import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\CreateCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/CreateCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/create'
 */
const CreateCitizenCharter = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CreateCitizenCharter.url(options),
    method: 'get',
})

CreateCitizenCharter.definition = {
    methods: ["get","head"],
    url: '/ddms-admin/citizen-charters/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\CreateCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/CreateCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/create'
 */
CreateCitizenCharter.url = (options?: RouteQueryOptions) => {
    return CreateCitizenCharter.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\CreateCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/CreateCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/create'
 */
CreateCitizenCharter.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CreateCitizenCharter.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\CreateCitizenCharter::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/CreateCitizenCharter.php:7
 * @route '/ddms-admin/citizen-charters/create'
 */
CreateCitizenCharter.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: CreateCitizenCharter.url(options),
    method: 'head',
})
export default CreateCitizenCharter