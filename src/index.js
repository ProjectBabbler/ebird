'use strict'

var request = require('request-promise');
var phantom = require('phantom');
var parseString = require('xml2js').parseString;

var parseXml = (xml) => {
    var data = [];
    var content = xml.array.array;
    if (content) {
        content.forEach(listItem => {
            data[listItem.string] = {};
            var first = listItem['life-list-table-item'][0].$;
            var listItems = [];
            listItem['life-list-table-item'].forEach(tableItem => {
                tableItem = tableItem.$;
                listItems.push({
                    number: tableItem.number,
                    time: tableItem.time,
                });
            });
            data.push({
                name: listItem.string[0]._,
                code: first['list-type'],
                items: listItems,
            })
        });
    }
    return data;
};

var parseXmlPromise = (xml) => {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(parseXml(result));
            }
        });
    });
};

class ebird {
    constructor() {
        this.session = null;
    }

    auth(username, password) {
        return new Promise((resolve, reject) => {
            phantom.create(function (ph) {
                ph.createPage(function (page) {
                    page.open("https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Febird%2Flogin%2Fcas%3Fportal%3Debird", function (status) {
                        page.set('onLoadFinished', function() {
                            page.get('cookies', function(cookies) {
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

                        page.evaluate(function (username, password) {
                            document.getElementById("input-user-name").value = username;
                            document.getElementById("input-password").value = password;
                            document.getElementsByTagName('form')[0].submit();
                        }, () => {}, username, password);
                    });
                });
            });
        }).then((value) => {
            this.session = value;
        });
    }

    counties() {
        return request({
            uri: 'http://ebird.org/ebird/listing/country',
            headers: {
                    'Cookie': `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseXmlPromise);
    }

    states() {
        return request({
            uri: 'http://ebird.org/ebird/listing/country',
            headers: {
                    'Cookie': `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseXmlPromise);
    }
};

module.exports = ebird;
