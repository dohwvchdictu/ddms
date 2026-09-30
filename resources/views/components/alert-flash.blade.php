{{-- Alerts queued with flash() before a redirect (App\Traits\LivewireAlert). --}}
@if (session()->has('livewire-alert'))
    <script>
        Swal.fire(@js(session('livewire-alert')));
    </script>
@endif
