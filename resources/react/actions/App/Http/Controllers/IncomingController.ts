import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\IncomingController::index
 * @see app/Http/Controllers/IncomingController.php:32
 * @route '/status-incoming'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/status-incoming',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\IncomingController::index
 * @see app/Http/Controllers/IncomingController.php:32
 * @route '/status-incoming'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\IncomingController::index
 * @see app/Http/Controllers/IncomingController.php:32
 * @route '/status-incoming'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\IncomingController::index
 * @see app/Http/Controllers/IncomingController.php:32
 * @route '/status-incoming'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\IncomingController::selectable
 * @see app/Http/Controllers/IncomingController.php:59
 * @route '/status-incoming/selectable'
 */
export const selectable = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})

selectable.definition = {
    methods: ["get","head"],
    url: '/status-incoming/selectable',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\IncomingController::selectable
 * @see app/Http/Controllers/IncomingController.php:59
 * @route '/status-incoming/selectable'
 */
selectable.url = (options?: RouteQueryOptions) => {
    return selectable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\IncomingController::selectable
 * @see app/Http/Controllers/IncomingController.php:59
 * @route '/status-incoming/selectable'
 */
selectable.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\IncomingController::selectable
 * @see app/Http/Controllers/IncomingController.php:59
 * @route '/status-incoming/selectable'
 */
selectable.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: selectable.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\IncomingController::receive
 * @see app/Http/Controllers/IncomingController.php:75
 * @route '/status-incoming/receive'
 */
export const receive = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receive.url(options),
    method: 'post',
})

receive.definition = {
    methods: ["post"],
    url: '/status-incoming/receive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\IncomingController::receive
 * @see app/Http/Controllers/IncomingController.php:75
 * @route '/status-incoming/receive'
 */
receive.url = (options?: RouteQueryOptions) => {
    return receive.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\IncomingController::receive
 * @see app/Http/Controllers/IncomingController.php:75
 * @route '/status-incoming/receive'
 */
receive.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receive.url(options),
    method: 'post',
})
const IncomingController = { index, selectable, receive }

export default IncomingController