# Windows launcher counterpart for the UserPromptSubmit bootstrap reminder.
# Copilot CLI expects top-level additionalContext (SDK standard).
$context = 'Before responding or taking action, you MUST call the Skill tool to load using-tungnt-ai-skills and follow its routing rules. Then invoke whichever skill it selects.'

@{
    additionalContext = $context
} | ConvertTo-Json -Depth 5 -Compress
