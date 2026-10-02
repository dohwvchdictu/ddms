import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RoutingLogbookController::index
 * @see app/Http/Controllers/RoutingLogbookController.php:27
 * @route '/routing-logbook'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/routing-logbook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RoutingLogbookController::index
 * @see app/Http/Controllers/RoutingLogbookController.php:27
 * @route '/routing-logbook'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoutingLogbookController::index
 * @see app/Http/Controllers/RoutingLogbookController.php:27
 * @route '/routing-logbook'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RoutingLogbookController::index
 * @see app/Http/Controllers/RoutingLogbookController.php:27
 * @route '/routing-logbook'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const RoutingLogbookController = { index }

export default RoutingLogbookController