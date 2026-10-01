import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MiscController::form
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
export const form = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(args, options),
    method: 'get',
})

form.definition = {
    methods: ["get","head"],
    url: '/print-transmittal-form/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MiscController::form
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
form.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return form.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MiscController::form
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
form.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MiscController::form
 * @see app/Http/Controllers/MiscController.php:93
 * @route '/print-transmittal-form/{control_no}'
 */
form.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: form.url(args, options),
    method: 'head',
})
const transmittal = {
    form: Object.assign(form, form),
}

export default transmittal