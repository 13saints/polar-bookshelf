var assert = require('assert');

const {DocMeta} = require("./DocMeta");
const {DocMetas} = require("./DocMetas");
const {PageMeta} = require("./PageMeta");
const {Proxies} = require("../proxies/Proxies");

const {MetadataSerializer} = require("./MetadataSerializer");
const {assertJSON} = require("../test/Assertions");
const {TestingTime} = require("../test/TestingTime");

TestingTime.freeze();

describe('DocMetas', function() {

    describe('JSON', function() {

        it("Test basic JSON encoding and decoding", function () {

            let fingerprint = "0x001";

            let docMeta = DocMetas.createWithinInitialPagemarks(fingerprint, 14);
            DocMetas.addPagemarks(docMeta, {nrPages: 1, offsetPage: 4, percentage: 50})

            let json = MetadataSerializer.serialize(docMeta, "  ");

            let actual = MetadataSerializer.deserialize(new DocMeta(), json);

            assertJSON(docMeta, actual);

            assert.equal(actual instanceof DocMeta, true)


        });

        it("Test with default values for serialized data", function () {

            let json = "{}";

            let docMeta = DocMetas.deserialize(json);

            assert.equal(docMeta instanceof DocMeta, true);

        });



    });

    describe('Deserialize', function() {

        it("Test Deserializing and then updating some pagemarks", function () {

            let fingerprint = "0x001";

            let nrPages = 2;
            let docMeta = DocMetas.createWithinInitialPagemarks(fingerprint, nrPages);

            let json = DocMetas.serialize(docMeta, "  ");

            let expected = {
                "docInfo": {
                    "title": null,
                    "url": null,
                    "nrPages": 2,
                    "fingerprint": "0x001",
                    "lastOpened": null,
                    "progress": 0
                },
                "annotationInfo": {
                    "lastAnnotated": null
                },
                "pageMetas": {
                    "1": {
                        "pageInfo": {
                            "num": 1
                        },
                        "pagemarks": {
                            "0": {
                                "id": "12Vf1bAzeo",
                                "created": "2012-03-02T11:38:49.321Z",
                                "lastUpdated": "2012-03-02T11:38:49.321Z",
                                "type": "SINGLE_COLUMN",
                                "percentage": 100,
                                "column": 0,
                                "notes": {}
                            }
                        },
                        "textHighlights": {},
                        "areaHighlights": {}
                    },
                    "2": {
                        "pageInfo": {
                            "num": 2
                        },
                        "pagemarks": {
                            "0": {
                                "id": "12Vf1bAzeo",
                                "created": "2012-03-02T11:38:49.321Z",
                                "lastUpdated": "2012-03-02T11:38:49.321Z",
                                "type": "SINGLE_COLUMN",
                                "percentage": 100,
                                "column": 0,
                                "notes": {}
                            }
                        },
                        "textHighlights": {},
                        "areaHighlights": {}
                    }
                },
                "version": 1
            };

            assert.equal(typeof json, "string");

            assertJSON(json, expected);

            docMeta = DocMetas.deserialize(json);

            // now we have to trace it like it would be in production..
            docMeta = Proxies.create(docMeta).deepTrace();

            assertJSON(docMeta, expected);

            let pageMeta = docMeta.getPageMeta(1);

            pageMeta.pagemarks = {};

            assert.deepEqual(docMeta.getPageMeta(1).pagemarks, {})

        });

    });


});
