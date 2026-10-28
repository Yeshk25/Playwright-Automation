$workbookPath = Join-Path $PSScriptRoot '..\utilities\test-case-results.xlsx'

if (-not (Test-Path -LiteralPath $workbookPath -PathType Leaf)) {
  throw "Excel results workbook not found: $workbookPath. Run the Playwright tests first."
}

Start-Process -FilePath (Resolve-Path -LiteralPath $workbookPath).Path
