'use strict';

class SL {
    constructor() {
        this.country = 'SE';
        this.backColor = '#00adef';
        this.foreColor = '#ffffff';
        this.title = 'SL';
        this.id = this.image = 'se_sl';
        this.latitude = 59.3293;
        this.longitude = 18.0686;
        this.stopPollInterval = 10000;
    }
}

module.exports.Stop = new SL();
