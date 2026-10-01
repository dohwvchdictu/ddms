import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss3 from 'tailwindcss3';
import autoprefixer from 'autoprefixer';
import { getLocalIP } from './vite.shared.js';

// Legacy Blade / Livewire / Preline UI (Tailwind 3). The React UI is built
// separately by vite.react.config.ts. PostCSS is configured inline rather
// than in postcss.config.js so the React build never picks it up.
export default defineConfig({
    server: {
        host: '0.0.0.0',
        hmr: {
            host: getLocalIP(),
        },
    },
    css: {
        postcss: {
            plugins: [tailwindcss3({ config: './tailwind.config.js' }), autoprefixer()],
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
    ],
});
