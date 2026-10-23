# MILO delivery attribution — handler release

The current production baseline was found in the read-only MILO project mirror, including the current writer and retry source. All three packaged ZIP digests match deploy `6ada0e237386e2df5214b265` exactly. This supersedes the earlier missing-source blocker.

`handler.patch` targets that exact baseline. It adds bounded attribution fields and non-personal campaign IDs to normalized metadata, validates the agreed 30-day touch, and stores its verified category with the existing invoice and original EUR amount in the independent receipt/Sheet comment. It never infers SEO from absent metadata. Status distinguishes `not_collected`, `legacy_utm`, `no_known_non_direct`, `verified`, `expired`, and `invalid`; technical absence of a known touch is not proof of an actual direct acquisition.

Legacy Meta `social / cpc` remains recognized. Numeric campaign/adset/ad IDs in utm_id/utm_term/utm_content and allowlisted platform/branch/language metadata are preserved when present. Free-text search terms and arbitrary content are excluded. This server change does not prove browser label/branch propagation from WEEEK #6893.

Telegram formatter, routing, authentication, delivery logic and ledger are unchanged. notify and retry entry points, retry/ack logic and invoice deduplication are unchanged. wallet ZIP, all eight static/config file digests, runtime API 2 / stream and the five-minute schedule are preserved.

Validation: 29 isolated tests pass, with all network sends mocked, including original vs candidate Telegram bytes/routes, duplicate/ambiguous attempts, Google failure, slow queue, 30-day expiry, unknown metadata, safe campaign IDs, five-column schema, and actual bundled handler comparison. No live test orders, payments or messages were sent.

The private release workspace retains all three original ZIPs and a baseline file/function digest manifest. Emergency recovery is a fresh deploy of the preserved baseline manifest and original ZIPs, after reading current state; it does not replay orders or reset either ledger.

This PR remains an integration candidate until browser collection and the authenticated aggregate report are activated. Pulse must not label its current GA4 cards as Sheet-based 30-day results. Actual source-to-order accuracy needs a subsequent ordinary new order; publication alone does not establish it.

Production publication was rejected before execution by automatic approval review: explicit permission for the production release was required. Verified preview: `6adb610808c4655ea447efad`. Production remains `6ada0e237386e2df5214b265`. Do not retry publication until new relevant user approval.
