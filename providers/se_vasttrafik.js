'use strict';

const resplan_url = 'https://api.vasttrafik.se/bin/rest.exe/v2';

const nearest = require('../nearest');
const fetch = require("node-fetch");
const Homey = require('homey');

const API_KEY = Homey.env.VASTTRAFIK_API_KEY;

class Vasttrafik {
    constructor() {
        this.country = 'SE';
        this.backColor = '#009ddb';
        this.foreColor = '#ffffff';
        this.title = 'Västtrafik';
        this.id = this.image = 'se_vasttrafik';
        this.latitude = 57.7089;
        this.longitude = 11.9746;
        this.lastToken = null;
        this.lastTokenTime = null;
        this.stopPollInterval = 10000;
    }

    async getToken() {
        if(!this.lastToken || (new Date() - this.lastTokenTime) > 60000) {
            console.log("Refreshing token");
            this.lastTokenTime = new Date();
            const response = await fetch("https://api.vasttrafik.se:443/token", {
                method: "POST",
                body: "grant_type=client_credentials",
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'Authorization': 'Basic ' + API_KEY
                }
            });
            this.lastToken = (await response.json()).access_token;
        }
        return this.lastToken;
    }

    async getStops(text) {
        let token = await this.getToken();
        var response;
        if(!text || text.length < 2) {
            let loc = await nearest.getCurrentLocation();
            response = await fetch(resplan_url + "/location.nearbystops?format=json&originCoordLat="+loc.latitude+"&originCoordLong="+loc.longitude, {
                headers: { 
                    'Authorization': 'Bearer ' + token
                }
            });
        } else {
            response = await fetch(resplan_url + "/location.name?format=json&input=" + encodeURIComponent(text), {
                headers: { 
                    'Authorization': 'Bearer ' + token
                }
            });
        }
        let result = (await response.json()).LocationList.StopLocation;
        let filteredResult = []
        let allObjs = {}
        for(let stop of result) {
            if(!stop.track) {
                let val = {id: stop.id, title: stop.name, latitude: stop.lat, longitude: stop.lon, tracks: []};
                filteredResult.push(val);
                allObjs[stop.name] = val;
            }
        }for(let stop of result) {
            if(stop.track) {
                if(allObjs[stop.name])
                    allObjs[stop.name].tracks.push({track: stop.track, latitude: stop.lat, longitude: stop.lon, id: stop.id})
            }
        }
        return nearest.sortedByNearest(filteredResult);
    }

    async getTracks(stopData) {
        return stopData.tracks
    }

    async getLines(stopData, trackData) {
        var id;
        if(trackData && trackData.id)
            id = trackData.id;
        else
            id = stopData.id;

        let token = await this.getToken();
        let date = new Date().toISOString().substr(0, 10);
        let response = await fetch(resplan_url + "/departureBoard?format=json&date=" + date + "&time=00%3A00&timeSpan=1440&maxDeparturesPerLine=1&id=" + id, {
            headers: { 
                'Authorization': 'Bearer ' + token
            }
        });
        let retObj = await response.json();
        console.log(retObj);
        let result = [];
        let exist = {};
        for (let dep of retObj.DepartureBoard.Departure) {
            let ret = {title: dep.sname};
            if(dep.type == "TRAM")
                ret.type = "tram";
            else if(dep.type == "VAS" || dep.type == "LDT" || dep.type == "REG")
                ret.type = "train";
            else if(dep.type == "BOAT")
                ret.type = "boat";
            else
                ret.type = "bus";
            if(!exist[ret.title]) {
                exist[ret.title] = true;
                result.push(ret);
            }
        }
        console.log(result);
        return result;
    }

    async pollStop(stopId, trackId, lines) {
        let id = trackId ? trackId : stopId;
        let token = await this.getToken();
        let date = new Date().toLocaleDateString('sv-SE');
        let time = encodeURIComponent(new Date().toLocaleTimeString('sv-SE')/*.substr(5)*/);
        let response = await fetch(resplan_url + "/departureBoard?format=json&date=" + date + "&time=" + time + "&id=" + id, {
            headers: { 
                'Authorization': 'Bearer ' + token
            }
        });
        let retObj = await response.json();
        let result = [];
        let lineFilter = "," + lines + ",";
        for (let dep of retObj.DepartureBoard.Departure) {
            if(lineFilter != ",," && lineFilter.indexOf("," + dep.sname + ",") < 0) continue;
            console.log(dep);
            let ret = {line: dep.sname};
            let sched = new Date(dep.date + " " + dep.time);
            let est = new Date(dep.rtDate + " " + dep.rtTime);
            ret.delay = (est - sched) / 60000.0;
            ret.estimatedDeparture = (est - new Date()) / 60000.0;
            if(ret.estimatedDeparture < 0) ret.estimatedDeparture = 0;
            ret.track = dep.track;
            ret.destination = dep.direction;
            result.push(ret);
            if(result.length >= 2) break;
        }
        console.log(result);
        return result;
    }
}

module.exports.Stop = new Vasttrafik();
module.exports.Parking = new Vasttrafik();
