export function fuzzySearch(needle: string, haystack: string): boolean {
    const haystackLength = haystack.length;
    const needleLength = needle.length;

    if (needleLength > haystackLength) {
        return false;
    } else if (needleLength === haystackLength) {
        return needle === haystack;
    }

    outer: for (let i = 0, j = 0; i < needleLength; i++) {
        const nch = needle.charCodeAt(i);

        while (j < haystackLength) {
            if (haystack.charCodeAt(j++) === nch) {
                continue outer;
            }
        }

        return false;
    }

    return true;
}