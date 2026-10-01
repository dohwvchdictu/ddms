<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        rel="stylesheet">

    {{-- Only for the page bodies, which are still Livewire components; the header and
         sidebar around them are plain Blade (partials/app-header, partials/app-sidebar). --}}
    @livewireStyles

    @vite('resources/css/app.css')
    @vite('resources/js/app.js')

    <title>{{ $title ?? 'Page Title' }}</title>
    <link rel="icon" href="{!! asset('/img/doh.ico') !!}"/>

    <style>
        /* The icon rail (desktop): the Blade copy of the React sidebar's collapsed state. */
        #hs-application-sidebar { transition-property: width, transform; }
        .lg\:ps-64 { transition: padding .2s; }

        @media (min-width: 1024px) {
            body.sidebar-collapsed #hs-application-sidebar { width: 4rem; }
            body.sidebar-collapsed .lg\:ps-64 { padding-inline-start: 4rem; }
            body.sidebar-collapsed #hs-application-sidebar .app-nav-label,
            body.sidebar-collapsed #hs-application-sidebar .app-nav-badge,
            body.sidebar-collapsed #hs-application-sidebar .app-new-icon { display: none; }
            body.sidebar-collapsed #hs-application-sidebar .app-rail-badge { display: inline-flex; }
            body.sidebar-collapsed #hs-application-sidebar .app-new-rail-icon { display: block; }
            /* Groups show as icons only; their pages appear once the sidebar expands. */
            body.sidebar-collapsed #hs-application-sidebar .app-nav-panel { display: none; }
            body.sidebar-collapsed #hs-application-sidebar .app-nav-row,
            body.sidebar-collapsed #hs-application-sidebar .app-new-document { justify-content: center; padding-inline: 0; }
            body.sidebar-collapsed #hs-application-sidebar hr { margin-inline: .5rem; }
        }

        /* Hover hint next to a collapsed (icon-only) sidebar item. Fixed and appended to
           <body> so the sidebar's overflow doesn't clip it; shown only while collapsed. */
        .sidebar-tip {
            position: fixed;
            z-index: 80;
            transform: translateY(-50%);
            padding: 6px 9px;
            border-radius: 6px;
            background: #1f2937;
            color: #fff;
            font-size: 12px;
            line-height: 1.1;
            white-space: nowrap;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, .18);
            opacity: 0;
            transition: opacity .12s ease;
        }
        .sidebar-tip.show { opacity: 1; }
    </style>
    @include('partials.theme-script')
    <script>
        /**
         * The header and sidebar's behaviour. Same localStorage keys as the React shell
         * (darkMode, sidebarCollapsed, sidebarOpenGroups), so choices carry across both.
         */
        window.appShell = (function () {
            var DESKTOP = '(min-width: 1024px)';

            function read(key) {
                try { return localStorage.getItem(key); } catch (e) { return null; }
            }

            function write(key, value) {
                try {
                    value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value);
                } catch (e) {
                    // Storage blocked: the choice lasts for this page view only.
                }
            }

            function collapsed() {
                return read('sidebarCollapsed') === '1';
            }

            function setCollapsed(value) {
                write('sidebarCollapsed', value ? '1' : '0');
                document.body.classList.toggle('sidebar-collapsed', value);
            }

            function openGroups() {
                try {
                    var saved = JSON.parse(read('sidebarOpenGroups') || '{}');
                    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
                } catch (e) {
                    return {};
                }
            }

            function setGroup(li, open) {
                var panel = li.querySelector('.app-nav-panel');
                var badge = li.querySelector('.app-group-badge');

                li.querySelector('.app-nav-group-toggle').setAttribute('aria-expanded', open ? 'true' : 'false');
                li.querySelector('.app-group-chevron').classList.toggle('rotate-180', open);
                panel.classList.toggle('grid-rows-[1fr]', open);
                panel.classList.toggle('opacity-100', open);
                panel.classList.toggle('grid-rows-[0fr]', !open);
                panel.classList.toggle('opacity-0', !open);
                panel.inert = !open;
                // While open, the counts show on the rows themselves.
                if (badge) badge.classList.toggle('hidden', open);
            }

            function syncThemeButtons() {
                var saved = read('darkMode');
                var current = saved === '1' ? 'dark' : saved === '0' ? 'light' : 'system';

                document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
                    button.setAttribute('aria-checked', button.dataset.themeChoice === current ? 'true' : 'false');
                });
            }

            return {
                /** Folds to the icon rail on desktop; opens the slide-in menu below lg. */
                toggleSidebar: function () {
                    if (window.matchMedia(DESKTOP).matches) {
                        setCollapsed(!collapsed());
                    } else if (window.HSOverlay) {
                        window.HSOverlay.open(document.getElementById('hs-application-sidebar'));
                    }
                },

                applySidebar: function () {
                    document.body.classList.toggle('sidebar-collapsed', collapsed());
                },

                /** Each group: open if it holds the current page, else as last left, else its default. */
                applyGroups: function () {
                    var saved = openGroups();

                    document.querySelectorAll('.app-nav-group').forEach(function (li) {
                        var remembered = saved[li.dataset.group];
                        var open = li.dataset.active === '1' || (typeof remembered === 'boolean' ? remembered : li.dataset.openDefault === '1');
                        setGroup(li, open);
                    });
                },

                toggleGroup: function (button) {
                    var li = button.closest('.app-nav-group');

                    // In the rail a group's pages are hidden, so expand the sidebar and show them.
                    if (document.body.classList.contains('sidebar-collapsed') && window.matchMedia(DESKTOP).matches) {
                        setCollapsed(false);
                        setGroup(li, true);
                        return;
                    }

                    var open = button.getAttribute('aria-expanded') !== 'true';
                    var saved = openGroups();
                    saved[li.dataset.group] = open;
                    write('sidebarOpenGroups', JSON.stringify(saved));
                    setGroup(li, open);
                },

                /** 'light' | 'dark' | 'system', stored as the React menu stores it. */
                setTheme: function (theme) {
                    write('darkMode', theme === 'dark' ? '1' : theme === 'light' ? '0' : null);
                    var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    document.documentElement.classList.toggle('dark', dark);
                    syncThemeButtons();
                },

                syncThemeButtons: syncThemeButtons,
            };
        })();

        document.addEventListener('DOMContentLoaded', appShell.syncThemeButtons);

        /* Keep the sidebar's scroll position across page loads, then centre the current
           page's link. sessionStorage, because every navigation here is a full page load. */
        (function () {
            var KEY = 'sidebarScrollTop';

            window.addEventListener('pagehide', function () {
                var nav = document.getElementById('sidebar-scroll');
                if (nav) {
                    try { sessionStorage.setItem(KEY, nav.scrollTop); } catch (e) {}
                }
            });

            document.addEventListener('DOMContentLoaded', function () {
                var nav = document.getElementById('sidebar-scroll');
                if (!nav) return;

                requestAnimationFrame(function () {
                    try {
                        var stored = sessionStorage.getItem(KEY);
                        if (stored !== null) nav.scrollTop = Number(stored);
                    } catch (e) {}

                    var active = nav.querySelector('a[aria-current="page"]');
                    if (!active || !active.getClientRects().length) return;

                    var navBox = nav.getBoundingClientRect();
                    var box = active.getBoundingClientRect();
                    nav.scrollTop += (box.top + box.height / 2) - (navBox.top + navBox.height / 2);
                });
            });
        })();

        /* Tooltip hints for the collapsed sidebar: hovering an icon shows its label (data-title). */
        (function () {
            var SEL = '#hs-application-sidebar [data-title]';
            var tip = null;

            function getTip() {
                if (!tip || !tip.isConnected) {
                    tip = document.createElement('div');
                    tip.className = 'sidebar-tip';
                    document.body.appendChild(tip);
                }
                return tip;
            }

            function hide() { if (tip) tip.classList.remove('show'); }

            document.addEventListener('mouseover', function (e) {
                if (!document.body.classList.contains('sidebar-collapsed')) return;
                var item = e.target.closest && e.target.closest(SEL);
                if (!item) return;
                var t = getTip();
                var r = item.getBoundingClientRect();
                t.textContent = item.getAttribute('data-title');
                t.style.top = (r.top + r.height / 2) + 'px';
                t.style.left = (r.right + 8) + 'px';
                t.classList.add('show');
            });
            document.addEventListener('mouseout', function (e) {
                var from = e.target.closest && e.target.closest(SEL);
                if (!from) return;
                var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(SEL) : null;
                if (to !== from) hide();
            });
            document.addEventListener('click', hide);
        })();
    </script>
</head>

<body class="bg-slate-100 dark:bg-neutral-900">
    {{-- Before anything paints, so the rail doesn't flash open. --}}
    <script>appShell.applySidebar();</script>

    @include('partials.app-header')
    @include('partials.app-sidebar')
    @include('partials.search-dialog')

    <main>
        {{-- Room for the fixed 64px header. --}}
        <div class="h-16"></div>
        {{ $slot }}
    </main>

    @livewireScripts

    {{-- Livewire Alert --}}
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <x-alert-flash />

</body>

</html>
