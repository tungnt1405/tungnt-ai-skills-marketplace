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
    # Antigravity has no UserPromptSubmit event; PreInvocation is the per-turn
    # hook, so remind on every invocation after the first full bootstrap.
    $reminder = 'Before responding or taking action, you MUST call the Skill tool to load using-tungnt-ai-skills and follow its routing rules. Then invoke whichever skill it selects.'
    @{
        injectSteps = @(
            @{ ephemeralMessage = $reminder }
        )
    } | ConvertTo-Json -Depth 5 -Compress
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

This injected context appears only on the first invocation and does not persist. On every later turn you will receive a short reminder: respond to it by calling the Skill tool to load using-tungnt-ai-skills again before taking action.

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
