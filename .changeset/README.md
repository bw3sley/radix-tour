# Changesets

Every change that affects users needs a changeset: a short note that says what changed and how big the change is.

```bash
npx changeset
```

Pick the bump (`patch` for fixes, `minor` for new features, `major` for breaking changes) and write one sentence for the changelog. While the package is below 1.0, breaking changes use `minor`. Commit the generated file with your change.

Releasing is a separate step: `npm run version` applies the pending changesets to `package.json` and `CHANGELOG.md`, and `npm run release` publishes.
