import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ClosedController::index
 * @see app/Http/Controllers/ClosedController.php:27
 * @route '/status-closed'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/status-closed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClosedController::index
 * @see app/Http/Controllers/ClosedController.php:27
 * @route '/status-closed'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClosedController::index
 * @see app/Http/Controllers/ClosedController.php:27
 * @route '/status-closed'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ClosedController::index
 * @see app/Http/Controllers/ClosedController.php:27
 * @route '/status-closed'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const ClosedController = { index }

export default ClosedController