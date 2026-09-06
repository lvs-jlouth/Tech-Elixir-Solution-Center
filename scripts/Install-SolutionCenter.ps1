<#
.SYNOPSIS
    Portable installer for Solution Center list infrastructure and sample data.

.DESCRIPTION
    Provides an interactive and configuration-driven installation path for client environments.
    Supports single-site installs and multi-site rollout for a hub model. The script orchestrates
    existing provisioning and sample-data scripts to keep behavior consistent and idempotent.

.PARAMETER ConfigPath
    Optional path to an installer JSON configuration file.

.PARAMETER NonInteractive
    Uses only values from parameters and/or config file. Fails if required values are missing.

.PARAMETER OperationMode
    Install or Upgrade. Upgrade mode defaults to non-destructive behavior.

.PARAMETER InstallScope
    SingleSite or HubSites.

.PARAMETER SiteUrl
    Target site URL for SingleSite installs.

.PARAMETER HubSiteUrl
    Hub site URL for HubSites installs.

.PARAMETER DiscoverAssociatedSites
    In HubSites mode, auto-discovers associated sites from the hub when explicit site URLs are not provided.

.PARAMETER AssociatedSiteUrls
    Explicit site URLs to process in HubSites mode. If omitted, the script prompts in interactive mode.

.PARAMETER DeployPackage
    Uploads the SPFx package to the tenant app catalog before list provisioning.

.PARAMETER AppCatalogUrl
    URL of the app catalog site collection.

.PARAMETER PackagePath
    Path to the SPFx .sppkg package.

.PARAMETER PublishPackage
    Publishes the app package after upload.

.PARAMETER CreateMissingSites
    Checks target sites and creates missing sites before provisioning/import.

.PARAMETER TenantAdminUrl
    SharePoint tenant admin URL used for site existence checks and optional site creation.

.PARAMETER MissingSiteTemplate
    Site template used when creating missing sites: TeamSite or CommunicationSite.

.PARAMETER MissingSiteOwnerUpn
    Owner UPN used when creating missing team sites.

.PARAMETER AutoAssociateCreatedSitesToHub
    When in HubSites mode, associates newly-created sites to the configured hub site.

.PARAMETER NonDestructiveUpgrade
    In Upgrade mode, suppresses seed/import operations unless explicitly enabled.

.PARAMETER EnableBackup
    Exports list backups before running site changes.

.PARAMETER BackupBeforeChanges
    In Upgrade mode, runs backup prior to package deployment and provisioning.

.PARAMETER BackupFolder
    Root folder for backup output.

.PARAMETER BackupListNames
    SharePoint list names to export in backup snapshots.

.PARAMETER ProvisionLists
    Run list provisioning.

.PARAMETER SeedMinimalData
    Seed one record per list during provisioning.

.PARAMETER ImportSampleData
    Import sample JSON dataset.

.PARAMETER SampleDataFolder
    Folder that contains sample JSON files.

.EXAMPLE
    .\scripts\Install-SolutionCenter.ps1

.EXAMPLE
    .\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.install.template.json -NonInteractive
#>

