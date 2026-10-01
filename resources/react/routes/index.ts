import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../wayfinder'
/**
* @see \App\Http\Controllers\Auth\LoginController::login
 * @see app/Http/Controllers/Auth/LoginController.php:14
 * @route '/'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\LoginController::login
 * @see app/Http/Controllers/Auth/LoginController.php:14
 * @route '/'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\LoginController::login
 * @see app/Http/Controllers/Auth/LoginController.php:14
 * @route '/'
 */
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\LoginController::login
 * @see app/Http/Controllers/Auth/LoginController.php:14
 * @route '/'
 */
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:15
 * @route '/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:15
 * @route '/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:15
 * @route '/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:15
 * @route '/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
export const routingLogbook = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: routingLogbook.url(options),
    method: 'get',
})

routingLogbook.definition = {
    methods: ["get","head"],
    url: '/routing-logbook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
routingLogbook.url = (options?: RouteQueryOptions) => {
    return routingLogbook.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
routingLogbook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: routingLogbook.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\RoutingLogbook::__invoke
 * @see app/Livewire/Views/RoutingLogbook.php:7
 * @route '/routing-logbook'
 */
routingLogbook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: routingLogbook.url(options),
    method: 'head',
})

/**
 * @see routes/web.php:108
 * @route '/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
 * @see routes/web.php:108
 * @route '/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:108
 * @route '/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})