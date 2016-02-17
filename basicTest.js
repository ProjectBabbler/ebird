var ebird = require('./src/index.js');

var instance = new ebird();

instance.auth('projectbabbler', 'babblebabble').then(() => {
    console.log('successful login')
}).catch(() => {
    console.log('failed to log in');
    process.exit(1)
}).then(() => {
    var instance2 = new ebird();
    return instance2.auth('projectbabbler', 'wrong_password').then(() => {
        console.log('Logged in with a bad password')
        process.exit(1)
    }).catch(() => {
        console.log('successful failure with bad password')
    });
}).then(() => {
    console.log('Tests Pass');
    process.exit(0)
})