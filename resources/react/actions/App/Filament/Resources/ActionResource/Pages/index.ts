import ListActions from './ListActions'
import CreateAction from './CreateAction'
import EditAction from './EditAction'
const Pages = {
    ListActions: Object.assign(ListActions, ListActions),
CreateAction: Object.assign(CreateAction, CreateAction),
EditAction: Object.assign(EditAction, EditAction),
}

export default Pages