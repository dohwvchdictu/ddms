import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Report\DocumentStatus::__invoke
 * @see app/Livewire/Report/DocumentStatus.php:7
 * @route '/report-status-of-documents'
 */
const DocumentStatus = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentStatus.url(options),
    method: 'get',
})

DocumentStatus.definition = {
    methods: ["get","head"],
    url: '/report-status-of-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Report\DocumentStatus::__invoke
 * @see app/Livewire/Report/DocumentStatus.php:7
 * @route '/report-status-of-documents'
 */
DocumentStatus.url = (options?: RouteQueryOptions) => {
    return DocumentStatus.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Report\DocumentStatus::__invoke
 * @see app/Livewire/Report/DocumentStatus.php:7
 * @route '/report-status-of-documents'
 */
DocumentStatus.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocumentStatus.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Report\DocumentStatus::__invoke
 * @see app/Livewire/Report/DocumentStatus.php:7
 * @route '/report-status-of-documents'
 */
DocumentStatus.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocumentStatus.url(options),
    method: 'head',
})
export default DocumentStatus