@AGENTS.md

## Claude Code specifics

- This repository defines three subagents in `.claude/agents/`: `planner`,
  `author`, and `deployer`. Use them for infrastructure changes rather than
  doing the work in the main session. `/ship-change <request>` runs them in order.
- The Pulumi MCP server is configured in `.mcp.json`. `neo-bridge` is denied
  in `.claude/settings.json`, so don't try to hand work to Neo from here.
- `.claude/hooks/guardrails.py` blocks some Bash commands (see the "Never"
  list in AGENTS.md). If it blocks you, read its message and change your
  approach. Don't try to get around it.
