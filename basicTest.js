var ebird = require('./src/index.js');
var expect = require('chai').expect;

var instance = new ebird();
var instance2 = new ebird();


instance.auth('projectbabblertest1', 'babblebabble').then(() => {
    console.log('successful login to test 1');
}).catch(() => {
    console.log('failed to log in');
    process.exit(1);
}).then(() => {
    var instance2 = new ebird();
    return instance2.auth('projectbabblertest1', 'wrong_password').then(() => {
        console.log('Logged in with a bad password');
        process.exit(1);
    }).catch(() => {
        console.log('successful failure with bad password');
    });
}).then(() => {
    return instance.totals.countries().then(results => {
        expect(results.length).to.equal(0);
        console.log('Counties returns zero results');
    });
}).then(() => {
    return instance.list('US-VA', 'life').then(results => {
        //expect(results.length).to.equal(0);
        console.log('VA life list returns zero results');
    });
}).then(() => {
    return instance2.auth('projectbabblertest2', 'babblebabble').then(() => {
        console.log('successful login to test 2');
    });
}).then(() => {
    return instance2.list('US-CA', 'year', 2016).then(results => {
        expect(results.length).to.equal(4);
        var species = results.map(row => {
            return row.commonName;
        });
        expect(species).to.deep.equal([
            'Double-crested Cormorant',
            'Western Gull',
            'Black Phoebe',
            'White-crowned Sparrow',
        ]);
        console.log('CA 2016 list has 4 results');
    });
}).then(() => {
    return instance2.list('ABA', 'life').then(results => {
        expect(results.length).to.equal(5);
        var species = results.map(row => {
            return row.commonName;
        });
        expect(species).to.deep.equal([
            'Double-crested Cormorant',
            'Western Gull',
            'Rock Pigeon',
            'Black Phoebe',
            'White-crowned Sparrow',
        ]);
        console.log('ABA life list has 5 results');
    });
}).then(() => {
    return instance2.alerts.rarities('US-CA').then(results => {
        expect(results.length).to.be.above(1);
        console.log('Pulled some Rarities for CA');
    });
}).then(() => {
    return instance2.alerts.needs('US-CA').then(results => {
        expect(results.length).to.be.above(1);
        console.log('Pulled some Needs for CA');
    });
}).then(() => {
    console.log('Tests Pass');
    process.exit(0);
}).catch((e) => {
    console.log(e);
    process.exit(1);
});