import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MiscController::printDocumentStatusReport
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
export const printDocumentStatusReport = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: printDocumentStatusReport.url(options),
    method: 'get',
})

printDocumentStatusReport.definition = {
    methods: ["get","head"],
    url: '/print-document-status-report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MiscController::printDocumentStatusReport
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
printDocumentStatusReport.url = (options?: RouteQueryOptions) => {
    return printDocumentStatusReport.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::printDocumentStatusReport
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
printDocumentStatusReport.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: printDocumentStatusReport.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::printDocumentStatusReport
 * @see app/Http/Controllers/MiscController.php:129
 * @route '/print-document-status-report'
 */
printDocumentStatusReport.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: printDocumentStatusReport.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:68
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
 * @see app/Http/Controllers/MiscController.php:68
 * @route '/inbox/generate-logbook'
 */
generateLogbook.url = (options?: RouteQueryOptions) => {
    return generateLogbook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:68
 * @route '/inbox/generate-logbook'
 */
generateLogbook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateLogbook.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:68
 * @route '/inbox/generate-logbook'
 */
generateLogbook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generateLogbook.url(options),
    method: 'head',
})
const MiscController = { printDocumentStatusReport, generateLogbook }

export default MiscController