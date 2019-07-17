import {ITag} from './ITag';
/**
 * @interface
 * This interface serves as the react component properties which gets
	passed to the component TagStore.
 */
export interface ITagStore {

    tags:ITag[];
    add(text, cb?): void;
    validate(tagToSave, text): string | PromiseLike<string>;
    save(tagToSave, text, cb?) : void;
    remove(tag):void; 
    insertAfterTag(tag, text, cb?) :void;
    output(): void;
    subscribe(fn):void;
    index(text):number;
}