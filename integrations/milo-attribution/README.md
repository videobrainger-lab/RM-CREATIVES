# MILO order attribution: last non-direct touch, 30 days

Status: the verified handler patch is published in production. Browser collection, Sheet aggregate report and Pulse switching remain inactive.

The user selected the last known non-direct source within 30 days. A direct/internal return preserves the source and original timestamp. A later determined external source replaces it. The original timestamp expires after 30 days; direct visits never renew it. Unknown historical orders are not relabelled as SEO.

The existing core/browser candidate respects MILO analytics consent, stores only channel/source/medium/timestamp/model, and prepares five MILO_attribution_* fields for native T706 submission. It emits no orders or notifications and does not replace the checkout controller.

## Handler preparation and verified preview — 23 October 2026

Current sources, writer, retry and all three original ZIPs were found in the read-only MILO project mirror. Their SHA256 values match production deploy 6ada0e237386e2df5214b265. This supersedes the earlier missing-source blocker.

[Backend patch and validation](backend/README.md) add bounded source metadata, 30-day validation, source categories and safe numeric Meta campaign IDs to independent receipts, with the same invoice and EUR amount. Missing collection, unknown touch, expiry and invalid metadata are distinct statuses. No missing metadata is inferred as SEO. Legacy social/cpc remains compatible.

Verified preview: 6adb610808c4655ea447efad. All 29 mocked source/bundle regression tests pass. All eight static/config digests, wallet ZIP, Telegram formatting/routing/authentication, ledger/dedup logic and five-minute retry schedule are preserved. Preview GET /notify returns HTTP 200; configured=false is expected because production secrets are not present in preview. Production still returns configured=true.

The first production attempt was rejected before execution. After separate explicit user approval, the identical prepared handler candidate was published as production deploy `6adb6356cd657902e5e9bb9d` on 2026-10-23 at 13:38:40 UTC. Fresh read-only verification confirms the primary site uses this deploy, notify returns HTTP 200 / configured=true, all eight static/config digests and wallet are unchanged, and runtime, memory, region, rate limits and retry schedule match the baseline. No synthetic orders, payments or messages were sent. See [production evidence](backend/production-release-evidence.json).

## Remaining activation

1. Handler publication is complete. The separately authorized scope stops here; do not activate the remaining browser/report/Pulse work without further instruction.
2. Activate consent-aware browser collection and verify native serialization without submitting an order. WEEEK #6893 language/branch label propagation is a requirement, not proven by this handler preview.
3. Publish the authenticated read-only Sheet aggregate report and switch Pulse orders/revenue to verified Sheet EUR aggregates. Keep GA4 session purchases separate until then.
4. Observe a subsequent ordinary order to establish actual end-to-end invoice/source/amount accuracy without synthetic customer messages.

The existing Apps Script intake accepts arbitrary bounded source strings and retains the five-column schema; the handler change does not require altering its writer. The separate report endpoint is still pending. User-profile browser access is currently unavailable; no access settings or credentials were changed.

Private release workspace retains original ZIPs and a baseline digest manifest. Recovery uses a new deploy of the preserved baseline, with both ledgers untouched. This draft PR remains unmerged and does not activate the browser/Pulse candidate. Only the prepared handler patch from code commit a7b87bb3 was independently deployed.
