import document from './document'
import external from './external'
import transmittal from './transmittal'
const print = {
    document: Object.assign(document, document),
external: Object.assign(external, external),
transmittal: Object.assign(transmittal, transmittal),
}

export default print