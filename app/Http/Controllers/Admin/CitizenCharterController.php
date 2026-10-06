<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCitizenCharterRequest;
use App\Models\CitizenCharter;
use App\Services\ApiService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Administration › Citizen's Charter: the charter processes New Document
 * offers, with their owner office and timeline. Replaces the Filament
 * CitizenCharterResource. No delete: documents reference them; deactivate.
 */
class CitizenCharterController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    public const STATUSES = ['all', 'active', 'inactive'];

    public const SORTS = ['name', '-name', 'required_days', '-required_days'];

    public function index(Request $request, ApiService $api): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('admin/citizen-charters', [
            // Deferred: the page opens with a skeleton and the list follows.
            // Filter changes, page turns and saves ask for these by name, so they
            // come back in the same response. Rescued: a failure offers a retry.
            'charters' => Inertia::defer(function () use ($filters, $api) {
                [$column, $direction] = self::sortParts($filters['sort']);
                // Every office, active or not, so a charter owned by a since-closed office still names it.
                $officeNames = collect($api->getOfficesData()['officeList'] ?? [])->pluck('officeName', 'id');

                return $this->query($filters)
                    ->orderBy($column, $direction)
                    ->orderBy('name')
                    ->paginate($filters['per_page'])
                    ->withQueryString()
                    ->through(fn (CitizenCharter $charter) => [
                        'id' => $charter->id,
                        'name' => $charter->name,
                        'office_id' => (string) $charter->office_id,
                        'office' => $officeNames[$charter->office_id] ?? 'Office #' . $charter->office_id,
                        'required_days' => $charter->required_days,
                        'is_external' => (bool) $charter->is_external,
                        'is_active' => (bool) $charter->is_active,
                    ]);
            }, rescue: true),
            'filters' => $filters,
            // Counts for the tabs: the search applies, the tab itself doesn't.
            'counts' => Inertia::defer(function () use ($filters) {
                $counts = $this->query([...$filters, 'status' => 'all'])->toBase()
                    ->selectRaw('count(*) as total, sum(is_active = 1) as active')
                    ->first();

                return ['all' => (int) $counts->total, 'active' => (int) $counts->active, 'inactive' => (int) $counts->total - (int) $counts->active];
            }, rescue: true),
            'perPageOptions' => self::PER_PAGE_OPTIONS,
            // Owner choices: active offices only.
            'offices' => collect($api->getActiveOffices())->map(fn (array $office) => ['id' => (string) $office['id'], 'name' => $office['officeName'] ?? ''])->values(),
        ]);
    }

    public function store(SaveCitizenCharterRequest $request): RedirectResponse
    {
        $charter = CitizenCharter::create($request->validated());

        return $this->saved("\"{$charter->name}\" added");
    }

    public function update(SaveCitizenCharterRequest $request, CitizenCharter $citizenCharter): RedirectResponse
    {
        $citizenCharter->update($request->validated());

        return $this->saved("\"{$citizenCharter->name}\" saved");
    }

    /** @param  array{search: string, status: string}  $filters */
    protected function query(array $filters): Builder
    {
        return CitizenCharter::query()
            ->when($filters['search'] !== '', fn (Builder $query) => $query->where('name', 'like', "%{$filters['search']}%"))
            ->when($filters['status'] !== 'all', fn (Builder $query) => $query->where('is_active', $filters['status'] === 'active'));
    }

    protected function saved(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }

    /** @return array{search: string, status: string, sort: string, per_page: int} */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);

        return [
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($request->query('status'), self::STATUSES, true) ? $request->query('status') : 'all',
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }
}
