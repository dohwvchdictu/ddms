import { Head } from '@inertiajs/react';
import { Info, Plus } from 'lucide-react';
import { useState } from 'react';
import ActionDialog from '@/components/admin/action-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Props {
    actions: { id: number; name: string; color: string | null }[];
}

/** Administration › Actions: the steps routing is logged with. New ones can be added; existing ones stay as they are. */
export default function Actions({ actions }: Props) {
    const [adding, setAdding] = useState(false);

    return (
        <AppLayout
            title="Actions"
            actions={
                <Button size="icon" onClick={() => setAdding(true)} aria-label="Add action" title="Add action" className="bg-emerald-600 text-white hover:bg-emerald-700">
                    <Plus />
                </Button>
            }
        >
            <Head title="Actions" />

            <div className="grid gap-4">
                <Alert>
                    <Info />
                    <AlertDescription>
                        These are the actions a document's routing is recorded with. Existing ones can't be renamed or removed: the system finds them by name, so a change would
                        break routing.
                    </AlertDescription>
                </Alert>

                <div className="overflow-clip rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="pl-4">Description</TableHead>
                                <TableHead className="pr-4">Color Indicator</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {actions.map((action) => (
                                <TableRow key={action.id}>
                                    <TableCell className="pl-4 text-sm font-medium">{action.name}</TableCell>
                                    <TableCell className="pr-4">
                                        {/* Stored as a Tailwind class name; the swatch shows for the colours in the picker. */}
                                        <span className="inline-flex items-center gap-2">
                                            <span className={cn('size-4 rounded border', action.color)} aria-hidden="true" />
                                            <code className="text-xs text-muted-foreground">{action.color ?? '—'}</code>
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ActionDialog open={adding} onClose={() => setAdding(false)} />
        </AppLayout>
    );
}
