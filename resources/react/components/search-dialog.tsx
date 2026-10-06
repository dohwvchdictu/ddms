import { ArrowDown, ArrowUp, CornerDownLeft, FileSearch, FileText, History, Loader2, Search, SearchX, X } from 'lucide-react';
import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import DocumentTracking, { documentUrl as documentPageUrl, STATUS_STYLES } from '@/components/document-tracking';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { search as searchRoute } from '@/routes/documents';

interface SearchResult {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    status: string;
    created_at: string | null;
}

/** Matches DocumentSearchController::MIN_LENGTH and ::LIMIT. */
const MIN_LENGTH = 2;
const LIMIT = 50;
const DEBOUNCE_MS = 300;

const RECENT_KEY = 'recentDocumentSearches';
const RECENT_MAX = 5;

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

function readRecent(): string[] {
    try {
        const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');

        return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string').slice(0, RECENT_MAX) : [];
    } catch {
        return [];
    }
}

function saveRecent(list: string[]): void {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
        // Storage blocked: recent searches just aren't remembered.
    }
}

/** Wraps each case-insensitive occurrence of `term` in a highlight. */
function highlight(text: string, term: string): ReactNode {
    if (!term) {
        return text;
    }

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

    return parts.map((part, index) =>
        index % 2 === 1 ? (
            <mark key={index} className="rounded-sm bg-emerald-200/70 px-0.5 text-inherit dark:bg-emerald-500/30">
                {part}
            </mark>
        ) : (
            <Fragment key={index}>{part}</Fragment>
        ),
    );
}

function documentUrl(result: SearchResult): string {
    return documentPageUrl(result.control_no);
}

function Kbd({ children }: { children: ReactNode }) {
    return (
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-sans text-[0.65rem] font-medium text-muted-foreground">
            {children}
        </kbd>
    );
}

function EmptyState({ icon: Icon, title, children }: { icon: typeof Search; title: string; children?: ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-5" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            {children && <div className="text-sm text-muted-foreground">{children}</div>}
        </div>
    );
}

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Search documents by subject or control number. A result shows the
 * document's routing history, with a link to its page.
 */
