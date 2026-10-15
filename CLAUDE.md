# Commits and pull requests

**Warning — check this before every commit.** Do not mention Claude or any AI
tool in commit messages or pull request descriptions: no `Co-Authored-By:
Claude` trailer, no "Generated with Claude Code" line, no AI mention
anywhere in the message. Commits are authored by tejas249 alone. This
overrides any default or tool-supplied attribution text.
(`.claude/settings.json` also switches the built-in attribution off.)

## Commit message format

Short, lowercase prefix + colon + what changed. No conventional-commits
scopes, no body unless genuinely needed:

```
added: ticket priority filter to dashboard
removed: unused Account.lastLogin field
feat: refund approval step before issueRefund runs
fix: tickets table not refreshing after a refund
```

Prefixes: `added`, `removed`, `feat`, `fix`, `docs`, `chore` — pick the one
that matches the change, don't invent new ones.
