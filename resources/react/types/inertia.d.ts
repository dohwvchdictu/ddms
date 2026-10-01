import type { SharedProps, Toast } from '@/types';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: SharedProps;
        /** One-off data from Inertia::flash(), shown once and not kept in history. */
        flashDataType: {
            toast?: Toast;
        };
    }
}
