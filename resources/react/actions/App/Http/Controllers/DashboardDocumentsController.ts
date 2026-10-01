import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:20
 * @route '/dashboard/documents'
 */
const DashboardDocumentsController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardDocumentsController.url(options),
    method: 'get',
})

DashboardDocumentsController.definition = {
    methods: ["get","head"],
    url: '/dashboard/documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:20
 * @route '/dashboard/documents'
 */
DashboardDocumentsController.url = (options?: RouteQueryOptions) => {
    return DashboardDocumentsController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:20
 * @route '/dashboard/documents'
 */
DashboardDocumentsController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardDocumentsController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:20
 * @route '/dashboard/documents'
 */
DashboardDocumentsController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DashboardDocumentsController.url(options),
    method: 'head',
})
export default DashboardDocumentsController