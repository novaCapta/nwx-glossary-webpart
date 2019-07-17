import * as React from 'react';
/**
 * @interface
 * This interface serves as the react component properties which gets
	passed to the component QuillText.
 */
export interface IQuillTextProps extends React.HTMLProps<HTMLInputElement | HTMLTextAreaElement> {

    label?: string;
    className?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    theme: string;
    onChanged?: (newValue: any) => void;
    insertImageWithUrl?: boolean;

}
