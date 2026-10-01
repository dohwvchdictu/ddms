import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
const ListActions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListActions.url(options),
    method: 'get',
})

ListActions.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/actions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
ListActions.url = (options?: RouteQueryOptions) => {
    return ListActions.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
ListActions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListActions.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\ActionResource\Pages\ListActions::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/ListActions.php:7
 * @route '/dtis-admin/actions'
 */
ListActions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ListActions.url(options),
    method: 'head',
})
export default ListActions