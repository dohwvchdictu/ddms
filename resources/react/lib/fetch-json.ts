import { login } from '@/routes';

/**
 * GET a JSON endpoint of this app (session cookie included). Throws on a
 * non-2xx answer. A 401 means the session ended while the page was open, so
 * the user is sent to sign in instead of seeing a generic failure.
 */
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        signal,
    });

    if (response.status === 401) {
        window.location.assign(login.url());
    }

    if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
    }

    return (await response.json()) as T;
}
