'use strict';

const Homey = require('homey');
const provider = require('../../provider');

class TransitStop extends Homey.Device {
	
	onInit() {
		this.log('TransitStop has been inited');
		this.provider = provider.getStopProvider(this.getData().provider);
		console.log(this.getData());
		console.log(this.provider);
		let pollInterval = this.provider.stopPollInterval || 60000;
		console.log("Polling every " + pollInterval + " ms");
		setTimeout(this.onPoll.bind(this), 500);
		setInterval(this.onPoll.bind(this), pollInterval);
	}
	
	async onPoll() {
		console.log("Polling transit stop");
		let sett = this.getSettings();
		let departures = await this.provider.pollStop(sett.id, sett.track, sett.lines);
		if (departures.length > 0) {
			let departure = departures[0];
			this.setCapabilityValue('current_time_until_departure', departure.estimatedDeparture);
			this.setCapabilityValue('current_delay', departure.delay);
			this.setCapabilityValue('current_line', departure.line);
			this.setCapabilityValue('current_destination', departure.destination);
			this.setCapabilityValue('current_track', departure.track);
		} else {
			this.setCapabilityValue('current_time_until_departure', null);
			this.setCapabilityValue('current_delay', null);
			this.setCapabilityValue('current_line', null);
			this.setCapabilityValue('current_destination', null);
			this.setCapabilityValue('current_track', null);
		}
		if (departures.length > 1) {
			let departure = departures[1];
			this.setCapabilityValue('next_time_until_departure', departure.estimatedDeparture);
			this.setCapabilityValue('next_delay', departure.delay);
			this.setCapabilityValue('next_line', departure.line);
			this.setCapabilityValue('next_destination', departure.destination);
			this.setCapabilityValue('next_track', departure.track);
		} else {
			this.setCapabilityValue('next_time_until_departure', null);
			this.setCapabilityValue('next_delay', null);
			this.setCapabilityValue('next_line', null);
			this.setCapabilityValue('next_destination', null);
			this.setCapabilityValue('next_track', null);
		}
	}
}

module.exports = TransitStop;