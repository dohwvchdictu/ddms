import ListCategories from './ListCategories'
import CreateCategory from './CreateCategory'
import EditCategory from './EditCategory'
const Pages = {
    ListCategories: Object.assign(ListCategories, ListCategories),
CreateCategory: Object.assign(CreateCategory, CreateCategory),
EditCategory: Object.assign(EditCategory, EditCategory),
}

export default Pages