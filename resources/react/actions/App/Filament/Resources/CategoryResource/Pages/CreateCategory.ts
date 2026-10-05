import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/ddms-admin/categories/create'
 */
const CreateCategory = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CreateCategory.url(options),
    method: 'get',
})

CreateCategory.definition = {
    methods: ["get","head"],
    url: '/ddms-admin/categories/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/ddms-admin/categories/create'
 */
CreateCategory.url = (options?: RouteQueryOptions) => {
    return CreateCategory.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/ddms-admin/categories/create'
 */
CreateCategory.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CreateCategory.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CategoryResource\Pages\CreateCategory::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/CreateCategory.php:7
 * @route '/ddms-admin/categories/create'
 */
CreateCategory.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: CreateCategory.url(options),
    method: 'head',
})
export default CreateCategory