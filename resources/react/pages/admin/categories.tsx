import { Deferred, Head } from '@inertiajs/react';
import { CircleCheck, CircleX, Pencil, Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import CategoryDialog, { type CategoryValues } from '@/components/admin/category-dialog';
import RowMenu from '@/components/admin/row-menu';
import { LoadFailed, LoadingBody, TableSkeleton } from '@/components/data-table/deferred-states';
import ListTabs from '@/components/data-table/list-tabs';
import SortableHead from '@/components/data-table/sortable-head';
import Pagination from '@/components/pagination';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { index as categoriesIndex } from '@/routes/admin/categories';
import type { Paginated } from '@/types';

type Status = 'all' | 'active' | 'inactive';

interface Row {
    id: number;
    name: string;
    required_days: number | null;
    is_active: boolean;
}

interface Filters {
    search: string;
    status: Status;
    sort: string;
    per_page: number;
    [key: string]: unknown;
}

interface Props {
    /** Deferred: undefined until it arrives after the page opens. */
    categories?: Paginated<Row>;
    filters: Filters;
    counts?: Record<Status, number>;
    perPageOptions: number[];
}

/** Reloaded by name on filter changes, page turns and actions, so the old rows stay up meanwhile. */
const RELOAD = ['filters', 'categories', 'counts'];

const DEFAULT_SORT = 'name';
const DEFAULT_PER_PAGE = 25;

const toUrl = (filters: Filters) =>
    categoriesIndex.url({
        query: {
            search: filters.search.trim() || undefined,
            status: filters.status === 'all' ? undefined : filters.status,
            sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
            per_page: filters.per_page === DEFAULT_PER_PAGE ? undefined : filters.per_page,
        },
    });

/** Administration › Categories: the document types New Document offers, with their timelines. */
export default function Categories({ categories, filters: initial, counts }: Props) {
    const { filters, update, loading } = useListFilters(initial, toUrl, { debounce: ['search'], only: RELOAD });
    const [editing, setEditing] = useState<CategoryValues | null>(null);

    return (
        <AppLayout
            title="Categories"
            actions={
                <Button
                    size="icon"
                    onClick={() => setEditing({ name: '', required_days: null, is_active: true })}
                    aria-label="Add category"
                    title="Add category"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    <Plus />
                </Button>
            }
        >
            <Head title="Categories" />

            <div className="relative overflow-clip rounded-xl border bg-card shadow-sm">
                {loading && (
                    <div
                        className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-emerald-100 dark:bg-emerald-950"
                        role="progressbar"
                        aria-label="Loading"
                    >
                        <div className="h-full w-1/3 animate-[table-progress_1s_ease-in-out_infinite] bg-emerald-600" />
                    </div>
                )}

                <ListTabs
                    label="Status"
                    value={filters.status}
                    onChange={(status) => update({ status: status as Status })}
                    tabs={[
                        { value: 'all', label: 'All', count: counts?.all },
                        { value: 'active', label: 'Active', count: counts?.active },
                        { value: 'inactive', label: 'Inactive', count: counts?.inactive },
                    ]}
                />

                <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                    <SearchInput
                        value={filters.search}
                        onChange={(search) => update({ search })}
                        placeholder="Search category…"
                        label="Search categories"
                        loading={loading}
                        resultCount={categories && filters.search.trim() === initial.search ? categories.total : undefined}
                        className="w-full sm:max-w-md sm:min-w-72 sm:flex-1"
                    />
                </div>

                <Deferred data="categories" fallback={<TableSkeleton columns={4} />} rescue={<LoadFailed only={RELOAD} what="the categories" />}>
                    {categories && (
                        <>
                            <LoadingBody loading={loading}>
                                {categories.data.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <Tags className="size-5" />
                                        </div>
                                        <p className="text-sm font-medium">No categories match</p>
                                        <p className="text-sm text-muted-foreground">Try another search or tab.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                <SortableHead column="name" sort={filters.sort} onSort={(sort) => update({ sort })} className="pl-4">
                                                    Document Name
                                                </SortableHead>
                                                <SortableHead
                                                    column="required_days"
                                                    sort={filters.sort}
                                                    onSort={(sort) => update({ sort })}
                                                    className="text-right"
                                                >
                                                    Required Days
                                                </SortableHead>
                                                <TableHead>Is Active</TableHead>
                                                <TableHead className="pr-4 text-right">
                                                    <span className="sr-only">Actions</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories.data.map((row) => (
                                                <TableRow key={row.id} className={cn(!row.is_active && 'text-muted-foreground')}>
                                                    <TableCell className="max-w-xl pl-4 text-sm font-medium whitespace-normal text-foreground">
                                                        {row.name}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm tabular-nums">{row.required_days ?? '—'}</TableCell>
                                                    <TableCell>
                                                        <YesNo value={row.is_active} />
                                                    </TableCell>
                                                    <TableCell className="pr-4 text-right">
                                                        <RowMenu
                                                            label={`Actions for ${row.name}`}
                                                            items={[{ label: 'Edit', icon: Pencil, onSelect: () => setEditing(row) }]}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </LoadingBody>

                            <Pagination page={categories} only={RELOAD} />
                        </>
                    )}
                </Deferred>
            </div>

            <CategoryDialog category={editing} onClose={() => setEditing(null)} reloadOnly={RELOAD} />
        </AppLayout>
    );
}

/** A tick or a cross, as the old admin panel showed true / false columns. */
function YesNo({ value }: { value: boolean }) {
    return value ? (
        <CircleCheck className="size-5 text-emerald-600 dark:text-emerald-400" aria-label="Yes" />
    ) : (
        <CircleX className="size-5 text-red-500 dark:text-red-400" aria-label="No" />
    );
}
