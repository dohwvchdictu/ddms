import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import type { InertiaLinkProps } from '@inertiajs/react';

export interface Crumb {
    title: string;
    /** Leave out for the current page, the last crumb. */
    href?: InertiaLinkProps['href'];
}

/** Home › Section › Current page. The last crumb is the current page. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex min-w-0 items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
                {items.map((crumb, index) => {
                    const last = index === items.length - 1;

                    return (
                        <Fragment key={`${crumb.title}-${index}`}>
                            {index > 0 && <ChevronRight className="size-4 shrink-0" aria-hidden="true" />}
                            <li className={last ? 'truncate font-semibold text-foreground' : undefined} aria-current={last ? 'page' : undefined}>
                                {crumb.href && !last ? (
                                    <Link href={crumb.href} className="hover:text-foreground">
                                        {crumb.title}
                                    </Link>
                                ) : (
                                    crumb.title
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
