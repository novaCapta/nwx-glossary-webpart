import * as React from 'react';
import { getId, Label} from 'office-ui-fabric-react';
import { ITagEditorProps } from './ITagEditorProps';
import { ITagEditorState } from './ITagEditorState';
import {KEYS, ERROR} from './TagUtil';
import {ITag} from './ITag';
import {TagStore} from './TagStore';
import TagItem from './TagItem';

/**
 * @class
 * Tag editor component 
 * - edit in place tags
 * - intuitive navigation between tags with cursor keys, Tab, Shift+Tab, Enter, Pos1, End, Backspace, Del, and ESC
 * - copy-paste or delete multiple selected tags
 * - duplicate tags check
 */
export default class TagEditor extends React.Component<ITagEditorProps, ITagEditorState> {

private id:string;

  constructor(props: ITagEditorProps, state: ITagEditorState) {
    super(props);

    this.id = getId("TagEditor");

    this.renderTagItem = this.renderTagItem.bind(this);

    var store = this.props.store ? this.props.store : new TagStore({
        validate: this.props.validate
    });

    if(this.props.tags != null)
    {
      this.props.tags.forEach(tag => {
          store.add(tag);
      });
    }

    this.state = {
        editing: null,
        caret: null,
        repeat: null,
        store: store
    } as ITagEditorState;

    store.subscribe(() => {
        this.setState({
            store: store
        });
    });
  }

  public add(text) {
    var store = this.state.store
    , tagIndex = store.index(text);

    if (tagIndex > -1) {
      store.save(store.tags[tagIndex], text);
    } else {
      store.add(text);
    }
  }
  public remove(text) {
    this.state.store.remove(text);
  }

  public output() {
    return this.state.store.output();
  }

  private renderTagItem(tag: ITag, i:number): JSX.Element
  {
    return (
                    <TagItem
                        active={this.state.editing === i? true: false}
                        error={this.state.repeat === i? true: false}
                        caret={this.state.editing === i? this.state.caret: null}
                        onSave={this.handleTagSave.bind(this, tag)}
                        onFocus={this.handleTagFocus.bind(this, tag)}
                        onBlur={this.handleTagBlur.bind(this, tag)}
                        onRemove={this.handleTagRemove.bind(this, tag)}
                        onSplit={this.handleTagSplit.bind(this, tag)}
                        delimiterKeys={this.props.delimiters.filter( d => { return typeof d === 'number';} )}
                        delimiterChars={this.props.delimiters.filter( d=> { return typeof d === 'string';} )}
                        key={tag.id}>
                        {tag.text}
                    </TagItem>
                );

  }

  public render(): JSX.Element {

    const store = this.state.store;
    const label = this.props.label;

        if (!store) {
            return <div />;
        }

        var tags = this.state.store.tags;
        return (

            <div className="nc-tagField">            
                { label && <Label htmlFor={ this.id }>{ label }</Label> }

                <div className={"tag-editor" + (typeof this.state.editing === 'number'? " is-active": "")} onClick={this.handleClick.bind(this)} ref="editor">
                {tags.length == 0 ? <div className="tag-editor-placeholder">{this.props.placeholder}</div> : tags.map(this.renderTagItem)}
                </div>

            </div>
        );
  }

  private handleClick() 
  {
    this.state.store.add('', function(err, newTag, indexOfNewTag) 
    {
      this.setState({
      editing: indexOfNewTag,
      caret: 0
      });
    }.bind(this));
  }

  private handleTagSave(tag, text) 
  {
    this.state.store.save(tag, text, function(err) 
    {
        if (!err) 
        {
            if(this.props.onChange)
                this.props.onChange(text, this.state.store.output(), 'add');
            return;
        }

        switch(err.name) 
        {
            case ERROR.EMPTY:
                break;
            case ERROR.REPEAT:
                var tagIndex;
                this.state.store.tags.forEach((t, i) => {
                    if (t.text === text) {
                        tagIndex = i;
                    }
                });
                this.setState({
                    repeat: tagIndex
                });
                setTimeout(() => {
                    this.setState({ repeat: null });
                }, 1500);
                break;
            default:
                break;
        }
        if(this.props.onError) {
            this.props.onError(err);
        }
        this.handleTagRemove(tag);

    }.bind(this));

    this.setState({
        editing: null,
        caret: null
    });
  }

  private handleTagFocus(tag) 
  {
      var tagIndex;
      this.state.store.tags.forEach((t, i) => {
          if (tag.id === t.id) {
              tagIndex = i;
          }
      });
      if (tagIndex === void 0) { return; }
      this.setState({
          editing: tagIndex
      });
  }

  private handleTagBlur(tag, caretOnBlur, lastKeyOnBlur) 
  {
      var tags = this.state.store.tags
        , tagIndex;

      if (!tags.length) {
          this.handleClick();
          return;
      }
      tags.forEach((t, i) => {
          if (t.id === tag.id) {
              tagIndex = i;
          }
      });
      if (caretOnBlur === 0) {
          if (tagIndex > 0) {
              this.setState({
                  editing: tagIndex - 1,
                  caret: tags[tagIndex - 1].text.length
              });
          } else if (tagIndex === 0) {
              this.setState({
                  editing: 0,
                  caret: 0
              });
          } else {
              // tagIndex === void 0
              // this case happens when
              // press left/right/backspace key on empty tag
              var newState = {} as ITagEditorState;
              if (lastKeyOnBlur === KEYS.LEFT) {
                  if (this.state.editing - 1 < 0) { return; }
                  newState.editing = this.state.editing - 1;
                  newState.caret = tags[newState.editing].text.length;
              }
              if (lastKeyOnBlur === KEYS.RIGHT) {
                  newState.editing = this.state.editing;
                  newState.caret = 0;
              }
              this.setState(newState);
          }
      }
      if (caretOnBlur > 0) {
          if (tagIndex < tags.length - 1) {
              this.setState({
                  editing: tagIndex + 1,
                  caret: 0
              });
          } else if (tagIndex === tags.length - 1) {
              this.setState({
                  editing: tags.length - 1,
                  caret: tags[tags.length - 1].text.length
              });
          }
      }
  }

  private handleTagRemove(tag) {
      var tagText = tag.text;
      this.state.store.remove(tag);
      if(tagText.length && this.props.onChange){
         this.props.onChange(tagText, this.state.store.output(), 'remove');
      }
  }

  private handleTagSplit(tag, textBeforeCaret, textAfterCaret) 
  {
    this.state.store.insertAfterTag(tag, textAfterCaret, function(err, newTag, indexOfNewTag) 
    {
      this.setState({
      editing: indexOfNewTag,
      caret: 0
      });
    }.bind(this));
  }


}