import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
const DocumentStatusController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentStatusController.url(options),
    method: 'get',
})

DocumentStatusController.definition = {
    methods: ["get","head"],
    url: '/report-status-of-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
DocumentStatusController.url = (options?: RouteQueryOptions) => {
    return DocumentStatusController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
DocumentStatusController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentStatusController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
DocumentStatusController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocumentStatusController.url(options),
    method: 'head',
})
export default DocumentStatusController