export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [active, setActive] = useState(0);
    const [recent, setRecent] = useState<string[]>(readRecent);
    /** The result whose tracking is shown in place of the list. */
    const [selected, setSelected] = useState<SearchResult | null>(null);
    const request = useRef<AbortController | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const list = useRef<HTMLUListElement>(null);

    const term = query.trim();
    const searching = term.length >= MIN_LENGTH;

    useEffect(() => {
        if (!searching) {
            request.current?.abort();
            setResults([]);
            setLoading(false);
            setFailed(false);
            return;
        }

        setLoading(true);

        const timer = window.setTimeout(async () => {
            request.current?.abort();
            const controller = new AbortController();
            request.current = controller;

            try {
                const response = await fetch(searchRoute.url({ query: { q: term } }), {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Search failed (${response.status})`);
                }

                const body: { data: SearchResult[] } = await response.json();
                setResults(body.data);
                setActive(0);
                setFailed(false);
            } catch (error) {
                if ((error as Error).name === 'AbortError') {
                    return;
                }
                setResults([]);
                setFailed(true);
            }

            setLoading(false);
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [term, searching]);

    // Reopening search starts from the results, not the last tracking view.
    useEffect(() => {
        if (!open) {
            setSelected(null);
        }
    }, [open]);

    // Keep the highlighted row in view while moving with the arrow keys.
    useEffect(() => {
        list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active]);

    const remember = (value: string) => {
        const next = [value, ...recent.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, RECENT_MAX);
        setRecent(next);
        saveRecent(next);
    };

    const openResult = (result: SearchResult) => {
        remember(term);
        setSelected(result);
    };

    const backToResults = () => {
        setSelected(null);
        // Return focus to the search box once the list is back.
        window.requestAnimationFrame(() => input.current?.focus());
    };

    // Ctrl/Cmd/Shift/middle click keep the browser's "open in new tab" behaviour.
    const onResultClick = (event: MouseEvent<HTMLAnchorElement>, result: SearchResult) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
            remember(term);
            return;
        }

        event.preventDefault();
        openResult(result);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!results.length) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((index) => (index + 1) % results.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((index) => (index - 1 + results.length) % results.length);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            openResult(results[active]);
        }
    };

    const clear = () => {
        setQuery('');
        input.current?.focus();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="top-[10%] translate-y-0 gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-2xl"
                // While a document's tracking is open, Esc and Backspace step
                // back to the results instead of closing the window.
                onEscapeKeyDown={(event) => {
                    if (selected) {
                        event.preventDefault();
                        backToResults();
                    }
                }}
                onKeyDown={(event) => {
                    if (selected && event.key === 'Backspace' && !(event.target as HTMLElement).closest('input, textarea')) {
                        event.preventDefault();
                        backToResults();
                    }
                }}
            >
                <DialogTitle className="sr-only">Search documents</DialogTitle>
                <DialogDescription className="sr-only">
                    Search by subject or control number. Use the arrow keys to choose a result and Enter to open it.
                </DialogDescription>

                {selected ? (
                    <DocumentTracking documentId={selected.id} controlNo={selected.control_no} onBack={backToResults} onOpen={() => onOpenChange(false)} />
                ) : (
                    <>
                        <div className="flex items-center gap-3 border-b px-4">
                            {loading ? (
                                <Loader2 className="size-5 shrink-0 animate-spin text-emerald-600" aria-hidden="true" />
                            ) : (
                                <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                            )}
                            <input
                                ref={input}
                                type="text"
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Search by subject or control number…"
                                aria-label="Search documents"
                                aria-controls="document-search-results"
                                aria-activedescendant={results.length ? `document-search-result-${active}` : undefined}
                                autoComplete="off"
                                spellCheck={false}
                                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                                    aria-label="Clear search"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="hidden shrink-0 rounded focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:block"
                                aria-label="Close search"
                            >
                                <Kbd>Esc</Kbd>
                            </button>
                        </div>

                        <div className="max-h-[min(60vh,32rem)] overflow-y-auto" aria-live="polite">
                            {!searching ? (
                                recent.length > 0 ? (
                                    <div className="p-2">
                                        <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">Recent searches</p>
                                        <ul className="grid gap-0.5">
                                            {recent.map((item) => (
                                                <li key={item}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuery(item)}
                                                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                                                    >
                                                        <History className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                                        <span className="truncate">{item}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <EmptyState icon={FileSearch} title="Find a document">
                                        Type at least {MIN_LENGTH} characters of a subject or control number.
                                    </EmptyState>
                                )
                            ) : failed ? (
                                <EmptyState icon={SearchX} title="Search failed">
                                    Something went wrong. Please try again.
                                </EmptyState>
                            ) : loading && results.length === 0 ? (
                                <ul className="grid gap-1 p-2" aria-hidden="true">
                                    {[0, 1, 2].map((row) => (
                                        <li key={row} className="flex gap-3 rounded-md px-3 py-3">
                                            <div className="size-9 shrink-0 animate-pulse rounded-md bg-muted" />
                                            <div className="grid flex-1 gap-2">
                                                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                                                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : results.length === 0 ? (
                                <EmptyState icon={SearchX} title="No documents found">
                                    Nothing matches “{term}”. Check the spelling or try the control number.
                                </EmptyState>
                            ) : (
                                <div className="p-2">
                                    <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">
                                        {results.length === LIMIT
                                            ? `Showing the ${LIMIT} newest matches`
                                            : `${results.length} ${results.length === 1 ? 'document' : 'documents'}`}
                                    </p>
                                    <ul ref={list} id="document-search-results" role="listbox" aria-label="Search results" className="grid gap-0.5">
                                        {results.map((result, index) => (
                                            <li
                                                key={result.id}
                                                id={`document-search-result-${index}`}
                                                role="option"
                                                aria-selected={index === active}
                                                data-index={index}
                                            >
                                                <a
                                                    href={documentUrl(result)}
                                                    onClick={(event) => onResultClick(event, result)}
                                                    onMouseMove={() => setActive(index)}
                                                    tabIndex={-1}
                                                    className={cn(
                                                        'flex items-start gap-3 rounded-md px-3 py-2.5 outline-none',
                                                        index === active && 'bg-accent',
                                                    )}
                                                >
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                                        <FileText className="size-4" aria-hidden="true" />
                                                    </span>
                                                    <span className="grid min-w-0 flex-1 gap-0.5">
                                                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                            <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                                {highlight(result.control_no, term)}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    'rounded-full px-2 py-0.5 text-[0.65rem] leading-none font-medium',
                                                                    STATUS_STYLES[result.status] ?? STATUS_STYLES.Created,
                                                                )}
                                                            >
                                                                {result.status}
                                                            </span>
                                                        </span>
                                                        <span className="line-clamp-2 text-sm">{highlight(result.subject, term)}</span>
                                                        <span className="truncate text-xs text-muted-foreground">
                                                            {result.classification}
                                                            {result.created_at && ` · ${dateFormat.format(new Date(result.created_at))}`}
                                                        </span>
                                                    </span>
                                                    {index === active && (
                                                        <CornerDownLeft className="mt-1 hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
                                                    )}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="hidden items-center gap-4 border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground sm:flex">
                            <span className="flex items-center gap-1.5">
                                <Kbd>
                                    <ArrowUp className="size-3" />
                                </Kbd>
                                <Kbd>
                                    <ArrowDown className="size-3" />
                                </Kbd>
                                to move
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Kbd>
                                    <CornerDownLeft className="size-3" />
                                </Kbd>
                                to open
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Kbd>Esc</Kbd>
                                to close
                            </span>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
