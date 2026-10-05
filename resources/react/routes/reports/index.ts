import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import turnaroundAcab3a from './turnaround'
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

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::external
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
export const external = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: external.url(options),
    method: 'get',
})

external.definition = {
    methods: ["get","head"],
    url: '/report-status-of-external-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::external
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
external.url = (options?: RouteQueryOptions) => {
    return external.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::external
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
external.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: external.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\ExternalRequestsController::external
 * @see app/Http/Controllers/Reports/ExternalRequestsController.php:33
 * @route '/report-status-of-external-documents'
 */
external.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: external.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
export const perUnit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: perUnit.url(options),
    method: 'get',
})

perUnit.definition = {
    methods: ["get","head"],
    url: '/report-per-unit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
perUnit.url = (options?: RouteQueryOptions) => {
    return perUnit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
perUnit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: perUnit.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
perUnit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: perUnit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Reports\TurnaroundController::turnaround
 * @see app/Http/Controllers/Reports/TurnaroundController.php:20
 * @route '/report-turnaround-time'
 */
export const turnaround = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: turnaround.url(options),
    method: 'get',
})

turnaround.definition = {
    methods: ["get","head"],
    url: '/report-turnaround-time',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\TurnaroundController::turnaround
 * @see app/Http/Controllers/Reports/TurnaroundController.php:20
 * @route '/report-turnaround-time'
 */
turnaround.url = (options?: RouteQueryOptions) => {
    return turnaround.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\TurnaroundController::turnaround
 * @see app/Http/Controllers/Reports/TurnaroundController.php:20
 * @route '/report-turnaround-time'
 */
turnaround.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: turnaround.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\TurnaroundController::turnaround
 * @see app/Http/Controllers/Reports/TurnaroundController.php:20
 * @route '/report-turnaround-time'
 */
turnaround.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: turnaround.url(options),
    method: 'head',
})
const reports = {
    status: Object.assign(status, status),
endorsements: Object.assign(endorsements, endorsements),
external: Object.assign(external, external),
perUnit: Object.assign(perUnit, perUnit),
turnaround: Object.assign(turnaround, turnaroundAcab3a),
}

export default reports