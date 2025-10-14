# PowerShell script to convert Guests.csv to Guests.json with proper phone number formatting
# This handles the scientific notation issue and creates clean JSON

param(
    [string]$InputPath = "D:\work\Tar\Denen Ikya\birthday\invite2\contacts\Guests.csv",
    [string]$OutputPath = "D:\work\Tar\Denen Ikya\birthday\invite2\contacts\Guests.json"
)

Write-Host "Converting CSV to JSON..." -ForegroundColor Green
Write-Host "Input: $InputPath" -ForegroundColor Yellow
Write-Host "Output: $OutputPath" -ForegroundColor Yellow

try {
    # Read CSV content as raw text to avoid scientific notation conversion
    $csvContent = Get-Content $InputPath | Select-Object -Skip 0
    
    # Split header line to get column names
    $headerLine = $csvContent[0]
    $headers = $headerLine.Split(',')
    Write-Host "Found headers: $($headers -join ', ')" -ForegroundColor Cyan
    
    # Initialize array for JSON objects
    $jsonArray = @()
    
    # Process each data line (skip header)
    for ($i = 1; $i -lt $csvContent.Length; $i++) {
        $line = $csvContent[$i]
        
        # Skip empty lines
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }
        
        # Split the line by comma
        $values = $line.Split(',')
        
        # Create object for this row
        $rowObject = [PSCustomObject]@{}
        
        # Process each column
        for ($j = 0; $j -lt $headers.Length; $j++) {
            $columnName = $headers[$j].Trim()
            $value = ""
            
            if ($j -lt $values.Length) {
                $value = $values[$j].Trim()
            }
            
            # Special handling for phone numbers to convert scientific notation
            if ($columnName -eq "PhoneNumber" -and $value -match "E\+") {
                try {
                    # Convert scientific notation to full number
                    $numericValue = [double]$value
                    $value = $numericValue.ToString("F0")
                    Write-Host "Converted phone: $($csvContent[$i].Split(',')[0]) -> $value" -ForegroundColor Gray
                }
                catch {
                    Write-Host "Warning: Could not convert phone number: $value" -ForegroundColor Yellow
                }
            }
            
            # Handle empty values
            if ([string]::IsNullOrWhiteSpace($value)) {
                $value = $null
            }
            
            # Add property to object
            $rowObject | Add-Member -MemberType NoteProperty -Name $columnName -Value $value
        }
        
        $jsonArray += $rowObject
    }
    
    Write-Host "Processed $($jsonArray.Length) records" -ForegroundColor Green
    
    # Convert to JSON with proper formatting
    $jsonOutput = $jsonArray | ConvertTo-Json -Depth 3
    
    # Write to output file
    $jsonOutput | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Host "Successfully converted CSV to JSON" -ForegroundColor Green
    Write-Host "Output saved to: $OutputPath" -ForegroundColor Cyan
    
    # Show sample of converted data
    Write-Host "`nSample of converted data:" -ForegroundColor Yellow
    $jsonArray | Select-Object -First 3 | Format-Table -AutoSize
    
    Write-Host "`nPhone number samples:" -ForegroundColor Yellow
    $jsonArray | Where-Object { $_.PhoneNumber } | Select-Object Name, PhoneNumber -First 5 | Format-Table -AutoSize
}
catch {
    Write-Host "Error during conversion: $_" -ForegroundColor Red
    exit 1
}