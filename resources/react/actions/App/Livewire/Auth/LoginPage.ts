import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Auth\LoginPage::__invoke
 * @see app/Livewire/Auth/LoginPage.php:7
 * @route '/'
 */
const LoginPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: LoginPage.url(options),
    method: 'get',
})

LoginPage.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Auth\LoginPage::__invoke
 * @see app/Livewire/Auth/LoginPage.php:7
 * @route '/'
 */
LoginPage.url = (options?: RouteQueryOptions) => {
    return LoginPage.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Auth\LoginPage::__invoke
 * @see app/Livewire/Auth/LoginPage.php:7
 * @route '/'
 */
LoginPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: LoginPage.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Auth\LoginPage::__invoke
 * @see app/Livewire/Auth/LoginPage.php:7
 * @route '/'
 */
LoginPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: LoginPage.url(options),
    method: 'head',
})
export default LoginPage