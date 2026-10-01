/**
 * Document search for the Livewire pages (partials/search-dialog.blade.php), without Livewire:
 * a plain-JS copy of the React search dialog, over the same JSON endpoints. Search as you type,
 * pick a result to see its routing trail, then open the document.
 */

const DEBOUNCE_MS = 250;
const MIN_LENGTH = 2;

/** Same colours as STATUS_STYLES in resources/react/components/document-tracking.tsx. */
const STATUS_STYLES = {
    Created: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300',
    'For Receiving': 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    'On Process': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    Returned: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    Closed: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Text for innerHTML: everything from the API is escaped. */
const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const statusBadge = (status) =>
    `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status] ?? STATUS_STYLES.Created}">${esc(status)}</span>`;

function getJson(url, signal) {
    return fetch(url, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        signal,
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }

        return response.json();
    });
}

function message(icon, title, text) {
    return `<div class="flex flex-col items-center gap-1 px-6 py-12 text-center">
        <p class="text-sm font-medium">${esc(title)}</p>
        ${text ? `<p class="text-sm text-neutral-500 dark:text-neutral-400">${esc(text)}</p>` : ''}
    </div>`;
}

function init() {
    const root = document.getElementById('document-search');

    if (!root) {
        return;
    }

    const input = root.querySelector('[data-search-input]');
    const results = root.querySelector('[data-search-results]');
    const searchView = root.querySelector('[data-search-view]');
    const trackingView = root.querySelector('[data-tracking-view]');
    const trackingBody = root.querySelector('[data-tracking-body]');
    const openLink = root.querySelector('[data-tracking-open]');
    const icon = root.querySelector('[data-search-icon]');
    const spinner = root.querySelector('[data-search-spinner]');

    let rows = [];
    let active = -1;
    let timer;
    let controller;
    let returnFocus = null;

    const setLoading = (loading) => {
        icon.classList.toggle('hidden', loading);
        spinner.classList.toggle('hidden', !loading);
    };

    const renderResults = () => {
        results.innerHTML = rows
            .map(
                (row, index) => `<button type="button" role="option" data-index="${index}" aria-selected="${index === active}"
                    class="flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left outline-none ${index === active ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}">
                    <span class="flex flex-wrap items-center gap-2">
                        <span class="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">${esc(row.control_no)}</span>
                        ${statusBadge(row.status)}
                    </span>
                    <span class="line-clamp-2 text-sm">${esc(row.subject)}</span>
                    <span class="text-xs text-neutral-500 dark:text-neutral-400">${esc(row.classification)}${row.created_at ? ` · ${dateFormat.format(new Date(row.created_at))}` : ''}</span>
                </button>`,
            )
            .join('');

        results.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
    };

    const search = () => {
        const term = input.value.trim();
        controller?.abort();

        if (term.length < MIN_LENGTH) {
            rows = [];
            active = -1;
            setLoading(false);
            results.innerHTML = message('search', 'Search documents', 'Type at least 2 characters of a subject or control number.');

            return;
        }

        controller = new AbortController();
        setLoading(true);

        getJson(`${root.dataset.searchUrl}?q=${encodeURIComponent(term)}`, controller.signal)
            .then(({ data }) => {
                rows = data ?? [];
                active = rows.length ? 0 : -1;
                rows.length ? renderResults() : (results.innerHTML = message('file-search', 'No documents found', `Nothing matches “${term}”.`));
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    results.innerHTML = message('x', 'Search failed', 'Please try again.');
                }
            })
            .finally(() => setLoading(false));
    };

    const showTracking = (row) => {
        searchView.classList.add('hidden');
        trackingView.classList.remove('hidden');
        trackingView.classList.add('flex');
        openLink.href = `/document/view/${encodeURIComponent(row.control_no)}`;
        trackingBody.innerHTML = `<div class="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500"><span class="size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></span>Loading tracking…</div>`;

        getJson(root.dataset.trackingUrl.replace('__ID__', row.id))
            .then(({ document: doc, timeline }) => {
                trackingBody.innerHTML = `
                    <div class="border-b border-neutral-200 px-5 py-4 dark:border-white/10">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-400">${esc(doc.control_no)}</span>
                            ${statusBadge(doc.status)}
                        </div>
                        <p class="mt-1 text-sm">${esc(doc.subject)}</p>
                        <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">${esc(doc.classification)}${doc.current_location ? ` · Now at ${esc(doc.current_location)}` : ''}</p>
                    </div>
                    <ol class="space-y-4 px-5 py-4">
                        ${(timeline ?? [])
                            .map(
                                (entry) => `<li class="relative border-l border-neutral-200 pl-4 dark:border-white/10">
                                    <span class="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-emerald-600"></span>
                                    <div class="flex flex-wrap items-center gap-2">
                                        <span class="rounded-full px-2 py-0.5 text-xs font-medium ${esc(entry.color ?? 'bg-gray-100')} text-neutral-800 dark:text-neutral-100">${esc(entry.action)}</span>
                                        ${entry.created_at ? `<span class="text-xs text-neutral-500 dark:text-neutral-400">${dateTimeFormat.format(new Date(entry.created_at))}</span>` : ''}
                                        ${entry.elapsed ? `<span class="text-xs text-neutral-400">· ${esc(entry.elapsed)}</span>` : ''}
                                    </div>
                                    ${entry.description ? `<p class="mt-1 text-sm">${esc(entry.description)}</p>` : ''}
                                    ${(entry.offices ?? []).map((office) => `<p class="text-xs text-neutral-500 dark:text-neutral-400">${esc(office.label)}: ${esc(office.name ?? '—')}</p>`).join('')}
                                    ${entry.user ? `<p class="text-xs text-neutral-500 dark:text-neutral-400">By ${esc(entry.user)}</p>` : ''}
                                    ${entry.endorsed_to ? `<p class="text-xs text-neutral-500 dark:text-neutral-400">Endorsed to ${esc(entry.endorsed_to)}</p>` : ''}
                                    ${entry.remarks ? `<p class="mt-1 rounded-md bg-neutral-50 px-2 py-1 text-xs dark:bg-neutral-800">${esc(entry.remarks)}</p>` : ''}
                                </li>`,
                            )
                            .join('')}
                    </ol>`;
            })
            .catch(() => {
                trackingBody.innerHTML = message('x', 'Could not load the tracking', 'Please try again.');
            });
    };

    const showSearch = () => {
        trackingView.classList.add('hidden');
        trackingView.classList.remove('flex');
        searchView.classList.remove('hidden');
        input.focus();
    };

    const open = () => {
        returnFocus = document.activeElement;
        root.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden';
        showSearch();
        input.select();

        if (!input.value.trim()) {
            search();
        }
    };

    const close = () => {
        root.classList.add('hidden');
        document.documentElement.style.overflow = '';
        controller?.abort();
        returnFocus?.focus?.();
    };

    input.addEventListener('input', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(search, DEBOUNCE_MS);
    });

    results.addEventListener('click', (event) => {
        const button = event.target.closest('[data-index]');

        if (button) {
            showTracking(rows[Number(button.dataset.index)]);
        }
    });

    root.querySelector('[data-tracking-back]').addEventListener('click', showSearch);
    root.querySelector('[data-search-backdrop]').addEventListener('click', close);

    root.addEventListener('keydown', (event) => {
        const tracking = !trackingView.classList.contains('hidden');

        if (event.key === 'Escape') {
            event.preventDefault();
            tracking ? showSearch() : close();
        } else if (!tracking && (event.key === 'ArrowDown' || event.key === 'ArrowUp') && rows.length) {
            event.preventDefault();
            active = (active + (event.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length;
            renderResults();
        } else if (!tracking && event.key === 'Enter' && rows[active]) {
            event.preventDefault();
            showTracking(rows[active]);
        }
    });

    // "/" opens it from anywhere except while typing in a field.
    document.addEventListener('keydown', (event) => {
        const typing = event.target.closest?.('input, textarea, select, [contenteditable="true"]');

        if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey && root.classList.contains('hidden')) {
            event.preventDefault();
            open();
        }
    });

    window.documentSearch = { open, close };
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
