import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/dtis-admin/categories/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/categories/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/dtis-admin/categories/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/dtis-admin/categories/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/dtis-admin/categories/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/dtis-admin/categories/{record}/edit'
 */
export const edit = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/categories/{record}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/dtis-admin/categories/{record}/edit'
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
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/dtis-admin/categories/{record}/edit'
 */
edit.get = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/dtis-admin/categories/{record}/edit'
 */
edit.head = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})
const categories = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
edit: Object.assign(edit, edit),
}

export default categories