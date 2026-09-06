<#
.SYNOPSIS
    Creates an anonymized copy of the Solution Center sample seed data.

.DESCRIPTION
    Copies JSON seed files to an output folder and replaces organization-specific terms with
    neutral placeholders. Use this before packaging sample data for broader distribution.

.PARAMETER SourceFolder
    Folder containing source JSON sample files.

.PARAMETER OutputFolder
    Folder where anonymized JSON files will be written.

.PARAMETER OrganizationName
    Friendly organization name token replacement.

.EXAMPLE
    .\scripts\New-AnonymizedSeedData.ps1

.EXAMPLE
    .\scripts\New-AnonymizedSeedData.ps1 -OrganizationName "Contoso"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$SourceFolder = 'sharepoint/seed-data',

    [Parameter(Mandatory = $false)]
    [string]$OutputFolder = 'sharepoint/seed-data-anonymized',

    [Parameter(Mandatory = $false)]
    [string]$OrganizationName = 'Contoso'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Path (Split-Path -Path $PSCommandPath -Parent) -Parent

if (-not [System.IO.Path]::IsPathRooted($SourceFolder)) {
    $SourceFolder = Join-Path -Path $repoRoot -ChildPath $SourceFolder
}
if (-not [System.IO.Path]::IsPathRooted($OutputFolder)) {
    $OutputFolder = Join-Path -Path $repoRoot -ChildPath $OutputFolder
}

$SourceFolder = (Resolve-Path -Path $SourceFolder).Path
if (-not (Test-Path -LiteralPath $OutputFolder)) {
    New-Item -Path $OutputFolder -ItemType Directory | Out-Null
}

$replacements = @(
    @{ Pattern = 'Tech Elixir'; Replacement = 'Solution Center' },
    @{ Pattern = 'Finance Elixir'; Replacement = 'Solution Alpha' },
    @{ Pattern = 'Fitness Elixir'; Replacement = 'Solution Beta' },
    @{ Pattern = 'Script Elixir'; Replacement = 'Solution Gamma' },
    @{ Pattern = 'Tech Elixir Portal'; Replacement = 'Solution Portal' },
    @{ Pattern = 'tecanada'; Replacement = 'contoso' },
    @{ Pattern = 'TechElixir'; Replacement = 'SolutionCenter' },
    @{ Pattern = 'tech-elixir'; Replacement = 'solution-center' }
)

Write-Host "Source folder: $SourceFolder" -ForegroundColor Cyan
Write-Host "Output folder: $OutputFolder" -ForegroundColor Cyan

$files = Get-ChildItem -Path $SourceFolder -Filter '*.json' -File
if ($files.Count -eq 0) {
    throw "No JSON files found in $SourceFolder"
}

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8

    foreach ($rule in $replacements) {
        $content = [regex]::Replace($content, [regex]::Escape($rule.Pattern), $rule.Replacement)
    }

    # Replace likely owner or org aliases.
    $content = [regex]::Replace($content, '(?i)"Owner"\s*:\s*"[^"]+"', '"Owner": "' + $OrganizationName + ' Team"')
    $content = [regex]::Replace($content, '(?i)"AppOwner"\s*:\s*"[^"]+"', '"AppOwner": "' + $OrganizationName + ' Team"')

    $outputPath = Join-Path -Path $OutputFolder -ChildPath $file.Name
    Set-Content -LiteralPath $outputPath -Value $content -Encoding UTF8
    Write-Host "Anonymized: $($file.Name)" -ForegroundColor Green
}

Write-Host "Anonymization complete." -ForegroundColor Green
