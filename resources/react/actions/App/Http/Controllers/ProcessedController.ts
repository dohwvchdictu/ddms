import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProcessedController::index
 * @see app/Http/Controllers/ProcessedController.php:31
 * @route '/status-forwarded'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/status-forwarded',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProcessedController::index
 * @see app/Http/Controllers/ProcessedController.php:31
 * @route '/status-forwarded'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProcessedController::index
 * @see app/Http/Controllers/ProcessedController.php:31
 * @route '/status-forwarded'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProcessedController::index
 * @see app/Http/Controllers/ProcessedController.php:31
 * @route '/status-forwarded'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProcessedController::selectable
 * @see app/Http/Controllers/ProcessedController.php:58
 * @route '/status-forwarded/selectable'
 */
export const selectable = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})

selectable.definition = {
    methods: ["get","head"],
    url: '/status-forwarded/selectable',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProcessedController::selectable
 * @see app/Http/Controllers/ProcessedController.php:58
 * @route '/status-forwarded/selectable'
 */
selectable.url = (options?: RouteQueryOptions) => {
    return selectable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProcessedController::selectable
 * @see app/Http/Controllers/ProcessedController.php:58
 * @route '/status-forwarded/selectable'
 */
selectable.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProcessedController::selectable
 * @see app/Http/Controllers/ProcessedController.php:58
 * @route '/status-forwarded/selectable'
 */
selectable.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: selectable.url(options),
    method: 'head',
})
const ProcessedController = { index, selectable }

export default ProcessedController