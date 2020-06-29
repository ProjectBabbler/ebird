// TODO: Update for new ebird pages.

var request = require('request-promise');
var cheerio = require('cheerio');
var extract = require('url-querystring');

var parseResults = (html) => {
    var $ = cheerio.load(html);
    var trs = $('#sightingsTable tbody tr');
    var results = [];
    trs.each((i, elem) => {
        var tr = $(elem);
        if (tr.hasClass('obs-details-toggler')) {
            // We're looking at details toggler
            return;
        } else if (tr.hasClass('obs-details')) {
            // We're looking at details
            var text = tr.text();
            text = text.replace(/[\t\n]/g, '');
            var last = results.pop();
            last.details = text;
            results.push(last);
        } else {
            var speciesContent = tr.find('td.species-name').contents();
            var speciesName = speciesContent.eq(0).text();
            var scientificName = speciesContent.eq(1).text();
            var confirmed = true;
            if (speciesContent.length >= 3) {
                confirmed = speciesContent.eq(2).hasClass('unconfirmed') ? false : true;
            }

            var count = tr.find('td.count').text();

            var dateContents = tr.find('td.date').contents();
            var date = dateContents.eq(0).text();
            var checkListHref = dateContents.eq(1).attr('href');
            var checklistUrl = `http://ebird.org${checkListHref}`;

            var locationContents = tr.find('td.location').contents();
            var location = locationContents.eq(0).text();
            var latLongUrl = locationContents.eq(1).attr('href');
            var latLong;
            if (latLongUrl) {
                latLong = extract(latLongUrl).qs.q.split(',');
            }

            var county = tr.find('td.county').text();
            var state = tr.find('td.state').text();
            var observer = tr.find('td.observer').text();
            observer = observer.replace(/[\t\n]/g, '');

            if (speciesName) {
                results.push({
                    species: {
                        name: speciesName,
                        scientificName,
                    },
                    confirmed,
                    count,
                    date,
                    location: {
                        name: location,
                        lat: latLong ? latLong[0] : null,
                        long: latLong ? latLong[1] : null,
                    },
                    checklist: checklistUrl,
                    county,
                    state,
                    observer,
                });
            }
        }
    });

    return results;
};

module.exports = {
    needs: function (code) {
        return request({
            uri: 'http://ebird.org/ebird/alert/createNeeds',
            qs: {
                _t2: 'on',
                r1: code,
                rtype1: null,
                rtype2: null,
                r2: null,
                action: 'view',
            },
            headers: {
                Cookie: `EBIRD_SESSIONID=${this.session}`,
            },
        }).then(parseResults);
    },

    rarities: function (code) {
        return request({
            uri: 'http://ebird.org/ebird/alert/createRba',
            qs: {
                action: 'view',
                regionCode: code,
            },
            headers: {
                Cookie: `EBIRD_SESSIONID=${this.session}`,
            },
        }).then(parseResults);
    },
};
