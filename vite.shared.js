import { networkInterfaces } from 'os';

// LAN address for HMR, so the dev server works from other machines on the
// office network.
export function getLocalIP() {
    for (const nets of Object.values(networkInterfaces())) {
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}
