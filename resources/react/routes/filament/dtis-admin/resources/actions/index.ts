import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/actions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/actions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
export const edit = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/actions/{record}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
edit.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { record: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    record: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        record: args.record,
                }

    return edit.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
edit.get = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
edit.head = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})
const actions = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
edit: Object.assign(edit, edit),
}

export default actions