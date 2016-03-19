'use strict';

var phantom = require('phantom');
var Totals = require('./Totals');
var request = require('request-promise');
var CSVConverter = require('csvtojson').Converter;

var parseCSVPromise = (csv) => {
    return new Promise((resolve, reject) => {
        var csvConverter = new CSVConverter();
        csvConverter.fromString(csv, (err, obj) => {
            if (err) {
                reject(err);
            }
            resolve(obj);
        });
    });
};

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
            phantom.create(function(ph) {
                ph.createPage(function(page) {
                    page.open('https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Febird%2Flogin%2Fcas%3Fportal%3Debird', (status) => {
                        page.set('onLoadFinished', function() {
                            page.get('cookies', function(cookies) {
                                var value = '';
                                cookies.forEach(function(cookie) {
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

                        page.evaluate(function(username, password) {
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

    list(code, time, year, opts) {
        opts = opts || {};
        var options = {
            sortKey: opts.sortKey || 'taxon_order',
            o: opts.o || 'asc',
        };
        var lowerCaseCode = code.toLowerCase();
        var customList = [
            'aba',
            'poc',
            'world',
            'whs',
            'ehs',
            'north_america',
            'south_america',
            'cen',
            'caribbean',
            'aou',
            'lower48',
            'wpa',
            'eur',
            'asia',
            'eus',
            'afr',
            'saf',
            'aus',
            'aut',
            'spo',
            'aoc',
            'ioc',
        ];
        var rtype = null;
        if (customList.indexOf(lowerCaseCode) != -1) {
            rtype = 'custom';
        }
        return request({
            uri: 'http://ebird.org/ebird/MyEBird',
            qs: {
                cmd: 'list',
                r: code,
                time: time,
                sortKey: options.sortKey,
                o: options.o,
                year: year,
                fmt: 'csv',
                rtype: rtype,
            },
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            },
        }).then(parseCSVPromise);
    }
}

module.exports = ebird;
