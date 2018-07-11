const {SerializedObject} = require("./SerializedObject.js");
const {ISODateTime} = require("./ISODateTime");

/**
 * An object with created and lastUpdated fields.
 *
 * @abstract
 */
class TemporalObject extends SerializedObject {

    constructor(val) {

        super(val);

        /**
         * The time this annotation was created
         * @type ISODateTime
         */
        this.created = null;

        /**
         * The last time this annotation was updated (note changed, moved, etc).
         * @type ISODateTime
         */
        this.lastUpdated = null;

        this.init(val);

    }

    setup() {
        super.setup();

        if(!this.lastUpdated && this.created) {
            this.lastUpdated = this.created;
        }

    }

    validate() {

        super.validate();

        if(!this.created) {
            throw new Error("Created is required");
        }

        // FIXME: move this to validateMembers
        if(!this.created instanceof ISODateTime) {
            throw new Error("Member created has wrong type: " + typeof this.created);
        }

        if(!this.lastUpdated instanceof ISODateTime) {
            throw new Error("Member lastUpdated has wrong type: " + typeof this.lastUpdated);
        }

    }

}

module.exports.TemporalObject = TemporalObject;
