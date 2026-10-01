import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
export const employees = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(args, options),
    method: 'get',
})

employees.definition = {
    methods: ["get","head"],
    url: '/offices/{office}/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
employees.url = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { office: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    office: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        office: args.office,
                }

    return employees.definition.url
            .replace('{office}', parsedArgs.office.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
employees.get = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
employees.head = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employees.url(args, options),
    method: 'head',
})
const offices = {
    employees: Object.assign(employees, employees),
}

export default offices