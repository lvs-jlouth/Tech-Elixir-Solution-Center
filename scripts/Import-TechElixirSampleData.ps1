<#
.SYNOPSIS
    Imports bundled sample JSON data into the Tech Elixir SharePoint lists.

.DESCRIPTION
    Connects to a SharePoint site with PnP PowerShell, reads the sample JSON files
    from a folder, and upserts records into the seven Tech Elixir lists. The import
    is idempotent: rerunning the script updates matching records instead of creating
    duplicates.

.PARAMETER SiteUrl
    Full URL of the target SharePoint site (e.g. https://contoso.sharepoint.com/sites/TechElixir).

.PARAMETER SampleDataFolder
    Folder containing the sample JSON files (e.g. .\sharepoint\seed-data).

.EXAMPLE
    .\Import-TechElixirSampleData.ps1 `
        -SiteUrl "https://contoso.sharepoint.com/sites/TechElixir" `
        -SampleDataFolder ".\sharepoint\seed-data"

.NOTES
    Requires PnP.PowerShell module (Install-Module PnP.PowerShell).
#>

[CmdletBinding(SupportsShouldProcess)]
param (
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $true)]
    [string]$SampleDataFolder
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:ListFieldCache = @{}
$script:ParentSolutionMap = @{}

function Get-ListFieldMap {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ListName
    )

    if (-not $script:ListFieldCache.ContainsKey($ListName)) {
        $fieldMap = @{}
        foreach ($field in (Get-PnPField -List $ListName)) {
            $fieldMap[$field.InternalName] = $field
        }

        $script:ListFieldCache[$ListName] = $fieldMap
    }

    return $script:ListFieldCache[$ListName]
}

function Read-JsonRecords {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Required sample data file not found: $Path"
    }

    $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    if ([string]::IsNullOrWhiteSpace($content)) {
        return @()
    }

    $records = ConvertFrom-Json -InputObject $content
    if ($records -is [System.Array]) {
        return $records
    }

    return @($records)
}

function Convert-InputValue {
    param (
        [Parameter(Mandatory = $true)]
        [string]$FieldName,

        [Parameter(Mandatory = $false)]
        $Value
    )

    if ($null -eq $Value) {
        return $null
    }

    if ($Value -is [string]) {
        $trimmedValue = $Value.Trim()
        if ($trimmedValue -eq '') {
            return $null
        }

        switch ($FieldName) {
            { $_ -in @('LastUpdated', 'Date', 'ReleaseDate', 'CreatedDate', 'LastUpdatedDate', 'TargetDate') } {
                return [DateTime]::Parse($trimmedValue, [System.Globalization.CultureInfo]::InvariantCulture)
            }
            default {
                return $trimmedValue
            }
        }
    }

    return $Value
}

function Resolve-ParentSolutionId {
    param (
        [Parameter(Mandatory = $true)]
        $Record
    )

    $candidateKeys = @()

    if ($Record.PSObject.Properties.Name -contains 'SolutionKey' -and -not [string]::IsNullOrWhiteSpace([string]$Record.SolutionKey)) {
        $candidateKeys += "SolutionKey::$($Record.SolutionKey)"
    }

    if ($Record.PSObject.Properties.Name -contains 'SolutionTitle' -and -not [string]::IsNullOrWhiteSpace([string]$Record.SolutionTitle)) {
        $candidateKeys += "Title::$($Record.SolutionTitle)"
    }

    if ($Record.PSObject.Properties.Name -contains 'SolutionId' -and -not [string]::IsNullOrWhiteSpace([string]$Record.SolutionId)) {
        $candidateKeys += "SourceId::$($Record.SolutionId)"
    }

    if ($Record.PSObject.Properties.Name -contains 'AppId' -and -not [string]::IsNullOrWhiteSpace([string]$Record.AppId)) {
        $candidateKeys += "AppId::$($Record.AppId)"
    }

    foreach ($candidateKey in $candidateKeys) {
        if ($script:ParentSolutionMap.ContainsKey($candidateKey)) {
            return $script:ParentSolutionMap[$candidateKey]
        }
    }

    throw "Unable to resolve parent solution for record '$($Record | ConvertTo-Json -Compress)'."
}

