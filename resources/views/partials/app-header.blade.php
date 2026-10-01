{{--
    The app header for the Livewire pages: a Blade copy of resources/react/components/app-header.tsx
    and user-menu.tsx, so both kinds of page look the same while the migration lasts. Plain Blade
    (no Livewire); $employee comes from the view composer in AppServiceProvider. The scripts behind
    it (menu button, theme, search) are in components/layouts/app.blade.php.
--}}
<header class="fixed inset-x-0 top-0 z-40 h-16 bg-emerald-700 text-white shadow-sm dark:bg-emerald-900">
    <div class="flex h-full items-center gap-3 px-3 sm:px-4">
        {{-- Folds the sidebar to an icon rail on desktop; opens the slide-in menu below lg. --}}
        <button type="button" onclick="appShell.toggleSidebar()" id="app-sidebar-toggle"
            class="flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Toggle sidebar" aria-controls="hs-application-sidebar" title="Toggle sidebar">
            <x-lucide name="menu" class="size-5" />
        </button>

        <a href="/dashboard" class="flex min-w-0 shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/70">
            <img src="/img/doh.png" alt="Department of Health" class="size-10 shrink-0">
            <img src="/img/bagongpilipinas.png" alt="Bagong Pilipinas" class="size-10 shrink-0 scale-[1.2]">

            <span aria-hidden="true" class="mx-1 h-10 w-px shrink-0 bg-white/50"></span>

            <span class="hidden min-w-0 gap-1 lg:grid">
                <span class="text-[0.7rem] font-semibold uppercase leading-3 tracking-wide text-white">Department of Health</span>
                <span class="text-[0.6rem] uppercase leading-3 tracking-wide text-white">Western Visayas Center for Health Development</span>
                <span class="text-base font-bold leading-5 tracking-tight xl:text-lg xl:leading-6">Digital Document Management System</span>
            </span>
            <span class="grid gap-1 lg:hidden">
                <span class="text-[0.7rem] font-semibold uppercase leading-3 tracking-wide text-white">DOH</span>
                <span class="text-[0.6rem] uppercase leading-3 tracking-wide text-white">WVCHD</span>
                <span class="text-base font-bold leading-5 tracking-tight">DDMS</span>
            </span>
        </a>

        <div class="flex flex-1 justify-center px-2">
            <button type="button" onclick="documentSearch.open()"
                class="group hidden h-10 w-full max-w-lg items-center gap-2.5 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white/75 shadow-inner shadow-black/5 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:flex">
                <x-lucide name="search" class="size-4" />
                <span class="flex-1 truncate text-left">Search by subject or control number…</span>
                <kbd class="flex h-5 min-w-5 items-center justify-center rounded border border-white/25 bg-white/10 px-1.5 font-sans text-xs font-semibold text-white/80 group-hover:text-white">/</kbd>
            </button>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
            <button type="button" onclick="documentSearch.open()"
                class="flex size-9 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:hidden"
                aria-label="Search documents">
                <x-lucide name="search" class="size-5" />
            </button>

            @if ($employee)
                <span class="hidden whitespace-nowrap text-sm md:inline">
                    Hi, <span class="font-semibold">{{ $employee['firstName'] }}</span>
                </span>

                {{-- User menu (Preline dropdown) --}}
                <div class="hs-dropdown relative inline-flex [--placement:bottom-right] [--offset:8]">
                    <button id="app-user-menu" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Open user menu"
                        class="hs-dropdown-toggle rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700">
                        <img src="{{ $employee['photo'] }}" alt="" class="size-9 rounded-full object-cover ring-2 ring-white/40">
                    </button>

                    <div role="menu" aria-orientation="vertical" aria-labelledby="app-user-menu"
                        class="hs-dropdown-menu hidden z-50 w-64 rounded-md border border-neutral-200 bg-white p-1 text-neutral-900 opacity-0 shadow-md transition-[opacity,margin] duration hs-dropdown-open:opacity-100 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100">
                        <div class="px-2 py-1.5">
                            <p class="text-xs text-neutral-500 dark:text-neutral-400">Signed in as</p>
                            <p class="truncate text-sm font-medium">{{ $employee['name'] }}</p>
                            @if (! empty($employee['office']['name']))
                                <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">{{ $employee['office']['name'] }}</p>
                            @endif
                        </div>

                        <div class="-mx-1 my-1 h-px bg-neutral-200 dark:bg-white/10"></div>

                        {{-- Same choices and storage key as the React menu, so the theme carries across. --}}
                        <div role="radiogroup" aria-label="Theme" class="flex gap-1 p-1">
                            @foreach (['light' => ['sun', 'Light theme'], 'dark' => ['moon', 'Dark theme'], 'system' => ['monitor', 'Use system theme']] as $value => [$icon, $label])
                                <button type="button" role="radio" aria-checked="false" data-theme-choice="{{ $value }}" aria-label="{{ $label }}" title="{{ $label }}"
                                    onclick="appShell.setTheme('{{ $value }}')"
                                    class="flex h-8 flex-1 items-center justify-center rounded-md text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-emerald-500/50 aria-checked:bg-emerald-600 aria-checked:text-white aria-checked:hover:bg-emerald-600 aria-checked:hover:text-white dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100">
                                    <x-lucide :name="$icon" class="size-4" />
                                </button>
                            @endforeach
                        </div>

                        <div class="-mx-1 my-1 h-px bg-neutral-200 dark:bg-white/10"></div>

                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" role="menuitem"
                                class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800">
                                <x-lucide name="log-out" class="size-4 text-neutral-500 dark:text-neutral-400" />
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            @endif
        </div>
    </div>
</header>
