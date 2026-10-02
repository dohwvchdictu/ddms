import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:91
 * @route '/inbox/generate-logbook'
 */
export const generateLogbook = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateLogbook.url(options),
    method: 'get',
})

generateLogbook.definition = {
    methods: ["get","head"],
    url: '/inbox/generate-logbook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:91
 * @route '/inbox/generate-logbook'
 */
generateLogbook.url = (options?: RouteQueryOptions) => {
    return generateLogbook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:91
 * @route '/inbox/generate-logbook'
 */
generateLogbook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateLogbook.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:91
 * @route '/inbox/generate-logbook'
 */
generateLogbook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generateLogbook.url(options),
    method: 'head',
})
const inbox = {
    generateLogbook: Object.assign(generateLogbook, generateLogbook),
}

export default inbox