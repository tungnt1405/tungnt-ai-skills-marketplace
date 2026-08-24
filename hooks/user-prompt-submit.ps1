# Windows launcher counterpart for the UserPromptSubmit bootstrap reminder.
# Platform-aware (mirrors hooks/user-prompt-submit):
# - Claude Code: SessionStart bootstrap persists in context; remind softly and
#   emit the nested hookSpecificOutput schema Claude Code expects.
# - Copilot CLI / other platforms: nothing persists; require explicit reload,
#   top-level additionalContext (SDK standard).

$claudeMode = [bool]$env:CLAUDE_PLUGIN_ROOT -and -not $env:COPILOT_CLI -and -not $env:CURSOR_PLUGIN_ROOT

if ($claudeMode) {
    $context = 'Your tungnt-ai-skills bootstrap skill content was injected at session start and remains in your context. Follow its routing rules before responding or taking action. Only call the Skill tool to load using-tungnt-ai-skills if that content is missing from your context.'

    @{
        hookSpecificOutput = @{
            hookEventName = 'UserPromptSubmit'
            additionalContext = $context
        }
    } | ConvertTo-Json -Depth 5 -Compress
    exit 0
}

$context = 'Before responding or taking action, you MUST call the Skill tool to load using-tungnt-ai-skills and follow its routing rules. Then invoke whichever skill it selects.'

@{
    additionalContext = $context
} | ConvertTo-Json -Depth 5 -Compress
