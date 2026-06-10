$pluginRoot = Split-Path -Parent $PSScriptRoot
$bootstrapFile = Join-Path $pluginRoot 'skills/using-tungnt-ai-skills/SKILL.md'

$warningMessage = ''
$homeDir = if ($env:HOME) { $env:HOME } else { $env:USERPROFILE }
$legacySkillsDir = if ($homeDir) { Join-Path $homeDir '.config/tungnt-ai-skills/skills' } else { $null }

if ($legacySkillsDir -and (Test-Path -LiteralPath $legacySkillsDir -PathType Container)) {
    $warningMessage = "`n`n<important-reminder>IN YOUR FIRST REPLY AFTER SEEING THIS MESSAGE YOU MUST TELL THE USER: WARNING: tungnt-ai-skills now uses Claude Code's skills system. Custom skills in ~/.config/tungnt-ai-skills/skills will not be read. Move custom skills to ~/.claude/skills instead. To make this message go away, remove ~/.config/tungnt-ai-skills/skills</important-reminder>"
}

try {
    $bootstrapContent = Get-Content -Raw -LiteralPath $bootstrapFile
} catch {
    $bootstrapContent = 'Error reading using-tungnt-ai-skills skill'
}

$sessionContext = @"
<EXTREMELY_IMPORTANT>
You have tungnt-ai-skills.

**Below is the full content of your bootstrap skill (`using-tungnt-ai-skills`). Read it first. For all other skills, use the 'Skill' tool:**

$bootstrapContent

$warningMessage
</EXTREMELY_IMPORTANT>
"@

if ($env:CURSOR_PLUGIN_ROOT) {
    @{
        additional_context = $sessionContext
    } | ConvertTo-Json -Depth 6 -Compress
} elseif ($env:CLAUDE_PLUGIN_ROOT -and -not $env:COPILOT_CLI) {
    @{
        hookSpecificOutput = @{
            hookEventName = 'SessionStart'
            additionalContext = $sessionContext
        }
    } | ConvertTo-Json -Depth 6 -Compress
} else {
    @{
        additionalContext = $sessionContext
    } | ConvertTo-Json -Depth 6 -Compress
}
