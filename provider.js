'use strict';

const nearest = require('./nearest');

module.exports.providers = [
	require("./providers/se_skanetrafiken"),
	require("./providers/se_sl"),
	require("./providers/se_vasttrafik")
];

module.exports.parkingProviders = []
module.exports.stopProviders = []

for(let provider of module.exports.providers) {
    if(provider.Parking) {
        module.exports.parkingProviders.push(provider.Parking);
    }
    if(provider.Stop) {
        module.exports.stopProviders.push(provider.Stop);
    }
}

module.exports.countries = {
    "SE" : {
        "en" : "Sweden"
    }
}


module.exports.getSortedStopProviders = async function() {
    return nearest.sortedByNearest(module.exports.stopProviders);
}

module.exports.getStopProvider = function(providerType) {
    for(let p of module.exports.providers) {
        if(p.Stop && p.Stop.id == providerType) {
            return p.Stop;
        }
    }
    throw Error("Missing stop provider '" + providerType + "'");
}
module.exports.getParkingProvider = function(providerType) {
    for(let p of module.exports.providers) {
        if(p.Parking && p.Parking.id == providerType) {
            return p.Parking;
        }
    }
    throw Error("Missing parking provider '" + providerType + "'");
}