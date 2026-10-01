import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Status\Forwarded::__invoke
 * @see app/Livewire/Status/Forwarded.php:7
 * @route '/status-forwarded'
 */
const Forwarded = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Forwarded.url(options),
    method: 'get',
})

Forwarded.definition = {
    methods: ["get","head"],
    url: '/status-forwarded',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Status\Forwarded::__invoke
 * @see app/Livewire/Status/Forwarded.php:7
 * @route '/status-forwarded'
 */
Forwarded.url = (options?: RouteQueryOptions) => {
    return Forwarded.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Status\Forwarded::__invoke
 * @see app/Livewire/Status/Forwarded.php:7
 * @route '/status-forwarded'
 */
Forwarded.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Forwarded.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Status\Forwarded::__invoke
 * @see app/Livewire/Status/Forwarded.php:7
 * @route '/status-forwarded'
 */
Forwarded.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Forwarded.url(options),
    method: 'head',
})
export default Forwarded