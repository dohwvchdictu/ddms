import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MyDocumentsController::selectable
 * @see app/Http/Controllers/MyDocumentsController.php:71
 * @route '/my-documents/selectable'
 */
export const selectable = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})

selectable.definition = {
    methods: ["get","head"],
    url: '/my-documents/selectable',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MyDocumentsController::selectable
 * @see app/Http/Controllers/MyDocumentsController.php:71
 * @route '/my-documents/selectable'
 */
selectable.url = (options?: RouteQueryOptions) => {
    return selectable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MyDocumentsController::selectable
 * @see app/Http/Controllers/MyDocumentsController.php:71
 * @route '/my-documents/selectable'
 */
selectable.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MyDocumentsController::selectable
 * @see app/Http/Controllers/MyDocumentsController.php:71
 * @route '/my-documents/selectable'
 */
selectable.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: selectable.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MyDocumentsController::forward
 * @see app/Http/Controllers/MyDocumentsController.php:86
 * @route '/my-documents/forward'
 */
export const forward = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forward.url(options),
    method: 'post',
})

forward.definition = {
    methods: ["post"],
    url: '/my-documents/forward',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MyDocumentsController::forward
 * @see app/Http/Controllers/MyDocumentsController.php:86
 * @route '/my-documents/forward'
 */
forward.url = (options?: RouteQueryOptions) => {
    return forward.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MyDocumentsController::forward
 * @see app/Http/Controllers/MyDocumentsController.php:86
 * @route '/my-documents/forward'
 */
forward.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forward.url(options),
    method: 'post',
})
const myDocuments = {
    selectable: Object.assign(selectable, selectable),
forward: Object.assign(forward, forward),
}

export default myDocuments