<#
.SYNOPSIS
    Links files already uploaded to the Shared Documents library into the
    Solution Documents list so they surface in the Solution Center Documents tab.

.DESCRIPTION
    Bridges the gap between raw file uploads (e.g. via Deploy.ps1) and the
    Solution Documents list that drives the web part's Documents tab. Resolves
    the parent Solution Registry item by title, then upserts one Solution
    Documents item per file in the given library folder, linked by SolutionId.

    Idempotent: re-running updates existing items (matched by SolutionId +
    SectionKey) instead of duplicating them.

.PARAMETER SolutionTitle
    Title of the existing Solution Registry item to link documents to.

.PARAMETER LibraryFolder
    Project folder name under Shared Documents (e.g. "Andre's Website Update").
    Defaults to SolutionTitle when not supplied.

.PARAMETER Owner
    Owner value to stamp on created/updated Solution Documents items.

.EXAMPLE
    .\Sync-DocumentsFromLibrary.ps1 -SolutionTitle "AndreCampbell.ca Website Upgrade" -LibraryFolder "Andre's Website Update"

.NOTES
    Target site and client ID match Provision-TechElixirLists.ps1.
#>

[CmdletBinding(SupportsShouldProcess)]
param (
    [Parameter(Mandatory = $true)]
    [string]$SolutionTitle,

    [Parameter(Mandatory = $false)]
    [string]$LibraryFolder,

    [Parameter(Mandatory = $false)]
    [string]$Owner = 'Unassigned'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$SiteUrl = "https://tecanada.sharepoint.com/sites/TechElixirApps"
$ClientId = "b20f4aa3-ba69-41e5-af43-a17c3e1f9be2"

if ([string]::IsNullOrWhiteSpace($LibraryFolder)) {
    $LibraryFolder = $SolutionTitle
}

function Get-InferredSection {
    <#
    .SYNOPSIS  Derives SectionKey/SectionNumber/SectionTitle from a file name.
    #>
    param ([string]$FileName)

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    $match = [regex]::Match($baseName, '^(?<number>\d{2})-(?<title>.+)$')

    if ($match.Success) {
        $number = $match.Groups['number'].Value
        $title = ($match.Groups['title'].Value -replace '[-_]', ' ').Trim()
        $key = $baseName.ToLowerInvariant()
    }
    else {
        $number = ''
        $title = ($baseName -replace '[-_]', ' ').Trim()
        $key = $baseName.ToLowerInvariant()
    }

    [PSCustomObject]@{
        SectionKey   = $key
        SectionNumber = $number
        SectionTitle = $title
    }
}

Write-Host "Connecting to '$SiteUrl' ..." -ForegroundColor Yellow
Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -Interactive -ErrorAction Stop
Write-Host "Connected." -ForegroundColor Green

try {
    $registryItem = @(
        Get-PnPListItem `
            -List 'Solution Registry' `
            -Query "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>$SolutionTitle</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>" `
            -ErrorAction Stop
    )

    if ($registryItem.Count -eq 0) {
        throw "No Solution Registry item found with Title '$SolutionTitle'. Create it first, then re-run this script."
    }

    $solutionId = $registryItem[0].Id.ToString()
    Write-Host "Resolved '$SolutionTitle' to SolutionId=$solutionId" -ForegroundColor Cyan

    $web = Get-PnPWeb -Includes ServerRelativeUrl -ErrorAction Stop
    $siteRelUrl = "Shared Documents/$LibraryFolder"
    $libRelUrl = "$($web.ServerRelativeUrl.TrimEnd('/'))/Shared Documents/$LibraryFolder"
    $tenantUrl = $web.Url -replace '^(https?://[^/]+).*$', '$1'

    $folder = Get-PnPFolder -Url $libRelUrl -ErrorAction SilentlyContinue
    if ($null -eq $folder) {
        throw "Library folder not found: $libRelUrl"
    }

    $files = @(Get-PnPFolderItem -FolderSiteRelativeUrl $siteRelUrl -ItemType File -ErrorAction Stop)
    if ($files.Count -eq 0) {
        Write-Host "No files found in '$libRelUrl'. Nothing to sync." -ForegroundColor DarkGray
        return
    }

    Write-Host "Found $($files.Count) file(s) in '$libRelUrl'." -ForegroundColor Cyan

    foreach ($file in $files) {
        $section = Get-InferredSection -FileName $file.Name
        $fileUrl = "$tenantUrl$($file.ServerRelativeUrl)"

        $existing = @(
            Get-PnPListItem `
                -List 'Solution Documents' `
                -Query "<View><Query><Where><And><Eq><FieldRef Name='SolutionId'/><Value Type='Text'>$solutionId</Value></Eq><Eq><FieldRef Name='SectionKey'/><Value Type='Text'>$($section.SectionKey)</Value></Eq></And></Where></Query><RowLimit>1</RowLimit></View>" `
                -ErrorAction Stop
        )

        $values = @{
            Title         = $file.Name
            SolutionId    = $solutionId
            SectionKey    = $section.SectionKey
            SectionNumber = $section.SectionNumber
            SectionTitle  = $section.SectionTitle
            Status        = 'Current'
            Url           = $fileUrl
            LastUpdated   = [DateTime]::UtcNow
            Owner         = $Owner
        }

        if ($existing.Count -gt 0) {
            Set-PnPListItem -List 'Solution Documents' -Identity $existing[0].Id -Values $values -ErrorAction Stop | Out-Null
            Write-Host "  Updated: $($file.Name) -> SectionKey=$($section.SectionKey)" -ForegroundColor DarkGray
        }
        else {
            Add-PnPListItem -List 'Solution Documents' -Values $values -ErrorAction Stop | Out-Null
            Write-Host "  Linked:  $($file.Name) -> SectionKey=$($section.SectionKey)" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "Sync complete. $($files.Count) file(s) linked to SolutionId=$solutionId." -ForegroundColor Green
}
finally {
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
    Write-Host "Disconnected from SharePoint." -ForegroundColor DarkGray
}
