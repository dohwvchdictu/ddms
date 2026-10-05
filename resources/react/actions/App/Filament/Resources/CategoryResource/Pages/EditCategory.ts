import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/ddms-admin/categories/{record}/edit'
 */
const EditCategory = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EditCategory.url(args, options),
    method: 'get',
})

EditCategory.definition = {
    methods: ["get","head"],
    url: '/ddms-admin/categories/{record}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/ddms-admin/categories/{record}/edit'
 */
EditCategory.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return EditCategory.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/ddms-admin/categories/{record}/edit'
 */
EditCategory.get = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EditCategory.url(args, options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CategoryResource\Pages\EditCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/EditCategory.php:7
 * @route '/ddms-admin/categories/{record}/edit'
 */
EditCategory.head = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: EditCategory.url(args, options),
    method: 'head',
})
export default EditCategory