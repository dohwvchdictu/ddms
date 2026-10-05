import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::index
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/report-status-of-external-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::index
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::index
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::index
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::print
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
export const print = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: print.url(options),
    method: 'get',
})

print.definition = {
    methods: ["get","head"],
    url: '/print-external-documents-report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::print
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
print.url = (options?: RouteQueryOptions) => {
    return print.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::print
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
print.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: print.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::print
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
print.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: print.url(options),
    method: 'head',
})
const ExternalRequestsController = { index, print }

export default ExternalRequestsController