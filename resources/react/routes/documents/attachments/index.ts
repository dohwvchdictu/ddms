import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DocumentViewController::store
 * @see app/Http/Controllers/DocumentViewController.php:171
 * @route '/documents/{document}/attachments'
 */
export const store = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/documents/{document}/attachments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentViewController::store
 * @see app/Http/Controllers/DocumentViewController.php:171
 * @route '/documents/{document}/attachments'
 */
store.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::store
 * @see app/Http/Controllers/DocumentViewController.php:171
 * @route '/documents/{document}/attachments'
 */
store.post = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentViewController::destroy
 * @see app/Http/Controllers/DocumentViewController.php:222
 * @route '/documents/{document}/attachments/{attachment}'
 */
export const destroy = (args: { document: number | { id: number }, attachment: number | { id: number } } | [document: number | { id: number }, attachment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/documents/{document}/attachments/{attachment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DocumentViewController::destroy
 * @see app/Http/Controllers/DocumentViewController.php:222
 * @route '/documents/{document}/attachments/{attachment}'
 */
destroy.url = (args: { document: number | { id: number }, attachment: number | { id: number } } | [document: number | { id: number }, attachment: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    document: args[0],
                    attachment: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        document: typeof args.document === 'object'
                ? args.document.id
                : args.document,
                                attachment: typeof args.attachment === 'object'
                ? args.attachment.id
                : args.attachment,
                }

    return destroy.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace('{attachment}', parsedArgs.attachment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::destroy
 * @see app/Http/Controllers/DocumentViewController.php:222
 * @route '/documents/{document}/attachments/{attachment}'
 */
destroy.delete = (args: { document: number | { id: number }, attachment: number | { id: number } } | [document: number | { id: number }, attachment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const attachments = {
    store: Object.assign(store, store),
destroy: Object.assign(destroy, destroy),
}

export default attachments