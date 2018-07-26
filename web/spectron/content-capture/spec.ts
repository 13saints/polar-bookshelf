import {WebDriverTestResultReader} from '../../js/test/results/reader/WebDriverTestResultReader';
import {assertJSON} from '../../js/test/Assertions';

const assert = require('assert');
const {Functions} = require("../../js/util/Functions");
const {Spectron} = require("../../js/test/Spectron");

const TIMEOUT = 10000;

describe('content-capture', function () {

    this.timeout(TIMEOUT);

    Spectron.setup(__dirname);

    it('capture basic document', async function () {

        console.log("mocha: Waiting for first window");

        //assert.equal(await this.app.client.getWindowCount(), 2); // FIXME: is the second the tools window?

        console.log("mocha: Got first window!");

        let webDriverTestResultReader = new WebDriverTestResultReader(this.app);

        let result = await webDriverTestResultReader.read();

        console.log("mocha: result in mocha is: " ,result);

        let expected = {
            "capturedDocuments": {
                "file:///home/burton/projects/polar-bookshelf/web/spectron/content-capture/app.html": {
                    "content": "<html><head><base href=\"file:///home/burton/projects/polar-bookshelf/web/spectron/content-capture/app.html\"></head><body>\n\n<p>\n    This is some content.\n</p>\n\n\n\n\n\n</body></html>",
                    "contentTextLength": 177,
                    "href": "file:///home/burton/projects/polar-bookshelf/web/spectron/content-capture/app.html",
                    "mutations": {
                        "baseAdded": false,
                        "cleanupBase": {
                            "baseAdded": true,
                            "existingBaseRemoved": false
                        },
                        "cleanupHead": {
                            "headAdded": false
                        },
                        "cleanupRemoveScripts": {
                            "scriptsRemoved": 1
                        },
                        "eventAttributesRemoved": 0,
                        "existingBaseRemoved": false,
                        "javascriptAnchorsRemoved": 0,
                        "showAriaHidden": 0
                    },
                    "scrollBox": {
                        "height": 0,
                        "width": 0
                    },
                    "scrollHeight": 0,
                    "title": "",
                    "url": "file:///home/burton/projects/polar-bookshelf/web/spectron/content-capture/app.html"
                }
            },
            "scroll": {
                "height": 575,
                "width": 800
            },
            "title": "",
            "type": "chtml",
            "url": "file:///home/burton/projects/polar-bookshelf/web/spectron/content-capture/app.html",
            "version": "3.0.0"
        };

        assertJSON(result, expected);

    });

});
