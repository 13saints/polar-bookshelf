"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const TextType_1 = require("polar-shared/src/metadata/TextType");
const VersionedObject_1 = require("./VersionedObject");
const Texts_1 = require("polar-shared/src/metadata/Texts");
class Note extends VersionedObject_1.VersionedObject {
    constructor(val) {
        super(val);
        this.content = val.content;
        this.init(val);
    }
    setup() {
        if (!this.content) {
            this.content = Texts_1.Texts.create("", TextType_1.TextType.HTML);
        }
    }
    validate() {
        if (!this.created) {
            throw new Error("The field `created` is required.");
        }
    }
}
exports.Note = Note;
//# sourceMappingURL=Note.js.map