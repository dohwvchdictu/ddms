import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Inbox\MyPurchaseRequests::__invoke
 * @see app/Livewire/Inbox/MyPurchaseRequests.php:7
 * @route '/my-purchase-requests'
 */
const MyPurchaseRequests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyPurchaseRequests.url(options),
    method: 'get',
})

MyPurchaseRequests.definition = {
    methods: ["get","head"],
    url: '/my-purchase-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Inbox\MyPurchaseRequests::__invoke
 * @see app/Livewire/Inbox/MyPurchaseRequests.php:7
 * @route '/my-purchase-requests'
 */
MyPurchaseRequests.url = (options?: RouteQueryOptions) => {
    return MyPurchaseRequests.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Inbox\MyPurchaseRequests::__invoke
 * @see app/Livewire/Inbox/MyPurchaseRequests.php:7
 * @route '/my-purchase-requests'
 */
MyPurchaseRequests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyPurchaseRequests.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Inbox\MyPurchaseRequests::__invoke
 * @see app/Livewire/Inbox/MyPurchaseRequests.php:7
 * @route '/my-purchase-requests'
 */
MyPurchaseRequests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MyPurchaseRequests.url(options),
    method: 'head',
})
export default MyPurchaseRequests