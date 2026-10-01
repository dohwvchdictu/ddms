import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DocumentController::create
 * @see app/Http/Controllers/DocumentController.php:18
 * @route '/new-document'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/new-document',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentController::create
 * @see app/Http/Controllers/DocumentController.php:18
 * @route '/new-document'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::create
 * @see app/Http/Controllers/DocumentController.php:18
 * @route '/new-document'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DocumentController::create
 * @see app/Http/Controllers/DocumentController.php:18
 * @route '/new-document'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentController::store
 * @see app/Http/Controllers/DocumentController.php:36
 * @route '/new-document'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/new-document',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentController::store
 * @see app/Http/Controllers/DocumentController.php:36
 * @route '/new-document'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::store
 * @see app/Http/Controllers/DocumentController.php:36
 * @route '/new-document'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::created
 * @see app/Http/Controllers/DocumentController.php:58
 * @route '/new-document/{document}/saved'
 */
export const created = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: created.url(args, options),
    method: 'get',
})

created.definition = {
    methods: ["get","head"],
    url: '/new-document/{document}/saved',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentController::created
 * @see app/Http/Controllers/DocumentController.php:58
 * @route '/new-document/{document}/saved'
 */
created.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { document: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { document: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    document: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        document: typeof args.document === 'object'
                ? args.document.id
                : args.document,
                }

    return created.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::created
 * @see app/Http/Controllers/DocumentController.php:58
 * @route '/new-document/{document}/saved'
 */
created.get = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: created.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DocumentController::created
 * @see app/Http/Controllers/DocumentController.php:58
 * @route '/new-document/{document}/saved'
 */
created.head = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: created.url(args, options),
    method: 'head',
})
const DocumentController = { create, store, created }

export default DocumentController