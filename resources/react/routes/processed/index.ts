import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ProcessedController::selectable
 * @see app/Http/Controllers/ProcessedController.php:61
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
 * @see app/Http/Controllers/ProcessedController.php:61
 * @route '/status-forwarded/selectable'
 */
selectable.url = (options?: RouteQueryOptions) => {
    return selectable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProcessedController::selectable
 * @see app/Http/Controllers/ProcessedController.php:61
 * @route '/status-forwarded/selectable'
 */
selectable.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProcessedController::selectable
 * @see app/Http/Controllers/ProcessedController.php:61
 * @route '/status-forwarded/selectable'
 */
selectable.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: selectable.url(options),
    method: 'head',
})
const processed = {
    selectable: Object.assign(selectable, selectable),
}

export default processed