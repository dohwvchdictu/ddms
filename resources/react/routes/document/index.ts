import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
export const view = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/document/view/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
view.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return view.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
view.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\DocumentDetail::__invoke
 * @see app/Livewire/Views/DocumentDetail.php:7
 * @route '/document/view/{control_no}'
 */
view.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(args, options),
    method: 'head',
})

/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
export const incoming = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: incoming.url(args, options),
    method: 'get',
})

incoming.definition = {
    methods: ["get","head"],
    url: '/document/incoming/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
incoming.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return incoming.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
incoming.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: incoming.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\IncomingDetail::__invoke
 * @see app/Livewire/Views/IncomingDetail.php:7
 * @route '/document/incoming/{control_no}'
 */
incoming.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: incoming.url(args, options),
    method: 'head',
})

/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
export const pending = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(args, options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/document/pending/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
pending.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return pending.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
pending.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\PendingDetail::__invoke
 * @see app/Livewire/Views/PendingDetail.php:7
 * @route '/document/pending/{control_no}'
 */
pending.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(args, options),
    method: 'head',
})

/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
export const qrReceive = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrReceive.url(args, options),
    method: 'get',
})

qrReceive.definition = {
    methods: ["get","head"],
    url: '/document/qr-receive/{control_no}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
qrReceive.url = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return qrReceive.definition.url
            .replace('{control_no}', parsedArgs.control_no.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
qrReceive.get = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrReceive.url(args, options),
    method: 'get',
})
/**
* @see \App\Livewire\Views\QrReceive::__invoke
 * @see app/Livewire/Views/QrReceive.php:7
 * @route '/document/qr-receive/{control_no}'
 */
qrReceive.head = (args: { control_no: string | number } | [control_no: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: qrReceive.url(args, options),
    method: 'head',
})
const document = {
    view: Object.assign(view, view),
incoming: Object.assign(incoming, incoming),
pending: Object.assign(pending, pending),
qrReceive: Object.assign(qrReceive, qrReceive),
}

export default document