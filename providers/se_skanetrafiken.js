'use strict';

class Skanetrafiken {
    constructor() {
        this.country = 'SE';
        this.backColor = '#E30613';
        this.foreColor = '#ffffff';
        this.title = 'Skånetrafiken';
        this.id = this.image = 'se_skanetrafiken';
        this.latitude = 55.6050;
        this.longitude = 13.0038;
        this.stopPollInterval = 10000;
    }
}

module.exports.Stop = new Skanetrafiken();
