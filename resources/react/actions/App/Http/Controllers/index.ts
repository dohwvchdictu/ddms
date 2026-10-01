import Auth from './Auth'
import DashboardController from './DashboardController'
import DocumentSearchController from './DocumentSearchController'
import DocumentTrackingController from './DocumentTrackingController'
import MiscController from './MiscController'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
DashboardController: Object.assign(DashboardController, DashboardController),
DocumentSearchController: Object.assign(DocumentSearchController, DocumentSearchController),
DocumentTrackingController: Object.assign(DocumentTrackingController, DocumentTrackingController),
MiscController: Object.assign(MiscController, MiscController),
}

export default Controllers