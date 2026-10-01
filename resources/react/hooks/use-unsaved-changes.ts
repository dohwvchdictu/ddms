import { router } from '@inertiajs/react';
import { useEffect } from 'react';

const MESSAGE = 'You have unsaved changes. Leave this page and lose them?';

/**
 * Asks before leaving a form with unsaved changes: Inertia links, the browser's
 * Back button, and full page loads (the legacy Livewire links, closing the tab).
 * Only GET visits are checked, so submitting the form itself never prompts.
 */
export function useUnsavedChanges(dirty: boolean): void {
    useEffect(() => {
        if (!dirty) {
            return;
        }

        const removeBefore = router.on('before', (event) => {
            if (event.detail.visit.method === 'get' && !window.confirm(MESSAGE)) {
                event.preventDefault();
            }
        });

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        window.addEventListener('beforeunload', onBeforeUnload);

        return () => {
            removeBefore();
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, [dirty]);
}
