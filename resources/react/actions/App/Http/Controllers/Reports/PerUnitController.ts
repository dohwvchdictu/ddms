import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
const PerUnitController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PerUnitController.url(options),
    method: 'get',
})

PerUnitController.definition = {
    methods: ["get","head"],
    url: '/report-per-unit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
PerUnitController.url = (options?: RouteQueryOptions) => {
    return PerUnitController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
PerUnitController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PerUnitController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\PerUnitController::__invoke
 * @see app/Http/Controllers/Reports/PerUnitController.php:18
 * @route '/report-per-unit'
 */
PerUnitController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: PerUnitController.url(options),
    method: 'head',
})
export default PerUnitController