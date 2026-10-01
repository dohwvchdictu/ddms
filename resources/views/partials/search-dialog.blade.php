{{--
    Document search for the Livewire pages, without Livewire: a plain-JS copy of
    resources/react/components/search-dialog.tsx. It reads the same JSON endpoints as React
    (documents.search and documents.tracking); the behaviour is in resources/js/search-dialog.js.
    Opens with "/" or the header's search box.
--}}
<div id="document-search" class="fixed inset-0 z-[90] hidden" role="dialog" aria-modal="true" aria-labelledby="document-search-title"
    data-search-url="{{ route('documents.search') }}" data-tracking-url="{{ url('/documents/__ID__/tracking') }}">
    <div data-search-backdrop class="absolute inset-0 bg-black/50"></div>

    <div class="relative mx-auto mt-[8vh] flex max-h-[80vh] w-[calc(100%-2rem)] max-w-2xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100">
        <h2 id="document-search-title" class="sr-only">Search documents</h2>

        {{-- Search view --}}
        <div data-search-view class="flex min-h-0 flex-1 flex-col">
            <div class="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-white/10">
                <span data-search-icon><x-lucide name="search" class="size-5 text-neutral-500 dark:text-neutral-400" /></span>
                <span data-search-spinner class="hidden"><x-lucide name="loader-circle" class="size-5 animate-spin text-emerald-600" /></span>
                <input data-search-input type="text" autocomplete="off" spellcheck="false" aria-label="Search by subject or control number"
                    placeholder="Search by subject or control number…"
                    class="h-14 min-w-0 flex-1 border-0 bg-transparent p-0 text-base outline-none placeholder:text-neutral-400 focus:ring-0">
                <kbd class="hidden rounded border border-neutral-200 px-1.5 py-0.5 font-sans text-xs text-neutral-500 sm:inline-block dark:border-white/10 dark:text-neutral-400">Esc</kbd>
            </div>
            <div data-search-results class="min-h-0 flex-1 overflow-y-auto p-2" role="listbox" aria-label="Results"></div>
            <div class="flex items-center gap-3 border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-400">
                <span><kbd class="font-sans font-semibold">↑</kbd> <kbd class="font-sans font-semibold">↓</kbd> to move</span>
                <span><kbd class="font-sans font-semibold">Enter</kbd> to show tracking</span>
            </div>
        </div>

        {{-- Tracking view: a result's routing trail --}}
        <div data-tracking-view class="hidden min-h-0 flex-1 flex-col">
            <div class="flex items-center gap-2 border-b border-neutral-200 px-3 py-2.5 dark:border-white/10">
                <button type="button" data-tracking-back
                    class="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">
                    <x-lucide name="arrow-left" class="size-4" />
                    Back to results
                </button>
                <a data-tracking-open href="#"
                    class="ml-auto flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700">
                    Open document
                    <x-lucide name="external-link" class="size-3.5" />
                </a>
            </div>
            <div data-tracking-body class="min-h-0 flex-1 overflow-y-auto"></div>
        </div>
    </div>
</div>
