
// https://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript

module.exports.Event = class {

    constructor(name) {
        this.name = name;
        this.callbacks = [];
    }

    registerCallback(callback){
        this.callbacks.push(callback);
    }

    getCallbacks() {
        return this.callbacks;
    }

};
