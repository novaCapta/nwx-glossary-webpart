/**
 * @interface
 * This interface serves as the state of the component QuillText. 
 */
export interface IQuillTextState {
  value?: string;
  isFocused?: boolean;
  editor?:any;
  fallback?:boolean;
}