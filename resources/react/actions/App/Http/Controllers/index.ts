import Auth from './Auth'
import DashboardController from './DashboardController'
import DashboardDocumentsController from './DashboardDocumentsController'
import DocumentSearchController from './DocumentSearchController'
import DocumentTrackingController from './DocumentTrackingController'
import DocumentController from './DocumentController'
import MyDocumentsController from './MyDocumentsController'
import OfficeEmployeesController from './OfficeEmployeesController'
import MiscController from './MiscController'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
DashboardController: Object.assign(DashboardController, DashboardController),
DashboardDocumentsController: Object.assign(DashboardDocumentsController, DashboardDocumentsController),
DocumentSearchController: Object.assign(DocumentSearchController, DocumentSearchController),
DocumentTrackingController: Object.assign(DocumentTrackingController, DocumentTrackingController),
DocumentController: Object.assign(DocumentController, DocumentController),
MyDocumentsController: Object.assign(MyDocumentsController, MyDocumentsController),
OfficeEmployeesController: Object.assign(OfficeEmployeesController, OfficeEmployeesController),
MiscController: Object.assign(MiscController, MiscController),
}

export default Controllers