'use strict';

const Homey = require('homey');

class TransitApp extends Homey.App {
	
	async onInit() {
		this.log('TransitApp is running...');
	}
	
}

module.exports = TransitApp;