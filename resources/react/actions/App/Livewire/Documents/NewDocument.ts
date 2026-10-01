import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Documents\NewDocument::__invoke
 * @see app/Livewire/Documents/NewDocument.php:7
 * @route '/new-document'
 */
const NewDocument = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: NewDocument.url(options),
    method: 'get',
})

NewDocument.definition = {
    methods: ["get","head"],
    url: '/new-document',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Documents\NewDocument::__invoke
 * @see app/Livewire/Documents/NewDocument.php:7
 * @route '/new-document'
 */
NewDocument.url = (options?: RouteQueryOptions) => {
    return NewDocument.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Documents\NewDocument::__invoke
 * @see app/Livewire/Documents/NewDocument.php:7
 * @route '/new-document'
 */
NewDocument.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: NewDocument.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Documents\NewDocument::__invoke
 * @see app/Livewire/Documents/NewDocument.php:7
 * @route '/new-document'
 */
NewDocument.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: NewDocument.url(options),
    method: 'head',
})
export default NewDocument