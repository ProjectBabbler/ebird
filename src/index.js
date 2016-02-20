'use strict';

var phantom = require('phantom');
var Totals = require('./Totals');

class ebird {
    constructor() {
        this.session = null;
        this.bindTo('totals', Totals);
    }

    bindTo(key, object) {
        this[key] = {};
        for (var name in object) {
            this[key][name] = object[name].bind(this);
        }
    }

    auth(username, password) {
        return new Promise((resolve, reject) => {
            phantom.create((ph) => {
                ph.createPage((page) => {
                    page.open('https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Febird%2Flogin%2Fcas%3Fportal%3Debird', (status) => {
                        page.set('onLoadFinished', () => {
                            page.get('cookies', (cookies) => {
                                var value = '';
                                cookies.forEach(cookie => {
                                    if (cookie.name == 'EBIRD_SESSIONID') {
                                        value = cookie.value;
                                    }
                                });
                                ph.exit();
                                if (value) {
                                    resolve(value);
                                } else {
                                    reject();
                                }
                            });
                        });

                        page.evaluate((username, password) => {
                            document.getElementById('input-user-name').value = username;
                            document.getElementById('input-password').value = password;
                            document.getElementsByTagName('form')[0].submit();
                        }, () => {}, username, password);
                    });
                });
            });
        }).then((value) => {
            this.session = value;
        });
    }
}

module.exports = ebird;
