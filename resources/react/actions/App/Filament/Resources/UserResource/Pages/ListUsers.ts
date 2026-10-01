import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\UserResource\Pages\ListUsers::__invoke
 * @see app/Filament/Resources/UserResource/Pages/ListUsers.php:7
 * @route '/dtis-admin/users'
 */
const ListUsers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListUsers.url(options),
    method: 'get',
})

ListUsers.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\UserResource\Pages\ListUsers::__invoke
 * @see app/Filament/Resources/UserResource/Pages/ListUsers.php:7
 * @route '/dtis-admin/users'
 */
ListUsers.url = (options?: RouteQueryOptions) => {
    return ListUsers.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\UserResource\Pages\ListUsers::__invoke
 * @see app/Filament/Resources/UserResource/Pages/ListUsers.php:7
 * @route '/dtis-admin/users'
 */
ListUsers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListUsers.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\UserResource\Pages\ListUsers::__invoke
 * @see app/Filament/Resources/UserResource/Pages/ListUsers.php:7
 * @route '/dtis-admin/users'
 */
ListUsers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ListUsers.url(options),
    method: 'head',
})
export default ListUsers