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

// Pages allowed to load scripts from the dev server: Herd's *.test sites,
// localhost, and the app opened by a private network address (e.g.
// `php artisan serve --host=0.0.0.0`, to test from a phone). Without this the
// browser blocks the module scripts for an IP origin and the page stays white.
export const devCors = {
    origin: [
        /^https?:\/\/(?:[^:/]+\.)?test(?::\d+)?$/,
        /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/,
        /^https?:\/\/(?:10\.\d+|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d+\.\d+(?::\d+)?$/,
    ],
};
