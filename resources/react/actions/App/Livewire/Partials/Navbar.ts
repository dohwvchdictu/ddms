import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Livewire\Partials\Navbar::getEmployeePhoto
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
export const getEmployeePhoto = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getEmployeePhoto.url(args, options),
    method: 'get',
})

getEmployeePhoto.definition = {
    methods: ["get","head"],
    url: '/employee/image/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Partials\Navbar::getEmployeePhoto
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
getEmployeePhoto.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return getEmployeePhoto.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Partials\Navbar::getEmployeePhoto
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
getEmployeePhoto.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getEmployeePhoto.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Partials\Navbar::getEmployeePhoto
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
getEmployeePhoto.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getEmployeePhoto.url(args, options),
    method: 'head',
})
const Navbar = { getEmployeePhoto }

export default Navbar