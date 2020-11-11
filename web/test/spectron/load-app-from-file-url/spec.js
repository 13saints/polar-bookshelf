"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebDriverTestResultReader_1 = require("../../../js/test/results/reader/WebDriverTestResultReader");
const Spectron_1 = require("../../../js/test/Spectron");
const assert = require('assert');
const { Functions } = require("polar-shared/src/util/Functions");
describe('example-test', function () {
    Spectron_1.Spectron.setup(__dirname);
    this.timeout(10000);
    it('shows an basic initial window', function () {
        return __awaiter(this, void 0, void 0, function* () {
            assert.equal(yield this.app.client.getWindowCount(), 1);
            let testResultReader = new WebDriverTestResultReader_1.WebDriverTestResultReader(this.app);
            assert.equal(yield testResultReader.read(), true);
        });
    });
});
//# sourceMappingURL=spec.js.map