'use strict';

var Totals = require('./Totals');
var Alerts = require('./Alerts');
var Targets = require('./Targets');
var request = require('request-promise');
var cheerio = require('cheerio');
var extract = require('url-querystring');

var parseListResponse = html => {
    var $ = cheerio.load(html);
    var trs = $('#content table tr');
    var results = [];
    trs.each((i, elem) => {
        var tds = $(elem).find('td');
        if (tds.length == 6) {
            var row = $(tds[0]).text();
            var speciesTd = $(tds[1]);
            var name = speciesTd.text().split(' - ');
            var speciesCode = speciesTd.find('a').attr('data-species-code');
            var location = $(tds[2]).text();
            var sp = $(tds[3]).text();
            var date = $(tds[4]).text();

            results.push({
                rowNumber: row,
                commonName: name[0].trim(),
                scientificName: name[1] ? name[1].trim() : null,
                location: location,
                sp: sp,
                date: date,
                speciesCode: speciesCode
            });
        }
    });

    return results;
};

class ebird {
    constructor(sessionToken) {
        this.session = sessionToken;
        this.bindTo('totals', Totals);
        this.bindTo('alerts', Alerts);
        this.bindTo('targets', Targets);
    }

    bindTo(key, object) {
        this[key] = {};
        for (var name in object) {
            this[key][name] = object[name].bind(this);
        }
    }

    auth(username, password) {
        if (this.session) {
            return request({
                uri: 'https://ebird.org/prefs',
                headers: {
                    Cookie: `EBIRD_SESSIONID=${this.session}`
                },
                followRedirect: false,
                resolveWithFullResponse: true
            })
                .then(response => {
                    if (response.statusCode == 200) {
                        return this.session;
                    } else {
                        throw 'Not authed';
                    }
                })
                .catch(err => {
                    return this.authWithPassword(username, password);
                });
        } else {
            return this.authWithPassword(username, password);
        }
    }

    authWithPassword(username, password) {
        var j = request.jar();
        let url =
            'https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Febird%2Flogin%2Fcas%3Fportal%3Debird';
        return request({
            method: 'GET',
            uri: url,
            jar: j
        })
            .then(response => {
                let matches = response.match('name="lt" value="(.*)"');
                return request({
                    method: 'POST',
                    uri: url,
                    form: {
                        _eventId: 'submit',
                        execution: 'e1s1',
                        lt: matches[1],
                        password: password,
                        username: username
                    },
                    followAllRedirects: true,
                    resolveWithFullResponse: true,
                    jar: j
                });
            })
            .then(response => {
                let cookies = j.getCookies('https://ebird.org');
                let session = cookies.find(cookie => {
                    return cookie.key == 'EBIRD_SESSIONID';
                });
                if (!session) {
                    throw 'Invalid Auth';
                }
                this.session = session.value;
                return this.session;
            });
    }

    list(code, time, year, opts) {
        opts = opts || {};
        var options = {
            sortKey: opts.sortKey || 'taxon_order',
            o: opts.o || 'asc'
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
            'ioc'
        ];
        let qs = {
            cmd: 'list',
            listType: code,
            time: time,
            sortKey: options.sortKey,
            o: options.o,
            year: year
        };

        if (customList.indexOf(lowerCaseCode) != -1) {
            code = lowerCaseCode;
            qs.listCategory = 'default';
        }
        return request({
            uri: 'http://ebird.org/ebird/MyEBird',
            qs: qs,
            headers: {
                Cookie: `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseListResponse);
    }
}

module.exports = ebird;
