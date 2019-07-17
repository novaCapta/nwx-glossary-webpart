    /**
     * makes a trick with <a> tag.
     * .search returns query string
     * .host returns host
     * etc.
     * @param url
     * @returns {*}
     */
    export function anchorWithHref(url: string): HTMLAnchorElement {
        var parser = document.createElement('a');
        parser.href = url;
        return parser;
    }

    /**
     * gets query parameter by name from query string
     * @param search - query string
     * @param name - name of the parameter
     * @returns {string}
     */
    export function queryParameterByNameFromQueryString(search: string, name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    /**
     * get parameter from query string by name
     * @param url
     * @param name - name of the parameter
     * @returns {string}
     */
    export function queryParameterByName(url: string, name: string) {
        return queryParameterByNameFromQueryString(anchorWithHref(url).search, name);
    }