const {Clock} = require("./Clock.js");

class SyntheticClock extends Clock {

    getDate() {
        return new Date(Date.parse("2018-05-30T02:47:44.411Z"));
    }

}

module.exports.SyntheticClock = SyntheticClock;
