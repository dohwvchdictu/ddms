import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Status\Incoming::__invoke
 * @see app/Livewire/Status/Incoming.php:7
 * @route '/status-incoming'
 */
const Incoming = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Incoming.url(options),
    method: 'get',
})

Incoming.definition = {
    methods: ["get","head"],
    url: '/status-incoming',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Status\Incoming::__invoke
 * @see app/Livewire/Status/Incoming.php:7
 * @route '/status-incoming'
 */
Incoming.url = (options?: RouteQueryOptions) => {
    return Incoming.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Status\Incoming::__invoke
 * @see app/Livewire/Status/Incoming.php:7
 * @route '/status-incoming'
 */
Incoming.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Incoming.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Status\Incoming::__invoke
 * @see app/Livewire/Status/Incoming.php:7
 * @route '/status-incoming'
 */
Incoming.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Incoming.url(options),
    method: 'head',
})
export default Incoming