import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Report\Employees::__invoke
 * @see app/Livewire/Report/Employees.php:7
 * @route '/report-status-per-employee'
 */
const Employees = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Employees.url(options),
    method: 'get',
})

Employees.definition = {
    methods: ["get","head"],
    url: '/report-status-per-employee',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Report\Employees::__invoke
 * @see app/Livewire/Report/Employees.php:7
 * @route '/report-status-per-employee'
 */
Employees.url = (options?: RouteQueryOptions) => {
    return Employees.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Report\Employees::__invoke
 * @see app/Livewire/Report/Employees.php:7
 * @route '/report-status-per-employee'
 */
Employees.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Employees.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Report\Employees::__invoke
 * @see app/Livewire/Report/Employees.php:7
 * @route '/report-status-per-employee'
 */
Employees.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Employees.url(options),
    method: 'head',
})
export default Employees