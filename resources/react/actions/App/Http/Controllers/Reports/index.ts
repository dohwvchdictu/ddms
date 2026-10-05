import DocumentStatusController from './DocumentStatusController'
import EndorsementsController from './EndorsementsController'
import ExternalRequestsController from './ExternalRequestsController'
const Reports = {
    DocumentStatusController: Object.assign(DocumentStatusController, DocumentStatusController),
EndorsementsController: Object.assign(EndorsementsController, EndorsementsController),
ExternalRequestsController: Object.assign(ExternalRequestsController, ExternalRequestsController),
}

export default Reports