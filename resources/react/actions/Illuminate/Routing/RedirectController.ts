import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
const RedirectController76a9b79d958e64fdf30e10f21ad99e47 = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'get',
})

RedirectController76a9b79d958e64fdf30e10f21ad99e47.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/dtis-admin/{path?}',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.url = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    path: args[0],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "path",
        ])

    const parsedArgs = {
                        path: args?.path,
                }

    return RedirectController76a9b79d958e64fdf30e10f21ad99e47.definition.url
            .replace('{path?}', parsedArgs.path?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.get = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.head = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.post = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.put = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.patch = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.delete = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/dtis-admin/{path?}'
 */
RedirectController76a9b79d958e64fdf30e10f21ad99e47.options = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController76a9b79d958e64fdf30e10f21ad99e47.url(args, options),
    method: 'options',
})

    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
const RedirectControllere2d8cd98f1fb0099476de9967e378126 = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'get',
})

RedirectControllere2d8cd98f1fb0099476de9967e378126.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/ddms-admin/{path?}',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.url = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    path: args[0],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "path",
        ])

    const parsedArgs = {
                        path: args?.path,
                }

    return RedirectControllere2d8cd98f1fb0099476de9967e378126.definition.url
            .replace('{path?}', parsedArgs.path?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.get = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.head = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.post = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.put = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.patch = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.delete = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/ddms-admin/{path?}'
 */
RedirectControllere2d8cd98f1fb0099476de9967e378126.options = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllere2d8cd98f1fb0099476de9967e378126.url(args, options),
    method: 'options',
})

    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
const RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'get',
})

RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/my-purchase-requests',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url = (options?: RouteQueryOptions) => {
    return RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-purchase-requests'
 */
RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23.url(options),
    method: 'options',
})

    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
const RedirectControllere2fae844c00a680c646843dc60e2ede4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'get',
})

RedirectControllere2fae844c00a680c646843dc60e2ede4.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/my-payments',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.url = (options?: RouteQueryOptions) => {
    return RedirectControllere2fae844c00a680c646843dc60e2ede4.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/my-payments'
 */
RedirectControllere2fae844c00a680c646843dc60e2ede4.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllere2fae844c00a680c646843dc60e2ede4.url(options),
    method: 'options',
})

    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
const RedirectController9e5da7afa977b7eca46a17a6385fb774 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'get',
})

RedirectController9e5da7afa977b7eca46a17a6385fb774.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/status-endorsed',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.url = (options?: RouteQueryOptions) => {
    return RedirectController9e5da7afa977b7eca46a17a6385fb774.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/status-endorsed'
 */
RedirectController9e5da7afa977b7eca46a17a6385fb774.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController9e5da7afa977b7eca46a17a6385fb774.url(options),
    method: 'options',
})

/**
* Multiple routes resolve to \Illuminate\Routing\RedirectController::RedirectController, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `RedirectController['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
const RedirectController = {
    '/dtis-admin/{path?}': RedirectController76a9b79d958e64fdf30e10f21ad99e47,
    '/ddms-admin/{path?}': RedirectControllere2d8cd98f1fb0099476de9967e378126,
    '/my-purchase-requests': RedirectControllered5ad4acec71ff94e380d3a5ed2ebf23,
    '/my-payments': RedirectControllere2fae844c00a680c646843dc60e2ede4,
    '/status-endorsed': RedirectController9e5da7afa977b7eca46a17a6385fb774,
}

export default RedirectController