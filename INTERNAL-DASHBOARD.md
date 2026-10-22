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

DENTA now supports a separately stored aggregate CRM snapshot from its exact Google Sheet. Daily counts use enquiry receipt dates and current booking status (Pierakstījās), not advertising conversions. Duplicate inquiry IDs are removed before aggregation. Missing booking-event dates are disclosed; visit counts remain unavailable when visit status/date tracking is unfilled. Partial CRM periods display known counts and suppress CPA. Only daily counts and source metadata are uploaded; patient records and identifiers stay outside the app. The authenticated /internal/crm-import endpoint persists crm-denta separately from advertising refreshes. CRM imports are manual snapshots, not an active Google Sheets sync. EPILINE and MILO business outcomes remain unavailable. Neither of the connected BigQuery links returned datasets for the EPILINE project in this session. Kommo's current lead stage is not a historical booking/visit event feed. Do not fill business metrics using advertising clicks, current CRM stages, or inferred zeroes.

## Validation

Run `node --test tests/*.test.mjs` and `npm run build`. Security, CSRF, ranges, allocation, currencies, missing data and purchase/booking semantics have dedicated tests. The dashboard has a separate CSS and JS bundle and loads no marketing trackers.
