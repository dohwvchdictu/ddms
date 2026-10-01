import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
const ListCategories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListCategories.url(options),
    method: 'get',
})

ListCategories.definition = {
    methods: ["get","head"],
    url: '/dtis-admin/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
ListCategories.url = (options?: RouteQueryOptions) => {
    return ListCategories.definition.url + queryParams(options)
}

/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
ListCategories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ListCategories.url(options),
    method: 'get',
})
/**
* @see \App\Filament\Resources\CategoryResource\Pages\ListCategories::__invoke
 * @see app/Filament/Resources/CategoryResource/Pages/ListCategories.php:7
 * @route '/dtis-admin/categories'
 */
ListCategories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ListCategories.url(options),
    method: 'head',
})
export default ListCategories