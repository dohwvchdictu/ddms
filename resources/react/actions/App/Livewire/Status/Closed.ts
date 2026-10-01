import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Status\Closed::__invoke
 * @see app/Livewire/Status/Closed.php:7
 * @route '/status-closed'
 */
const Closed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Closed.url(options),
    method: 'get',
})

Closed.definition = {
    methods: ["get","head"],
    url: '/status-closed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Status\Closed::__invoke
 * @see app/Livewire/Status/Closed.php:7
 * @route '/status-closed'
 */
Closed.url = (options?: RouteQueryOptions) => {
    return Closed.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Status\Closed::__invoke
 * @see app/Livewire/Status/Closed.php:7
 * @route '/status-closed'
 */
Closed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Closed.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Status\Closed::__invoke
 * @see app/Livewire/Status/Closed.php:7
 * @route '/status-closed'
 */
Closed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Closed.url(options),
    method: 'head',
})
export default Closed