import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
const CreateAction = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CreateAction.url(options),
    method: 'get',
})

CreateAction.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/actions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
CreateAction.url = (options?: RouteQueryOptions) => {
    return CreateAction.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
CreateAction.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CreateAction.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\ActionResource\Pages\CreateAction::__invoke
 * @see app/Filament/Resources/ActionResource/Pages/CreateAction.php:7
 * @route '/dtis-admin/actions/create'
 */
CreateAction.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: CreateAction.url(options),
    method: 'head',
})
export default CreateAction