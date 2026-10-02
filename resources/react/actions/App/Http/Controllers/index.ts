import Auth from './Auth'
import DashboardController from './DashboardController'
import DashboardDocumentsController from './DashboardDocumentsController'
import DocumentSearchController from './DocumentSearchController'
import DocumentTrackingController from './DocumentTrackingController'
import DocumentController from './DocumentController'
import MyDocumentsController from './MyDocumentsController'
import OfficeEmployeesController from './OfficeEmployeesController'
import IncomingController from './IncomingController'
import PendingController from './PendingController'
import ProcessedController from './ProcessedController'
import ClosedController from './ClosedController'
import DocumentViewController from './DocumentViewController'
import RoutingLogbookController from './RoutingLogbookController'
import MiscController from './MiscController'
import EmployeePhotoController from './EmployeePhotoController'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
DashboardController: Object.assign(DashboardController, DashboardController),
DashboardDocumentsController: Object.assign(DashboardDocumentsController, DashboardDocumentsController),
DocumentSearchController: Object.assign(DocumentSearchController, DocumentSearchController),
DocumentTrackingController: Object.assign(DocumentTrackingController, DocumentTrackingController),
DocumentController: Object.assign(DocumentController, DocumentController),
MyDocumentsController: Object.assign(MyDocumentsController, MyDocumentsController),
OfficeEmployeesController: Object.assign(OfficeEmployeesController, OfficeEmployeesController),
IncomingController: Object.assign(IncomingController, IncomingController),
PendingController: Object.assign(PendingController, PendingController),
ProcessedController: Object.assign(ProcessedController, ProcessedController),
ClosedController: Object.assign(ClosedController, ClosedController),
DocumentViewController: Object.assign(DocumentViewController, DocumentViewController),
RoutingLogbookController: Object.assign(RoutingLogbookController, RoutingLogbookController),
MiscController: Object.assign(MiscController, MiscController),
EmployeePhotoController: Object.assign(EmployeePhotoController, EmployeePhotoController),
}

export default Controllers