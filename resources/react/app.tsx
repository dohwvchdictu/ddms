import './css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { SharedProps } from '@/types';

// Any controller can confirm an action with Inertia::flash('toast', [...]).
// Registered once here, not in a layout, so a toast sent with a redirect still
// shows while the next page mounts.
router.on('flash', (event) => {
    const message = event.detail.flash.toast;

    if (message) {
        toast[message.type](message.message, { description: message.description });
    }
});

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
                <TooltipProvider delayDuration={200}>
                    <App {...props} />
                </TooltipProvider>
                <Toaster richColors closeButton />
            </>,
        );
    },
    progress: {
        color: '#059669',
    },
});
