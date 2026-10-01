import Incoming from './Incoming'
import Pending from './Pending'
import Endorsed from './Endorsed'
import Forwarded from './Forwarded'
import Closed from './Closed'
const Status = {
    Incoming: Object.assign(Incoming, Incoming),
Pending: Object.assign(Pending, Pending),
Endorsed: Object.assign(Endorsed, Endorsed),
Forwarded: Object.assign(Forwarded, Forwarded),
Closed: Object.assign(Closed, Closed),
}

export default Status