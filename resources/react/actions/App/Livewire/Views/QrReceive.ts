import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
const QrReceive = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: QrReceive.url(args, options),
    method: 'get',
})

QrReceive.definition = {
    methods: ["get","head"],
    url: '/document/qr-receive/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
QrReceive.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { control_no: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    control_no: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        control_no: args.control_no,
                }

    return QrReceive.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
QrReceive.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: QrReceive.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
QrReceive.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: QrReceive.url(args, options),
    method: 'head',
})
export default QrReceive