# MILO order attribution: last non-direct touch, 30 days

Status: agreed model and tested integration candidate. NOT active in production.

The user selected the last known non-direct source within 30 days. A direct/internal return preserves the source and original timestamp. A later determined external source replaces it. The original timestamp expires after 30 days; direct visits never renew it. Unknown historical orders are not relabelled as SEO.

The existing core/browser candidate respects MILO analytics consent, stores only channel/source/medium/timestamp/model, and prepares five MILO_attribution_* fields for native T706 submission. It emits no orders or notifications and does not replace the checkout controller.

## Handler preparation and verified preview — 23 October 2026

Current sources, writer, retry and all three original ZIPs were found in the read-only MILO project mirror. Their SHA256 values match production deploy 6ada0e237386e2df5214b265. This supersedes the earlier missing-source blocker.

[Backend patch and validation](backend/README.md) add bounded source metadata, 30-day validation, source categories and safe numeric Meta campaign IDs to independent receipts, with the same invoice and EUR amount. Missing collection, unknown touch, expiry and invalid metadata are distinct statuses. No missing metadata is inferred as SEO. Legacy social/cpc remains compatible.

Verified preview: 6adb610808c4655ea447efad. All 29 mocked source/bundle regression tests pass. All eight static/config digests, wallet ZIP, Telegram formatting/routing/authentication, ledger/dedup logic and five-minute retry schedule are preserved. Preview GET /notify returns HTTP 200; configured=false is expected because production secrets are not present in preview. Production still returns configured=true.

Production publication was rejected before execution by automatic approval review, which required explicit user permission for the production release of PR #13. No retry was made. Production remains 6ada0e237386e2df5214b265; no live test orders, payments, messages or sheet writes occurred.

## Remaining activation

1. Obtain new relevant production-release approval and publish the already verified handler candidate once; recheck live state first.
2. Activate consent-aware browser collection and verify native serialization without submitting an order. WEEEK #6893 language/branch label propagation is a requirement, not proven by this handler preview.
3. Publish the authenticated read-only Sheet aggregate report and switch Pulse orders/revenue to verified Sheet EUR aggregates. Keep GA4 session purchases separate until then.
4. Observe a subsequent ordinary order to establish actual end-to-end invoice/source/amount accuracy without synthetic customer messages.

The existing Apps Script intake accepts arbitrary bounded source strings and retains the five-column schema; the handler change does not require altering its writer. The separate report endpoint is still pending. User-profile browser access is currently unavailable; no access settings or credentials were changed.

Private release workspace retains original ZIPs and a baseline digest manifest. Recovery uses a new deploy of the preserved baseline, with both ledgers untouched. This draft PR does not merge or activate the browser/Pulse candidate.
