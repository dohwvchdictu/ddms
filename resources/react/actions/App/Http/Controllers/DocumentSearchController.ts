import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
const DocumentSearchController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentSearchController.url(options),
    method: 'get',
})

DocumentSearchController.definition = {
    methods: ["get","head"],
    url: '/documents/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
DocumentSearchController.url = (options?: RouteQueryOptions) => {
    return DocumentSearchController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
DocumentSearchController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentSearchController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
DocumentSearchController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocumentSearchController.url(options),
    method: 'head',
})
export default DocumentSearchController