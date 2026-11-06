# Test plan — CheckQR

## Scope

Testing covers the single-page app in `index.html` (per-type payload
formatting, the canvas pattern generator, history, batch mode) and the
`handshake.js` inter-app message queue. Visual fidelity of the rendered
pattern and the browser's PNG download mechanics are out of scope for the
automated suite and are checked manually in a browser before a release.
Whether the rendered pattern decodes as a standards QR symbol is a product
question tracked in the README's accuracy note, not a test-suite item.

## Suites

| Suite | Covers | Run it | Runs in CI |
|---|---|---|---|
| Smoke suite (`tests/smoke.test.js`) | Page structure (core element IDs, button wiring, the six type options); pattern-generator determinism (same payload → identical painted modules; different payload → different pattern; requested canvas size honoured); payload formatting in `generateQR()` (URL scheme prefixing, credential → checkinfo.me verify URL token, empty-input rejection); history (record, ordering, localStorage persistence, regen, clear); batch tile rendering; `handshake.js` send/receive round-trip | `node tests/smoke.test.js` | Yes — `.github/workflows/tests.yml` |
| Repository structure check | Presence of `index.html`, `README.md`, `LICENSE`, `.gitignore` | (shell steps in the workflow) | Yes — `.github/workflows/ci.yml` |

## CI gates

- Smoke suite green on every push and pull request to `main`.
- CodeQL (javascript-typescript) runs on push, pull request, and weekly; findings are dispositioned per the house SLA (Critical 48 h, High 7 d, Medium 14 d — fix, or a dismissal with the reason recorded).

## Cadence

- Every pull request: smoke suite + structure check + CodeQL.
- Weekly: CodeQL scheduled run.
- Every release candidate: the release-readiness run (checker + evidence reads), per the house Release-Readiness Standard.

## Coverage bar

No numeric floor; new functionality lands with tests per CONTRIBUTING.
