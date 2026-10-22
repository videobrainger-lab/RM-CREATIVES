import { getStore } from '@netlify/blobs';
// Production-only password is withheld from preview deployments, so previews
// cannot enter any route that reads or writes this private site-wide store.
export const store = () => getStore({ name:'rm-kpi-production', consistency:'strong' });
export const getSnapshot = () => store().get('snapshot', {type:'json'});
export const getSettings = () => store().get('settings', {type:'json'});
