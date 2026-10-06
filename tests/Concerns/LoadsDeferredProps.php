<?php

namespace Tests\Concerns;

use Illuminate\Testing\TestResponse;
use Inertia\Support\Header;
use PHPUnit\Framework\Assert as PHPUnit;

/**
 * For pages whose data is a deferred Inertia prop (the reports): open the
 * page, check the data was left out of that first response, then load
 * every prop at once, as the browser does right after.
 */
trait LoadsDeferredProps
{
    protected function getWithDeferred(string $uri): TestResponse
    {
        $page = $this->get($uri)->assertOk()->viewData('page');

        $deferred = collect($page['deferredProps'] ?? [])->flatten()->all();
        PHPUnit::assertNotEmpty($deferred, "Expected deferred props on {$uri}.");

        foreach ($deferred as $prop) {
            PHPUnit::assertArrayNotHasKey($prop, $page['props'], "{$prop} should load after the page opens.");
        }

        // The same request Inertia's own ReloadRequest makes: a partial reload naming every prop.
        $response = $this->get($uri, [
            Header::VERSION => (string) $page['version'],
            Header::PARTIAL_COMPONENT => $page['component'],
            Header::PARTIAL_ONLY => implode(',', [...array_keys($page['props']), ...$deferred]),
        ]);

        // A rescued prop is silently left out (the page shows a retry), which would hide a crash here.
        $loaded = $response->viewData('page');
        foreach ($deferred as $prop) {
            PHPUnit::assertArrayHasKey($prop, $loaded['props'], "{$prop} failed to load (rescued: it threw on the server).");
        }

        return $response;
    }
}
