'use strict';

var Totals = require('./Totals');
var Alerts = require('./Alerts');
var Targets = require('./Targets');
var request = require('request-promise');
var cheerio = require('cheerio');

var parseListResponse = (html) => {
    var $ = cheerio.load(html);
    var lis = $('#results li.Observation');
    var results = [];
    lis.each((i, elem) => {
        var row = $(elem).find('.Observation-numberObserved').text().replace('.', '');
        var speciesEl = $(elem).find('.Observation-species');
        var name = speciesEl.find('.Heading-main').text();
        var speciesCode = speciesEl.find('a').attr('data-species-code');

        var location = $(elem).find('.Observation-meta-location a').text();
        var date = $(elem).find('.Observation-meta a').text();
        results.push({
            rowNumber: row,
            commonName: name,
            location: location,
            date: date,
            speciesCode: speciesCode,
        });
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
                    Cookie: `EBIRD_SESSIONID=${this.session}`,
                },
                followRedirect: false,
                resolveWithFullResponse: true,
            })
                .then((response) => {
                    if (response.statusCode == 200) {
                        return this.session;
                    } else {
                        throw 'Not authed';
                    }
                })
                .catch((err) => {
                    return this.authWithPassword(username, password);
                });
        } else {
            return this.authWithPassword(username, password);
        }
    }

    authWithPassword(username, password) {
        var j = request.jar();
        let url = 'https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Febird%2Flogin%2Fcas%3Fportal%3Debird';
        return request({
            method: 'GET',
            uri: url,
            jar: j,
        })
            .then((response) => {
                let matches = response.match('name="lt" value="(.*)"');
                return request({
                    method: 'POST',
                    uri: url,
                    form: {
                        _eventId: 'submit',
                        execution: 'e1s1',
                        lt: matches[1],
                        password: password,
                        username: username,
                    },
                    followAllRedirects: true,
                    resolveWithFullResponse: true,
                    jar: j,
                });
            })
            .then((response) => {
                let cookies = j.getCookies('https://ebird.org');
                let session = cookies.find((cookie) => {
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
        let qs = {
            cmd: 'list',
            listType: code,
            time: time,
            sortKey: options.sortKey,
            o: options.o,
            year: year,
        };

        if (customList.indexOf(lowerCaseCode) != -1) {
            code = lowerCaseCode;
            qs.listCategory = 'default';
        }
        return request({
            uri: 'http://ebird.org/ebird/MyEBird',
            qs: qs,
            headers: {
                Cookie: `EBIRD_SESSIONID=${this.session}`,
            },
        }).then(parseListResponse);
    }
}

module.exports = ebird;
