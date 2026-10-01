import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
const EditAction = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EditAction.url(args, options),
    method: 'get',
})

EditAction.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/actions/{record}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
EditAction.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return EditAction.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
EditAction.get = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EditAction.url(args, options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\ActionResource\Pages\EditAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/EditAction.php:7
 * @route '/dtis-admin/actions/{record}/edit'
 */
EditAction.head = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: EditAction.url(args, options),
    method: 'head',
})
export default EditAction