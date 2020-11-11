"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Styles = void 0;
const Preconditions_1 = require("polar-shared/src/Preconditions");
const Optional_1 = require("polar-shared/src/util/ts/Optional");
const Strings_1 = require("polar-shared/src/util/Strings");
class Styles {
    static parsePX(value) {
        Preconditions_1.Preconditions.assertNotNull(value, "value");
        if (Strings_1.Strings.empty(value)) {
            throw new Error("Empty string given");
        }
        return parseInt(value.replace("px", ""));
    }
    static positioning(element) {
        const result = {
            left: undefined,
            top: undefined,
            right: undefined,
            bottom: undefined,
            width: undefined,
            height: undefined,
        };
        Object.keys(result).forEach(key => {
            if (result.hasOwnProperty(key)) {
                result[key] = Optional_1.Optional.of(element.style.getPropertyValue(key))
                    .filter(current => current !== null && current !== undefined)
                    .map((current) => current.toString())
                    .filter(current => current !== null && current !== "")
                    .getOrUndefined();
            }
        });
        return result;
    }
    static positioningToPX(positioning) {
        let result = {
            left: undefined,
            top: undefined,
            right: undefined,
            bottom: undefined,
            width: undefined,
            height: undefined,
        };
        for (let key in positioning) {
            if (!positioning.hasOwnProperty(key)) {
                continue;
            }
            result[key] = Optional_1.Optional.of(positioning[key])
                .map(current => Styles.parsePX(current))
                .getOrUndefined();
        }
        return result;
    }
}
exports.Styles = Styles;
//# sourceMappingURL=Styles.js.map