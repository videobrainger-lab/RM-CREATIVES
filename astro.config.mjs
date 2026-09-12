import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static production build for rmcreatives.com.
export default defineConfig({
  site: 'https://rmcreatives.com',
  integrations: [
    sitemap({
      filter: (page) => ![
        '/thank-you/',
        '/ru/thank-you/',
        '/privacy/',
        '/ru/privacy/',
        '/terms/',
        '/ru/terms/',
        '/cookies/',
        '/ru/cookies/',
        '/404/'
      ].some((path) => page.endsWith(path))
    })
  ],
  output: 'static'
});
