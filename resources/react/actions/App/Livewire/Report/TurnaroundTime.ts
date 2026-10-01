import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Livewire\Report\TurnaroundTime::__invoke
 * @see app/Livewire/Report/TurnaroundTime.php:7
 * @route '/report-turnaround-time'
 */
const TurnaroundTime = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TurnaroundTime.url(options),
    method: 'get',
})

TurnaroundTime.definition = {
    methods: ["get","head"],
    url: '/report-turnaround-time',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Report\TurnaroundTime::__invoke
 * @see app/Livewire/Report/TurnaroundTime.php:7
 * @route '/report-turnaround-time'
 */
TurnaroundTime.url = (options?: RouteQueryOptions) => {
    return TurnaroundTime.definition.url + queryParams(options)
}

/**
* @see \App\Livewire\Report\TurnaroundTime::__invoke
 * @see app/Livewire/Report/TurnaroundTime.php:7
 * @route '/report-turnaround-time'
 */
TurnaroundTime.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TurnaroundTime.url(options),
    method: 'get',
})
/**
* @see \App\Livewire\Report\TurnaroundTime::__invoke
 * @see app/Livewire/Report/TurnaroundTime.php:7
 * @route '/report-turnaround-time'
 */
TurnaroundTime.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: TurnaroundTime.url(options),
    method: 'head',
})
export default TurnaroundTime