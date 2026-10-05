import DocumentStatusController from './DocumentStatusController'
import EndorsementsController from './EndorsementsController'
import ExternalRequestsController from './ExternalRequestsController'
import PerUnitController from './PerUnitController'
const Reports = {
    DocumentStatusController: Object.assign(DocumentStatusController, DocumentStatusController),
EndorsementsController: Object.assign(EndorsementsController, EndorsementsController),
ExternalRequestsController: Object.assign(ExternalRequestsController, ExternalRequestsController),
PerUnitController: Object.assign(PerUnitController, PerUnitController),
}

export default Reports