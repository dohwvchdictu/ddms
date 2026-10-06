import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:21
 * @route '/dashboard/documents'
 */
export const documents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})

documents.definition = {
    methods: ["get","head"],
    url: '/dashboard/documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:21
 * @route '/dashboard/documents'
 */
documents.url = (options?: RouteQueryOptions) => {
    return documents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:21
 * @route '/dashboard/documents'
 */
documents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardDocumentsController::__invoke
 * @see app/Http/Controllers/DashboardDocumentsController.php:21
 * @route '/dashboard/documents'
 */
documents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: documents.url(options),
    method: 'head',
})
const dashboard = {
    documents: Object.assign(documents, documents),
}

export default dashboard