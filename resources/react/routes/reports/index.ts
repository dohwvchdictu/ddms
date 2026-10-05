import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/report-status-of-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\DocumentStatusController::__invoke
 * @see app/Http/Controllers/Reports/DocumentStatusController.php:19
 * @route '/report-status-of-documents'
 */
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
export const endorsements = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: endorsements.url(options),
    method: 'get',
})

endorsements.definition = {
    methods: ["get","head"],
    url: '/report-status-per-employee',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
endorsements.url = (options?: RouteQueryOptions) => {
    return endorsements.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
endorsements.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: endorsements.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
endorsements.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: endorsements.url(options),
    method: 'head',
})
const reports = {
    status: Object.assign(status, status),
endorsements: Object.assign(endorsements, endorsements),
}

export default reports