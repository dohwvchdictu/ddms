import DocumentStatusController from './DocumentStatusController'
import EndorsementsController from './EndorsementsController'
import ExternalRequestsController from './ExternalRequestsController'
import PerUnitController from './PerUnitController'
import TurnaroundController from './TurnaroundController'
const Reports = {
    DocumentStatusController: Object.assign(DocumentStatusController, DocumentStatusController),
EndorsementsController: Object.assign(EndorsementsController, EndorsementsController),
ExternalRequestsController: Object.assign(ExternalRequestsController, ExternalRequestsController),
PerUnitController: Object.assign(PerUnitController, PerUnitController),
TurnaroundController: Object.assign(TurnaroundController, TurnaroundController),
}

export default Reports