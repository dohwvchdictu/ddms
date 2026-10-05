import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
const EndorsementsController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EndorsementsController.url(options),
    method: 'get',
})

EndorsementsController.definition = {
    methods: ["get","head"],
    url: '/report-status-per-employee',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
EndorsementsController.url = (options?: RouteQueryOptions) => {
    return EndorsementsController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
EndorsementsController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EndorsementsController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\EndorsementsController::__invoke
 * @see app/Http/Controllers/Reports/EndorsementsController.php:19
 * @route '/report-status-per-employee'
 */
EndorsementsController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: EndorsementsController.url(options),
    method: 'head',
})
export default EndorsementsController