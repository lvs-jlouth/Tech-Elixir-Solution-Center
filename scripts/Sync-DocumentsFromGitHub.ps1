<#
.SYNOPSIS
    Links markdown documentation from a GitHub repository's docs folder into the
    Solution Documents list so the Solution Center Documents tab stays aligned
    with the repo as source of truth.

.DESCRIPTION
    Mirrors Sync-DocumentsFromLibrary.ps1, but pulls files from GitHub instead of
    the SharePoint library. Resolves the parent Solution Registry item by title,
    lists markdown files under the given docs path via the GitHub Contents API,
    looks up each file's last commit date, and upserts a Solution Documents item
    per file (matched by SolutionId + SectionKey, so re-running updates in place).

.PARAMETER SolutionTitle
    Title of the existing Solution Registry item to link documents to.

.PARAMETER RepoOwner
    GitHub organization or user that owns the repository.

.PARAMETER RepoName
    GitHub repository name.

.PARAMETER DocsPath
    Path within the repo containing the markdown docset. Defaults to "docs".

.PARAMETER Branch
    Branch to read from. Defaults to "main".

.PARAMETER GitHubToken
    Optional personal access token for private repositories or to avoid the
    60 requests/hour unauthenticated rate limit. Never hardcode this value —
    pass it at runtime (e.g. from a secret store or -GitHubToken (Read-Host -AsSecureString)).

.PARAMETER Owner
    Owner value to stamp on created/updated Solution Documents items.

.EXAMPLE
    .\Sync-DocumentsFromGitHub.ps1 -SolutionTitle "Tech Elixir Solution Center" -RepoOwner "lvs-jlouth" -RepoName "Tech-Elixir-Solution-Center"

.NOTES
    Target site and client ID match Provision-TechElixirLists.ps1.
#>

[CmdletBinding(SupportsShouldProcess)]
param (
    [Parameter(Mandatory = $true)]
    [string]$SolutionTitle,

    [Parameter(Mandatory = $true)]
    [string]$RepoOwner,

    [Parameter(Mandatory = $true)]
    [string]$RepoName,

    [Parameter(Mandatory = $false)]
    [string]$DocsPath = 'docs',

    [Parameter(Mandatory = $false)]
    [string]$Branch = 'main',

    [Parameter(Mandatory = $false)]
    [string]$GitHubToken,

    [Parameter(Mandatory = $false)]
    [string]$Owner = 'GitHub Sync'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$SiteUrl = "https://tecanada.sharepoint.com/sites/TechElixirApps"
$ClientId = "b20f4aa3-ba69-41e5-af43-a17c3e1f9be2"

function Get-InferredSection {
    <#
    .SYNOPSIS  Derives SectionKey/SectionNumber/SectionTitle from a file name.
    .NOTES     Kept identical to Sync-DocumentsFromLibrary.ps1 so both sources
               produce the same section identity for a given file name.
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
        SectionKey    = $key
        SectionNumber = $number
        SectionTitle  = $title
    }
}

function Get-GitHubHeaders {
    param ([string]$Token)

    $headers = @{
        'User-Agent' = 'TechElixir-SolutionCenter-DocSync'
        'Accept'     = 'application/vnd.github+json'
    }
    if (-not [string]::IsNullOrWhiteSpace($Token)) {
        $headers['Authorization'] = "token $Token"
    }
    return $headers
}

$githubHeaders = Get-GitHubHeaders -Token $GitHubToken
$apiBase = "https://api.github.com/repos/$RepoOwner/$RepoName"

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

    Write-Host "Reading '$DocsPath' from $RepoOwner/$RepoName@$Branch ..." -ForegroundColor Yellow
    $contentsUrl = "$apiBase/contents/$DocsPath`?ref=$Branch"
    $contents = Invoke-RestMethod -Uri $contentsUrl -Headers $githubHeaders -Method Get -ErrorAction Stop

    $mdFiles = @($contents | Where-Object { $_.type -eq 'file' -and $_.name -match '\.md$' })
    if ($mdFiles.Count -eq 0) {
        Write-Host "No markdown files found under '$DocsPath'. Nothing to sync." -ForegroundColor DarkGray
        return
    }

    Write-Host "Found $($mdFiles.Count) markdown file(s)." -ForegroundColor Cyan

    foreach ($file in $mdFiles) {
        $section = Get-InferredSection -FileName $file.name

        # Last commit date for this specific file drives LastUpdated.
        $commitsUrl = "$apiBase/commits`?path=$($file.path)&sha=$Branch&per_page=1"
        $commits = @(Invoke-RestMethod -Uri $commitsUrl -Headers $githubHeaders -Method Get -ErrorAction Stop)
        $lastUpdated = if ($commits.Count -gt 0) { [DateTime]$commits[0].commit.author.date } else { [DateTime]::UtcNow }

        $existing = @(
            Get-PnPListItem `
                -List 'Solution Documents' `
                -Query "<View><Query><Where><And><Eq><FieldRef Name='SolutionId'/><Value Type='Text'>$solutionId</Value></Eq><Eq><FieldRef Name='SectionKey'/><Value Type='Text'>$($section.SectionKey)</Value></Eq></And></Where></Query><RowLimit>1</RowLimit></View>" `
                -ErrorAction Stop
        )

        $values = @{
            Title         = $file.name
            SolutionId    = $solutionId
            SectionKey    = $section.SectionKey
            SectionNumber = $section.SectionNumber
            SectionTitle  = $section.SectionTitle
            Status        = 'Current'
            Url           = $file.html_url
            LastUpdated   = $lastUpdated
            Owner         = $Owner
        }

        if ($existing.Count -gt 0) {
            Set-PnPListItem -List 'Solution Documents' -Identity $existing[0].Id -Values $values -ErrorAction Stop | Out-Null
            Write-Host "  Updated: $($file.name) -> SectionKey=$($section.SectionKey)" -ForegroundColor DarkGray
        }
        else {
            Add-PnPListItem -List 'Solution Documents' -Values $values -ErrorAction Stop | Out-Null
            Write-Host "  Linked:  $($file.name) -> SectionKey=$($section.SectionKey)" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "Sync complete. $($mdFiles.Count) file(s) linked to SolutionId=$solutionId from $RepoOwner/$RepoName." -ForegroundColor Green
}
finally {
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
    Write-Host "Disconnected from SharePoint." -ForegroundColor DarkGray
}
