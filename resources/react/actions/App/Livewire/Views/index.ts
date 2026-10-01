import DocumentDetail from './DocumentDetail'
import IncomingDetail from './IncomingDetail'
import PendingDetail from './PendingDetail'
import QrReceive from './QrReceive'
import RoutingLogbook from './RoutingLogbook'
const Views = {
    DocumentDetail: Object.assign(DocumentDetail, DocumentDetail),
IncomingDetail: Object.assign(IncomingDetail, IncomingDetail),
PendingDetail: Object.assign(PendingDetail, PendingDetail),
QrReceive: Object.assign(QrReceive, QrReceive),
RoutingLogbook: Object.assign(RoutingLogbook, RoutingLogbook),
}

export default Views