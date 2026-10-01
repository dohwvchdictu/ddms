import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Status\Pending::__invoke
 * @see app/Livewire/Status/Pending.php:7
 * @route '/status-pending'
 */
const Pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Pending.url(options),
    method: 'get',
})

Pending.definition = {
    methods: ["get","head"],
    url: '/status-pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Status\Pending::__invoke
 * @see app/Livewire/Status/Pending.php:7
 * @route '/status-pending'
 */
Pending.url = (options?: RouteQueryOptions) => {
    return Pending.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Status\Pending::__invoke
 * @see app/Livewire/Status/Pending.php:7
 * @route '/status-pending'
 */
Pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Pending.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Status\Pending::__invoke
 * @see app/Livewire/Status/Pending.php:7
 * @route '/status-pending'
 */
Pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Pending.url(options),
    method: 'head',
})
export default Pending