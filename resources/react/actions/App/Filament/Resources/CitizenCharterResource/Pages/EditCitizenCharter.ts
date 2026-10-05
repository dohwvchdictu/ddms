import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\EditCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/EditCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/{record}/edit'
 */
const EditCitizenCharter = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EditCitizenCharter.url(args, options),
    method: 'get',
})

EditCitizenCharter.definition = {
    methods: ["get","head"],
    url: '/ddms-admin/citizen-charters/{record}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\EditCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/EditCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/{record}/edit'
 */
EditCitizenCharter.url = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return EditCitizenCharter.definition.url
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\EditCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/EditCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/{record}/edit'
 */
EditCitizenCharter.get = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EditCitizenCharter.url(args, options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\EditCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/EditCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/{record}/edit'
 */
EditCitizenCharter.head = (args: { record: string | number } | [record: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: EditCitizenCharter.url(args, options),
    method: 'head',
})
export default EditCitizenCharter