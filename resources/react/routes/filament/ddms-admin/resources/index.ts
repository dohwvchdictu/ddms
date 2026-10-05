import actions from './actions'
import categories from './categories'
import citizenCharters from './citizen-charters'
import users from './users'
const resources = {
    actions: Object.assign(actions, actions),
categories: Object.assign(categories, categories),
citizenCharters: Object.assign(citizenCharters, citizenCharters),
users: Object.assign(users, users),
}

export default resources