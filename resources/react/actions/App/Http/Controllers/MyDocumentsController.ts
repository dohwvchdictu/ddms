import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MyDocumentsController::__invoke
 * @see app/Http/Controllers/MyDocumentsController.php:31
 * @route '/my-documents'
 */
const MyDocumentsController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyDocumentsController.url(options),
    method: 'get',
})

MyDocumentsController.definition = {
    methods: ["get","head"],
    url: '/my-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MyDocumentsController::__invoke
 * @see app/Http/Controllers/MyDocumentsController.php:31
 * @route '/my-documents'
 */
MyDocumentsController.url = (options?: RouteQueryOptions) => {
    return MyDocumentsController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MyDocumentsController::__invoke
 * @see app/Http/Controllers/MyDocumentsController.php:31
 * @route '/my-documents'
 */
MyDocumentsController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyDocumentsController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MyDocumentsController::__invoke
 * @see app/Http/Controllers/MyDocumentsController.php:31
 * @route '/my-documents'
 */
MyDocumentsController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MyDocumentsController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MyDocumentsController::selectable
 * @see app/Http/Controllers/MyDocumentsController.php:67
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
 * @see app/Http/Controllers/MyDocumentsController.php:67
 * @route '/my-documents/selectable'
 */
selectable.url = (options?: RouteQueryOptions) => {
    return selectable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MyDocumentsController::selectable
 * @see app/Http/Controllers/MyDocumentsController.php:67
 * @route '/my-documents/selectable'
 */
selectable.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: selectable.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MyDocumentsController::selectable
 * @see app/Http/Controllers/MyDocumentsController.php:67
 * @route '/my-documents/selectable'
 */
selectable.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: selectable.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MyDocumentsController::forward
 * @see app/Http/Controllers/MyDocumentsController.php:82
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
 * @see app/Http/Controllers/MyDocumentsController.php:82
 * @route '/my-documents/forward'
 */
forward.url = (options?: RouteQueryOptions) => {
    return forward.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MyDocumentsController::forward
 * @see app/Http/Controllers/MyDocumentsController.php:82
 * @route '/my-documents/forward'
 */
forward.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forward.url(options),
    method: 'post',
})
MyDocumentsController.selectable = selectable
MyDocumentsController.forward = forward

export default MyDocumentsController