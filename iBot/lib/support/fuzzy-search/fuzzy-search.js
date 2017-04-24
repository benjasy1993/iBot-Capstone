"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fuzzySearch(needle, haystack) {
    var haystackLength = haystack.length;
    var needleLength = needle.length;
    if (needleLength > haystackLength) {
        return false;
    }
    else if (needleLength === haystackLength) {
        return needle === haystack;
    }
    outer: for (var i = 0, j = 0; i < needleLength; i++) {
        var nch = needle.charCodeAt(i);
        while (j < haystackLength) {
            if (haystack.charCodeAt(j++) === nch) {
                continue outer;
            }
        }
        return false;
    }
    return true;
}
exports.fuzzySearch = fuzzySearch;
