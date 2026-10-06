<?php

namespace Tests\Unit;

use App\Actions\Reports\TurnaroundReport;
use Carbon\Carbon;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionMethod;
use Tests\TestCase;

/**
 * TurnaroundReport counts working days arithmetically for speed; it must give
 * exactly the count Carbon's diffInDaysFiltered gave before.
 */
class TurnaroundBusinessDaysTest extends TestCase
{
    protected function fast(string $start, string $end): int
    {
        return (new ReflectionMethod(TurnaroundReport::class, 'businessDays'))->invoke(null, $start, $end);
    }

    protected function carbon(string $start, string $end): int
    {
        return (new ReflectionMethod(TurnaroundReport::class, 'businessDaysCarbon'))->invoke(null, $start, $end);
    }

    public static function edges(): array
    {
        return [
            'same moment' => ['2026-10-01 09:00:00', '2026-10-01 09:00:00', 0],
            'end before start' => ['2026-10-02 09:00:00', '2026-10-01 09:00:00', 0],
            'same day, later' => ['2026-10-01 09:00:00', '2026-10-01 16:00:00', 1],
            'exactly one day later' => ['2026-10-01 09:00:00', '2026-10-02 09:00:00', 1],
            'one day and a second' => ['2026-10-01 09:00:00', '2026-10-02 09:00:01', 2],
            'next day, earlier hour' => ['2026-10-01 16:00:00', '2026-10-02 08:00:00', 1],
            'Friday to Monday' => ['2026-10-02 10:00:00', '2026-10-05 11:00:00', 2],
            'Saturday to Sunday' => ['2026-10-03 10:00:00', '2026-10-04 11:00:00', 0],
            'Saturday to Monday' => ['2026-10-03 10:00:00', '2026-10-05 11:00:00', 1],
            'fractional seconds' => ['2026-10-01 09:00:00.250', '2026-10-01 09:00:00.500', 1],
            'across a year end' => ['2025-12-29 08:00:00', '2026-01-05 08:00:00', 5],
        ];
    }

    #[DataProvider('edges')]
    public function test_edge_cases_match_carbon(string $start, string $end, int $expected): void
    {
        $this->assertSame($expected, $this->carbon($start, $end), 'Carbon reference');
        $this->assertSame($expected, $this->fast($start, $end));
    }

    public function test_random_pairs_match_carbon(): void
    {
        mt_srand(20261006);
        $base = Carbon::parse('2024-01-01 00:00:00')->getTimestamp();

        for ($i = 0; $i < 3000; $i++) {
            $start = $base + mt_rand(0, 3 * 365 * 86400);
            $end = $start + mt_rand(-86400, 120 * 86400);
            $a = date('Y-m-d H:i:s', $start);
            $b = date('Y-m-d H:i:s', $end);

            $this->assertSame($this->carbon($a, $b), $this->fast($a, $b), "$a → $b");
        }
    }
}
