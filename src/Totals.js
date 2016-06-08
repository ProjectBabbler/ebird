var request = require('request-promise');

var parseResults = (results) => {
    return results.table.map(row => {
        var items = [];
        for (var i = 1; i < row.length; i++) {
            items.push(row[i]);
        }
        return {
            name: row[0],
            code: row[1].listType,
            items: items
        };
    });
};

module.exports = {
    countries: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/country',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            },
            json: true
        }).then(parseResults);
    },

    states: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/states',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            },
            json: true
        }).then(parseResults);
    },

    counties: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/counties',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            },
            json: true
        }).then(parseResults);
    },

    regions: function() {
        return request({
            uri: 'http://ebird.org/ebird/listing/regions',
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            },
            json: true
        }).then(parseResults);
    },
};