<?php

namespace App\Http\Controllers;

use App\Services\ApiService;
use Illuminate\Http\JsonResponse;

/**
 * The people in one office, for "endorsed to" pickers. Fetched per office
 * rather than shipped with the page: the whole directory is large.
 */
class OfficeEmployeesController extends Controller
{
    public function __invoke(int $office, ApiService $api): JsonResponse
    {
        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])
            ->filter(fn ($employee) => ($employee['office']['id'] ?? null) == $office)
            ->map(fn ($employee) => [
                'id' => $employee['id'],
                // Last name first, as the Livewire picker listed them.
                'name' => trim(($employee['lastName'] ?? '') . ', ' . ($employee['firstName'] ?? '') . ' ' . ($employee['suffix'] ?? ''), ', '),
            ])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        return response()->json($employees);
    }
}
