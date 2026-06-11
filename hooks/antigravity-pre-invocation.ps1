$stdinPayload = [Console]::In.ReadToEnd()
$invocationNum = $null

if (-not [string]::IsNullOrWhiteSpace($stdinPayload)) {
    try {
        $payload = $stdinPayload | ConvertFrom-Json
        $invocationNum = $payload.invocationNum
    } catch {
        $invocationNum = $null
    }
}

if ($null -ne $invocationNum -and [int]$invocationNum -gt 1) {
    @{ injectSteps = @() } | ConvertTo-Json -Depth 5 -Compress
    exit 0
}

$pluginRoot = Split-Path -Parent $PSScriptRoot
$bootstrapFile = Join-Path $pluginRoot 'skills/using-tungnt-ai-skills/SKILL.md'

try {
    $bootstrapContent = Get-Content -Raw -LiteralPath $bootstrapFile
} catch {
    $bootstrapContent = 'Error reading using-tungnt-ai-skills skill'
}

$sessionContext = @"
<EXTREMELY_IMPORTANT>
You have tungnt-ai-skills.

Below is the full content of your bootstrap skill (using-tungnt-ai-skills). Read it before responding or taking action. Follow its routing rules and use the relevant Antigravity skill/plugin mechanism for any additional skills.

$bootstrapContent
</EXTREMELY_IMPORTANT>
"@

@{
    injectSteps = @(
        @{
            ephemeralMessage = $sessionContext
        }
    )
} | ConvertTo-Json -Depth 5 -Compress
