import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Inbox\MyDocuments::__invoke
 * @see app/Livewire/Inbox/MyDocuments.php:7
 * @route '/my-documents'
 */
const MyDocuments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyDocuments.url(options),
    method: 'get',
})

MyDocuments.definition = {
    methods: ["get","head"],
    url: '/my-documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Inbox\MyDocuments::__invoke
 * @see app/Livewire/Inbox/MyDocuments.php:7
 * @route '/my-documents'
 */
MyDocuments.url = (options?: RouteQueryOptions) => {
    return MyDocuments.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Inbox\MyDocuments::__invoke
 * @see app/Livewire/Inbox/MyDocuments.php:7
 * @route '/my-documents'
 */
MyDocuments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyDocuments.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Inbox\MyDocuments::__invoke
 * @see app/Livewire/Inbox/MyDocuments.php:7
 * @route '/my-documents'
 */
MyDocuments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MyDocuments.url(options),
    method: 'head',
})
export default MyDocuments