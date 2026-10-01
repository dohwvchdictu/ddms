import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Livewire\Partials\Navbar::photo
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
export const photo = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})

photo.definition = {
    methods: ["get","head"],
    url: '/employee/image/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Partials\Navbar::photo
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
photo.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return photo.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Partials\Navbar::photo
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
photo.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Partials\Navbar::photo
 * @see app/Livewire/Partials/Navbar.php:57
 * @route '/employee/image/{filename}'
 */
photo.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: photo.url(args, options),
    method: 'head',
})
const employee = {
    photo: Object.assign(photo, photo),
}

export default employee