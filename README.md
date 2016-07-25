# ebird

This package is an api to ebird data.  It uses web scrapers to pull data from the ebird site.

## Installation

```
    npm install ebird
```

## Usage

```javascript
var ebird = require('ebird');

// Create a new instance of the ebird api.
var instance = new ebird();

// Authorize with an ebird username and password
instance.auth(username, password).then(() => {
    // Once authorized, query for regions or another metric.  
    instance.regions().then(results => {
        console.log('Regions', JSON.stringify(results));
    });

    // Request countries in paralle with regions.
    instance.countries().then(results => {
        console.log('Counties', JSON.stringify(results));
    });
});
```

## API

### constructor `ebird(opt_sessionToken)`
Constructs an instance of the ebird api.  `var instance = new ebird();`  If you have a ebird session token you can pass that in the constructor `var instance = new ebird(sessionToken);`.

### `auth(username, password) returns sessionToken`
Authenticates an ebird instance.  Returns a session token so you can skip full auth when using a different ebird instance.  Ebird uses phantom js to log in, which can be flaky.  To receive better reliability save the session token between uses to avoid instantiating phantom js.

### totals
### `totals.regions()` `totals.countries()` `totals.states()` `totals.counties()`
This functions all work the same.  They return a personal list of counts for a user for the given location.

```javascript
{
    "name": place_name,
    "code": ebird_code,
    "items":[
        {
            "number": count,
            "time": time_frame_string,
        }
        ...
    ]
```

### lists
### `list(ebird_code, time_frame_string, opt_year)`
Retrieves an array of objects for a bird list.

```javascript
// Example response. ebird.list('US-CA', 'life');
[
    {
        commonName: "Black-bellied Whistling-Duck",
        date: "24 Apr 2015",
        location: "Baytown Nature Center (UTC 039)",
        rowNumber: "1",
        scientificName: "Dendrocygna autumnalis",
        sp: "US-TX",
        speciesCode: "bbwduc",
    },
    ...
]
```


### alerts
### `alerts.needs(code)` `alerts.rarities(code)`
Returns an array of sightings for either a needs or a rarities list.

```javascript
{
    species: {
        name: 'Pin-tailed Whydah ',
        scientificName: 'Vidua macroura'
    },
    confirmed: true,
    count: '1',
    date: 'Apr 2, 2016 08:40',
    location: {
        name: 'Peck Rd. Water Conservation Park ',
        lat: '34.10053',
        long: '-118.01333'
    },
    checklist: 'http://ebird.org/ebird/view/checklist?subID=SUB_ID',
    county: 'Los Angeles',
    state: 'California, United States',
    observer: 'eBirder User',
    details: '',
}
```

### targets
### `targest.species(options)`
Returns an array of species and frequencies for a user's target birds
#### Options
```javascript
location: Location Code.
startMonth: Month number 1-12.
endMonth: Month number 1-12.
locationFilter: Location code, 'aba', or 'world'.
timeFilter: 'life', 'year', 'month', or 'day'.
```
#### Results
```javascript
{
    species: {
        name: 'Yellow Warbler',
        code: 'yelwar'
    },
    frequency: 5.77985
}
```


