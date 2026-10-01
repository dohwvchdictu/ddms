import MyDocuments from './MyDocuments'
import MyBundles from './MyBundles'
import MyPurchaseRequests from './MyPurchaseRequests'
import MyPayments from './MyPayments'
const Inbox = {
    MyDocuments: Object.assign(MyDocuments, MyDocuments),
MyBundles: Object.assign(MyBundles, MyBundles),
MyPurchaseRequests: Object.assign(MyPurchaseRequests, MyPurchaseRequests),
MyPayments: Object.assign(MyPayments, MyPayments),
}

export default Inbox