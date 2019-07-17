import {ITagStore} from './ITagStore';
/**
 * @interface
 * This interface serves as the state of the component TagEditor. 
 */
export interface ITagEditorState {
    editing?: number;
    caret?: number;
    repeat?: number;
    store?: ITagStore;
}