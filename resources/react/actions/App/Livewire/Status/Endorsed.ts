import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Status\Endorsed::__invoke
 * @see app/Livewire/Status/Endorsed.php:7
 * @route '/status-endorsed'
 */
const Endorsed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Endorsed.url(options),
    method: 'get',
})

Endorsed.definition = {
    methods: ["get","head"],
    url: '/status-endorsed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Status\Endorsed::__invoke
 * @see app/Livewire/Status/Endorsed.php:7
 * @route '/status-endorsed'
 */
Endorsed.url = (options?: RouteQueryOptions) => {
    return Endorsed.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Status\Endorsed::__invoke
 * @see app/Livewire/Status/Endorsed.php:7
 * @route '/status-endorsed'
 */
Endorsed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Endorsed.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Status\Endorsed::__invoke
 * @see app/Livewire/Status/Endorsed.php:7
 * @route '/status-endorsed'
 */
Endorsed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Endorsed.url(options),
    method: 'head',
})
export default Endorsed