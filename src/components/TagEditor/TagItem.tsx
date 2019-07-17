import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ITagItemProps } from './ITagItemProps';
import { ITagItemState } from './ITagItemState';
import {TagUtil, KEYS} from './TagUtil';

/**
 * @class
 * Tag item component
 */
export default class TagItem extends React.Component<ITagItemProps, ITagItemState> {

  private keyHandlers;
  private textInput:HTMLInputElement;

  constructor(props:ITagItemProps, state: ITagItemState) {
    super(props);

    this.state = {

    };

    this.keyHandlers = {
        LEFT: (e)=> {
            if (e.caret === 0) 
            {
                // seems that:
                // if current node do not blur
                // can not set next node to focus
                e.node.blur();
                e.originalEvent.preventDefault();
                props.onBlur(e.caret, KEYS.LEFT);
            }
        },
        RIGHT:(e)=> {
            if (e.caret === e.node.value.length) 
            {
                e.node.blur();
                e.originalEvent.preventDefault();
                props.onBlur(e.caret, KEYS.RIGHT);
            }
        },
        BACKSPACE: (e)=> {
            if (e.caret === 0) {
                var node = e.node;
                if (node.selectionStart !== node.selectionEnd) { return; }
                e.node.blur();
                e.originalEvent.preventDefault();
                props.onBlur(e.caret, KEYS.LEFT);
            }
        }
    };
  }

  public componentDidMount(): void {

        var node = this.getInputElement();
        if (this.props.active) {
            node.focus();
        } else {
            node.blur();
        }
        TagUtil.autoSize(node);
  }

  public componentWillReceiveProps(nextProps) {
      var node = this.getInputElement()
        , tagNode = ReactDOM.findDOMNode(this)
        , activityChanged = this.props.active !== nextProps.active;

      if (nextProps.active) {
          TagUtil.setCaretPos(node, nextProps.caret);
      } else {
          node.blur();
      }
  }

  public render(): JSX.Element {

      return (
          <div className={"tag" + (this.props.error? " has-error": "")} onClick={this.handleClick.bind(this)}>
              <input
                  type="text"
                  defaultValue={this.props.children.toString()}
                  ref={(input) => { this.textInput = input; }} 
                  onFocus={this.handleFocus.bind(this)}
                  onBlur={this.handleBlur.bind(this)}
                  onKeyDown={this.handleKeyDown.bind(this)}
                  onChange={this.handleChange.bind(this)} />
              <a><i className="ms-Icon ms-Icon--Cancel"></i></a>
          </div>

      );
  }

  private handleClick(e) {
    e.stopPropagation();
    if (e.target.tagName === 'A' || e.target.tagName === 'I') {
        // click on X to remove
        this.props.onRemove();
    }
  }

  private handleFocus() {
      this.props.onFocus();
  }

  private handleBlur() {
      var node = this.getInputElement();
      this.props.onSave(node.value);
  }

  private handleKeyDown(e) 
  {
      var charCode = TagUtil.getCharcode(e);
      for (var key in KEYS) {
          if (KEYS[key] === charCode) 
          {
              this.keyHandlers[key].call(this, {
                  originalEvent: e,
                  caret: TagUtil.getCaretPos(this.getInputElement()),
                  node: this.getInputElement()
              });
          }
      }

      if (this.props.delimiterKeys.indexOf(charCode) > -1) 
      {
          e.preventDefault();
          var node = this.getInputElement();
          this.split(node, TagUtil.getCaretPos(node));
      }
  }

  private handleChange(e) {
      var tagText = e.target.value
        , node = this.getInputElement()
        , caretPos = TagUtil.getCaretPos(node)
        , lastInput = tagText.charAt(caretPos - 1);
      this.props.delimiterChars.forEach(delimiter =>  {
          if (lastInput === delimiter) {
              this.split(node, caretPos - 1, caretPos);
          }
      });
      TagUtil.autoSize(node);
  }

  private split(node, posCaretBefore?, posCaretAfter?) 
  {
      var positions = Array.prototype.slice.call(arguments, 1)
        , tagText = node.value
        , textBeforeCaret = tagText.substring(0, positions[0])
        , textAfterCaret = tagText.substring(positions[1] || positions[0], tagText.length);
      node.value = textBeforeCaret;
      node.blur();
      this.props.onSplit(textBeforeCaret, textAfterCaret);
  }

  private getInputElement():HTMLInputElement
  {
    return this.textInput;
  }

}