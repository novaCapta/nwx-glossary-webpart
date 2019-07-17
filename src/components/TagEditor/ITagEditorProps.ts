import {ITagStore} from './ITagStore';
/**
 * @interface
 * This interface serves as the react component properties which gets
	passed to the component TagEditor.
 */
export interface ITagEditorProps {

  label?: string;
  tags?: string[];
  delimiters: any[];
  placeholder?:string;
  emptyErrorMessage?:string;
  repeatErrorMessage?:string;
  validate?:(currentTag, tags)=>string | PromiseLike<string>;
  onChange?:(tagsChanged, allTags, action)=>void;
  onError?:(error)=>void;
  store?: ITagStore;
}