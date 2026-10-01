{{--
    The sidebar for the Livewire pages: a Blade copy of resources/react/components/app-sidebar.tsx
    over the same menu (App\Support\Navigation mirrors resources/react/lib/navigation.ts). Plain
    Blade (no Livewire); $sidebarCounts comes from the view composer in AppServiceProvider.

    Shares its remembered state with the React sidebar through localStorage: `sidebarCollapsed`
    (icon rail) and `sidebarOpenGroups` (which groups are open, by title). The rail styles and
    scripts are in components/layouts/app.blade.php.
--}}
@php
    $count = fn (?string $key) => $key && $sidebarCounts ? (int) ($sidebarCounts[$key] ?? 0) : 0;
    $new = \App\Support\Navigation::newDocument();
    $creating = \App\Support\Navigation::isActive($new['href']);
@endphp

<aside id="hs-application-sidebar" role="dialog" tabindex="-1" aria-label="Sidebar"
    class="hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 fixed bottom-0 start-0 top-16 z-30 hidden w-64 -translate-x-full transform border-r border-neutral-200 bg-slate-50 transition-all duration-200 lg:block lg:translate-x-0 dark:border-white/10 dark:bg-neutral-950">
    <nav id="sidebar-scroll" aria-label="Main" class="h-full space-y-3 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-3">
        <ul class="space-y-0.5">
            @foreach (\App\Support\Navigation::primary() as $item)
                <x-app-nav-item :item="$item" :count="$count($item['badge'] ?? null)" />
            @endforeach
        </ul>

        {{-- The main call to action. --}}
        <a href="{{ $new['href'] }}" data-title="{{ $new['title'] }}" @if ($creating) aria-current="page" @endif
            @class([
                'app-new-document flex h-10 w-full items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-neutral-950',
                'ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-slate-50 dark:ring-offset-neutral-950' => $creating,
            ])>
            <x-lucide :name="$new['icon']" class="app-new-icon size-[1.15rem]" />
            <x-lucide name="plus" class="app-new-rail-icon hidden size-5" />
            <span class="app-nav-label">{{ $new['title'] }}</span>
            <x-lucide name="plus" class="app-nav-label ml-auto size-4 opacity-80" />
        </a>

        <hr class="mx-1 border-neutral-200 dark:border-white/10">

        <ul class="space-y-1">
            @foreach (\App\Support\Navigation::groups() as $group)
                @php
                    $active = collect($group['items'])->contains(fn ($item) => \App\Support\Navigation::isActive($item['href']));
                    $badge = $count($group['badge'] ?? null);
                    $panel = 'sidebar-group-' . \Illuminate\Support\Str::slug($group['title']);
                @endphp
                {{-- data-open-default: open before any remembered choice; data-active: holds the current page, so always open. --}}
                <li class="app-nav-group" data-group="{{ $group['title'] }}" data-open-default="{{ $group['defaultOpen'] ? '1' : '0' }}" data-active="{{ $active ? '1' : '0' }}">
                    <button type="button" aria-expanded="{{ $active || $group['defaultOpen'] ? 'true' : 'false' }}" aria-controls="{{ $panel }}"
                        data-title="{{ $badge > 0 ? $group['title'] . ' · ' . $badge : $group['title'] }}" onclick="appShell.toggleGroup(this)"
                        @class([
                            'app-nav-group-toggle app-nav-row group/row relative flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white',
                            'text-neutral-900 dark:text-white' => $active,
                        ])>
                        <span class="relative">
                            <x-lucide :name="$group['icon']" @class([
                                'size-[1.15rem]',
                                'text-emerald-600 dark:text-emerald-400' => $active,
                                'text-neutral-500 group-hover/row:text-neutral-900 dark:text-neutral-400 dark:group-hover/row:text-white' => ! $active,
                            ]) />
                            @if ($badge > 0)
                                <span class="app-rail-badge absolute -top-2 left-2.5 hidden h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.55rem] font-semibold leading-none text-white ring-2 ring-slate-50 tabular-nums dark:ring-neutral-950">{{ $badge > 99 ? '99+' : $badge }}</span>
                            @endif
                        </span>
                        <span class="app-nav-label truncate">{{ $group['title'] }}</span>
                        @if ($badge > 0)
                            {{-- While open, the counts show on the rows themselves. --}}
                            <span class="app-nav-badge app-group-badge ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.7rem] font-semibold leading-none text-white tabular-nums">{{ $badge }}</span>
                        @endif
                        <x-lucide name="chevron-down" class="app-nav-label app-group-chevron ml-auto size-4 text-neutral-500 transition-transform duration-200 dark:text-neutral-400" />
                    </button>

                    {{-- Animates height by moving the grid row between 0fr and 1fr. --}}
                    <div id="{{ $panel }}" class="app-nav-panel grid transition-[grid-template-rows,opacity] duration-200 ease-out">
                        <div class="overflow-hidden">
                            <ul class="ml-[1.15rem] mt-0.5 space-y-0.5 border-l border-neutral-200 pl-2.5 dark:border-white/10">
                                @foreach ($group['items'] as $item)
                                    <x-app-nav-item :item="$item" :count="$count($item['badge'] ?? null)" nested />
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </li>
            @endforeach
        </ul>
    </nav>
</aside>

{{-- Applied before first paint, so groups don't open then snap shut. --}}
<script>
    appShell.applyGroups();
</script>
