'use strict';

var phantom = require('phantom');
var Totals = require('./Totals');
var request = require('request-promise');
var cheerio = require('cheerio');
var extract = require('url-querystring');

var parseListResponse = (html) => {
    var $ = cheerio.load(html);
    var trs = $('#content table tr');
    var results = [];
    trs.each((i, elem) => {
        var tds = $(elem).find('td');
        if (tds.length == 5) {
            var row = $(tds[0]).text();
            var speciesTd = $(tds[1]);
            var name = speciesTd.text().split(' - ');
            var speciesLink = speciesTd.find('a').attr('href');
            var speciesCode = extract(speciesLink).qs.spp;

            var location = $(tds[2]).text();
            var sp = $(tds[3]).text();
            var date = $(tds[4]).text();
            results.push({
                rowNumber: row,
                commonName: name[0],
                scientificName: name[1],
                location: location,
                sp: sp,
                date: date,
                speciesCode: speciesCode,
            });
        }
    });

    return results;
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
                rtype: rtype,
            },
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            },
        }).then(parseListResponse);
    }
}

module.exports = ebird;
