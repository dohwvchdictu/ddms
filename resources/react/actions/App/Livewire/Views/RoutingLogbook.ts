import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
const RoutingLogbook = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RoutingLogbook.url(options),
    method: 'get',
})

RoutingLogbook.definition = {
    methods: ["get","head"],
    url: '/routing-logbook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
RoutingLogbook.url = (options?: RouteQueryOptions) => {
    return RoutingLogbook.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
RoutingLogbook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RoutingLogbook.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
RoutingLogbook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RoutingLogbook.url(options),
    method: 'head',
})
export default RoutingLogbook