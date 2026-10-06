import { useEffect, useState } from 'react';

const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

/**
 * Tracks the `dark` class on <html>. The class is set before first paint in
 * inertia.blade.php (theme-script) from the `darkMode` key use-theme writes.
 */
export function useDarkMode(): boolean {
    const [dark, setDark] = useState(isDark);

    useEffect(() => {
        const observer = new MutationObserver(() => setDark(isDark()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return dark;
}
