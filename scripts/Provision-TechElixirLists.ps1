<#
.SYNOPSIS
    Provisions the SharePoint backend lists required by the TechElixirSolutionCenter web part.

.DESCRIPTION
    Creates seven SharePoint lists (Solution Registry, Solution Documents, Solution Releases,
    Solution Technical Debt, Solution Architecture Assets, Solution Integrations,
    Solution Accessibility Checks) with all required columns, indexes, and default views.
    The script is fully idempotent – safe to run multiple times against the same site.

.PARAMETER SiteUrl
    Full URL of the target SharePoint site (e.g. https://contoso.sharepoint.com/sites/TechElixir).

.PARAMETER SeedSampleData
    When provided, adds one sample record to each list for testing.

.EXAMPLE
    .\Provision-TechElixirLists.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/TechElixir"

.EXAMPLE
    .\Provision-TechElixirLists.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/TechElixir" -SeedSampleData

.NOTES
    Requires PnP.PowerShell module (Install-Module PnP.PowerShell).
    Authenticated interactively via device-code / browser login.
#>

[CmdletBinding(SupportsShouldProcess)]
param (
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [switch]$SeedSampleData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

function Get-OrCreateList {
    <#
    .SYNOPSIS  Returns an existing list or creates it if absent.
    #>
    param (
        [string]$ListName,
        [string]$ListTemplate = 'GenericList'
    )

    $list = Get-PnPList -Identity $ListName -ErrorAction SilentlyContinue
    if ($null -eq $list) {
        Write-Host "  Creating list: '$ListName'" -ForegroundColor Cyan
        $list = New-PnPList -Title $ListName -Template $ListTemplate -OnQuickLaunch
        # Enable versioning for governance
        Set-PnPList -Identity $ListName -EnableVersioning $true
    }
    else {
        Write-Host "  List already exists: '$ListName'" -ForegroundColor DarkGray
    }
    return $list
}

function Add-FieldIfMissing {
    <#
    .SYNOPSIS  Adds a column to a list only if a column with the same internal name does not exist.
    #>
    param (
        [string]$ListName,
        [string]$InternalName,
        [string]$DisplayName,
        [string]$Type,               # Text | Note | Number | DateTime | Boolean | Choice | URL
        [string[]]$Choices,          # For Choice fields
        [string]$DefaultValue,       # Optional default
        [bool]$Required = $false,
        [bool]$AddToDefaultView = $false
    )

    $existing = Get-PnPField -List $ListName -Identity $InternalName -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        Write-Host "    Column already exists: '$InternalName' on '$ListName'" -ForegroundColor DarkGray
        return $existing
    }

    Write-Host "    Adding column '$InternalName' ($Type) to '$ListName'" -ForegroundColor Cyan

    $field = $null
    switch ($Type) {
        'Text' {
            $field = Add-PnPField -List $ListName -InternalName $InternalName -DisplayName $DisplayName `
                -Type Text -Required:$Required -AddToDefaultView:$AddToDefaultView
        }
        'Note' {
            $field = Add-PnPField -List $ListName -InternalName $InternalName -DisplayName $DisplayName `
                -Type Note -Required:$Required -AddToDefaultView:$AddToDefaultView
        }
        'Number' {
            $field = Add-PnPField -List $ListName -InternalName $InternalName -DisplayName $DisplayName `
                -Type Number -Required:$Required -AddToDefaultView:$AddToDefaultView
        }
        'DateTime' {
            $field = Add-PnPField -List $ListName -InternalName $InternalName -DisplayName $DisplayName `
                -Type DateTime -Required:$Required -AddToDefaultView:$AddToDefaultView
        }
        'Boolean' {
            $field = Add-PnPField -List $ListName -InternalName $InternalName -DisplayName $DisplayName `
                -Type Boolean -Required:$Required -AddToDefaultView:$AddToDefaultView
        }
        'URL' {
            $field = Add-PnPField -List $ListName -InternalName $InternalName -DisplayName $DisplayName `
                -Type URL -Required:$Required -AddToDefaultView:$AddToDefaultView
        }
        'Choice' {
            $field = Add-PnPField -List $ListName -InternalName $InternalName -DisplayName $DisplayName `
                -Type Choice -Choices $Choices -Required:$Required -AddToDefaultView:$AddToDefaultView
        }
        default {
            throw "Unsupported field type '$Type' for column '$InternalName'."
        }
    }

    if ($null -ne $DefaultValue -and $DefaultValue -ne '') {
        Set-PnPField -List $ListName -Identity $InternalName -Values @{ DefaultValue = $DefaultValue }
    }

    return $field
}

function Add-IndexIfMissing {
    <#
    .SYNOPSIS  Adds a list index on the given column if not already present.
    #>
    param (
        [string]$ListName,
        [string]$InternalName
    )

    $list = Get-PnPList -Identity $ListName -Includes FieldIndexes
    $field = Get-PnPField -List $ListName -Identity $InternalName -ErrorAction SilentlyContinue
    if ($null -eq $field) {
        Write-Host "    Skipping index – column '$InternalName' not found on '$ListName'." -ForegroundColor Yellow
        return
    }

    $alreadyIndexed = $list.FieldIndexes | Where-Object { $_.Id -eq $field.Id }
    if ($null -ne $alreadyIndexed) {
        Write-Host "    Index already exists on '$InternalName' in '$ListName'" -ForegroundColor DarkGray
        return
    }

    Write-Host "    Adding index on '$InternalName' in '$ListName'" -ForegroundColor Cyan
    $ctx = Get-PnPContext
    $spList = $ctx.Web.Lists.GetByTitle($ListName)
    $spField = $spList.Fields.GetByInternalNameOrTitle($InternalName)
    $spList.FieldIndexes.Add($spField) | Out-Null
    $ctx.ExecuteQuery()
}

function Add-ViewIfMissing {
    <#
    .SYNOPSIS  Creates a list view only if no view with the same name exists.
    #>
    param (
        [string]$ListName,
        [string]$ViewName,
        [string[]]$Fields,
        [string]$Query = '',
        [string]$RowLimit = '30',
        [bool]$SetAsDefault = $false
    )

    $existing = Get-PnPView -List $ListName -Identity $ViewName -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        Write-Host "    View already exists: '$ViewName' on '$ListName'" -ForegroundColor DarkGray
        return
    }

    Write-Host "    Creating view '$ViewName' on '$ListName'" -ForegroundColor Cyan

    $params = @{
        List      = $ListName
        Title     = $ViewName
        Fields    = $Fields
        RowLimit  = [int]$RowLimit
    }
    if ($Query -ne '') { $params['Query'] = $Query }
    if ($SetAsDefault)  { $params['SetAsDefault'] = $true }

    Add-PnPView @params | Out-Null
}

# ---------------------------------------------------------------------------
# Connect
# ---------------------------------------------------------------------------

Write-Host "`nConnecting to '$SiteUrl' ..." -ForegroundColor Yellow
Connect-PnPOnline -Url $SiteUrl -Interactive
Write-Host "Connected.`n" -ForegroundColor Green

# ===========================================================================
# 1. Solution Registry
# ===========================================================================
Write-Host "=== Solution Registry ===" -ForegroundColor Magenta

Get-OrCreateList -ListName 'Solution Registry' | Out-Null

Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'Description'       -DisplayName 'Description'       -Type Note
Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'SolutionStatus'    -DisplayName 'Solution Status'   -Type Choice `
    -Choices @('Active','Inactive','InDevelopment','Deprecated','Planned','Retired')
Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'AppStatus'         -DisplayName 'App Status'        -Type Choice `
    -Choices @('Active','Inactive','InDevelopment','Deprecated','Planned','Retired')
Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'Owner'             -DisplayName 'Owner'             -Type Text
Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'AppOwner'          -DisplayName 'App Owner'         -Type Text
Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'DocCompleteness'   -DisplayName 'Doc Completeness'  -Type Number
Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'GithubRepoUrl'     -DisplayName 'GitHub Repo URL'   -Type URL
Add-FieldIfMissing -ListName 'Solution Registry' -InternalName 'Tags'              -DisplayName 'Tags'              -Type Text

# Views
Add-ViewIfMissing -ListName 'Solution Registry' -ViewName 'All Solutions' -SetAsDefault $true `
    -Fields @('LinkTitle','SolutionStatus','AppStatus','Owner','DocCompleteness','Tags')

Add-ViewIfMissing -ListName 'Solution Registry' -ViewName 'Active Solutions' `
    -Fields @('LinkTitle','SolutionStatus','Owner','DocCompleteness') `
    -Query '<Where><Eq><FieldRef Name="SolutionStatus"/><Value Type="Choice">Active</Value></Eq></Where>'

Add-ViewIfMissing -ListName 'Solution Registry' -ViewName 'By Owner' `
    -Fields @('LinkTitle','SolutionStatus','Owner','DocCompleteness') `
    -Query '<GroupBy><FieldRef Name="Owner"/></GroupBy>'

Add-ViewIfMissing -ListName 'Solution Registry' -ViewName 'Needs Documentation' `
    -Fields @('LinkTitle','SolutionStatus','Owner','DocCompleteness') `
    -Query '<Where><Lt><FieldRef Name="DocCompleteness"/><Value Type="Number">70</Value></Lt></Where>'

# ===========================================================================
# 2. Solution Documents
# ===========================================================================
Write-Host "`n=== Solution Documents ===" -ForegroundColor Magenta

Get-OrCreateList -ListName 'Solution Documents' | Out-Null

Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'SolutionId'     -DisplayName 'Solution Id'     -Type Text    -Required $true
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'AppId'          -DisplayName 'App Id'          -Type Text
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'SectionKey'     -DisplayName 'Section Key'     -Type Text    -Required $true
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'SectionNumber'  -DisplayName 'Section Number'  -Type Text
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'SectionTitle'   -DisplayName 'Section Title'   -Type Text    -Required $true
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'Status'         -DisplayName 'Status'          -Type Choice  -Required $true `
    -Choices @('Current','Outdated','Missing','InReview','Draft')
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'Url'            -DisplayName 'Url'             -Type URL
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'LastUpdated'    -DisplayName 'Last Updated'    -Type DateTime
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'Owner'          -DisplayName 'Owner'           -Type Text
Add-FieldIfMissing -ListName 'Solution Documents' -InternalName 'Notes'          -DisplayName 'Notes'           -Type Note

# Indexes
Add-IndexIfMissing -ListName 'Solution Documents' -InternalName 'SolutionId'
Add-IndexIfMissing -ListName 'Solution Documents' -InternalName 'AppId'

# Views
Add-ViewIfMissing -ListName 'Solution Documents' -ViewName 'By Solution' -SetAsDefault $true `
    -Fields @('LinkTitle','SolutionId','SectionTitle','Status','LastUpdated','Owner') `
    -Query '<GroupBy><FieldRef Name="SolutionId"/></GroupBy>'

Add-ViewIfMissing -ListName 'Solution Documents' -ViewName 'Current Docs' `
    -Fields @('LinkTitle','SolutionId','SectionTitle','Status','LastUpdated') `
    -Query '<Where><Eq><FieldRef Name="Status"/><Value Type="Choice">Current</Value></Eq></Where>'

Add-ViewIfMissing -ListName 'Solution Documents' -ViewName 'Outdated or Missing' `
    -Fields @('LinkTitle','SolutionId','SectionTitle','Status','LastUpdated') `
    -Query '<Where><In><FieldRef Name="Status"/><Values><Value Type="Choice">Outdated</Value><Value Type="Choice">Missing</Value></Values></In></Where>'

Add-ViewIfMissing -ListName 'Solution Documents' -ViewName 'Recently Updated' `
    -Fields @('LinkTitle','SolutionId','SectionTitle','Status','LastUpdated') `
    -Query '<OrderBy><FieldRef Name="LastUpdated" Ascending="FALSE"/></OrderBy>'

# ===========================================================================
# 3. Solution Releases
# ===========================================================================
Write-Host "`n=== Solution Releases ===" -ForegroundColor Magenta

Get-OrCreateList -ListName 'Solution Releases' | Out-Null

Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'SolutionId'            -DisplayName 'Solution Id'             -Type Text     -Required $true
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'AppId'                 -DisplayName 'App Id'                  -Type Text
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'Version'               -DisplayName 'Version'                 -Type Text     -Required $true
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'Date'                  -DisplayName 'Date'                    -Type DateTime
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'ReleaseDate'           -DisplayName 'Release Date'            -Type DateTime -Required $true
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'ReleaseType'           -DisplayName 'Release Type'            -Type Choice `
    -Choices @('Major','Minor','Patch','Hotfix','Preview','PreRelease')
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'Summary'               -DisplayName 'Summary'                 -Type Note
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'Changes'               -DisplayName 'Changes'                 -Type Note
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'DocumentationChanges'  -DisplayName 'Documentation Changes'   -Type Note
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'GithubReleaseUrl'      -DisplayName 'GitHub Release URL'      -Type URL
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'DeploymentStatus'      -DisplayName 'Deployment Status'       -Type Choice `
    -Choices @('Deployed','InProgress','Planned','Failed','RolledBack')
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'ReleaseOwner'          -DisplayName 'Release Owner'           -Type Text
Add-FieldIfMissing -ListName 'Solution Releases' -InternalName 'KnownIssues'           -DisplayName 'Known Issues'            -Type Note

# Indexes
Add-IndexIfMissing -ListName 'Solution Releases' -InternalName 'SolutionId'
Add-IndexIfMissing -ListName 'Solution Releases' -InternalName 'AppId'

# Views
Add-ViewIfMissing -ListName 'Solution Releases' -ViewName 'Release Timeline' -SetAsDefault $true `
    -Fields @('LinkTitle','SolutionId','Version','ReleaseDate','ReleaseType','DeploymentStatus') `
    -Query '<OrderBy><FieldRef Name="ReleaseDate" Ascending="FALSE"/></OrderBy>'

Add-ViewIfMissing -ListName 'Solution Releases' -ViewName 'By Solution' `
    -Fields @('LinkTitle','SolutionId','Version','ReleaseDate','DeploymentStatus') `
    -Query '<GroupBy><FieldRef Name="SolutionId"/></GroupBy>'

Add-ViewIfMissing -ListName 'Solution Releases' -ViewName 'Pending or Failed Deployments' `
    -Fields @('LinkTitle','SolutionId','Version','ReleaseDate','DeploymentStatus') `
    -Query '<Where><In><FieldRef Name="DeploymentStatus"/><Values><Value Type="Choice">Planned</Value><Value Type="Choice">InProgress</Value><Value Type="Choice">Failed</Value></Values></In></Where>'

Add-ViewIfMissing -ListName 'Solution Releases' -ViewName 'Major Releases' `
    -Fields @('LinkTitle','SolutionId','Version','ReleaseDate','Summary') `
    -Query '<Where><Eq><FieldRef Name="ReleaseType"/><Value Type="Choice">Major</Value></Eq></Where>'

# ===========================================================================
# 4. Solution Technical Debt
# ===========================================================================
Write-Host "`n=== Solution Technical Debt ===" -ForegroundColor Magenta

Get-OrCreateList -ListName 'Solution Technical Debt' | Out-Null

Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'SolutionId'           -DisplayName 'Solution Id'           -Type Text   -Required $true
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'AppId'                -DisplayName 'App Id'                -Type Text
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'Description'          -DisplayName 'Description'           -Type Note
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'Category'             -DisplayName 'Category'              -Type Choice -Required $true `
    -Choices @('Architecture','Security','Performance','Maintainability','Testing','Dependency','Compliance','Other')
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'Severity'             -DisplayName 'Severity'              -Type Choice -Required $true `
    -Choices @('Critical','High','Medium','Low')
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'Impact'               -DisplayName 'Impact'                -Type Note
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'SuggestedRemediation' -DisplayName 'Suggested Remediation' -Type Note
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'Owner'                -DisplayName 'Owner'                 -Type Text
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'TargetRelease'        -DisplayName 'Target Release'        -Type Text
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'Status'               -DisplayName 'Status'                -Type Choice -Required $true `
    -Choices @('Open','InProgress','Resolved','Deferred','Cancelled')
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'CreatedDate'          -DisplayName 'Created Date'          -Type DateTime
Add-FieldIfMissing -ListName 'Solution Technical Debt' -InternalName 'LastUpdatedDate'      -DisplayName 'Last Updated Date'     -Type DateTime

# Indexes
Add-IndexIfMissing -ListName 'Solution Technical Debt' -InternalName 'SolutionId'
Add-IndexIfMissing -ListName 'Solution Technical Debt' -InternalName 'AppId'

# Views
Add-ViewIfMissing -ListName 'Solution Technical Debt' -ViewName 'Open Debt' -SetAsDefault $true `
    -Fields @('LinkTitle','SolutionId','Category','Severity','Status','Owner') `
    -Query '<Where><Neq><FieldRef Name="Status"/><Value Type="Choice">Resolved</Value></Neq></Where>'

Add-ViewIfMissing -ListName 'Solution Technical Debt' -ViewName 'Critical and High' `
    -Fields @('LinkTitle','SolutionId','Category','Severity','Status','Owner') `
    -Query '<Where><In><FieldRef Name="Severity"/><Values><Value Type="Choice">Critical</Value><Value Type="Choice">High</Value></Values></In></Where>'

Add-ViewIfMissing -ListName 'Solution Technical Debt' -ViewName 'By Solution' `
    -Fields @('LinkTitle','SolutionId','Category','Severity','Status') `
    -Query '<GroupBy><FieldRef Name="SolutionId"/></GroupBy>'

Add-ViewIfMissing -ListName 'Solution Technical Debt' -ViewName 'By Owner' `
    -Fields @('LinkTitle','SolutionId','Category','Severity','Status','Owner') `
    -Query '<GroupBy><FieldRef Name="Owner"/></GroupBy>'

# ===========================================================================
# 5. Solution Architecture Assets
# ===========================================================================
Write-Host "`n=== Solution Architecture Assets ===" -ForegroundColor Magenta

Get-OrCreateList -ListName 'Solution Architecture Assets' | Out-Null

Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'SolutionId'       -DisplayName 'Solution Id'       -Type Text    -Required $true
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'AppId'            -DisplayName 'App Id'            -Type Text
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'Url'              -DisplayName 'Url'               -Type URL     -Required $true
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'AssetType'        -DisplayName 'Asset Type'        -Type Choice  -Required $true `
    -Choices @('SVG','PNG','PDF','VSDX','Draw.io','MERMAID','PowerPoint','Other')
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'Description'      -DisplayName 'Description'       -Type Note
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'Version'          -DisplayName 'Version'           -Type Text
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'LastUpdated'      -DisplayName 'Last Updated'      -Type DateTime
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'Owner'            -DisplayName 'Owner'             -Type Text
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'PreviewAvailable' -DisplayName 'Preview Available' -Type Boolean
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'PreviewUrl'       -DisplayName 'Preview Url'       -Type URL
Add-FieldIfMissing -ListName 'Solution Architecture Assets' -InternalName 'Category'         -DisplayName 'Category'          -Type Choice `
    -Choices @('Current State','Future State','Logical','Physical','Data Flow','Sequence','Deployment','Other')

# Indexes
Add-IndexIfMissing -ListName 'Solution Architecture Assets' -InternalName 'SolutionId'
Add-IndexIfMissing -ListName 'Solution Architecture Assets' -InternalName 'AppId'

# Views
Add-ViewIfMissing -ListName 'Solution Architecture Assets' -ViewName 'By Solution' -SetAsDefault $true `
    -Fields @('LinkTitle','SolutionId','AssetType','Category','LastUpdated','Owner') `
    -Query '<GroupBy><FieldRef Name="SolutionId"/></GroupBy>'

Add-ViewIfMissing -ListName 'Solution Architecture Assets' -ViewName 'Future State Assets' `
    -Fields @('LinkTitle','SolutionId','AssetType','Description','LastUpdated') `
    -Query '<Where><Eq><FieldRef Name="Category"/><Value Type="Choice">Future State</Value></Eq></Where>'

Add-ViewIfMissing -ListName 'Solution Architecture Assets' -ViewName 'Assets Missing Preview' `
    -Fields @('LinkTitle','SolutionId','AssetType','Category','Owner') `
    -Query '<Where><Eq><FieldRef Name="PreviewAvailable"/><Value Type="Integer">0</Value></Eq></Where>'

Add-ViewIfMissing -ListName 'Solution Architecture Assets' -ViewName 'Recently Updated Assets' `
    -Fields @('LinkTitle','SolutionId','AssetType','Category','LastUpdated') `
    -Query '<OrderBy><FieldRef Name="LastUpdated" Ascending="FALSE"/></OrderBy>'

# ===========================================================================
# 6. Solution Integrations
# ===========================================================================
Write-Host "`n=== Solution Integrations ===" -ForegroundColor Magenta

Get-OrCreateList -ListName 'Solution Integrations' | Out-Null

Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'SolutionId'         -DisplayName 'Solution Id'         -Type Text   -Required $true
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'AppId'              -DisplayName 'App Id'              -Type Text
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'Name'               -DisplayName 'Name'                -Type Text   -Required $true
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'SystemType'         -DisplayName 'System Type'         -Type Choice -Required $true `
    -Choices @('SharePoint','Dataverse','Power Automate','Azure Service','External API','GitHub','Microsoft Graph','SAP','SQL Database','Other')
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'Direction'          -DisplayName 'Direction'           -Type Choice -Required $true `
    -Choices @('Inbound','Outbound','Bidirectional')
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'AuthenticationType' -DisplayName 'Authentication Type' -Type Choice -Required $true `
    -Choices @('OAuth 2.0','API Key','Managed Identity','Service Principal','Basic Auth','Certificate','Anonymous','Other')
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'DataClassification' -DisplayName 'Data Classification' -Type Choice -Required $true `
    -Choices @('Public','Internal','Confidential','Restricted')
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'Url'               -DisplayName 'Url'                 -Type URL
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'DocumentationUrl'  -DisplayName 'Documentation Url'   -Type URL
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'Notes'             -DisplayName 'Notes'               -Type Note
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'Environment'       -DisplayName 'Environment'         -Type Choice -Required $true `
    -Choices @('Development','Test','UAT','Production')
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'Status'            -DisplayName 'Status'              -Type Choice -Required $true `
    -Choices @('Active','Degraded','Inactive','Planned')
Add-FieldIfMissing -ListName 'Solution Integrations' -InternalName 'Owner'             -DisplayName 'Owner'               -Type Text

# Indexes
Add-IndexIfMissing -ListName 'Solution Integrations' -InternalName 'SolutionId'
Add-IndexIfMissing -ListName 'Solution Integrations' -InternalName 'AppId'

# Views
Add-ViewIfMissing -ListName 'Solution Integrations' -ViewName 'By Solution' -SetAsDefault $true `
    -Fields @('LinkTitle','SolutionId','Name','SystemType','Direction','Status','Environment') `
    -Query '<GroupBy><FieldRef Name="SolutionId"/></GroupBy>'

Add-ViewIfMissing -ListName 'Solution Integrations' -ViewName 'Production Integrations' `
    -Fields @('LinkTitle','SolutionId','Name','SystemType','AuthenticationType','Status') `
    -Query '<Where><Eq><FieldRef Name="Environment"/><Value Type="Choice">Production</Value></Eq></Where>'

Add-ViewIfMissing -ListName 'Solution Integrations' -ViewName 'Degraded or Inactive' `
    -Fields @('LinkTitle','SolutionId','Name','SystemType','Status','Owner') `
    -Query '<Where><In><FieldRef Name="Status"/><Values><Value Type="Choice">Degraded</Value><Value Type="Choice">Inactive</Value></Values></In></Where>'

Add-ViewIfMissing -ListName 'Solution Integrations' -ViewName 'By System Type' `
    -Fields @('LinkTitle','SolutionId','Name','SystemType','Status','Environment') `
    -Query '<GroupBy><FieldRef Name="SystemType"/></GroupBy>'

# ===========================================================================
# 7. Solution Accessibility Checks
# ===========================================================================
Write-Host "`n=== Solution Accessibility Checks ===" -ForegroundColor Magenta

Get-OrCreateList -ListName 'Solution Accessibility Checks' | Out-Null

Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'SolutionId'          -DisplayName 'Solution Id'          -Type Text   -Required $true
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'AppId'               -DisplayName 'App Id'               -Type Text
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'Requirement'         -DisplayName 'Requirement'          -Type Text   -Required $true
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'WcagReference'       -DisplayName 'WCAG Reference'       -Type Text
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'Status'              -DisplayName 'Status'               -Type Choice -Required $true `
    -Choices @('Pass','NeedsAttention','Blocked','NotReviewed')
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'ImpactArea'          -DisplayName 'Impact Area'          -Type Choice -Required $true `
    -Choices @('Visual','Auditory','Mobility','Cognitive','Keyboard Navigation','Screen Reader','Color Contrast','Other')
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'Notes'               -DisplayName 'Notes'                -Type Note
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'RemediationGuidance' -DisplayName 'Remediation Guidance' -Type Note
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'Owner'               -DisplayName 'Owner'                -Type Text
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'TargetDate'          -DisplayName 'Target Date'          -Type DateTime
Add-FieldIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'RelatedDocumentUrl'  -DisplayName 'Related Document URL' -Type URL

# Indexes
Add-IndexIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'SolutionId'
Add-IndexIfMissing -ListName 'Solution Accessibility Checks' -InternalName 'AppId'

# Views
Add-ViewIfMissing -ListName 'Solution Accessibility Checks' -ViewName 'By Solution' -SetAsDefault $true `
    -Fields @('LinkTitle','SolutionId','Requirement','WcagReference','Status','ImpactArea','Owner') `
    -Query '<GroupBy><FieldRef Name="SolutionId"/></GroupBy>'

Add-ViewIfMissing -ListName 'Solution Accessibility Checks' -ViewName 'Open Accessibility Issues' `
    -Fields @('LinkTitle','SolutionId','Requirement','Status','ImpactArea','Owner','TargetDate') `
    -Query '<Where><In><FieldRef Name="Status"/><Values><Value Type="Choice">NeedsAttention</Value><Value Type="Choice">Blocked</Value><Value Type="Choice">NotReviewed</Value></Values></In></Where>'

Add-ViewIfMissing -ListName 'Solution Accessibility Checks' -ViewName 'Due Soon' `
    -Fields @('LinkTitle','SolutionId','Requirement','Status','TargetDate','Owner') `
    -Query '<Where><And><Leq><FieldRef Name="TargetDate"/><Value Type="DateTime"><Today OffsetDays="30"/></Value></Leq><Neq><FieldRef Name="Status"/><Value Type="Choice">Pass</Value></Neq></And></Where>'

Add-ViewIfMissing -ListName 'Solution Accessibility Checks' -ViewName 'By Impact Area' `
    -Fields @('LinkTitle','SolutionId','Requirement','Status','ImpactArea','WcagReference') `
    -Query '<GroupBy><FieldRef Name="ImpactArea"/></GroupBy>'

# ===========================================================================
# Sample data (only when -SeedSampleData is specified)
# ===========================================================================
if ($SeedSampleData) {
    Write-Host "`n=== Seeding sample data ===" -ForegroundColor Magenta

    # Solution Registry – parent record (used as SolutionId = "1" by children below)
    Write-Host "  Adding sample: Solution Registry" -ForegroundColor Cyan
    $parentItem = Add-PnPListItem -List 'Solution Registry' -Values @{
        Title            = 'Finance Elixir'
        Description      = 'Finance operations solution built on the Power Platform and SharePoint.'
        SolutionStatus   = 'Active'
        Owner            = 'Finance Team'
        DocCompleteness  = 82
        Tags             = 'Finance;SharePoint;Power Platform'
    }
    $solutionId = $parentItem.Id.ToString()

    Write-Host "  Adding sample: Solution Documents (SolutionId=$solutionId)" -ForegroundColor Cyan
    Add-PnPListItem -List 'Solution Documents' -Values @{
        Title         = 'Architecture Overview'
        SolutionId    = $solutionId
        SectionKey    = 'architecture'
        SectionNumber = '2.1'
        SectionTitle  = 'Current State Architecture'
        Status        = 'Current'
        Owner         = 'Architecture Team'
        Notes         = 'Reviewed and approved Q2 2026.'
    } | Out-Null

    Write-Host "  Adding sample: Solution Releases (SolutionId=$solutionId)" -ForegroundColor Cyan
    Add-PnPListItem -List 'Solution Releases' -Values @{
        Title            = 'v2.4.0'
        SolutionId       = $solutionId
        Version          = '2.4.0'
        ReleaseDate      = [DateTime]::Today
        ReleaseType      = 'Minor'
        Summary          = 'Added API caching improvements and telemetry refactor.'
        DeploymentStatus = 'Deployed'
        ReleaseOwner     = 'DevOps Team'
    } | Out-Null

    Write-Host "  Adding sample: Solution Technical Debt (SolutionId=$solutionId)" -ForegroundColor Cyan
    Add-PnPListItem -List 'Solution Technical Debt' -Values @{
        Title               = 'Replace legacy auth flow'
        SolutionId          = $solutionId
        Description         = 'Uses deprecated token logic that will be unsupported in 2027.'
        Category            = 'Security'
        Severity            = 'High'
        SuggestedRemediation = 'Move to managed identity for all API calls.'
        Owner               = 'Platform Security'
        TargetRelease       = '2.5.0'
        Status              = 'Open'
    } | Out-Null

    Write-Host "  Adding sample: Solution Architecture Assets (SolutionId=$solutionId)" -ForegroundColor Cyan
    Add-PnPListItem -List 'Solution Architecture Assets' -Values @{
        Title            = 'Target Architecture Diagram'
        SolutionId       = $solutionId
        AssetType        = 'VSDX'
        Description      = 'Logical application topology – future state.'
        Category         = 'Future State'
        Owner            = 'Enterprise Architecture'
        PreviewAvailable = $false
    } | Out-Null

    Write-Host "  Adding sample: Solution Integrations (SolutionId=$solutionId)" -ForegroundColor Cyan
    Add-PnPListItem -List 'Solution Integrations' -Values @{
        Title              = 'Finance API Connector'
        SolutionId         = $solutionId
        Name               = 'SAP Finance API'
        SystemType         = 'External API'
        Direction          = 'Bidirectional'
        AuthenticationType = 'OAuth 2.0'
        DataClassification = 'Confidential'
        Environment        = 'Production'
        Status             = 'Active'
        Owner              = 'Integration Team'
        Notes              = 'Rate limited at 500 RPM.'
    } | Out-Null

    Write-Host "  Adding sample: Solution Accessibility Checks (SolutionId=$solutionId)" -ForegroundColor Cyan
    Add-PnPListItem -List 'Solution Accessibility Checks' -Values @{
        Title               = 'Keyboard Focus Order'
        SolutionId          = $solutionId
        Requirement         = 'All interactive controls are keyboard reachable'
        WcagReference       = 'WCAG 2.1.1'
        Status              = 'NeedsAttention'
        ImpactArea          = 'Keyboard Navigation'
        Notes               = 'Modal trap on settings panel.'
        RemediationGuidance = 'Implement focus trap and escape key handling in modal component.'
        Owner               = 'Accessibility Champion'
        TargetDate          = [DateTime]::Today.AddDays(30)
    } | Out-Null

    Write-Host "`nSample data seeded successfully." -ForegroundColor Green
}

Write-Host "`n=== Provisioning complete ===" -ForegroundColor Green
Disconnect-PnPOnline
