import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TransmittalFormController::__invoke
 * @see app/Http/Controllers/TransmittalFormController.php:22
 * @route '/print-transmittal-form/{control_no}'
 */
const TransmittalFormController = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TransmittalFormController.url(args, options),
    method: 'get',
})

TransmittalFormController.definition = {
    methods: ["get","head"],
    url: '/print-transmittal-form/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TransmittalFormController::__invoke
 * @see app/Http/Controllers/TransmittalFormController.php:22
 * @route '/print-transmittal-form/{control_no}'
 */
TransmittalFormController.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return TransmittalFormController.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransmittalFormController::__invoke
 * @see app/Http/Controllers/TransmittalFormController.php:22
 * @route '/print-transmittal-form/{control_no}'
 */
TransmittalFormController.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TransmittalFormController.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TransmittalFormController::__invoke
 * @see app/Http/Controllers/TransmittalFormController.php:22
 * @route '/print-transmittal-form/{control_no}'
 */
TransmittalFormController.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: TransmittalFormController.url(args, options),
    method: 'head',
})
export default TransmittalFormController