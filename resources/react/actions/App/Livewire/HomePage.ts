import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Livewire\HomePage::__invoke
 * @see app/Livewire/HomePage.php:7
 * @route '/dashboard'
 */
const HomePage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HomePage.url(options),
    method: 'get',
})

HomePage.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\HomePage::__invoke
 * @see app/Livewire/HomePage.php:7
 * @route '/dashboard'
 */
HomePage.url = (options?: RouteQueryOptions) => {
    return HomePage.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\HomePage::__invoke
 * @see app/Livewire/HomePage.php:7
 * @route '/dashboard'
 */
HomePage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HomePage.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\HomePage::__invoke
 * @see app/Livewire/HomePage.php:7
 * @route '/dashboard'
 */
HomePage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: HomePage.url(options),
    method: 'head',
})
export default HomePage