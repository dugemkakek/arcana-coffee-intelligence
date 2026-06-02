## What & why

A short description of the change and the problem it solves.

Link the issue this closes: `Closes #…`

## How to test

Step-by-step instructions a reviewer can follow to verify the change works. Include any env vars, sample data, or commands.

```bash
# example
pnpm install
pnpm --filter @arcana/db-local prisma migrate dev
pnpm dev
```

## Screenshots / recordings

For UI changes, attach before/after screenshots or a short screen recording.

## Checklist

- [ ] Tests added or updated
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm format:check` passes
- [ ] CHANGELOG.md updated (if user-facing)
- [ ] Docs updated (if behavior changed)

## Breaking changes

Call them out explicitly. Migration steps required?
