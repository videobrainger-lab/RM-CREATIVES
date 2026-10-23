# Internal performance dashboard

Production route: `https://rmcreatives.com/internal/`. The main public Astro site is unchanged. The dashboard is served by a Netlify Function; no private data is emitted into static files, the sitemap, or this repository.

## Access

`RM_DASHBOARD_PASSWORD` is a production-only secret in the Functions scope. Visitors enter the shared password and receive an HMAC-signed, Secure, HttpOnly, SameSite=Strict cookie for seven days. Changing the password invalidates existing sessions. Page and API responses use private/no-store and noindex. Direct function routes and the background refresh also authenticate. Never put passwords or API keys in this repository.

## Data

Google Ads and Meta advertising data are queried through Windsor. Initial daily data was loaded through the connected Windsor tool. This is a dated snapshot until the owner supplies a Windsor API key in the authenticated Connections dialog. The key is stored server-side in private Netlify Blobs and is never returned by an endpoint.

Once configured, a scheduled function starts the authenticated background refresh at 04:00 UTC (07:00 Moscow). Four queries load the preceding 90 complete days, including campaign spend, conversion events, current conversion definitions, and Meta website events. Queries run outside the browser; long-running pending reports are polled. A failed refresh preserves the last complete snapshot. Manual refresh is available in the dashboard. After 90 days, older data rolls out of the snapshot.

The `rm-kpi-production` site-wide store contains snapshot, settings, and sync status objects. The production-only password is withheld from preview deployments; never configure a preview with the production password. Reads and writes require the password/session. The authenticated `/internal/import` endpoint is for complete initial/recovery advertising snapshots, not client records or PII.

Campaign IDs and account mappings live exclusively in the private snapshot; `netlify/lib/kpi-model.mjs` contains only public project labels and calculation logic. Unknown MILO campaigns default to Shared/unallocated. Review that list when adding new delivery/services campaigns. EUR and USD are kept separate. Platform conversion counts and attributed revenue are not added into unique business totals.

Google Primary uses `conversions` under campaign goal settings. Secondary sums events explicitly classified as secondary in the currently returned action definitions. Historical changes to action definitions cannot be reconstructed from this snapshot. Unclassified nonzero events make derived event metrics unavailable. Purchase counts use the Purchase category; booking counts require the explicit booking_created event name, rather than treating every Book appointment category action as a real booking.

DENTA now supports a separately stored aggregate CRM snapshot from its exact Google Sheet. Pulse totals and rows include only Google Ads and Meta; unattributed and other sources remain excluded. Daily counts use enquiry receipt dates and current booking status (Pierakstījās), not advertising conversions. Duplicate inquiry IDs are removed before aggregation. Missing booking-event dates are disclosed; visit counts remain unavailable when visit status/date tracking is unfilled. Partial CRM periods display known counts and suppress CPA. Only daily counts and source metadata are uploaded; patient records and identifiers stay outside the app. The authenticated /internal/crm-import endpoint persists crm-denta separately from advertising refreshes. CRM imports are manual snapshots, not an active Google Sheets sync. EPILINE and MILO business outcomes remain unavailable. Neither of the connected BigQuery links returned datasets for the EPILINE project in this session. Kommo's current lead stage is not a historical booking/visit event feed. Do not fill business metrics using advertising clicks, current CRM stages, or inferred zeroes.

## Validation

Run `node --test tests/*.test.mjs` and `npm run build`. Security, CSRF, ranges, allocation, currencies, missing data and purchase/booking semantics have dedicated tests. The dashboard has a separate CSS and JS bundle and loads no marketing trackers.

## MILO SEO / GEO

The MILO view adds six KPI cards, a six-month history, landing-direction and language tables, and AI diagnostics. Default period for the MILO deep link is 28 complete days. Revenue uses GA4 `gross_purchase_revenue`, without cancellation or refund deductions; orders are recorded GA4 ecommerce purchases, not verified payments. Attribution is session-based Organic Search, with known AI-host referrals separated before aggregation. Nonbrand clicks exclude MILO / MĪLO / МИЛО from visible Search Console queries; hidden queries are not estimated, and query revenue is not fabricated.

The verified MILO GA4 property currency is USD. EUR is an explicit conversion using the ECB daily USD-per-EUR reference rate, falling back to the preceding business day within seven days. It is not the original EUR order value. Unknown currency/rates produce missing revenue, never a relabelled USD amount. Landing categories retain shared home/menu pages under Other instead of assigning them to a city. Fixed-query top-3/top-10, AI recommendation share and Google AI impressions remain unavailable until dedicated verified monitoring is connected; Search Console average positions are not substituted for local rank tracking.

Private source mapping uses production Functions environment variables `RM_MILO_GA4_PROPERTY` and `RM_MILO_GSC_SITE`. Existing Windsor credentials stay in private settings. The independently authenticated background function `internal-seo-background` refreshes GA4, ECB and Search Console; daily refresh is started alongside advertising at 04:00 UTC. Authenticated `/internal/seo-refresh` starts a manual refresh. The initial MILO view starts it once when the existing Windsor key is configured and no SEO snapshot exists. Production password/session protection, CSRF checks and preview isolation apply unchanged.

Private `seo-milo` stores only daily aggregated metrics (no individual queries, landing URLs, transaction IDs or customer records); `seo-sync-status` reports progress. Each source replaces its previous aggregate only after complete success; failures preserve earlier data and dates. Search Console is queried in consecutive 28-day chunks with a three-day delay. Current and comparison windows shift equally to its last available day, with the actual dates shown on the click card. The graph uses calendar months, with source coverage gaps kept as missing values. This feature does not alter the existing advertising snapshot, CRM aggregation or MILO checkout.

### Agreed CRM attribution model (pending activation)

The user selected last known non-direct source within 30 days for MILO delivery orders. Direct/internal returns retain the original timestamp; a later non-direct entry replaces it. Historical unknowns remain unknown. Tested browser/core candidates and the integration contract are in `integrations/milo-attribution`; they are not loaded on the production site. Pulse's method text records the decision and explicitly keeps its current GA4 session-purchase metrics distinct until the sheet writer is updated. Current `milo-wallet-live` deploy `6ada0e237386e2df5214b265` includes an order-sheet retry function missing from the available local source. A complete current writer/retry source is required before backend or Tilda activation. No test order, payment, notification or sheet write was performed.
