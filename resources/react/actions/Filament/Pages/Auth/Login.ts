import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \Filament\Pages\Auth\Login::__invoke
 * @see vendor/filament/filament/src/Pages/Auth/Login.php:7
 * @route '/dtis-admin/login'
 */
const Login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Login.url(options),
    method: 'get',
})

Login.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Filament\Pages\Auth\Login::__invoke
 * @see vendor/filament/filament/src/Pages/Auth/Login.php:7
 * @route '/dtis-admin/login'
 */
Login.url = (options?: RouteQueryOptions) => {
    return Login.definition.url + queryParams(options)
}

/**
* @see \Filament\Pages\Auth\Login::__invoke
 * @see vendor/filament/filament/src/Pages/Auth/Login.php:7
 * @route '/dtis-admin/login'
 */
Login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Login.url(options),
    method: 'get',
})
/**
* @see \Filament\Pages\Auth\Login::__invoke
 * @see vendor/filament/filament/src/Pages/Auth/Login.php:7
 * @route '/dtis-admin/login'
 */
Login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Login.url(options),
    method: 'head',
})
export default Login