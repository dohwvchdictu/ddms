import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\EmployeePhotoController::__invoke
 * @see app/Http/Controllers/EmployeePhotoController.php:16
 * @route '/employee/image/{filename}'
 */
const EmployeePhotoController = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EmployeePhotoController.url(args, options),
    method: 'get',
})

EmployeePhotoController.definition = {
    methods: ["get","head"],
    url: '/employee/image/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EmployeePhotoController::__invoke
 * @see app/Http/Controllers/EmployeePhotoController.php:16
 * @route '/employee/image/{filename}'
 */
EmployeePhotoController.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return EmployeePhotoController.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeePhotoController::__invoke
 * @see app/Http/Controllers/EmployeePhotoController.php:16
 * @route '/employee/image/{filename}'
 */
EmployeePhotoController.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: EmployeePhotoController.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EmployeePhotoController::__invoke
 * @see app/Http/Controllers/EmployeePhotoController.php:16
 * @route '/employee/image/{filename}'
 */
EmployeePhotoController.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: EmployeePhotoController.url(args, options),
    method: 'head',
})
export default EmployeePhotoController