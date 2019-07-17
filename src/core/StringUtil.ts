/**
 * @class
 * String utilities
 */
export class StringUtil {
    /**
     * Combines an arbitrary set of paths ensuring that the slashes are normalized
     *
     * @param paths 0 to n path parts to combine
     */
    public static combinePaths(...paths: string[]): string {

        return paths
            .filter(path => typeof path !== "undefined" && path !== null)
            .map(path => path.replace(/^[\\|\/]/, "").replace(/[\\|\/]$/, ""))
            .join("/")
            .replace(/\\/g, "/");
    }

    /**
     * Gets a random string of chars length
     *
     * @param chars The length of the random string to generate
     */
    public static getRandomString(chars: number): string {
        const text = new Array(chars);
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < chars; i++) {
            text[i] = possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text.join("");
    }
    /**
     * Strip HTML tags from a string
     * @param input The input string. 
     * @param allowed You can use the optional second parameter to specify tags which should not be stripped.
     */
    public static stripTags (input, allowed='') : string 
    { 
        allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

        return input.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) =>
        {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }

    /**
     * Determines if a string is null or empty or undefined
     *
     * @param s The string to test
     */
    public static isNullOrEmpty(s: string): boolean {
        return typeof s === "undefined" || s === null || s === "";
    }
/**
 * Determines whether a string begins with the characters of a specified string.
 * @param str The input string. 
 * @param search Required. The string to search for
 * @param position Optional. Default 0. At which position to start the search
 */
    public static startsWith (str:string, search:string, position:number =0) : boolean 
    {
        if (str == null) {
            return false;
        }

        var string = String(str);
        var stringLength = string.length;
        
        var searchString = String(search);
        var searchLength = searchString.length;

        var pos = Number(position);
        if (pos != pos) { // better `isNaN`
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        // Avoid the `indexOf` call if no match is possible
        if (searchLength + start > stringLength) {
            return false;
        }
        var index = -1;
        while (++index < searchLength) {
            if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
                return false;
            }
        }
        return true;
    };
    
    public static contains(str:string, search:string, position:number =0):boolean
    {
            if (str == null) {
            return false;
        }

        var string = String(str);
        var stringLength = string.length;
        
        var searchString = String(search);
        var searchLength = searchString.length;

        var pos = Number(position);
        if (pos != pos) { // better `isNaN`
            pos = 0;
        }

        if (pos + searchLength > stringLength) {
            return false;
        } else {
            return string.toLowerCase().indexOf(searchString.toLowerCase(), pos) !== -1;
        }
    }

    public static format(value, ...args): string {
        try {
            return value.replace(/{(\d+(:.*)?)}/g, (match, i) =>{
                var s = match.split(':');
                if (s.length > 1) {
                    i = i[0];
                    match = s[1].replace('}', '');
                }

                var arg = StringUtil.formatPattern(match, args[i]);
                return typeof arg != 'undefined' && arg != null ? arg : "";
            });
        }
        catch (e) {
            return "";
        }
    }

    private static formatPattern(match, arg): string {
        switch (match) {
            case 'L':
                arg = arg.toLowerCase();
                break;
            case 'U':
                arg = arg.toUpperCase();
                break;
            default:
                break;
        }

        return arg;
    }
}