import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Inbox\MyPayments::__invoke
 * @see app/Livewire/Inbox/MyPayments.php:7
 * @route '/my-payments'
 */
const MyPayments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyPayments.url(options),
    method: 'get',
})

MyPayments.definition = {
    methods: ["get","head"],
    url: '/my-payments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Inbox\MyPayments::__invoke
 * @see app/Livewire/Inbox/MyPayments.php:7
 * @route '/my-payments'
 */
MyPayments.url = (options?: RouteQueryOptions) => {
    return MyPayments.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Inbox\MyPayments::__invoke
 * @see app/Livewire/Inbox/MyPayments.php:7
 * @route '/my-payments'
 */
MyPayments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: MyPayments.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Inbox\MyPayments::__invoke
 * @see app/Livewire/Inbox/MyPayments.php:7
 * @route '/my-payments'
 */
MyPayments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: MyPayments.url(options),
    method: 'head',
})
export default MyPayments