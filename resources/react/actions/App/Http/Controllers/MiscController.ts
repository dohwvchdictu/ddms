import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MiscController::printDocumentStatusReport
 * @see app/Http/Controllers/MiscController.php:191
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
 * @see app/Http/Controllers/MiscController.php:191
 * @route '/print-document-status-report'
 */
printDocumentStatusReport.url = (options?: RouteQueryOptions) => {
    return printDocumentStatusReport.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::printDocumentStatusReport
 * @see app/Http/Controllers/MiscController.php:191
 * @route '/print-document-status-report'
 */
printDocumentStatusReport.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: printDocumentStatusReport.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::printDocumentStatusReport
 * @see app/Http/Controllers/MiscController.php:191
 * @route '/print-document-status-report'
 */
printDocumentStatusReport.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: printDocumentStatusReport.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MiscController::printExternalDocumentsReport
 * @see app/Http/Controllers/MiscController.php:394
 * @route '/print-external-documents-report'
 */
export const printExternalDocumentsReport = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: printExternalDocumentsReport.url(options),
    method: 'get',
})

printExternalDocumentsReport.definition = {
    methods: ["get","head"],
    url: '/print-external-documents-report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MiscController::printExternalDocumentsReport
 * @see app/Http/Controllers/MiscController.php:394
 * @route '/print-external-documents-report'
 */
printExternalDocumentsReport.url = (options?: RouteQueryOptions) => {
    return printExternalDocumentsReport.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::printExternalDocumentsReport
 * @see app/Http/Controllers/MiscController.php:394
 * @route '/print-external-documents-report'
 */
printExternalDocumentsReport.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: printExternalDocumentsReport.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::printExternalDocumentsReport
 * @see app/Http/Controllers/MiscController.php:394
 * @route '/print-external-documents-report'
 */
printExternalDocumentsReport.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: printExternalDocumentsReport.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MiscController::printTransmittalForm
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
export const printTransmittalForm = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: printTransmittalForm.url(args, options),
    method: 'get',
})

printTransmittalForm.definition = {
    methods: ["get","head"],
    url: '/print-transmittal-form/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MiscController::printTransmittalForm
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
printTransmittalForm.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return printTransmittalForm.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::printTransmittalForm
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
printTransmittalForm.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: printTransmittalForm.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::printTransmittalForm
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
printTransmittalForm.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: printTransmittalForm.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:139
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
 * @see app/Http/Controllers/MiscController.php:139
 * @route '/inbox/generate-logbook'
 */
generateLogbook.url = (options?: RouteQueryOptions) => {
    return generateLogbook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:139
 * @route '/inbox/generate-logbook'
 */
generateLogbook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateLogbook.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::generateLogbook
 * @see app/Http/Controllers/MiscController.php:139
 * @route '/inbox/generate-logbook'
 */
generateLogbook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generateLogbook.url(options),
    method: 'head',
})
const MiscController = { printDocumentStatusReport, printExternalDocumentsReport, printTransmittalForm, generateLogbook }

export default MiscController