function Convert-RecordToListValues {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ListName,

        [Parameter(Mandatory = $true)]
        $Record,

        [Parameter(Mandatory = $false)]
        [string]$ResolvedSolutionId
    )

    $fieldMap = Get-ListFieldMap -ListName $ListName
    $values = @{}

    foreach ($property in $Record.PSObject.Properties) {
        $name = $property.Name

        if ($name -in @('SolutionKey', 'SolutionTitle')) {
            continue
        }

        if ($name -in @('SolutionId', 'AppId') -and $ResolvedSolutionId) {
            if ($fieldMap.ContainsKey($name)) {
                $values[$name] = $ResolvedSolutionId
            }

            continue
        }

        if (-not $fieldMap.ContainsKey($name)) {
            continue
        }

        $values[$name] = Convert-InputValue -FieldName $name -Value $property.Value
    }

    return $values
}

function New-MatchCriteria {
    param (
        [Parameter(Mandatory = $true)]
        [hashtable]$Values,

        [Parameter(Mandatory = $true)]
        [object[]]$PreferredFieldSets
    )

    foreach ($fieldSet in $PreferredFieldSets) {
        $criteria = @{}
        $isComplete = $true

        foreach ($fieldName in $fieldSet) {
            if (-not $Values.ContainsKey($fieldName) -or $null -eq $Values[$fieldName] -or [string]::IsNullOrWhiteSpace([string]$Values[$fieldName])) {
                $isComplete = $false
                break
            }

            $criteria[$fieldName] = $Values[$fieldName]
        }

        if ($isComplete) {
            return $criteria
        }
    }

    throw "Unable to build stable match criteria from fields: $($Values.Keys -join ', ')."
}

function Get-FieldComparisonValue {
    param (
        [Parameter(Mandatory = $false)]
        $Value
    )

    if ($null -eq $Value) {
        return ''
    }

    if ($Value -is [Microsoft.SharePoint.Client.FieldUrlValue]) {
        return $Value.Url
    }

    if ($Value -is [DateTime]) {
        return $Value.ToString('o')
    }

    return [string]$Value
}

function Find-ExistingListItem {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ListName,

        [Parameter(Mandatory = $true)]
        [hashtable]$MatchCriteria
    )

    $matchFields = @($MatchCriteria.Keys)
    $items = Get-PnPListItem -List $ListName -PageSize 2000 -Fields $matchFields

    foreach ($item in $items) {
        $isMatch = $true

        foreach ($fieldName in $matchFields) {
            if ((Get-FieldComparisonValue -Value $item[$fieldName]) -ne (Get-FieldComparisonValue -Value $MatchCriteria[$fieldName])) {
                $isMatch = $false
                break
            }
        }

        if ($isMatch) {
            return $item
        }
    }

    return $null
}

