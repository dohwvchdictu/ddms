import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * Full-screen DOH facade under a green overlay, with the DOH and Bagong
 * Pilipinas seals and the system's name beside the form. Sizes are fluid
 * (clamp), and app.css grows the root font size on wide monitors while this
 * layout is mounted, so the whole page scales up rather than floating small
 * in the middle. It stacks below `lg` and scrolls instead of clipping on
 * short or zoomed-in screens.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div data-auth-layout className="relative isolate min-h-dvh overflow-x-hidden bg-emerald-950">
            <img
                src="/img/dohfacade.svg"
                alt=""
                aria-hidden="true"
                className="fixed inset-0 -z-20 size-full object-cover object-center"
            />
            <div
                aria-hidden="true"
                className="fixed inset-0 -z-10 bg-emerald-900/80"
            />

            <main className="mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
                <div className="grid w-full items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
                    <section className="text-center text-white lg:text-left">
                        <div className="flex items-center justify-center gap-3 lg:justify-start">
                            <img
                                src="/img/doh.png"
                                alt="Department of Health"
                                className="size-[clamp(3.5rem,5vw,5.5rem)] drop-shadow-lg"
                            />
                            <img
                                src="/img/bagongpilipinas.png"
                                alt="Bagong Pilipinas"
                                // The PNG has wide transparent margins; scale it up to
                                // look the same size as the DOH seal.
                                className="size-[clamp(3.5rem,5vw,5.5rem)] scale-[1.2] drop-shadow-lg"
                            />
                        </div>

                        <p className="mt-5 text-xs font-medium tracking-wide text-emerald-100 uppercase">
                            <span className="block">Department of Health</span>
                            <span className="block">Western Visayas Center for Health Development</span>
                        </p>

                        <h1 className="mt-3 text-[clamp(1.6rem,1rem+1.8vw,2.75rem)] leading-tight font-bold tracking-tight text-balance">
                            Digital Document Management System
                        </h1>

                        <p className="mt-2 text-sm text-emerald-100/80">Version 1.0</p>
                    </section>

                    <section className="w-full">{children}</section>
                </div>
            </main>
        </div>
    );
}
