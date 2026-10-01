import Auth from './Auth'
import MiscController from './MiscController'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
MiscController: Object.assign(MiscController, MiscController),
}

export default Controllers