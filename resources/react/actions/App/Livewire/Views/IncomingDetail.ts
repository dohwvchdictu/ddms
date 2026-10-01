import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
const IncomingDetail = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: IncomingDetail.url(args, options),
    method: 'get',
})

IncomingDetail.definition = {
    methods: ["get","head"],
    url: '/document/incoming/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
IncomingDetail.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return IncomingDetail.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
IncomingDetail.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: IncomingDetail.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
IncomingDetail.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: IncomingDetail.url(args, options),
    method: 'head',
})
export default IncomingDetail