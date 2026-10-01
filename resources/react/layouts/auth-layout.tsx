import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * Full-screen DOH facade with the system's name on the left and the form on
 * the right; stacks on small screens.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/img/dohfacadev3.jpg')" }}>
            <div className="mx-auto max-w-[85rem] px-4 pt-10 pb-10 sm:px-6 md:pt-20 lg:px-8 lg:pt-36">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <img src="/img/login-logo.svg" alt="Department of Health" className="h-auto w-80" />
                        <p className="inline-block bg-gradient-to-l from-green-500 to-emerald-700 bg-clip-text text-sm font-medium text-transparent dark:from-blue-400 dark:to-violet-400">
                            Department of Health Western Visayas - Center for Health Development
                        </p>

                        <div className="mt-4 max-w-2xl md:mb-12">
                            <h1 className="mb-4 text-4xl font-semibold text-gray-800 lg:text-5xl dark:text-neutral-200">
                                Document Tracking Information System
                            </h1>
                            <p className="text-gray-600 dark:text-neutral-400">Version 2.0</p>
                        </div>
                    </div>

                    <div>{children}</div>
                </div>
            </div>
        </div>
    );
}
