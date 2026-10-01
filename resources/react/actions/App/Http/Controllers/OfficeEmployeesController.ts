import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
const OfficeEmployeesController = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: OfficeEmployeesController.url(args, options),
    method: 'get',
})

OfficeEmployeesController.definition = {
    methods: ["get","head"],
    url: '/offices/{office}/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
OfficeEmployeesController.url = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return OfficeEmployeesController.definition.url
            .replace('{office}', parsedArgs.office.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
OfficeEmployeesController.get = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: OfficeEmployeesController.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OfficeEmployeesController::__invoke
 * @see app/Http/Controllers/OfficeEmployeesController.php:14
 * @route '/offices/{office}/employees'
 */
OfficeEmployeesController.head = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: OfficeEmployeesController.url(args, options),
    method: 'head',
})
export default OfficeEmployeesController