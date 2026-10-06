import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::index
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:33
 * @route '/admin/citizen-charters'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/citizen-charters',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::index
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:33
 * @route '/admin/citizen-charters'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::index
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:33
 * @route '/admin/citizen-charters'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::index
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:33
 * @route '/admin/citizen-charters'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::store
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:76
 * @route '/admin/citizen-charters'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/citizen-charters',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::store
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:76
 * @route '/admin/citizen-charters'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::store
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:76
 * @route '/admin/citizen-charters'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::update
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:83
 * @route '/admin/citizen-charters/{citizenCharter}'
 */
export const update = (args: { citizenCharter: number | { id: number } } | [citizenCharter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/citizen-charters/{citizenCharter}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::update
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:83
 * @route '/admin/citizen-charters/{citizenCharter}'
 */
update.url = (args: { citizenCharter: number | { id: number } } | [citizenCharter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { citizenCharter: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { citizenCharter: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    citizenCharter: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        citizenCharter: typeof args.citizenCharter === 'object'
                ? args.citizenCharter.id
                : args.citizenCharter,
                }

    return update.definition.url
            .replace('{citizenCharter}', parsedArgs.citizenCharter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CitizenCharterController::update
 * @see app/Http/Controllers/Admin/CitizenCharterController.php:83
 * @route '/admin/citizen-charters/{citizenCharter}'
 */
update.patch = (args: { citizenCharter: number | { id: number } } | [citizenCharter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})
const CitizenCharterController = { index, store, update }

export default CitizenCharterController