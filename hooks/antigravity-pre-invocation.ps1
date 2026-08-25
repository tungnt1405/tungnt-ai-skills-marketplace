$stdinPayload = [Console]::In.ReadToEnd()

$invocationNum = $null
$conversationId = $null
$workspacePath = $null

if (-not [string]::IsNullOrWhiteSpace($stdinPayload)) {
    try {
        $payload = $stdinPayload | ConvertFrom-Json
        $invocationNum = $payload.invocationNum
        $conversationId = $payload.conversationId
        if ($payload.workspacePaths -and @($payload.workspacePaths).Count -gt 0) {
            $workspacePath = @($payload.workspacePaths)[0]
        }
    } catch {
        $invocationNum = $null
        $conversationId = $null
        $workspacePath = $null
    }
}

# Debug logging is off by default. Enabled when:
# - TAIS_HOOK_DEBUG env var is set, or
# - policy.hookDebug=true in workspace tais/setting.json or plugin setting.json.
function Test-HookDebugEnabled {
    if ($env:TAIS_HOOK_DEBUG) { return $true }
    $pluginRoot = Split-Path -Parent $PSScriptRoot
    $candidates = @()
    if ($workspacePath) { $candidates += (Join-Path $workspacePath 'tais/setting.json') }
    $candidates += @(
        (Join-Path $pluginRoot 'tais/setting.json'),
        (Join-Path $pluginRoot 'setting.json')
    )
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) {
            try {
                $setting = Get-Content -Raw -LiteralPath $candidate | ConvertFrom-Json
                if ($setting.policy -and $setting.policy.hookDebug -eq $true) { return $true }
            } catch {}
        }
    }
    return $false
}

if (Test-HookDebugEnabled) {
    $debugLog = if ($env:TAIS_HOOK_DEBUG_LOG) { $env:TAIS_HOOK_DEBUG_LOG } else { Join-Path $HOME '.gemini/tais-hook-debug.log' }
    Add-Content -Path $debugLog -Value ("[{0}] PreInvocation payload: {1}" -f (Get-Date -Format o), $stdinPayload)
}

# Verified Antigravity semantics: invocationNum resets to 0 on each user turn.
# > 0 means mid-turn continuation; context is already present.
if ($null -ne $invocationNum -and [int]$invocationNum -gt 0) {
    Write-Output '{}'
    exit 0
}

$stateDir = if ($env:TAIS_HOOK_STATE_DIR) { $env:TAIS_HOOK_STATE_DIR } else { Join-Path $HOME '.gemini/tungnt-ai-skills' }
$stateFile = Join-Path $stateDir 'bootstrap-state.txt'

$seen = $false
if ($conversationId -and (Test-Path $stateFile)) {
    $pattern = '^{0}=' -f [regex]::Escape($conversationId)
    $seen = [bool](Select-String -LiteralPath $stateFile -Pattern $pattern -Quiet)
}

if ($seen) {
    $reminder = @'
Before responding or taking action, you MUST call the Skill tool to load using-tungnt-ai-skills and follow its routing rules.

Skill tool usage:
  Skill name: using-tungnt-ai-skills
  This loads the bootstrap skill which routes to the right workflow skill.

Routing rules (from using-tungnt-ai-skills):
1. User instructions win
2. tungnt-ai-skills skills take priority
3. Default assistant behavior last

Process skills (choose one):
- investigation: bug tracing, incident analysis
- quick-dev: trivial, low-risk changes (<30 min)
- brainstorming: design exploration before creative work
- writing-plans: turn specs into implementation plans
- executing-plans: execute written plans with checkpoints
- requesting-code-review / receiving-code-review
- finishing-a-development-branch: verify DoD, handle merge

Domain skills (support brainstorming):
- api-design: REST/HTTP API contracts
- security-and-hardening: auth, secrets, OWASP, DevSecOps
- ui-ux-pro-max: design intelligence, design systems

Then invoke whichever skill it selects.
'@
    @{
        injectSteps = @(
            @{ ephemeralMessage = $reminder }
        )
    } | ConvertTo-Json -Depth 5 -Compress
    exit 0
}

if ($conversationId) {
    New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
    $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $cutoff = $now - 604800
    $kept = @()
    if (Test-Path $stateFile) {
        foreach ($line in Get-Content -LiteralPath $stateFile) {
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2 -and [long]$parts[1] -ge $cutoff) {
                $kept += $line
            }
        }
    }
    $kept += "$conversationId=$now"
    if ($kept.Count -gt 200) {
        $kept = $kept[-200..-1]
    }
    Set-Content -LiteralPath "$stateFile.tmp" -Value $kept
    Move-Item -Force -LiteralPath "$stateFile.tmp" -Destination $stateFile
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

This injected context appears only on the first model invocation of a session. On later turns you will receive a short reminder: respond to it by calling the Skill tool to load using-tungnt-ai-skills again before taking action.

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
