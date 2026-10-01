import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Documents\NewBundle::__invoke
 * @see app/Livewire/Documents/NewBundle.php:7
 * @route '/new-bundle'
 */
const NewBundle = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: NewBundle.url(options),
    method: 'get',
})

NewBundle.definition = {
    methods: ["get","head"],
    url: '/new-bundle',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Documents\NewBundle::__invoke
 * @see app/Livewire/Documents/NewBundle.php:7
 * @route '/new-bundle'
 */
NewBundle.url = (options?: RouteQueryOptions) => {
    return NewBundle.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Documents\NewBundle::__invoke
 * @see app/Livewire/Documents/NewBundle.php:7
 * @route '/new-bundle'
 */
NewBundle.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: NewBundle.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Documents\NewBundle::__invoke
 * @see app/Livewire/Documents/NewBundle.php:7
 * @route '/new-bundle'
 */
NewBundle.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: NewBundle.url(options),
    method: 'head',
})
export default NewBundle