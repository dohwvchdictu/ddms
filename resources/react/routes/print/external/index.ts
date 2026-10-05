import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::documents
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
export const documents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})

documents.definition = {
    methods: ["get","head"],
    url: '/print-external-documents-report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::documents
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
documents.url = (options?: RouteQueryOptions) => {
    return documents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::documents
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
documents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::documents
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:54
 * @route '/print-external-documents-report'
 */
documents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: documents.url(options),
    method: 'head',
})
const external = {
    documents: Object.assign(documents, documents),
}

export default external