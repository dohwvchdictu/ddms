import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MiscController::status
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/print-document-status-report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MiscController::status
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::status
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::status
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})
const document = {
    status: Object.assign(status, status),
}

export default document