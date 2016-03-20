# ebird

This package is an api to ebird data.  It uses web scrapers to pull data from the ebird site.

## Installation

```
    npm install ebird
```

## Usage

```
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

### constructor `ebird()`
Constructs an instance of the ebird api.  `var instance = new ebird();`

### `auth(username, password)`
Authenticates an ebird instance

### totals
### `totals.regions()` `totals.countries()` `totals.states()` `totals.counties()`
This functions all work the same.  They return a personal list of counts for a user for the given location.

```
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

```
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




