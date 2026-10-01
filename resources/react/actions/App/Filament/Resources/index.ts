import ActionResource from './ActionResource'
import CategoryResource from './CategoryResource'
import CitizenCharterResource from './CitizenCharterResource'
import UserResource from './UserResource'
const Resources = {
    ActionResource: Object.assign(ActionResource, ActionResource),
CategoryResource: Object.assign(CategoryResource, CategoryResource),
CitizenCharterResource: Object.assign(CitizenCharterResource, CitizenCharterResource),
UserResource: Object.assign(UserResource, UserResource),
}

export default Resources