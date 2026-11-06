# CheckQR — QR Code Generator

CheckQR builds QR-style codes for URLs, text, vCard contacts, WiFi credentials, email links, and Checkinfo credentials, entirely in your browser.

Pick a type, enter the data, and CheckQR formats the payload for that type — a bare domain gains its `https://` scheme, a credential becomes a `checkinfo.me` verification URL carrying a base64 token — then renders a deterministic 25×25 module pattern on a canvas, seeded from the payload text so the same input always produces the same pattern. Codes can be downloaded as PNG files, everything you generate is kept in a local history, and a batch mode renders one tile per line of input. There is no server and no account; history lives in your browser's `localStorage`.

> Accuracy note: the renderer draws a QR-style pattern (finder squares, timing marks, and payload-seeded data modules). It is the pattern generator the code ships today — see the comment at the top of `generateQRCode` in `index.html` — not a standards-encoded QR symbol, so phone scanners should not be expected to decode it. The payload formatting, rendering determinism, history, and batch behaviour described here are exactly what the code does.

## What it does

- **Six payload types** — URL, Text, vCard, WiFi, Email, and Credential, each with an example payload shown as the input placeholder when the type is selected.
- **Payload formatting** — URL entries without a scheme are prefixed with `https://`; a Credential entry (JSON or plain text) is converted into a `https://checkinfo.me/verify?t=…` URL whose token is the first 20 characters of the base64-encoded credential.
- **Deterministic rendering** — the canvas pattern is seeded from the payload's character codes: identical input, identical pattern; the size is configurable (the input defaults to 200 px).
- **Download** — save the rendered canvas as a PNG (`checkqr-<timestamp>.png`).
- **History** — the last 50 generations are stored in `localStorage`, can be re-loaded into the form with one click ("Use"), and can be cleared.
- **Batch mode** — paste one entry per line and render a tile for each.
- **Handshake helper** — `handshake.js` provides a small localStorage-based message queue (`CheckinfoHandshake`) for inter-app communication between Checkinfo-family apps: register, discover, send, and receive.

## How to use it

1. Clone or download this repository.
2. Open `index.html` in any modern browser (no build step, no server needed).
3. On the **Create** tab, choose a type, enter your data, set a size if you want, and click **Generate**.
4. Click **Download** to save the PNG, revisit past codes on the **History** tab, or use the **Batch** tab for several codes at once.

## Development

- Run the tests: `node tests/smoke.test.js` (Node 18+, no dependencies — the suite loads the page's own script and exercises the payload formatting, the deterministic pattern generator, history, batch mode, and the handshake queue).
- CI runs the same suite on every push and pull request (`.github/workflows/tests.yml`), alongside the repository-structure check in `.github/workflows/ci.yml`.
- The test plan (scope, suites, gates, cadence) lives in [TEST-PLAN.md](TEST-PLAN.md).

## Security

Found a vulnerability? Please report it privately — see [SECURITY.md](SECURITY.md) for the reporting route (GitHub Private Vulnerability Reporting). Do not open a public issue for a security vulnerability.

## Contributing

Contributions are welcome — the process is in [CONTRIBUTING.md](CONTRIBUTING.md). Note its PR-flow discipline: changes land through pull requests, every PR adds a CHANGELOG entry, and the version in `index.html` and `handshake.js` is kept in sync.

## License

MIT — see [LICENSE](LICENSE).
