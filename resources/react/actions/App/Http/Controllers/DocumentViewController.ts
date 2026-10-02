import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DocumentViewController::show
 * @see app/Http/Controllers/DocumentViewController.php:30
 * @route '/document/view/{control_no}'
 */
export const show = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/document/view/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentViewController::show
 * @see app/Http/Controllers/DocumentViewController.php:30
 * @route '/document/view/{control_no}'
 */
show.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { control_no: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    control_no: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        control_no: args.control_no,
                }

    return show.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::show
 * @see app/Http/Controllers/DocumentViewController.php:30
 * @route '/document/view/{control_no}'
 */
show.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DocumentViewController::show
 * @see app/Http/Controllers/DocumentViewController.php:30
 * @route '/document/view/{control_no}'
 */
show.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentViewController::updateSubject
 * @see app/Http/Controllers/DocumentViewController.php:119
 * @route '/documents/{document}/subject'
 */
export const updateSubject = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateSubject.url(args, options),
    method: 'patch',
})

updateSubject.definition = {
    methods: ["patch"],
    url: '/documents/{document}/subject',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\DocumentViewController::updateSubject
 * @see app/Http/Controllers/DocumentViewController.php:119
 * @route '/documents/{document}/subject'
 */
updateSubject.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateSubject.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::updateSubject
 * @see app/Http/Controllers/DocumentViewController.php:119
 * @route '/documents/{document}/subject'
 */
updateSubject.patch = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateSubject.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\DocumentViewController::destroy
 * @see app/Http/Controllers/DocumentViewController.php:134
 * @route '/documents/{document}'
 */
export const destroy = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/documents/{document}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DocumentViewController::destroy
 * @see app/Http/Controllers/DocumentViewController.php:134
 * @route '/documents/{document}'
 */
destroy.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::destroy
 * @see app/Http/Controllers/DocumentViewController.php:134
 * @route '/documents/{document}'
 */
destroy.delete = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DocumentViewController::attach
 * @see app/Http/Controllers/DocumentViewController.php:154
 * @route '/documents/{document}/attachments'
 */
export const attach = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

attach.definition = {
    methods: ["post"],
    url: '/documents/{document}/attachments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentViewController::attach
 * @see app/Http/Controllers/DocumentViewController.php:154
 * @route '/documents/{document}/attachments'
 */
attach.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return attach.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::attach
 * @see app/Http/Controllers/DocumentViewController.php:154
 * @route '/documents/{document}/attachments'
 */
attach.post = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentViewController::detach
 * @see app/Http/Controllers/DocumentViewController.php:205
 * @route '/documents/{document}/attachments/{attachment}'
 */
export const detach = (args: { document: number | { id: number }, attachment: number | { id: number } } | [document: number | { id: number }, attachment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: detach.url(args, options),
    method: 'delete',
})

detach.definition = {
    methods: ["delete"],
    url: '/documents/{document}/attachments/{attachment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DocumentViewController::detach
 * @see app/Http/Controllers/DocumentViewController.php:205
 * @route '/documents/{document}/attachments/{attachment}'
 */
detach.url = (args: { document: number | { id: number }, attachment: number | { id: number } } | [document: number | { id: number }, attachment: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return detach.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace('{attachment}', parsedArgs.attachment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::detach
 * @see app/Http/Controllers/DocumentViewController.php:205
 * @route '/documents/{document}/attachments/{attachment}'
 */
detach.delete = (args: { document: number | { id: number }, attachment: number | { id: number } } | [document: number | { id: number }, attachment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: detach.url(args, options),
    method: 'delete',
})
const DocumentViewController = { show, updateSubject, destroy, attach, detach }

export default DocumentViewController