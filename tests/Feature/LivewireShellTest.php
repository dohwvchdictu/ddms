<?php

namespace Tests\Feature;

use App\Actions\Navigation\SidebarCounts;
use App\Services\ApiService;
use App\Support\Navigation;
use Mockery\MockInterface;
use Tests\TestCase;

/**
 * The Blade copy of the app shell that the Livewire pages use: the same header
 * and sidebar as the React pages, with no Livewire components of its own.
 */
class LivewireShellTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->with(3, 7)->andReturn([
            'incoming' => 4, 'pending' => 2, 'endorsed' => 1, 'total' => 6,
        ]));
        $this->mock(ApiService::class, function (MockInterface $mock) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => []]);
            $mock->shouldReceive('getActiveOffices')->andReturn([]);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => []]);
        });
    }

    protected function signedIn(): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => [
                'id' => 7,
                'firstName' => 'Juan',
                'lastName' => 'Dela Cruz',
                'suffix' => '',
                'office' => ['id' => 3, 'officeName' => 'Knowledge Management and ICT Unit'],
            ],
            'user_photo' => '/storage/photos/7-juan.jpg',
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    public function test_a_livewire_page_gets_the_new_header_and_sidebar(): void
    {
        $response = $this->signedIn()->get('/status-forwarded')->assertOk();

        $response->assertSee('Digital Document Management System')
            ->assertSee('Hi, <span class="font-semibold">Juan</span>', false)
            ->assertSee('Knowledge Management and ICT Unit')
            ->assertSee('/storage/photos/7-juan.jpg')
            ->assertSee('id="hs-application-sidebar"', false)
            ->assertSee('id="document-search"', false)
            // The old Livewire chrome is gone.
            ->assertDontSee('document-search-modal');

        // The page's own <title> may still carry the old name; the chrome must not.
        $this->assertStringNotContainsString('Document Tracking Information System', preg_replace('#<title>.*?</title>#s', '', $response->getContent()));

        // The current page is marked, and the menu lists every page.
        $this->assertMatchesRegularExpression('#href="/status-forwarded"[^>]*aria-current="page"#', $response->getContent());
        $this->assertDoesNotMatchRegularExpression('#href="/dashboard"[^>]*aria-current="page"#', $response->getContent());

        foreach (Navigation::groups() as $group) {
            foreach ($group['items'] as $item) {
                $response->assertSee('href="' . $item['href'] . '"', false);
            }
        }
    }

    public function test_the_badges_come_from_the_shared_counts(): void
    {
        $this->signedIn()
            ->get('/status-forwarded')
            ->assertSee('data-title="Incoming · 4"', false)
            ->assertSee('data-title="Pending · 2"', false)
            ->assertSee('data-title="Inbox · 6"', false)
            // Endorsed was merged into Pending's "To me" switch.
            ->assertDontSee('data-title="Endorsed', false);
    }

    public function test_the_photo_route_still_serves_only_images(): void
    {
        $this->signedIn()->get('/employee/image/notes.txt')->assertNotFound();
        $this->signedIn()->get('/employee/image/nobody.jpg')->assertNotFound();
    }

    /** The PHP menu mirrors resources/react/lib/navigation.ts; an edit to one alone fails here. */
    public function test_the_blade_menu_matches_the_react_one(): void
    {
        $source = file_get_contents(resource_path('react/lib/navigation.ts'));
        preg_match_all("/title: '([^']+)', href: '([^']+)'/", $source, $matches, PREG_SET_ORDER);
        $react = array_map(fn ($match) => [$match[1], $match[2]], $matches);

        $blade = array_map(
            fn ($item) => [$item['title'], $item['href']],
            [
                ...Navigation::primary(),
                Navigation::newDocument(),
                ...array_merge(...array_column(Navigation::groups(), 'items')),
            ],
        );

        $this->assertNotEmpty($react);
        $this->assertSame($react, $blade);
    }
}
