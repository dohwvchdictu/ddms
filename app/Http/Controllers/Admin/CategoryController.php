<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Administration › Categories: the document types offered on New Document,
 * each with its prescribed timeline. Replaces the Filament CategoryResource.
 * There is no delete: documents reference categories, so a category that is
 * no longer used is deactivated instead (New Document stops offering it).
 */
class CategoryController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    public const STATUSES = ['all', 'active', 'inactive'];

    public const SORTS = ['name', '-name', 'required_days', '-required_days'];

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('admin/categories', [
            // Deferred: the page opens with a skeleton and the list follows.
            // Filter changes, page turns and saves ask for these by name, so they
            // come back in the same response. Rescued: a failure offers a retry.
            'categories' => Inertia::defer(function () use ($filters) {
                [$column, $direction] = self::sortParts($filters['sort']);

                return $this->query($filters)
                    ->orderBy($column, $direction)
                    ->orderBy('name')
                    ->paginate($filters['per_page'])
                    ->withQueryString()
                    ->through(fn (Category $category) => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'required_days' => $category->required_days,
                        'is_active' => (bool) $category->is_active,
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
        ]);
    }

    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Category::create([...$data, 'slug' => $this->uniqueSlug($data['name'])]);

        return $this->saved("Category \"{$data['name']}\" added");
    }

    /** The slug is kept on a rename, so anything already pointing at it still does. */
    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return $this->saved("Category \"{$category->name}\" saved");
    }

    /** @param  array{search: string, status: string}  $filters */
    protected function query(array $filters): Builder
    {
        return Category::query()
            ->when($filters['search'] !== '', fn (Builder $query) => $query->where('name', 'like', "%{$filters['search']}%"))
            ->when($filters['status'] !== 'all', fn (Builder $query) => $query->where('is_active', $filters['status'] === 'active'));
    }

    /** From the name, as the Filament form made it; numbered when taken. */
    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;

        for ($n = 2; Category::where('slug', $slug)->exists(); $n++) {
            $slug = "{$base}-{$n}";
        }

        return $slug;
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