[CmdletBinding(SupportsShouldProcess)]
param (
    [Parameter(Mandatory = $false)]
    [string]$ConfigPath,

    [Parameter(Mandatory = $false)]
    [switch]$NonInteractive,

    [Parameter(Mandatory = $false)]
    [ValidateSet('Install', 'Upgrade')]
    [string]$OperationMode = 'Install',

    [Parameter(Mandatory = $false)]
    [ValidateSet('SingleSite', 'HubSites')]
    [string]$InstallScope,

    [Parameter(Mandatory = $false)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$HubSiteUrl,

    [Parameter(Mandatory = $false)]
    [bool]$DiscoverAssociatedSites = $false,

    [Parameter(Mandatory = $false)]
    [string[]]$AssociatedSiteUrls,

    [Parameter(Mandatory = $false)]
    [bool]$DeployPackage = $false,

    [Parameter(Mandatory = $false)]
    [string]$AppCatalogUrl,

    [Parameter(Mandatory = $false)]
    [string]$PackagePath = 'sharepoint/solution/tech-elixir-solution-center.sppkg',

    [Parameter(Mandatory = $false)]
    [bool]$PublishPackage = $true,

    [Parameter(Mandatory = $false)]
    [bool]$CreateMissingSites = $false,

    [Parameter(Mandatory = $false)]
    [string]$TenantAdminUrl,

    [Parameter(Mandatory = $false)]
    [ValidateSet('TeamSite', 'CommunicationSite')]
    [string]$MissingSiteTemplate = 'CommunicationSite',

    [Parameter(Mandatory = $false)]
    [string]$MissingSiteOwnerUpn,

    [Parameter(Mandatory = $false)]
    [bool]$AutoAssociateCreatedSitesToHub = $true,

    [Parameter(Mandatory = $false)]
    [bool]$NonDestructiveUpgrade = $true,

    [Parameter(Mandatory = $false)]
    [bool]$EnableBackup = $false,

    [Parameter(Mandatory = $false)]
    [bool]$BackupBeforeChanges = $true,

    [Parameter(Mandatory = $false)]
    [string]$BackupFolder = 'backups',

    [Parameter(Mandatory = $false)]
    [string[]]$BackupListNames = @(
        'Solution Registry',
        'Solution Documents',
        'Solution Releases',
        'Solution Technical Debt',
        'Solution Architecture Assets',
        'Solution Integrations',
        'Solution Accessibility Checks'
    ),

    [Parameter(Mandatory = $false)]
    [bool]$ProvisionLists = $true,

    [Parameter(Mandatory = $false)]
    [bool]$SeedMinimalData = $false,

    [Parameter(Mandatory = $false)]
    [bool]$ImportSampleData = $false,

    [Parameter(Mandatory = $false)]
    [string]$SampleDataFolder = 'sharepoint/seed-data'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-RepoRoot {
    param (
        [string]$ScriptPath
    )

    return (Split-Path -Path (Split-Path -Path $ScriptPath -Parent) -Parent)
}

function Merge-ConfigValue {
    param (
        [Parameter(Mandatory = $true)]
        $CurrentValue,

        [Parameter(Mandatory = $false)]
        $ConfigValue
    )

    if ($null -ne $ConfigValue -and "$ConfigValue" -ne '') {
        return $ConfigValue
    }

    return $CurrentValue
}

function Read-RequiredValue {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Prompt,

        [Parameter(Mandatory = $false)]
        [string]$DefaultValue
    )

    while ($true) {
        $suffix = if ($DefaultValue) { " [$DefaultValue]" } else { '' }
        $value = Read-Host "$Prompt$suffix"
        if ([string]::IsNullOrWhiteSpace($value)) {
            if ($DefaultValue) {
                return $DefaultValue
            }
            continue
        }

        return $value.Trim()
    }
}

function Invoke-Provisioning {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ProvisionScriptPath,

        [Parameter(Mandatory = $true)]
        [string]$TargetSiteUrl,

        [Parameter(Mandatory = $true)]
        [bool]$SeedSampleData
    )

    Write-Host "`n[Install] Provisioning lists on $TargetSiteUrl" -ForegroundColor Yellow
    if ($SeedSampleData) {
        & $ProvisionScriptPath -SiteUrl $TargetSiteUrl -SeedSampleData
    }
    else {
        & $ProvisionScriptPath -SiteUrl $TargetSiteUrl
    }
}

function Invoke-SampleImport {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ImportScriptPath,

        [Parameter(Mandatory = $true)]
        [string]$TargetSiteUrl,

        [Parameter(Mandatory = $true)]
        [string]$ResolvedSampleFolder
    )

    Write-Host "[Install] Importing sample data on $TargetSiteUrl" -ForegroundColor Yellow
    & $ImportScriptPath -SiteUrl $TargetSiteUrl -SampleDataFolder $ResolvedSampleFolder
}

function Discover-HubSites {
    param (
        [Parameter(Mandatory = $true)]
        [string]$HubUrl
    )

    if (-not (Get-Command -Name Get-PnPHubSiteChild -ErrorAction SilentlyContinue)) {
        throw 'Get-PnPHubSiteChild is unavailable in the current PnP.PowerShell version. Provide AssociatedSiteUrls explicitly.'
    }

    Write-Host "[Install] Discovering associated sites for hub: $HubUrl" -ForegroundColor Yellow
    Connect-PnPOnline -Url $HubUrl -Interactive

    try {
        $children = $null
        try {
            $children = Get-PnPHubSiteChild -Identity $HubUrl -ErrorAction Stop
        }
        catch {
            $children = Get-PnPHubSiteChild -ErrorAction Stop
        }

        $urls = @($children | ForEach-Object {
            if ($_.PSObject.Properties.Name -contains 'SiteUrl' -and $_.SiteUrl) {
                [string]$_.SiteUrl
            }
            elseif ($_.PSObject.Properties.Name -contains 'Url' -and $_.Url) {
                [string]$_.Url
            }
        } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)

        return $urls
    }
    finally {
        Disconnect-PnPOnline -ErrorAction SilentlyContinue
    }
}

function Invoke-AppCatalogDeployment {
    param (
        [Parameter(Mandatory = $true)]
        [string]$CatalogUrl,

        [Parameter(Mandatory = $true)]
        [string]$ResolvedPackagePath,

        [Parameter(Mandatory = $true)]
        [bool]$ShouldPublish
    )

    if (-not (Test-Path -LiteralPath $ResolvedPackagePath -PathType Leaf)) {
        throw "Package file not found: $ResolvedPackagePath"
    }

    Write-Host "[Install] Deploying package to app catalog: $CatalogUrl" -ForegroundColor Yellow
    Connect-PnPOnline -Url $CatalogUrl -Interactive

    try {
        $uploaded = Add-PnPApp -Path $ResolvedPackagePath -Scope Tenant -Overwrite
        if ($ShouldPublish) {
            Publish-PnPApp -Identity $uploaded.Id -Scope Tenant | Out-Null
            Write-Host "[Install] Package uploaded and published." -ForegroundColor Green
        }
        else {
            Write-Host "[Install] Package uploaded (publish skipped by configuration)." -ForegroundColor Green
        }
    }
    finally {
        Disconnect-PnPOnline -ErrorAction SilentlyContinue
    }
}

