import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/documents/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DocumentSearchController::__invoke
 * @see app/Http/Controllers/DocumentSearchController.php:20
 * @route '/documents/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
export const tracking = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tracking.url(args, options),
    method: 'get',
})

tracking.definition = {
    methods: ["get","head"],
    url: '/documents/{document}/tracking',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
tracking.url = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return tracking.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
tracking.get = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tracking.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DocumentTrackingController::__invoke
 * @see app/Http/Controllers/DocumentTrackingController.php:11
 * @route '/documents/{document}/tracking'
 */
tracking.head = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tracking.url(args, options),
    method: 'head',
})
const documents = {
    search: Object.assign(search, search),
tracking: Object.assign(tracking, tracking),
}

export default documents