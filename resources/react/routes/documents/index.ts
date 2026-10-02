import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import attachments from './attachments'
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

/**
* @see \App\Http\Controllers\DocumentViewController::subject
 * @see app/Http/Controllers/DocumentViewController.php:160
 * @route '/documents/{document}/subject'
 */
export const subject = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: subject.url(args, options),
    method: 'patch',
})

subject.definition = {
    methods: ["patch"],
    url: '/documents/{document}/subject',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\DocumentViewController::subject
 * @see app/Http/Controllers/DocumentViewController.php:160
 * @route '/documents/{document}/subject'
 */
subject.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return subject.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::subject
 * @see app/Http/Controllers/DocumentViewController.php:160
 * @route '/documents/{document}/subject'
 */
subject.patch = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: subject.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\DocumentViewController::destroy
 * @see app/Http/Controllers/DocumentViewController.php:175
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
 * @see app/Http/Controllers/DocumentViewController.php:175
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
 * @see app/Http/Controllers/DocumentViewController.php:175
 * @route '/documents/{document}'
 */
destroy.delete = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DocumentViewController::returnMethod
 * @see app/Http/Controllers/DocumentViewController.php:277
 * @route '/documents/{document}/return'
 */
export const returnMethod = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returnMethod.url(args, options),
    method: 'post',
})

returnMethod.definition = {
    methods: ["post"],
    url: '/documents/{document}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentViewController::returnMethod
 * @see app/Http/Controllers/DocumentViewController.php:277
 * @route '/documents/{document}/return'
 */
returnMethod.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return returnMethod.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentViewController::returnMethod
 * @see app/Http/Controllers/DocumentViewController.php:277
 * @route '/documents/{document}/return'
 */
returnMethod.post = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returnMethod.url(args, options),
    method: 'post',
})
const documents = {
    search: Object.assign(search, search),
tracking: Object.assign(tracking, tracking),
create: Object.assign(create, create),
store: Object.assign(store, store),
created: Object.assign(created, created),
subject: Object.assign(subject, subject),
destroy: Object.assign(destroy, destroy),
attachments: Object.assign(attachments, attachments),
return: Object.assign(returnMethod, returnMethod),
}

export default documents