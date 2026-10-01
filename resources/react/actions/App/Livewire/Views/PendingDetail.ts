import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
const PendingDetail = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PendingDetail.url(args, options),
    method: 'get',
})

PendingDetail.definition = {
    methods: ["get","head"],
    url: '/document/pending/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
PendingDetail.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return PendingDetail.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
PendingDetail.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PendingDetail.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
PendingDetail.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: PendingDetail.url(args, options),
    method: 'head',
})
export default PendingDetail