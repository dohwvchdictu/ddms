<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- Same preference key as the Livewire layout, so the theme carries
         across both halves of the app while they coexist. --}}
    <script>
        try {
            if (localStorage.getItem('darkMode') === '1') document.documentElement.classList.add('dark');
        } catch (e) {}
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        rel="stylesheet">
    <link rel="icon" href="{{ asset('/img/doh.ico') }}" />

    {{-- The React UI is a separate Vite build (vite.react.config.ts) so its
         Tailwind 4 never meets the legacy Tailwind 3 / Preline styles. --}}
    @php(\Illuminate\Support\Facades\Vite::useHotFile(public_path('react.hot'))->useBuildDirectory('build-react'))
    @viteReactRefresh
    @vite('resources/react/app.tsx')
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
