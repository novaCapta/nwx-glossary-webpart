/**
 * @class
 * Utility with methods for tag editor component
 */
export class TagUtil {

    public static autoSize(element) 
    {
        var mirror = document.querySelector('.tag-editor-mirror');
        if (!mirror) {
            mirror = document.createElement('div');
            mirror.setAttribute('class', 'tag-editor-mirror');
            document.body.appendChild(mirror);
        }
        mirror.textContent = element.value;
        element.style.width = getComputedStyle(mirror).width;
    }

    public static getCharcode(e) 
    {
        var charCode = e.charCode;
        return (typeof charCode === "number" && charCode !== 0 )? charCode: e.keyCode;
    }

    public static setCaretPos(inputNode, pos) 
    {
        if (inputNode.setSelectionRange) {
            inputNode.setSelectionRange(pos, pos);
        } else if (inputNode.createTextRange) {
            inputNode.createTextRange().move('character', pos);
        }
        inputNode.focus();
    }

    public static getCaretPos(inputNode) 
    {
        const range:any = document.getSelection().getRangeAt(0);
        return 'selectionStart' in inputNode? inputNode.selectionStart: Math.abs(range.moveStart('character', -inputNode.value.length));
    }

    public static uuid() {
        var i, random;
        var uuid = '';
        for (i = 0; i < 32; i++) 
        {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
            .toString(16);
        }
        return uuid;
    }

    public static error(name, message) : Error
    {
        var error = new Error(message);
        error.name = name;
        return error;
    }
}

export const KEYS = 
{
    BACKSPACE: 8,
    LEFT: 37,
    RIGHT: 39
};

export var ERROR = {
    EMPTY: 'TagEmptyError',
    REPEAT: 'TagRepeatError'
};

export var ERROR_MSG = {
    'TagEmptyError': 'Tag should not be empty',
    'TagRepeatError': 'Tag should be unique'
};