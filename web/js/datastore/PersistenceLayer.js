
const {Datastore} = require("./Datastore.js");
const {MetadataSerializer} = require("../metadata/MetadataSerializer");
const {DocMeta} = require("../metadata/DocMeta");
const {DocMetas} = require("../metadata/DocMetas");
const {DocMetaDescriber} = require("../metadata/DocMetaDescriber");

const fs = require("fs");
const os = require("os");
const util = require('util');

/**
 * First layer before the raw datastore. At one point we allowed the datastore
 * to perform all the data manipulation / serialization but we ran into problems
 * with node+chrome behaving differently so now we just make node work with raw
 * strings.
 */
module.exports.PersistenceLayer = class {

    /**
     */
    constructor(datastore) {
        /**
         * @type Datastore
         */
        this.datastore = datastore;
    }

    async init() {
        await this.datastore.init();
    }

    /**
     * Get the DocMeta object we currently in the datastore for this given
     * fingerprint or null if it does not exist.
     */
    async getDocMeta(fingerprint) {
        let data = await this.datastore.getDocMeta(fingerprint);

        if(!data)
            return null;

        if(! (typeof data === "string")) {
            throw new Error("Expected string and received: " + typeof data);
        }

        return DocMetas.deserialize(data);
    }

    /**
     * Convenience method to not require the fingerprint.
     */
    async syncDocMeta(docMeta) {
        return this.sync(docMeta.fingerprint, docMeta);
    }

    /**
     * Write the datastore to disk.
     */
    async sync(fingerprint, docMeta) {

        if(! docMeta instanceof DocMeta) {
            throw new Error("Can not sync anything other than DocMeta.")
        }

        // NOTE that we always write the state with JSON pretty printing.
        // Otherwise tools like git diff , etc will be impossible to deal with
        // in practice.
        let data = DocMetas.serialize(docMeta, "  ");
        await this.datastore.sync(fingerprint, data);

    }

};
