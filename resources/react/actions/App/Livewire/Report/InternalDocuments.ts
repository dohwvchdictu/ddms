import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Report\InternalDocuments::__invoke
 * @see app/Livewire/Report/InternalDocuments.php:7
 * @route '/report-status-of-internal-documents'
 */
const InternalDocuments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: InternalDocuments.url(options),
    method: 'get',
})

InternalDocuments.definition = {
    methods: ["get","head"],
    url: '/report-status-of-internal-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Report\InternalDocuments::__invoke
 * @see app/Livewire/Report/InternalDocuments.php:7
 * @route '/report-status-of-internal-documents'
 */
InternalDocuments.url = (options?: RouteQueryOptions) => {
    return InternalDocuments.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Report\InternalDocuments::__invoke
 * @see app/Livewire/Report/InternalDocuments.php:7
 * @route '/report-status-of-internal-documents'
 */
InternalDocuments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: InternalDocuments.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Report\InternalDocuments::__invoke
 * @see app/Livewire/Report/InternalDocuments.php:7
 * @route '/report-status-of-internal-documents'
 */
InternalDocuments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: InternalDocuments.url(options),
    method: 'head',
})
export default InternalDocuments