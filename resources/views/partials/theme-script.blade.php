{{-- Sets the `dark` class on <html> before first paint. A choice made with
     the theme toggle (localStorage `darkMode` = '1' or '0') wins; with no
     choice saved, the page follows the browser/OS theme and keeps following
     it if that changes while the page is open. Shared by the Livewire and
     Inertia layouts so the theme carries across both.

     Pass `followSystem => true` to ignore the saved choice and always follow
     the browser/OS theme (the login page does this). --}}
<script>
    (function (followSystem) {
        var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

        function savedTheme() {
            if (followSystem) return null;

            try {
                return localStorage.getItem('darkMode');
            } catch (e) {
                return null;
            }
        }

        function apply() {
            var saved = savedTheme();
            var dark = saved === '1' || (saved === null && !!media && media.matches);
            document.documentElement.classList.toggle('dark', dark);
        }

        apply();

        if (media) {
            var onChange = function () {
                if (savedTheme() === null) apply();
            };
            media.addEventListener ? media.addEventListener('change', onChange) : media.addListener(onChange);
        }
    })(@json($followSystem ?? false));
</script>
