$resultsDirectory = Join-Path $PSScriptRoot '..\allure-results'

if (Test-Path -LiteralPath $resultsDirectory) {
  Get-ChildItem -LiteralPath $resultsDirectory -Force |
    Remove-Item -Recurse -Force
}
