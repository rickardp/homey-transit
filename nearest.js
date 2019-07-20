"use strict";

const { HomeyAPI } = require('athom-api');

async function getCurrentLocation() {
    let api = await HomeyAPI.forCurrentHomey();
    let loc = await api.geolocation.getOptionLocation();
    return loc.value;
}

module.exports.getCurrentLocation = getCurrentLocation;

function haversine(p1, p2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }    
    var dLat = toRad(p2.latitude - p1.latitude);
    var dLon = toRad(p2.longitude - p1.longitude)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(p1.latitude)) * Math.cos(toRad(p2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = 6371 * c;    
    return d;
}

module.exports.sortedByNearest = async function(items, getLoc) {
    let loc = await getCurrentLocation();
    let result = [];
    for(let item of items) result.push(item);
    if(!getLoc) getLoc = item => item;
    function getDistance(a) {
        return haversine(getLoc(a), loc);
    }
    result.sort(function(a, b) {
        let aDist = getDistance(a);
        let bDist = getDistance(b);
        if(aDist < bDist) return -1;
        if(aDist > bDist) return 1;
        return 0;
    });
    return result;
}