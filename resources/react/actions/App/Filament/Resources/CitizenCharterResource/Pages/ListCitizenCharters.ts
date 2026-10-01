import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\ListCitizenCharters::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/ListCitizenCharters.php:7
 * @route '/dtis-admin/citizen-charters'
 */
const ListCitizenCharters = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListCitizenCharters.url(options),
    method: 'get',
})

ListCitizenCharters.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/citizen-charters',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\ListCitizenCharters::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/ListCitizenCharters.php:7
 * @route '/dtis-admin/citizen-charters'
 */
ListCitizenCharters.url = (options?: RouteQueryOptions) => {
    return ListCitizenCharters.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\ListCitizenCharters::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/ListCitizenCharters.php:7
 * @route '/dtis-admin/citizen-charters'
 */
ListCitizenCharters.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListCitizenCharters.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CitizenCharterResource\Pages\ListCitizenCharters::__invoke
 * @see app/Filament/Resources/CitizenCharterResource/Pages/ListCitizenCharters.php:7
 * @route '/dtis-admin/citizen-charters'
 */
ListCitizenCharters.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ListCitizenCharters.url(options),
    method: 'head',
})
export default ListCitizenCharters