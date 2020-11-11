"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocInfo = void 0;
const SerializedObject_1 = require("./SerializedObject");
const PagemarkType_1 = require("polar-shared/src/metadata/PagemarkType");
const Preconditions_1 = require("polar-shared/src/Preconditions");
class DocInfo extends SerializedObject_1.SerializedObject {
    constructor(val) {
        super();
        this.progress = 0;
        this.pagemarkType = PagemarkType_1.PagemarkType.SINGLE_COLUMN;
        this.properties = {};
        this.archived = false;
        this.flagged = false;
        this.tags = {};
        this.attachments = {};
        this.nrPages = val.nrPages;
        this.fingerprint = val.fingerprint;
        this.init(val);
    }
    setup() {
        this.progress = Preconditions_1.Preconditions.defaultValue(this.progress, 0);
        this.pagemarkType = this.pagemarkType || PagemarkType_1.PagemarkType.SINGLE_COLUMN;
        this.properties = Preconditions_1.Preconditions.defaultValue(this.properties, {});
    }
    validate() {
        Preconditions_1.Preconditions.assertNumber(this.nrPages, "nrPages");
        Preconditions_1.Preconditions.assertPresent(this.fingerprint, "fingerprint");
    }
}
exports.DocInfo = DocInfo;
//# sourceMappingURL=DocInfo.js.map