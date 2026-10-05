import ExternalDocuments from './ExternalDocuments'
import InternalDocuments from './InternalDocuments'
import PerUnit from './PerUnit'
import TurnaroundTime from './TurnaroundTime'
const Report = {
    ExternalDocuments: Object.assign(ExternalDocuments, ExternalDocuments),
InternalDocuments: Object.assign(InternalDocuments, InternalDocuments),
PerUnit: Object.assign(PerUnit, PerUnit),
TurnaroundTime: Object.assign(TurnaroundTime, TurnaroundTime),
}

export default Report