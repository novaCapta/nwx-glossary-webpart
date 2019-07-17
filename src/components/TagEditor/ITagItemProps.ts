/**
 * @interface
 * This interface serves as the react component properties which gets
	passed to the component TagItem.
 */
export interface ITagItemProps {

    active?:boolean;
    error?:boolean;
    caret?:number;
    onSave: (tag, text?)=>void;
    onFocus: (tag?)=>void;
    onBlur: (tag, caretOnBlur?, lastKeyOnBlur?)=>void;
    onRemove: (tag?)=>void;
    onSplit: (tag, textBeforeCaret?, textAfterCaret?)=>void;
    delimiterKeys?: string[];
    delimiterChars?: string[];
    key:string;
}