<?php

namespace Tests\Feature;

use App\Traits\LivewireAlert;
use Livewire\Component;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * App\Traits\LivewireAlert keeps the livewire-alert v3 call style working on v4.
 */
class LivewireAlertTest extends TestCase
{
    public function test_alert_keeps_v3_defaults_and_passes_options_through(): void
    {
        $js = $this->alertJs(Livewire::test(AlertTestComponent::class)->call('warn'));

        $this->assertStringContainsString('"icon":"warning"', $js);
        $this->assertStringContainsString('"titleText":"Nothing to act on."', $js);
        $this->assertStringContainsString('"position":"top-end"', $js);
        $this->assertStringContainsString('"toast":true', $js);
        $this->assertStringContainsString('"timer":10000', $js);
    }

    public function test_alert_callbacks_call_the_component_method(): void
    {
        $js = $this->alertJs(Livewire::test(AlertTestComponent::class)->call('confirmForward'));

        $this->assertStringContainsString('"isConfirmed":{"action":"forward"', $js);
        $this->assertStringContainsString('"isDismissed":{"action":"closeModal"', $js);
        $this->assertStringNotContainsString('onConfirmed', $js);
    }

    public function test_flash_queues_the_alert_for_the_next_page_and_redirects(): void
    {
        Livewire::test(AlertTestComponent::class)
            ->call('forward')
            ->assertRedirect('/my-documents');

        $this->assertSame('success', session('livewire-alert.icon'));
        $this->assertSame('Document successfully forwarded!', session('livewire-alert.titleText'));
    }

    public function test_flashed_alert_is_shown_on_the_next_page(): void
    {
        // Rendered on its own: the Livewire layouts include it, but the login
        // page that used to be the easiest one to hit is now React.
        session()->put('livewire-alert', ['icon' => 'success', 'titleText' => 'Document successfully received!']);

        $this->blade('<x-alert-flash />')
            ->assertSee('Swal.fire(', false)
            ->assertSee('Document successfully received!');
    }

    private function alertJs($component): string
    {
        return collect($component->effects['xjs'] ?? [])->pluck('expression')->implode("\n");
    }
}

class AlertTestComponent extends Component
{
    use LivewireAlert;

    public function warn(): void
    {
        $this->alert('warning', 'Nothing to act on.', [
            'timer' => 10000,
        ]);
    }

    public function confirmForward(): void
    {
        $this->alert('warning', 'Forward the selected documents?', [
            'position' => 'center',
            'toast' => false,
            'timer' => null,
            'showConfirmButton' => true,
            'confirmButtonText' => 'Confirm',
            'onConfirmed' => 'forward',
            'showCancelButton' => true,
            'onDismissed' => 'closeModal',
        ]);
    }

    public function forward()
    {
        return $this->flash('success', 'Document successfully forwarded!', [], '/my-documents');
    }

    public function closeModal(): void
    {
    }

    public function render(): string
    {
        return '<div></div>';
    }
}
