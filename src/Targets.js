var request = require('request-promise');
var cheerio = require('cheerio');
var extract = require('url-querystring');

var parseResults = (html) => {
    var $ = cheerio.load(html);
    var rows = $('.ResultsStat');
    var results = [];
    rows.each((i, elem) => {
        var row = $(elem);

        var speciesContent = row.find('.SpecimenHeader').contents();
        var speciesName = speciesContent.eq(0).text().replace(/[\t\n]/g, '');

        let frequency = parseFloat(row.find('.Stat-count').text().replace(/[\t\n]/g, ''));
        let mapLocation = row.find('.ResultsStat-action a').attr('href');
        let paths = extract(mapLocation).url.split('/');
        let speciesCode = paths[paths.length - 1];

        results.push({
            species: {
                name: speciesName,
                code: speciesCode,
            },
            frequency,
            map: `http://ebird.org${mapLocation}`,
        });
    });

    return results;
};

module.exports = {
    species: function(options) {
        return request({
            uri: 'http://ebird.org/ebird/targets',
            qs: {
                r1: options.location,
                bmo: options.startMonth,
                emo: options.endMonth,
                r2: options.locationFilter,
                t2: options.timeFilter,
            },
            headers: {
                'Cookie': `EBIRD_SESSIONID=${this.session}`
            }
        }).then(parseResults);
    },
};
