{{-- One sidebar link: the Blade copy of renderItem() in resources/react/components/app-sidebar.tsx. --}}
@props(['item', 'count' => 0, 'nested' => false])

@php
    $active = \App\Support\Navigation::isActive($item['href']);
@endphp

<li>
    <a href="{{ $item['href'] }}" data-title="{{ $count > 0 ? $item['title'] . ' · ' . $count : $item['title'] }}" @if ($active) aria-current="page" @endif
        @class([
            'app-nav-row group/row relative flex w-full items-center gap-3 rounded-lg px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500/50',
            $nested ? 'h-8' : 'h-9',
            // The active page: tinted row with a green bar on its left edge.
            'bg-emerald-100/70 font-medium text-emerald-800 before:absolute before:inset-y-1.5 before:-left-3 before:w-1 before:rounded-r-full before:bg-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' => $active,
            'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white' => ! $active,
        ])>
        <span class="relative">
            <x-lucide :name="$item['icon']" @class([
                $nested ? 'size-4' : 'size-[1.15rem]',
                'text-emerald-600 dark:text-emerald-400' => $active,
                'text-neutral-500 group-hover/row:text-neutral-900 dark:text-neutral-400 dark:group-hover/row:text-white' => ! $active,
            ]) />
            @if ($count > 0)
                {{-- Pinned to the icon's corner; shown only in the rail. --}}
                <span class="app-rail-badge absolute -top-2 left-2.5 hidden h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.55rem] font-semibold leading-none text-white ring-2 ring-slate-50 tabular-nums dark:ring-neutral-950">{{ $count > 99 ? '99+' : $count }}</span>
            @endif
        </span>
        <span class="app-nav-label truncate">{{ $item['title'] }}</span>
        @if ($count > 0)
            <span class="app-nav-badge ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.7rem] font-semibold leading-none text-white tabular-nums">{{ $count }}</span>
        @endif
    </a>
</li>
