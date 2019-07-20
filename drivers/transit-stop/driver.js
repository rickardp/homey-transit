'use strict';

const Homey = require('homey');
const provider = require('../../provider');

class TransitStopDriver extends Homey.Driver {

	onInit() {
	}

	onPair( socket ) {
		console.log("Begin add new transit stop");
		let providers = {};
		var current_provider = null;
		var current_stop = null;
		var current_track = null;
		var current_lines = '';
		var stops_data = null;
		var tracks_data = null;
		socket.on('get_providers', async function( data, callback ) {
			console.log("get_providers");
			let result = await provider.getSortedStopProviders();
			for(let prov of result) {
				if(!current_provider) current_provider = prov.id;
				providers[prov.id] = prov;
			}
			callback( null, result );
		});
		socket.on('select_provider', async function( data, callback ) {
			console.log("select_provider: " + data);
			current_provider = data;
			callback( null, null );
		});
		socket.on('get_stops', async function( data, callback ) {
			console.log(data);
			if(data.trim) {
				data = data.trim();
			} else {
				data = "";
			}
			console.log("get_stops: " + data);
			console.log("current provider is " + current_provider);
			
			data = (data || "").trim();
			let stops = await providers[current_provider].getStops(data);
			stops_data = {};
			for(let stop of stops) {
				if(!current_stop) current_stop = stop.id;
				stops_data[stop.id] = stop;
			}
			//for(let stop of stops_data)
			//	console.log(stop);
			callback( null, stops );
		});
		socket.on('select_stop', async function( data, callback ) {
			console.log("select_stop: " + data);
			current_stop = data;
			callback( null, null );
		});
		socket.on('get_tracks', async function( data, callback ) {
			console.log("get_tracks: " + data);
			console.log("current stop ID is " + current_stop);
			console.log("current stop is " + stops_data[current_stop]);
			
			let tracks = await providers[current_provider].getTracks(stops_data[current_stop]);
			tracks_data = {};
			for(let track of tracks) {
				tracks_data[track.id] = track;
			}
			callback( null, tracks );
		});
		socket.on('select_track', async function( data, callback ) {
			if(!data.trim) data = null;
			console.log("select_track: " + data);
			current_track = data;
			callback( null, null );
		});
		socket.on('get_lines', async function( data, callback ) {
			console.log("get_lines: " + data);
			
			let lines = await providers[current_provider].getLines(stops_data[current_stop], current_track ? tracks_data[current_track] : null);
			
			callback( null, lines );
		});
		socket.on('select_lines', async function( data, callback ) {
			if(!data.trim) data = '';
			console.log("select_lines: " + data);
			current_lines = data;
			callback( null, null );
		});
		socket.on('create_device', async function( data, callback ) {
			console.log("create_device: " + data);
			callback( null, {
				name: stops_data[current_stop].title,
				data: {
					provider: current_provider
				},
				settings: {
					id: stops_data[current_stop].id,
					track: current_track ? tracks_data[current_track].id : '',
					lines: current_lines
				},
				store: {}
			} );
		});
	}
	
}

module.exports = TransitStopDriver;