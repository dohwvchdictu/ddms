import CategoryController from './CategoryController'
import CitizenCharterController from './CitizenCharterController'
import ActionController from './ActionController'
const Admin = {
    CategoryController: Object.assign(CategoryController, CategoryController),
CitizenCharterController: Object.assign(CitizenCharterController, CitizenCharterController),
ActionController: Object.assign(ActionController, ActionController),
}

export default Admin