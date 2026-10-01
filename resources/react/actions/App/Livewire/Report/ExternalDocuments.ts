import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Report\ExternalDocuments::__invoke
 * @see app/Livewire/Report/ExternalDocuments.php:7
 * @route '/report-status-of-external-documents'
 */
const ExternalDocuments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ExternalDocuments.url(options),
    method: 'get',
})

ExternalDocuments.definition = {
    methods: ["get","head"],
    url: '/report-status-of-external-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Report\ExternalDocuments::__invoke
 * @see app/Livewire/Report/ExternalDocuments.php:7
 * @route '/report-status-of-external-documents'
 */
ExternalDocuments.url = (options?: RouteQueryOptions) => {
    return ExternalDocuments.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Report\ExternalDocuments::__invoke
 * @see app/Livewire/Report/ExternalDocuments.php:7
 * @route '/report-status-of-external-documents'
 */
ExternalDocuments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ExternalDocuments.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Report\ExternalDocuments::__invoke
 * @see app/Livewire/Report/ExternalDocuments.php:7
 * @route '/report-status-of-external-documents'
 */
ExternalDocuments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ExternalDocuments.url(options),
    method: 'head',
})
export default ExternalDocuments