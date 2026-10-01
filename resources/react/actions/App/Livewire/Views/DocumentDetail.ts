import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
const DocumentDetail = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentDetail.url(args, options),
    method: 'get',
})

DocumentDetail.definition = {
    methods: ["get","head"],
    url: '/document/view/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
DocumentDetail.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return DocumentDetail.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
DocumentDetail.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentDetail.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
DocumentDetail.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocumentDetail.url(args, options),
    method: 'head',
})
export default DocumentDetail