function Upsert-ListItem {
    [CmdletBinding(SupportsShouldProcess)]
    param (
        [Parameter(Mandatory = $true)]
        [string]$ListName,

        [Parameter(Mandatory = $true)]
        [hashtable]$Values,

        [Parameter(Mandatory = $true)]
        [hashtable]$MatchCriteria,

        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    $existingItem = Find-ExistingListItem -ListName $ListName -MatchCriteria $MatchCriteria

    if ($null -ne $existingItem) {
        if ($PSCmdlet.ShouldProcess("$ListName item $($existingItem.Id)", "Update $Label")) {
            Set-PnPListItem -List $ListName -Identity $existingItem.Id -Values $Values | Out-Null
        }

        Write-Host "  Updated: $Label" -ForegroundColor DarkYellow
        return $existingItem.Id.ToString()
    }

    if ($PSCmdlet.ShouldProcess($ListName, "Create $Label")) {
        $createdItem = Add-PnPListItem -List $ListName -Values $Values
        Write-Host "  Created: $Label" -ForegroundColor Green
        return $createdItem.Id.ToString()
    }

    Write-Host "  Skipped (WhatIf): $Label" -ForegroundColor DarkGray
    return ''
}

function Import-RegistryData {
    param (
        [Parameter(Mandatory = $true)]
        [string]$FolderPath
    )

    $filePath = Join-Path -Path $FolderPath -ChildPath 'solution-registry.sample.json'
    $records = Read-JsonRecords -Path $filePath

    Write-Host "`n=== Importing Solution Registry ===" -ForegroundColor Magenta
    Write-Host "Found $($records.Count) registry records in '$filePath'." -ForegroundColor Cyan

    for ($index = 0; $index -lt $records.Count; $index++) {
        $record = $records[$index]
        $values = Convert-RecordToListValues -ListName 'Solution Registry' -Record $record
        $matchCriteria = New-MatchCriteria -Values $values -PreferredFieldSets @(
            @('SolutionKey'),
            @('Title')
        )

        $label = "$($record.Title)"
        $solutionId = Upsert-ListItem -ListName 'Solution Registry' -Values $values -MatchCriteria $matchCriteria -Label $label

        if (-not [string]::IsNullOrWhiteSpace($solutionId)) {
            $sourceOrdinal = ($index + 1).ToString()
            $script:ParentSolutionMap["SourceId::$sourceOrdinal"] = $solutionId
            $script:ParentSolutionMap["AppId::$sourceOrdinal"] = $solutionId
            $script:ParentSolutionMap["Title::$($record.Title)"] = $solutionId

            if ($record.PSObject.Properties.Name -contains 'SolutionKey' -and -not [string]::IsNullOrWhiteSpace([string]$record.SolutionKey)) {
                $script:ParentSolutionMap["SolutionKey::$($record.SolutionKey)"] = $solutionId
            }
        }
    }
}

function Import-ChildListData {
    param (
        [Parameter(Mandatory = $true)]
        [string]$FolderPath,

        [Parameter(Mandatory = $true)]
        [string]$ListName,

        [Parameter(Mandatory = $true)]
        [string]$FileName,

        [Parameter(Mandatory = $true)]
        [object[]]$PreferredFieldSets
    )

    $filePath = Join-Path -Path $FolderPath -ChildPath $FileName
    $records = Read-JsonRecords -Path $filePath

    Write-Host "`n=== Importing $ListName ===" -ForegroundColor Magenta
    Write-Host "Found $($records.Count) records in '$filePath'." -ForegroundColor Cyan

    foreach ($record in $records) {
        $resolvedSolutionId = Resolve-ParentSolutionId -Record $record
        $values = Convert-RecordToListValues -ListName $ListName -Record $record -ResolvedSolutionId $resolvedSolutionId
        $matchCriteria = New-MatchCriteria -Values $values -PreferredFieldSets $PreferredFieldSets

        $label = if ($values.ContainsKey('Title') -and $values['Title']) { [string]$values['Title'] } elseif ($values.ContainsKey('Name') -and $values['Name']) { [string]$values['Name'] } elseif ($values.ContainsKey('Requirement') -and $values['Requirement']) { [string]$values['Requirement'] } else { ($matchCriteria.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', ' }
        Upsert-ListItem -ListName $ListName -Values $values -MatchCriteria $matchCriteria -Label $label | Out-Null
    }
}

try {
    if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
        throw "PnP.PowerShell is not installed. Run 'Install-Module PnP.PowerShell -Scope CurrentUser' first."
    }

    $resolvedSampleDataFolder = (Resolve-Path -Path $SampleDataFolder).Path

    Write-Host "`nConnecting to '$SiteUrl' ..." -ForegroundColor Yellow
    Connect-PnPOnline -Url $SiteUrl -Interactive
    Write-Host "Connected.`n" -ForegroundColor Green

    Import-RegistryData -FolderPath $resolvedSampleDataFolder
    Import-ChildListData -FolderPath $resolvedSampleDataFolder -ListName 'Solution Documents' -FileName 'solution-documents.sample.json' -PreferredFieldSets @(
        @('SolutionId', 'SectionKey'),
        @('SolutionId', 'Title')
    )
    Import-ChildListData -FolderPath $resolvedSampleDataFolder -ListName 'Solution Releases' -FileName 'solution-releases.sample.json' -PreferredFieldSets @(
        @('SolutionId', 'Version'),
        @('SolutionId', 'Title')
    )
    Import-ChildListData -FolderPath $resolvedSampleDataFolder -ListName 'Solution Technical Debt' -FileName 'solution-technical-debt.sample.json' -PreferredFieldSets @(
        @('SolutionId', 'Title')
    )
    Import-ChildListData -FolderPath $resolvedSampleDataFolder -ListName 'Solution Architecture Assets' -FileName 'solution-architecture-assets.sample.json' -PreferredFieldSets @(
        @('SolutionId', 'Title'),
        @('SolutionId', 'Url')
    )
    Import-ChildListData -FolderPath $resolvedSampleDataFolder -ListName 'Solution Integrations' -FileName 'solution-integrations.sample.json' -PreferredFieldSets @(
        @('SolutionId', 'Name'),
        @('SolutionId', 'Title')
    )
    Import-ChildListData -FolderPath $resolvedSampleDataFolder -ListName 'Solution Accessibility Checks' -FileName 'solution-accessibility-checks.sample.json' -PreferredFieldSets @(
        @('SolutionId', 'Requirement'),
        @('SolutionId', 'Title')
    )

    Write-Host "`n=== Sample data import complete ===" -ForegroundColor Green
}
finally {
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
}
