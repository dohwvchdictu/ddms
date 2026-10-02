import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PendingController::selectable
 * @see app/Http/Controllers/PendingController.php:76
 * @route '/status-pending/selectable'
 */
export const selectable = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})

selectable.definition = {
    methods: ["get","head"],
    url: '/status-pending/selectable',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PendingController::selectable
 * @see app/Http/Controllers/PendingController.php:76
 * @route '/status-pending/selectable'
 */
selectable.url = (options?: RouteQueryOptions) => {
    return selectable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PendingController::selectable
 * @see app/Http/Controllers/PendingController.php:76
 * @route '/status-pending/selectable'
 */
selectable.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PendingController::selectable
 * @see app/Http/Controllers/PendingController.php:76
 * @route '/status-pending/selectable'
 */
selectable.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: selectable.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PendingController::forward
 * @see app/Http/Controllers/PendingController.php:92
 * @route '/status-pending/forward'
 */
export const forward = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forward.url(options),
    method: 'post',
})

forward.definition = {
    methods: ["post"],
    url: '/status-pending/forward',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PendingController::forward
 * @see app/Http/Controllers/PendingController.php:92
 * @route '/status-pending/forward'
 */
forward.url = (options?: RouteQueryOptions) => {
    return forward.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PendingController::forward
 * @see app/Http/Controllers/PendingController.php:92
 * @route '/status-pending/forward'
 */
forward.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forward.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PendingController::endorse
 * @see app/Http/Controllers/PendingController.php:109
 * @route '/status-pending/endorse'
 */
export const endorse = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: endorse.url(options),
    method: 'post',
})

endorse.definition = {
    methods: ["post"],
    url: '/status-pending/endorse',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PendingController::endorse
 * @see app/Http/Controllers/PendingController.php:109
 * @route '/status-pending/endorse'
 */
endorse.url = (options?: RouteQueryOptions) => {
    return endorse.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PendingController::endorse
 * @see app/Http/Controllers/PendingController.php:109
 * @route '/status-pending/endorse'
 */
endorse.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: endorse.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PendingController::closeCode
 * @see app/Http/Controllers/PendingController.php:143
 * @route '/status-pending/close-code'
 */
export const closeCode = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: closeCode.url(options),
    method: 'get',
})

closeCode.definition = {
    methods: ["get","head"],
    url: '/status-pending/close-code',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PendingController::closeCode
 * @see app/Http/Controllers/PendingController.php:143
 * @route '/status-pending/close-code'
 */
closeCode.url = (options?: RouteQueryOptions) => {
    return closeCode.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PendingController::closeCode
 * @see app/Http/Controllers/PendingController.php:143
 * @route '/status-pending/close-code'
 */
closeCode.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: closeCode.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PendingController::closeCode
 * @see app/Http/Controllers/PendingController.php:143
 * @route '/status-pending/close-code'
 */
closeCode.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: closeCode.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PendingController::close
 * @see app/Http/Controllers/PendingController.php:157
 * @route '/status-pending/close'
 */
export const close = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(options),
    method: 'post',
})

close.definition = {
    methods: ["post"],
    url: '/status-pending/close',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PendingController::close
 * @see app/Http/Controllers/PendingController.php:157
 * @route '/status-pending/close'
 */
close.url = (options?: RouteQueryOptions) => {
    return close.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PendingController::close
 * @see app/Http/Controllers/PendingController.php:157
 * @route '/status-pending/close'
 */
close.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(options),
    method: 'post',
})
const pending = {
    selectable: Object.assign(selectable, selectable),
forward: Object.assign(forward, forward),
endorse: Object.assign(endorse, endorse),
closeCode: Object.assign(closeCode, closeCode),
close: Object.assign(close, close),
}

export default pending