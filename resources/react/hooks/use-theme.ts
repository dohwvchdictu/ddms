import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Same localStorage key as theme-script.blade.php, which applies it before
 * React loads (no flash of the wrong theme): '1' dark, '0' light, absent =
 * follow the browser/OS.
 */
const STORAGE_KEY = 'darkMode';

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function readTheme(): Theme {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        return saved === '1' ? 'dark' : saved === '0' ? 'light' : 'system';
    } catch {
        return 'system';
    }
}

function applyTheme(theme: Theme): void {
    const dark = theme === 'dark' || (theme === 'system' && media().matches);
    document.documentElement.classList.toggle('dark', dark);
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(readTheme);

    const setTheme = useCallback((next: Theme) => {
        try {
            if (next === 'system') {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, next === 'dark' ? '1' : '0');
            }
        } catch {
            // Storage blocked: the theme still applies for this page view.
        }

        setThemeState(next);
        applyTheme(next);
    }, []);

    // While following the system, keep following it if the OS theme changes.
    useEffect(() => {
        if (theme !== 'system') {
            return;
        }

        const query = media();
        const onChange = () => applyTheme('system');
        query.addEventListener('change', onChange);

        return () => query.removeEventListener('change', onChange);
    }, [theme]);

    return { theme, setTheme };
}
