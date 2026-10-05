import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ActionController::index
 * @see app/Http/Controllers/Admin/ActionController.php:30
 * @route '/admin/actions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/actions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActionController::index
 * @see app/Http/Controllers/Admin/ActionController.php:30
 * @route '/admin/actions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActionController::index
 * @see app/Http/Controllers/Admin/ActionController.php:30
 * @route '/admin/actions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ActionController::index
 * @see app/Http/Controllers/Admin/ActionController.php:30
 * @route '/admin/actions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ActionController::store
 * @see app/Http/Controllers/Admin/ActionController.php:37
 * @route '/admin/actions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/actions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ActionController::store
 * @see app/Http/Controllers/Admin/ActionController.php:37
 * @route '/admin/actions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActionController::store
 * @see app/Http/Controllers/Admin/ActionController.php:37
 * @route '/admin/actions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})
const actions = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
}

export default actions