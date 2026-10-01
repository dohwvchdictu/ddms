import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import { fileURLToPath, URL } from 'node:url';
import { getLocalIP } from './vite.shared.js';

// React + Inertia UI (Tailwind 4). Kept apart from the legacy build in
// vite.config.js: its own hot file, build directory, port and CSS pipeline.
export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5174,
        strictPort: true,
        hmr: {
            host: getLocalIP(),
        },
    },
    css: {
        postcss: {
            plugins: [],
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/react', import.meta.url)),
        },
    },
    plugins: [
        laravel({
            input: ['resources/react/app.tsx'],
            hotFile: 'public/react.hot',
            buildDirectory: 'build-react',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        // The Docker asset stage has no PHP, so it builds from the committed
        // generated files instead of regenerating them.
        ...(process.env.SKIP_WAYFINDER ? [] : [wayfinder({ path: 'resources/react' })]),
    ],
});
