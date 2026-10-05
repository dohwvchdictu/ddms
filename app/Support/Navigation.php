<?php

namespace App\Support;

/**
 * The sidebar menu for the Blade copy of the app shell, which the Livewire
 * pages use until they move to React. A mirror of resources/react/lib/navigation.ts:
 * same titles, links, icons and badge keys, in the same order.
 * NavigationTest compares the two, so an edit to one without the other fails.
 *
 * Icons are lucide names, drawn by <x-lucide>. Badge keys read
 * CurrentEmployee::sidebarCounts().
 */
class Navigation
{
    /**
     * Links shown above the New Document button.
     *
     * @return list<array{title: string, href: string, icon: string, badge?: string}>
     */
    public static function primary(): array
    {
        return [
            ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'house'],
        ];
    }

    /** @return array{title: string, href: string, icon: string} */
    public static function newDocument(): array
    {
        return ['title' => 'New Document', 'href' => '/new-document', 'icon' => 'file-plus-2'];
    }

    /**
     * @return list<array{title: string, icon: string, defaultOpen: bool, badge?: string, items: list<array{title: string, href: string, icon: string, badge?: string}>}>
     */
    public static function groups(): array
    {
        return [
            [
                // `total` rather than the sum of the rows, so a document counts once.
                'title' => 'Inbox',
                'icon' => 'inbox',
                'defaultOpen' => true,
                'badge' => 'total',
                'items' => [
                    ['title' => 'Incoming', 'href' => '/status-incoming', 'icon' => 'arrow-down-to-line', 'badge' => 'incoming'],
                    ['title' => 'Pending', 'href' => '/status-pending', 'icon' => 'hourglass', 'badge' => 'pending'],
                ],
            ],
            [
                'title' => 'Outbox',
                'icon' => 'folder-open',
                'defaultOpen' => true,
                'items' => [
                    ['title' => 'My Documents', 'href' => '/my-documents', 'icon' => 'files'],
                    ['title' => 'Routing Logbook', 'href' => '/routing-logbook', 'icon' => 'book-open'],
                ],
            ],
            [
                'title' => 'Archive',
                'icon' => 'archive',
                'defaultOpen' => false,
                'items' => [
                    ['title' => 'Processed', 'href' => '/status-forwarded', 'icon' => 'send'],
                    ['title' => 'Closed', 'href' => '/status-closed', 'icon' => 'circle-check-big'],
                ],
            ],
            [
                'title' => 'Reports',
                'icon' => 'chart-column',
                'defaultOpen' => false,
                'items' => [
                    ['title' => 'Status', 'href' => '/report-status-of-documents', 'icon' => 'clipboard-list'],
                    ['title' => 'Endorsements', 'href' => '/report-status-per-employee', 'icon' => 'user-round-check'],
                    ['title' => 'External Requests', 'href' => '/report-status-of-external-documents', 'icon' => 'globe'],
                    ['title' => 'Per Unit', 'href' => '/report-per-unit', 'icon' => 'network'],
                    ['title' => 'Turnaround Time', 'href' => '/report-turnaround-time', 'icon' => 'timer'],
                ],
            ],
        ];
    }

    /** Whether a link is the current page, or a page under it (same rule as React). */
    public static function isActive(string $href, ?string $path = null): bool
    {
        $path = '/' . ltrim($path ?? request()->path(), '/');

        return $path === $href || str_starts_with($path, $href . '/');
    }
}
