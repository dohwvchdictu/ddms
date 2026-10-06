import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Reports\TurnaroundController::office
 * @see app/Http/Controllers/Reports/TurnaroundController.php:45
 * @route '/report-turnaround-time/offices/{office}'
 */
export const office = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: office.url(args, options),
    method: 'get',
})

office.definition = {
    methods: ["get","head"],
    url: '/report-turnaround-time/offices/{office}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Reports\TurnaroundController::office
 * @see app/Http/Controllers/Reports/TurnaroundController.php:45
 * @route '/report-turnaround-time/offices/{office}'
 */
office.url = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return office.definition.url
            .replace('{office}', parsedArgs.office.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Reports\TurnaroundController::office
 * @see app/Http/Controllers/Reports/TurnaroundController.php:45
 * @route '/report-turnaround-time/offices/{office}'
 */
office.get = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: office.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Reports\TurnaroundController::office
 * @see app/Http/Controllers/Reports/TurnaroundController.php:45
 * @route '/report-turnaround-time/offices/{office}'
 */
office.head = (args: { office: string | number } | [office: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: office.url(args, options),
    method: 'head',
})
const turnaround = {
    office: Object.assign(office, office),
}

export default turnaround