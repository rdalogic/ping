import {Ping} from './lib/ping.js';

const hosts = ['google.com', '1.1.1.1', 'ukr.net'];

// hosts.forEach(function (host) {
//     Ping.probe(host)
//         .then(function (res) {
//             console.log(res);
//         })
//         .catch(error => {
//             console.log('caught', error);
//         });
// });

// hosts.forEach(function (host) {
//     Ping.probeCb(host, function(res){
//         const msg = res?.alive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
//         console.log(msg);
//     });
// });