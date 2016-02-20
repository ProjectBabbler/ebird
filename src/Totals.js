var request = require('request-promise');
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
                if (tableItem.number != '--') {
                    listItems.push({
                        number: tableItem.number,
                        time: tableItem.time,
                    });
                }
            });
            data.push({
                name: listItem.string[0]._,
                code: first['list-type'],
                items: listItems,
            });
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

module.exports = {
    countries: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/country',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseXmlPromise);
    },

    states: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/states',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseXmlPromise);
    },

    counties: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/counties',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseXmlPromise);
    },

    regions: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/regions',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseXmlPromise);
    },
};