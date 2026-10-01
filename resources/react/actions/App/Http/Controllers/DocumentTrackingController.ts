import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
const DocumentTrackingController = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentTrackingController.url(args, options),
    method: 'get',
})

DocumentTrackingController.definition = {
    methods: ["get","head"],
    url: '/documents/{document}/tracking',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
DocumentTrackingController.url = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { document: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    document: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        document: args.document,
                }

    return DocumentTrackingController.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
DocumentTrackingController.get = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentTrackingController.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
DocumentTrackingController.head = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocumentTrackingController.url(args, options),
    method: 'head',
})
export default DocumentTrackingController