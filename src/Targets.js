var request = require('request-promise');
var cheerio = require('cheerio');

var parseResults = (html) => {
    var $ = cheerio.load(html);
    var trs = $('#targets-results .ResultsStats');
    var results = [];
    trs.each((i, elem) => {
        var tr = $(elem);
        var speciesName = tr.find('.ResultsStats-title a').text();
        var scientificName = tr.find('.ResultsStats-title a em').text();
        speciesName = speciesName.replace(scientificName, '').trim();
        var speciesCode = tr.find('.ResultsStats-title a').attr('data-species-code');

        let frequency = parseFloat(tr.find('.ResultsStats-stats').attr('title'));
        let mapLocation = tr.find('.ResultsStats-action a').attr('href');

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
    species: function (options) {
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
                Cookie: `EBIRD_SESSIONID=${this.session}`,
            },
        }).then(parseResults);
    },
};
