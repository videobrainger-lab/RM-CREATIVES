import fs from 'node:fs';
// Apps Script has no ES modules. Generate its exact pure transformation from the tested module.
const pure=fs.readFileSync(new URL('../../netlify/lib/kpi-delivery-sheet.mjs',import.meta.url),'utf8').replace(/^export /gm,'');
fs.writeFileSync(new URL('MiloPulseTransform.gs',import.meta.url),pure);
