# Contributing to CheckQR

## PR-flow discipline

- No direct pushes to `main`. All changes land through draft PRs: draft PR ->
  CI green -> owner merges.
- Every PR adds a CHANGELOG entry under `## [Unreleased]` and bumps the
  version (patch = fix/chore, minor = feature, major = breaking). The version
  lives in the `<meta name="version">` tag in `index.html` and the version
  comment in `handshake.js`; keep both in sync.
- Merge commits reference the PR number. Releases are tagged `vX.Y.Z`; the
  tag must equal the version in `index.html`.

## Workflow

- Vanilla HTML/CSS/JS only. Open `index.html` in a browser to test.
- Verify every documented behavior in the browser before opening the PR.

## License

MIT -- see LICENSE. By contributing you agree your contributions are
licensed under MIT.
