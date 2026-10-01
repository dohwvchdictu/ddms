import './css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import type { SharedProps } from '@/types';

createInertiaApp({
    // APP_NAME comes from the server, so there is one place to rebrand.
    title: (title, page) => {
        const appName = (page.props.app as SharedProps['app']).name;

        return title ? `${title} | ${appName}` : appName;
    },
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        return page() as never;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <Toaster richColors closeButton />
            </>,
        );
    },
    progress: {
        color: '#059669',
    },
});
