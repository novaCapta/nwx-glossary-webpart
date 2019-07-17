import {ITag} from './ITag';
import {ITagStore} from './ITagStore';
import {TagUtil, ERROR, ERROR_MSG} from './TagUtil';
import {ITagEditorProps} from './ITagEditorProps';
import {StringUtil} from '../../core/StringUtil';

/**
 * @class
 * Component for storing, retrieving and searching tags in the tag editor component
 */
export class TagStore  implements ITagStore
{
    public tags:ITag[];
    private options:ITagEditorProps;
    private listeners:any[];

    constructor(options)
    {
        this.tags = [];
        this.options = options || { };
        this.listeners = [];
    }

    public add(text, cb?) 
    {
        var newTag = {
            id: TagUtil.uuid(),
            text: text
        };
        this.tags.push(newTag);
        if(cb) cb({}, newTag, this.tags.length - 1);
        this.broadcast();
    }

    public validate(tagToSave, text): string | PromiseLike<string>
    {
        // tags should
        // * be unique
        // * length > 0
        if (!text.length) {
            throw TagUtil.error(ERROR.EMPTY, !StringUtil.isNullOrEmpty(this.options.emptyErrorMessage) ? this.options.emptyErrorMessage : ERROR_MSG[ERROR.EMPTY]);
        }

        for(var i = 0, l = this.tags.length; i < l; i++) 
        {
            var tag = this.tags[i];
            if (tag === tagToSave) { continue;}
            if (tag.text.trim() === text.trim()) {
                throw TagUtil.error(ERROR.REPEAT, !StringUtil.isNullOrEmpty(this.options.repeatErrorMessage) ? this.options.repeatErrorMessage : ERROR_MSG[ERROR.REPEAT]);
            }
        }

        if(this.options.validate){
            return this.options.validate(text, this.output());
        }
        return "";

    }

    private processSave(tagToSave, text, cb?)
    {
            this.tags.forEach(tag => {
                if (tag === tagToSave) {
                    tag.text = text;
                }
            });
            if(cb) cb();
            this.broadcast();
    }

    public save(tagToSave, text, cb?):void 
    {
        try {

            let result: string | PromiseLike<string> = this.validate(tagToSave, text);
            if (result !== undefined) 
            {
                if (typeof result === 'string') 
                {
                    if(result != null && result != "")
                    {
                        throw TagUtil.error(result, result); 
                    }

                    this.processSave(tagToSave, text, cb);

                } else {
                    result.then((errorMessage: string) => 
                    {
                        if(errorMessage != null && errorMessage != "")
                        {
                            throw TagUtil.error(errorMessage, errorMessage); 
                        }
                        this.processSave(tagToSave, text, cb);
                    });
                }
            }

        } catch(exception) {
            cb(exception);
        }
    }

    public remove(tag):void 
    {
        var text = (typeof tag === "string")? tag: tag.text;
        this.tags = this.tags.filter(candidate => {
            return candidate.text !== text;
        });
        this.broadcast();
    }
    
    public output() {
        return this.tags.map((tag) =>
        {
            return tag.text;
        });
    }

    public subscribe(fn):void
    {
        this.listeners.push(fn);
    }

    public index(text):number 
    {
        var tagIndex = -1;
        for(var i = 0, l = this.tags.length; i < l; i++) {
            if (text === this.tags[i].text) {
                tagIndex = i;
                break;
            }
        }
        return tagIndex;
    }

    public insertAfterTag(tag, text, cb?) :void
    {
        var tagIndex
          , newTag;
        this.tags.forEach((t, i) => {
            if (t.id === tag.id) {
                tagIndex = i;
            }
        });
        if (tagIndex === void 0) {
            return;
        }
        newTag = {
            id: TagUtil.uuid(),
            text: text
        };
        this.tags.splice(tagIndex + 1, 0, newTag);
        if(cb) cb(null, newTag, tagIndex + 1);
    }

    private broadcast():void
    {
        this.listeners.forEach(fn => { fn();});
    }


}