function New-SiteAliasFromUrl {
    param (
        [Parameter(Mandatory = $true)]
        [string]$SiteUrl
    )

    $uri = [Uri]$SiteUrl
    $segments = @($uri.AbsolutePath.Trim('/') -split '/')
    $leaf = if ($segments.Count -gt 0) { $segments[$segments.Count - 1] } else { '' }
    $alias = ($leaf -replace '[^a-zA-Z0-9-]', '').ToLowerInvariant()
    if ([string]::IsNullOrWhiteSpace($alias)) {
        throw "Unable to derive a site alias from URL '$SiteUrl'."
    }

    return $alias
}

function Ensure-TargetSitesExist {
    param (
        [Parameter(Mandatory = $true)]
        [string]$AdminUrl,

        [Parameter(Mandatory = $true)]
        [string[]]$SiteUrls,

        [Parameter(Mandatory = $true)]
        [bool]$CreateIfMissing,

        [Parameter(Mandatory = $true)]
        [string]$Template,

        [Parameter(Mandatory = $false)]
        [string]$OwnerUpn,

        [Parameter(Mandatory = $false)]
        [string]$HubUrl,

        [Parameter(Mandatory = $true)]
        [bool]$AssociateToHub
    )

    if (-not (Get-Command -Name Get-PnPTenantSite -ErrorAction SilentlyContinue)) {
        throw 'Get-PnPTenantSite is unavailable in the current PnP.PowerShell version.'
    }

    if ($CreateIfMissing -and -not (Get-Command -Name New-PnPSite -ErrorAction SilentlyContinue)) {
        throw 'New-PnPSite is unavailable in the current PnP.PowerShell version.'
    }

    if ($CreateIfMissing -and $Template -eq 'TeamSite' -and [string]::IsNullOrWhiteSpace($OwnerUpn)) {
        throw 'MissingSiteOwnerUpn is required when creating TeamSite sites.'
    }

    if ($AssociateToHub -and -not [string]::IsNullOrWhiteSpace($HubUrl) -and -not (Get-Command -Name Add-PnPHubSiteAssociation -ErrorAction SilentlyContinue)) {
        throw 'Add-PnPHubSiteAssociation is unavailable in the current PnP.PowerShell version.'
    }

    $status = @{}

    Write-Host "[Install] Checking target sites from tenant admin: $AdminUrl" -ForegroundColor Yellow
    Connect-PnPOnline -Url $AdminUrl -Interactive

    try {
        foreach ($siteUrl in $SiteUrls) {
            $exists = $false
            try {
                $null = Get-PnPTenantSite -Identity $siteUrl -ErrorAction Stop
                $exists = $true
            }
            catch {
                if ($_.Exception.Message -notmatch '(?i)not exist|cannot be found|no site collection') {
                    throw
                }
            }

            if ($exists) {
                $status[$siteUrl] = [PSCustomObject]@{
                    Exists  = $true
                    Created = $false
                }
                continue
            }

            if (-not $CreateIfMissing) {
                throw "Target site does not exist: $siteUrl. Enable CreateMissingSites and provide TenantAdminUrl to auto-create it."
            }

            $uri = [Uri]$siteUrl
            $alias = New-SiteAliasFromUrl -SiteUrl $siteUrl
            $siteTitle = "Solution Center - $alias"

            Write-Host "[Install] Creating missing site: $siteUrl ($Template)" -ForegroundColor Yellow
            if ($Template -eq 'TeamSite') {
                $expectedPath = "/sites/$alias"
                if ($uri.AbsolutePath -ne $expectedPath) {
                    throw "TeamSite creation expects URLs in /sites/<alias> format. Requested URL '$siteUrl' is not compatible."
                }

                New-PnPSite -Type TeamSite -Title $siteTitle -Alias $alias -Owners $OwnerUpn -IsPublic:$false -Wait | Out-Null
            }
            else {
                New-PnPSite -Type CommunicationSite -Title $siteTitle -Url $siteUrl -Wait | Out-Null
            }

            if ($AssociateToHub -and -not [string]::IsNullOrWhiteSpace($HubUrl)) {
                try {
                    Add-PnPHubSiteAssociation -Site $siteUrl -HubSite $HubUrl -ErrorAction Stop
                    Write-Host "[Install] Associated created site to hub: $siteUrl" -ForegroundColor Green
                }
                catch {
                    Write-Host "[Install] Warning: Could not associate '$siteUrl' to hub '$HubUrl'. $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }

            $status[$siteUrl] = [PSCustomObject]@{
                Exists  = $true
                Created = $true
            }
        }
    }
    finally {
        Disconnect-PnPOnline -ErrorAction SilentlyContinue
    }

    return $status
}

function ConvertTo-SafePathName {
    param (
        [Parameter(Mandatory = $true)]
        [string]$InputValue
    )

    return (($InputValue -replace '^https?://', '') -replace '[^a-zA-Z0-9._-]', '_')
}

function Export-SiteBackup {
    param (
        [Parameter(Mandatory = $true)]
        [string]$SiteUrl,

        [Parameter(Mandatory = $true)]
        [string]$OutputRoot,

        [Parameter(Mandatory = $true)]
        [string[]]$ListNames
    )

    $siteFolderName = ConvertTo-SafePathName -InputValue $SiteUrl
    $siteOutput = Join-Path -Path $OutputRoot -ChildPath $siteFolderName
    if (-not (Test-Path -LiteralPath $siteOutput)) {
        New-Item -Path $siteOutput -ItemType Directory | Out-Null
    }

    Write-Host "[Install] Backing up site lists: $SiteUrl" -ForegroundColor Yellow
    Connect-PnPOnline -Url $SiteUrl -Interactive

    $manifest = New-Object System.Collections.Generic.List[object]
    try {
        foreach ($listName in $ListNames) {
            $list = Get-PnPList -Identity $listName -ErrorAction SilentlyContinue
            if ($null -eq $list) {
                $manifest.Add([PSCustomObject]@{
                    ListName = $listName
                    Status   = 'Missing'
                    Count    = 0
                }) | Out-Null
                continue
            }

            $items = @(Get-PnPListItem -List $listName -PageSize 500 -ErrorAction Stop)
            $records = @($items | ForEach-Object {
                [PSCustomObject]@{
                    Id     = $_.Id
                    Values = $_.FieldValues
                }
            })

            $listFileName = "list-{0}.json" -f (ConvertTo-SafePathName -InputValue $listName)
            $listPath = Join-Path -Path $siteOutput -ChildPath $listFileName
            $records | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $listPath -Encoding UTF8

            $manifest.Add([PSCustomObject]@{
                ListName = $listName
                Status   = 'Exported'
                Count    = $records.Count
                File     = $listFileName
            }) | Out-Null
        }
    }
    finally {
        Disconnect-PnPOnline -ErrorAction SilentlyContinue
    }

    $manifestPath = Join-Path -Path $siteOutput -ChildPath 'backup-manifest.json'
    $manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

    return [PSCustomObject]@{
        SiteUrl      = $SiteUrl
        BackupFolder = $siteOutput
        ManifestPath = $manifestPath
    }
}

function Get-TargetSites {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Scope,

        [Parameter(Mandatory = $false)]
        [string]$SingleSiteUrl,

        [Parameter(Mandatory = $false)]
        [string]$HubUrl,

        [Parameter(Mandatory = $true)]
        [bool]$UseHubDiscovery,

        [Parameter(Mandatory = $false)]
        [string[]]$HubAssociatedSites,

        [Parameter(Mandatory = $true)]
        [bool]$IsNonInteractive
    )

    if ($Scope -eq 'SingleSite') {
        if ([string]::IsNullOrWhiteSpace($SingleSiteUrl)) {
            throw 'SiteUrl is required for SingleSite installs.'
        }

        return @($SingleSiteUrl)
    }

    if ($UseHubDiscovery) {
        if ([string]::IsNullOrWhiteSpace($HubUrl)) {
            throw 'HubSiteUrl is required when DiscoverAssociatedSites is enabled.'
        }

        $discovered = Discover-HubSites -HubUrl $HubUrl
        $combined = @($discovered)
        if ($HubAssociatedSites -and $HubAssociatedSites.Count -gt 0) {
            $combined += $HubAssociatedSites
        }

        $deduped = @($combined | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
        if ($deduped.Count -eq 0) {
            throw "No associated sites were discovered for hub '$HubUrl'."
        }

        return $deduped
    }

    if ($HubAssociatedSites -and $HubAssociatedSites.Count -gt 0) {
        return @($HubAssociatedSites | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
    }

    if ($IsNonInteractive) {
        throw 'AssociatedSiteUrls is required in NonInteractive HubSites mode.'
    }

    if ([string]::IsNullOrWhiteSpace($HubUrl)) {
        $HubUrl = Read-RequiredValue -Prompt 'Enter the hub site URL'
    }

    Write-Host "`nEnter associated site URLs one per line. Press Enter on an empty line to finish." -ForegroundColor Cyan
    $sites = New-Object System.Collections.Generic.List[string]
    while ($true) {
        $candidate = Read-Host 'Associated site URL'
        if ([string]::IsNullOrWhiteSpace($candidate)) {
            break
        }
        $sites.Add($candidate.Trim())
    }

    if ($sites.Count -eq 0) {
        throw 'No associated site URLs were provided for HubSites mode.'
    }

    return @($sites)
}

$repoRoot = Resolve-RepoRoot -ScriptPath $PSCommandPath
$provisionScript = Join-Path -Path $repoRoot -ChildPath 'scripts/Provision-TechElixirLists.ps1'
$importScript = Join-Path -Path $repoRoot -ChildPath 'scripts/Import-TechElixirSampleData.ps1'

if (-not (Test-Path -LiteralPath $provisionScript -PathType Leaf)) {
    throw "Provision script not found: $provisionScript"
}

if (-not (Test-Path -LiteralPath $importScript -PathType Leaf)) {
    throw "Import script not found: $importScript"
}

$config = $null
if (-not [string]::IsNullOrWhiteSpace($ConfigPath)) {
    $resolvedConfigPath = (Resolve-Path -LiteralPath $ConfigPath).Path
    $config = Get-Content -LiteralPath $resolvedConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json

    $InstallScope = Merge-ConfigValue -CurrentValue $InstallScope -ConfigValue $config.installScope
    $OperationMode = Merge-ConfigValue -CurrentValue $OperationMode -ConfigValue $config.operationMode
    $SiteUrl = Merge-ConfigValue -CurrentValue $SiteUrl -ConfigValue $config.siteUrl
    $HubSiteUrl = Merge-ConfigValue -CurrentValue $HubSiteUrl -ConfigValue $config.hubSiteUrl
    $AppCatalogUrl = Merge-ConfigValue -CurrentValue $AppCatalogUrl -ConfigValue $config.appCatalogUrl
    $PackagePath = Merge-ConfigValue -CurrentValue $PackagePath -ConfigValue $config.packagePath
    $TenantAdminUrl = Merge-ConfigValue -CurrentValue $TenantAdminUrl -ConfigValue $config.tenantAdminUrl
    $MissingSiteTemplate = Merge-ConfigValue -CurrentValue $MissingSiteTemplate -ConfigValue $config.missingSiteTemplate
    $MissingSiteOwnerUpn = Merge-ConfigValue -CurrentValue $MissingSiteOwnerUpn -ConfigValue $config.missingSiteOwnerUpn
    $BackupFolder = Merge-ConfigValue -CurrentValue $BackupFolder -ConfigValue $config.backupFolder
    if ($null -eq $AssociatedSiteUrls -or $AssociatedSiteUrls.Count -eq 0) {
        $AssociatedSiteUrls = @($config.associatedSiteUrls)
    }
    if ($null -eq $BackupListNames -or $BackupListNames.Count -eq 0) {
        $BackupListNames = @($config.backupListNames)
    }

    if ($null -ne $config.discoverAssociatedSites) {
        $DiscoverAssociatedSites = [bool]$config.discoverAssociatedSites
    }
    if ($null -ne $config.deployPackage) {
        $DeployPackage = [bool]$config.deployPackage
    }
    if ($null -ne $config.publishPackage) {
        $PublishPackage = [bool]$config.publishPackage
    }
    if ($null -ne $config.createMissingSites) {
        $CreateMissingSites = [bool]$config.createMissingSites
    }
    if ($null -ne $config.autoAssociateCreatedSitesToHub) {
        $AutoAssociateCreatedSitesToHub = [bool]$config.autoAssociateCreatedSitesToHub
    }
    if ($null -ne $config.nonDestructiveUpgrade) {
        $NonDestructiveUpgrade = [bool]$config.nonDestructiveUpgrade
    }
    if ($null -ne $config.enableBackup) {
        $EnableBackup = [bool]$config.enableBackup
    }
    if ($null -ne $config.backupBeforeChanges) {
        $BackupBeforeChanges = [bool]$config.backupBeforeChanges
    }

    if ($null -ne $config.provisionLists) {
        $ProvisionLists = [bool]$config.provisionLists
    }
    if ($null -ne $config.seedMinimalData) {
        $SeedMinimalData = [bool]$config.seedMinimalData
    }
    if ($null -ne $config.importSampleData) {
        $ImportSampleData = [bool]$config.importSampleData
    }
    if ($null -ne $config.sampleDataFolder -and "$($config.sampleDataFolder)" -ne '') {
        $SampleDataFolder = [string]$config.sampleDataFolder
    }
}

if ([string]::IsNullOrWhiteSpace($InstallScope)) {
    if ($NonInteractive) {
        throw 'InstallScope is required in NonInteractive mode.'
    }

    $InstallScope = Read-RequiredValue -Prompt 'Install scope (SingleSite|HubSites)' -DefaultValue 'SingleSite'
}

if ($InstallScope -notin @('SingleSite', 'HubSites')) {
    throw "InstallScope must be SingleSite or HubSites. Received '$InstallScope'."
}

if ($OperationMode -eq 'Upgrade' -and $NonDestructiveUpgrade) {
    if ($SeedMinimalData) {
        Write-Host '[Install] Upgrade mode with NonDestructiveUpgrade enabled: forcing SeedMinimalData to false.' -ForegroundColor Yellow
    }
    if ($ImportSampleData) {
        Write-Host '[Install] Upgrade mode with NonDestructiveUpgrade enabled: forcing ImportSampleData to false.' -ForegroundColor Yellow
    }
    $SeedMinimalData = $false
    $ImportSampleData = $false

    if (-not $EnableBackup) {
        Write-Host '[Install] Upgrade mode with NonDestructiveUpgrade enabled: enabling backup export.' -ForegroundColor Yellow
        $EnableBackup = $true
    }
}

if (-not $NonInteractive) {
    if ([string]::IsNullOrWhiteSpace($OperationMode)) {
        $OperationMode = Read-RequiredValue -Prompt 'Operation mode (Install|Upgrade)' -DefaultValue 'Install'
    }

    if ($InstallScope -eq 'SingleSite' -and [string]::IsNullOrWhiteSpace($SiteUrl)) {
        $SiteUrl = Read-RequiredValue -Prompt 'Enter target site URL'
    }

    if ($InstallScope -eq 'HubSites' -and [string]::IsNullOrWhiteSpace($HubSiteUrl)) {
        $HubSiteUrl = Read-RequiredValue -Prompt 'Enter hub site URL (used for context)'
    }

    if ($null -eq $AssociatedSiteUrls -or $AssociatedSiteUrls.Count -eq 0) {
        if ($InstallScope -eq 'HubSites') {
            Write-Host 'No associated sites were supplied. You will be prompted to enter them.' -ForegroundColor Cyan
        }
    }

    if ($InstallScope -eq 'HubSites' -and -not $DiscoverAssociatedSites) {
        $discoverPrompt = Read-Host 'Auto-discover associated sites from hub? (y/n) [n]'
        if ($discoverPrompt -in @('y', 'Y', 'yes', 'YES')) {
            $DiscoverAssociatedSites = $true
        }
    }

    if (-not $CreateMissingSites) {
        $siteCreatePrompt = Read-Host 'Create missing target sites before provisioning? (y/n) [n]'
        if ($siteCreatePrompt -in @('y', 'Y', 'yes', 'YES')) {
            $CreateMissingSites = $true
        }
    }

    if ($CreateMissingSites) {
        if ([string]::IsNullOrWhiteSpace($TenantAdminUrl)) {
            $TenantAdminUrl = Read-RequiredValue -Prompt 'Enter tenant admin URL (for example: https://contoso-admin.sharepoint.com)'
        }
        if ([string]::IsNullOrWhiteSpace($MissingSiteTemplate)) {
            $MissingSiteTemplate = Read-RequiredValue -Prompt 'Missing site template (TeamSite|CommunicationSite)' -DefaultValue 'CommunicationSite'
        }
        if ($MissingSiteTemplate -eq 'TeamSite' -and [string]::IsNullOrWhiteSpace($MissingSiteOwnerUpn)) {
            $MissingSiteOwnerUpn = Read-RequiredValue -Prompt 'Enter owner UPN for new team sites'
        }
    }

    if (-not $DeployPackage) {
        $deployPrompt = Read-Host 'Deploy .sppkg package to app catalog before provisioning? (y/n) [n]'
        if ($deployPrompt -in @('y', 'Y', 'yes', 'YES')) {
            $DeployPackage = $true
        }
    }

    if ($DeployPackage) {
        if ([string]::IsNullOrWhiteSpace($AppCatalogUrl)) {
            $AppCatalogUrl = Read-RequiredValue -Prompt 'Enter App Catalog URL'
        }
        if ([string]::IsNullOrWhiteSpace($PackagePath)) {
            $PackagePath = Read-RequiredValue -Prompt 'Enter .sppkg path' -DefaultValue 'sharepoint/solution/tech-elixir-solution-center.sppkg'
        }
    }

    if (-not $EnableBackup) {
        $backupPrompt = Read-Host 'Enable pre-change backup export? (y/n) [n]'
        if ($backupPrompt -in @('y', 'Y', 'yes', 'YES')) {
            $EnableBackup = $true
        }
    }
}

$resolvedSampleFolder = ''
if ($ImportSampleData) {
    $resolvedSampleFolder = $SampleDataFolder
    if (-not [System.IO.Path]::IsPathRooted($resolvedSampleFolder)) {
        $resolvedSampleFolder = Join-Path -Path $repoRoot -ChildPath $resolvedSampleFolder
    }
    $resolvedSampleFolder = (Resolve-Path -Path $resolvedSampleFolder).Path
}

$resolvedPackagePath = ''
if ($DeployPackage) {
    if ([string]::IsNullOrWhiteSpace($AppCatalogUrl)) {
        throw 'AppCatalogUrl is required when DeployPackage is enabled.'
    }

    $resolvedPackagePath = $PackagePath
    if (-not [System.IO.Path]::IsPathRooted($resolvedPackagePath)) {
        $resolvedPackagePath = Join-Path -Path $repoRoot -ChildPath $resolvedPackagePath
    }
    $resolvedPackagePath = (Resolve-Path -Path $resolvedPackagePath).Path
}

$resolvedBackupRoot = ''
if ($EnableBackup) {
    $resolvedBackupRoot = $BackupFolder
    if (-not [System.IO.Path]::IsPathRooted($resolvedBackupRoot)) {
        $resolvedBackupRoot = Join-Path -Path $repoRoot -ChildPath $resolvedBackupRoot
    }

    if (-not (Test-Path -LiteralPath $resolvedBackupRoot)) {
        New-Item -Path $resolvedBackupRoot -ItemType Directory | Out-Null
    }

    $resolvedBackupRoot = (Resolve-Path -Path $resolvedBackupRoot).Path
}

$targetSites = Get-TargetSites `
    -Scope $InstallScope `
    -SingleSiteUrl $SiteUrl `
    -HubUrl $HubSiteUrl `
    -UseHubDiscovery $DiscoverAssociatedSites `
    -HubAssociatedSites $AssociatedSiteUrls `
    -IsNonInteractive $NonInteractive

$targetSites = @($targetSites)

Write-Host "`n=== Solution Center Installer Summary ===" -ForegroundColor Magenta
Write-Host "Scope:             $InstallScope"
Write-Host "Operation mode:    $OperationMode"
Write-Host "Target site count: $($targetSites.Count)"
Write-Host "Hub discovery:     $DiscoverAssociatedSites"
Write-Host "Create missing:    $CreateMissingSites"
if ($CreateMissingSites) {
    Write-Host "Tenant admin URL:  $TenantAdminUrl"
    Write-Host "Missing template:  $MissingSiteTemplate"
    if ($MissingSiteTemplate -eq 'TeamSite') {
        Write-Host "Missing owner UPN: $MissingSiteOwnerUpn"
    }
    Write-Host "Auto-associate hub created sites: $AutoAssociateCreatedSitesToHub"
}
Write-Host "Deploy package:    $DeployPackage"
if ($DeployPackage) {
    Write-Host "App Catalog URL:   $AppCatalogUrl"
    Write-Host "Package path:      $resolvedPackagePath"
    Write-Host "Publish package:   $PublishPackage"
}
Write-Host "Provision lists:   $ProvisionLists"
Write-Host "Seed minimal:      $SeedMinimalData"
Write-Host "Import sample:     $ImportSampleData"
Write-Host "Enable backup:     $EnableBackup"
if ($EnableBackup) {
    Write-Host "Backup before changes: $BackupBeforeChanges"
    Write-Host "Backup folder:     $resolvedBackupRoot"
}
if ($ImportSampleData) {
    Write-Host "Sample folder:     $resolvedSampleFolder"
}
Write-Host "Target sites:" -ForegroundColor Cyan
$targetSites | ForEach-Object { Write-Host "  - $_" }

if (-not $NonInteractive) {
    $proceed = Read-Host "`nProceed with installation? (y/n)"
    if ($proceed -notin @('y', 'Y', 'yes', 'YES')) {
        Write-Host 'Installation cancelled by user.' -ForegroundColor Yellow
        return
    }
}

$results = New-Object System.Collections.Generic.List[object]
$packageDeploymentStatus = if ($DeployPackage) { 'Success' } else { 'Skipped' }
$packageDeploymentError = ''
$siteStatusByUrl = @{}
$backupStatusByUrl = @{}

if ($CreateMissingSites) {
    if ([string]::IsNullOrWhiteSpace($TenantAdminUrl)) {
        throw 'TenantAdminUrl is required when CreateMissingSites is enabled.'
    }

    $siteStatusByUrl = Ensure-TargetSitesExist `
        -AdminUrl $TenantAdminUrl `
        -SiteUrls $targetSites `
        -CreateIfMissing $CreateMissingSites `
        -Template $MissingSiteTemplate `
        -OwnerUpn $MissingSiteOwnerUpn `
        -HubUrl $HubSiteUrl `
        -AssociateToHub $AutoAssociateCreatedSitesToHub
}

if ($EnableBackup -and $BackupBeforeChanges) {
    $backupRunRoot = Join-Path -Path $resolvedBackupRoot -ChildPath ("backup-{0}" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
    if (-not (Test-Path -LiteralPath $backupRunRoot)) {
        New-Item -Path $backupRunRoot -ItemType Directory | Out-Null
    }

    foreach ($targetSite in $targetSites) {
        try {
            $backupResult = Export-SiteBackup -SiteUrl $targetSite -OutputRoot $backupRunRoot -ListNames $BackupListNames
            $backupStatusByUrl[$targetSite] = [PSCustomObject]@{
                Status = 'Success'
                Path   = $backupResult.BackupFolder
                Error  = ''
            }
        }
        catch {
            $backupStatusByUrl[$targetSite] = [PSCustomObject]@{
                Status = 'Failed'
                Path   = ''
                Error  = $_.Exception.Message
            }
            throw
        }
    }
}

if ($DeployPackage) {
    try {
        Invoke-AppCatalogDeployment -CatalogUrl $AppCatalogUrl -ResolvedPackagePath $resolvedPackagePath -ShouldPublish $PublishPackage
    }
    catch {
        $packageDeploymentStatus = 'Failed'
        $packageDeploymentError = $_.Exception.Message
        throw
    }
}

foreach ($targetSite in $targetSites) {
    $provisionStatus = 'Skipped'
    $importStatus = 'Skipped'
    $failure = ''
    $backupStatus = if ($EnableBackup -and $BackupBeforeChanges) {
        if ($backupStatusByUrl.ContainsKey($targetSite)) { $backupStatusByUrl[$targetSite].Status } else { 'Skipped' }
    }
    elseif ($EnableBackup) {
        'Pending'
    }
    else {
        'Skipped'
    }
    $backupPath = if ($EnableBackup -and $BackupBeforeChanges -and $backupStatusByUrl.ContainsKey($targetSite)) { $backupStatusByUrl[$targetSite].Path } else { '' }
    $backupError = if ($EnableBackup -and $BackupBeforeChanges -and $backupStatusByUrl.ContainsKey($targetSite)) { $backupStatusByUrl[$targetSite].Error } else { '' }
    $siteCreationStatus = if ($CreateMissingSites) {
        if ($siteStatusByUrl.ContainsKey($targetSite) -and $siteStatusByUrl[$targetSite].Created) {
            'Created'
        }
        else {
            'AlreadyExists'
        }
    }
    else {
        'NotChecked'
    }

    try {
        if ($ProvisionLists) {
            Invoke-Provisioning -ProvisionScriptPath $provisionScript -TargetSiteUrl $targetSite -SeedSampleData $SeedMinimalData
            $provisionStatus = 'Success'
        }

        if ($ImportSampleData) {
            Invoke-SampleImport -ImportScriptPath $importScript -TargetSiteUrl $targetSite -ResolvedSampleFolder $resolvedSampleFolder
            $importStatus = 'Success'
        }
    }
    catch {
        $failure = $_.Exception.Message
        if ($provisionStatus -eq 'Skipped' -and $ProvisionLists) {
            $provisionStatus = 'Failed'
        }
        if ($importStatus -eq 'Skipped' -and $ImportSampleData) {
            $importStatus = 'Failed'
        }
        Write-Host "[Install] Failed for site ${targetSite}: $failure" -ForegroundColor Red
    }

    $results.Add([PSCustomObject]@{
        SiteUrl                  = $targetSite
        SiteCreationStatus       = $siteCreationStatus
        BackupStatus             = $backupStatus
        BackupPath               = $backupPath
        BackupError              = $backupError
        PackageDeploymentStatus  = $packageDeploymentStatus
        PackageDeploymentError   = $packageDeploymentError
        ProvisionStatus          = $provisionStatus
        ImportStatus             = $importStatus
        Error                    = $failure
    }) | Out-Null
}

if ($EnableBackup -and -not $BackupBeforeChanges) {
    $backupRunRoot = Join-Path -Path $resolvedBackupRoot -ChildPath ("backup-{0}" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
    if (-not (Test-Path -LiteralPath $backupRunRoot)) {
        New-Item -Path $backupRunRoot -ItemType Directory | Out-Null
    }

    foreach ($targetSite in $targetSites) {
        try {
            $backupResult = Export-SiteBackup -SiteUrl $targetSite -OutputRoot $backupRunRoot -ListNames $BackupListNames
            $backupStatusByUrl[$targetSite] = [PSCustomObject]@{
                Status = 'Success'
                Path   = $backupResult.BackupFolder
                Error  = ''
            }
        }
        catch {
            $backupStatusByUrl[$targetSite] = [PSCustomObject]@{
                Status = 'Failed'
                Path   = ''
                Error  = $_.Exception.Message
            }
        }
    }

    foreach ($row in $results) {
        if ($backupStatusByUrl.ContainsKey($row.SiteUrl)) {
            $row.BackupStatus = $backupStatusByUrl[$row.SiteUrl].Status
            $row.BackupPath = $backupStatusByUrl[$row.SiteUrl].Path
            $row.BackupError = $backupStatusByUrl[$row.SiteUrl].Error
        }
    }
}

Write-Host "`n=== Installation Report ===" -ForegroundColor Magenta
$results | Format-Table -AutoSize

$outputFile = Join-Path -Path $repoRoot -ChildPath ("install-report-{0}.json" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $outputFile -Encoding UTF8
Write-Host "Report written to: $outputFile" -ForegroundColor Green
