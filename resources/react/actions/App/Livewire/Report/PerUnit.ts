import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Report\PerUnit::__invoke
 * @see app/Livewire/Report/PerUnit.php:7
 * @route '/report-per-unit'
 */
const PerUnit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PerUnit.url(options),
    method: 'get',
})

PerUnit.definition = {
    methods: ["get","head"],
    url: '/report-per-unit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Report\PerUnit::__invoke
 * @see app/Livewire/Report/PerUnit.php:7
 * @route '/report-per-unit'
 */
PerUnit.url = (options?: RouteQueryOptions) => {
    return PerUnit.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Report\PerUnit::__invoke
 * @see app/Livewire/Report/PerUnit.php:7
 * @route '/report-per-unit'
 */
PerUnit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PerUnit.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Report\PerUnit::__invoke
 * @see app/Livewire/Report/PerUnit.php:7
 * @route '/report-per-unit'
 */
PerUnit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: PerUnit.url(options),
    method: 'head',
})
export default PerUnit