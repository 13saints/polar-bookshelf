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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const Files_1 = require("polar-shared/src/util/Files");
const Spectron_1 = require("../../js/test/Spectron");
const path = require('path');
describe('Open specific PDF file from command line', function () {
    this.timeout(30000);
    const examplePDF = path.join(__dirname, "../../../docs/example.pdf");
    Spectron_1.Spectron.setup(path.join(__dirname, '../../..'), examplePDF);
    xit('PDF file loads', function () {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.default.ok(yield Files_1.Files.existsAsync(examplePDF));
            const client = this.app.client;
            console.log("OK.. both windows are up.");
            yield this.app.client.waitUntilTextExists('.textLayer', 'Trace-based Just-in-Time', 10000);
            return true;
        });
    });
});
//# sourceMappingURL=spec.js.map