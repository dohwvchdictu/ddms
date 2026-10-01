import DocumentStatus from './DocumentStatus'
import Employees from './Employees'
import ExternalDocuments from './ExternalDocuments'
import InternalDocuments from './InternalDocuments'
import PerUnit from './PerUnit'
import TurnaroundTime from './TurnaroundTime'
const Report = {
    DocumentStatus: Object.assign(DocumentStatus, DocumentStatus),
Employees: Object.assign(Employees, Employees),
ExternalDocuments: Object.assign(ExternalDocuments, ExternalDocuments),
InternalDocuments: Object.assign(InternalDocuments, InternalDocuments),
PerUnit: Object.assign(PerUnit, PerUnit),
TurnaroundTime: Object.assign(TurnaroundTime, TurnaroundTime),
}

export default Report