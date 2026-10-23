# MILO order attribution: last non-direct touch, 30 days

Status: agreed model and tested integration candidate. NOT active in production.

The user selected the last known non-direct source within 30 days. A direct/internal return preserves the source and original timestamp. A later search, advertising, AI, email, social or referral entry replaces it. The timestamp expires after exactly 30 days; direct visits never renew it. Payment returns, reloads and internal kitchen/language navigation do not create acquisition touches. Unknown historical orders are not relabelled as SEO.

`attribution.mjs` contains classification, expiry and order-field validation. `browser.mjs` is a candidate for the Tilda project head. It respects existing MILO analytics consent, stores only channel/source/medium/timestamp/model, and adds five `MILO_attribution_*` fields to T706 forms immediately before native submission. It emits no request, purchase, payment, order, or notification and does not replace the checkout controller. Browser storage denial leaves current-page attribution in memory; revocation removes stored and prepared form data.

## Required integration before activation

1. Obtain the current full source/build of `milo-wallet-live`, deploy `6ada0e237386e2df5214b265` (2026-10-22). It contains `notify`, `order-sheet-retry` and `wallet`. The found local source is from an earlier two-function version and must not replace it.
2. Add server validation of the five fields using `validateOrderAttribution(payload, orderCreationISO)`. Only a valid model and unexpired timestamp may classify a new delivery order. Continue deduplication by the existing order ID and preserve retry, notification and payment behavior.
3. Write the validated source plus model/timestamp to the existing delivery-order integration. Do not infer organic orders from Other/Unknown. Preserve existing sheet rows, protections, column semantics and EUR amounts.
4. Change Pulse's SEO orders/revenue to verified sheet aggregates once that flow is proven. Keep GA4 sessions and source attribution separate: GA4 session purchases are not this CRM model and cannot be used as its numerator silently. Revenue from the sheet is EUR before cancellation/refund deductions.
5. Bundle/attach the browser candidate, publish the affected Tilda pages, verify native form serialization without sending an order, then observe one normal order. An actual test order/message/payment requires separate authorization.

## Read-only blockers found

The connected Netlify MCP exposes deployment metadata, not function-source download. The current deploy reports no source ZIP. Exact GETs for the two function code resources returned 404 via the authenticated CLI; no write/replay was attempted. The existing Chrome profile has JavaScript from Apple Events disabled, so its UI cannot be inspected through that interface. No browser security preference was changed.

Required input: current source/build containing the order-sheet writer and retry, or the maintained source location. No token or password is needed in chat.

Validation: `node --test tests/milo-attribution*.test.mjs`; all browser tests use isolated mocks and do not call live services.
