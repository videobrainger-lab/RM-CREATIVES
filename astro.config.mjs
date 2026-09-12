import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static production build for rmcreatives.com.
export default defineConfig({
  site: 'https://rmcreatives.com',
  integrations: [sitemap()],
  output: 'static'
});
