<?php

namespace App\Traits;

use Jantinnerezo\LivewireAlert\LivewireAlert as Alert;

/**
 * Keeps the livewire-alert v3 `alert()` / `flash()` API working on v4.
 *
 * v4 dropped the component trait for a fluent builder, and v3's onConfirmed /
 * onDismissed events now call the component method directly instead of
 * broadcasting a Livewire event. Every callback used here is a public method
 * on the component that raises the alert, so the behaviour is unchanged.
 */
trait LivewireAlert
{
    /**
     * livewire-alert v3's default `alert` config, which v4 no longer ships.
     */
    protected function alertDefaults(): array
    {
        return [
            'position' => 'top-end',
            'timer' => 3000,
            'toast' => true,
            'showCancelButton' => false,
            'showConfirmButton' => false,
        ];
    }

    protected function alert(string $type = 'success', string $message = '', array $options = []): void
    {
        [$options, $events] = $this->splitAlertOptions($type, $message, $options);

        $alert = (new Alert($this))->withOptions($options);

        if (isset($events['onConfirmed'])) {
            $alert->onConfirm($events['onConfirmed']);
        }

        if (isset($events['onDenied'])) {
            $alert->onDeny($events['onDenied']);
        }

        if (isset($events['onDismissed'])) {
            $alert->onDismiss($events['onDismissed']);
        }

        $alert->show();
    }

    /**
     * Show the alert on the next page load, rendered by <x-alert-flash />.
     */
    protected function flash(string $type = 'success', string $message = '', array $options = [], string $redirect = '')
    {
        [$options] = $this->splitAlertOptions($type, $message, $options);

        session()->flash('livewire-alert', $options);

        if ($redirect !== '') {
            return $this->redirect($redirect);
        }
    }

    /**
     * @return array{0: array<string, mixed>, 1: array<string, string>}
     */
    private function splitAlertOptions(string $type, string $message, array $options): array
    {
        $options = array_merge($this->alertDefaults(), $options);

        $events = array_intersect_key($options, array_flip(['onConfirmed', 'onDenied', 'onDismissed']));
        $options = array_diff_key($options, $events);

        // titleText, not title: SweetAlert renders `title` as HTML and some
        // messages carry text from the API.
        return [
            ['icon' => $type, 'titleText' => $message, 'backdrop' => ! $options['toast']] + $options,
            $events,
        ];
    }
}
