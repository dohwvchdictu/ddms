import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Inbox\MyBundles::__invoke
 * @see app/Livewire/Inbox/MyBundles.php:7
 * @route '/my-bundles'
 */
const MyBundles = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyBundles.url(options),
    method: 'get',
})

MyBundles.definition = {
    methods: ["get","head"],
    url: '/my-bundles',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Inbox\MyBundles::__invoke
 * @see app/Livewire/Inbox/MyBundles.php:7
 * @route '/my-bundles'
 */
MyBundles.url = (options?: RouteQueryOptions) => {
    return MyBundles.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Inbox\MyBundles::__invoke
 * @see app/Livewire/Inbox/MyBundles.php:7
 * @route '/my-bundles'
 */
MyBundles.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyBundles.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Inbox\MyBundles::__invoke
 * @see app/Livewire/Inbox/MyBundles.php:7
 * @route '/my-bundles'
 */
MyBundles.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MyBundles.url(options),
    method: 'head',
})
export default MyBundles