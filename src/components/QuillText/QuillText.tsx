import * as React from 'react';
import { getId, css, Label, TextField} from 'office-ui-fabric-react';

import { IQuillTextProps } from './IQuillTextProps';
import { IQuillTextState } from './IQuillTextState';
import * as Quill  from 'quill';
import '../../css/quill.snow.scss';
import '../../css/quill.scss';

/**
 * @class
 * Wrapper component for the quill HTML-Editor  https://quilljs.com/
 * Quill is a free, open source WYSIWYG editor built for the modern web. 
 * With its modular architecture and expressive API, it is completely customizable to fit any need.
 */
export default class QuillText extends React.Component<IQuillTextProps, IQuillTextState> {

    private id:string;

    /*
    Changing one of these props should cause a re-render.
    */
    private dirtyProps: string[] = [
        'id',
        'className',
        'theme'
    ];

    constructor(props: IQuillTextProps) {
        super(props);

        this.id = getId("QuillText");

        this.state = {
        value: props.value || props.defaultValue || '',
        isFocused: false,
        } as IQuillTextState;
    
        this.onEditorChange = this.onEditorChange.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    public componentWillReceiveProps(nextProps: IQuillTextProps): void 
    {
        const editor = this.state.editor;
        // If the component is unmounted and mounted too quickly
        // an error is thrown in setEditorContents since editor is
        // still undefined. Must check if editor is undefined
        // before performing this call.
        if (editor) {
            // Update only if we've been passed a new `value`.
            // This leaves components using `defaultValue` alone.
            if ('value' in nextProps) {
                // NOTE: Seeing that Quill is missing a way to prevent
                //       edits, we have to settle for a hybrid between
                //       controlled and uncontrolled mode. We can't prevent
                //       the change, but we'll still override content
                //       whenever `value` differs from current state.
                if (nextProps.value !== this.getEditorContents()) {
                    this.setEditorContents(editor, nextProps.value);
                }
            }
            // We can update disabled state in-place.
            if ('disabled' in nextProps) {
                if (nextProps.disabled !== this.props.disabled) {
                    this.setEditorReadOnly(editor, nextProps.disabled);
                }
            }
        }
    }

    public componentDidMount()
    {
        try{
            const editor = this.createEditor();
            this.setState({ editor:editor });
            if (this.props.value) {
                this.setEditorContents(editor, this.props.value);
            }
        }catch( e)
        {
            console.log(e.name + ': ' + e.message);
            this.setState({ fallback:true, editor:undefined });
        }
    }

    public componentWillUnmount()
    {
        // NOTE: Don't set the state to null here
        //       as it would generate a loop.
    }

    public shouldComponentUpdate(nextProps, nextState) 
    {
        if(nextState["fallback"] && this.state.fallback === undefined)
        {
            return true;
        }

        // Check if one of the changes should trigger a re-render.
        for (let i=0; i<this.dirtyProps.length; i++) {
            const prop = this.dirtyProps[i];
            if (nextProps[prop] !== this.props[prop]) {
                return true;
            }
        }
        // Never re-render otherwise.
        return false;
    }

    /*
    If for whatever reason we are rendering again,
    we should tear down the editor and bring it up
    again.
    */
    public componentWillUpdate() 
    {
        this.componentWillUnmount();
    }

    public componentDidUpdate() 
    {
        this.componentDidMount();
    }

    private getEditorConfig()
    {
        const config = {
            readOnly: this.props.disabled,
            bounds: '#' + this.id + ' .editor',
            modules: {
                'formula': false,
                'syntax': false,
                'toolbar': [
                    [{ 'size': [] }],
                    [ 'bold', 'italic', 'underline', 'strike' ],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'script': 'super' }, { 'script': 'sub' }],
                    [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ],
                    [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
                    [ 'direction', { 'align': [] }],
                    [ 'link', 'image'],
                    [ 'clean' ]
                ],
            },
            theme: this.props.theme,
            placeholder:  this.props.placeholder
        };
        return config;
    }

    private getEditor()
    {
        return this.state.editor;
    }

    private getEditorContents(){
        return this.state.value;
    }

    private createEditor () 
    {
        const config =  this.getEditorConfig();
        const editor = new Quill('#' + this.id+ ' .editor', config);
        this.hookEditor(editor);
        return editor;
    }

    private hookEditor (editor) 
    {
        // Expose the editor on change events via a weaker,
        // unprivileged proxy object that does not allow
        // accidentally modifying editor state.
        const unprivilegedEditor = this.makeUnprivilegedEditor(editor);

        var self = this;
        editor.on('text-change', function(delta, oldDelta, source) {
                self.onEditorChange(
                    editor.root.innerHTML, delta, source,
                    unprivilegedEditor
                );
        }.bind(this));
    }

    private setEditorReadOnly(editor, value) 
    {
        value? editor.disable()
             : editor.enable();
    }

    /*
    Replace the contents of the editor, but keep
    the previous selection hanging around so that
    the cursor won't move.
    */
    private setEditorContents(editor, value) 
    {
        const sel = editor.getSelection();
        editor.pasteHTML(value || '');
        if (sel) this.setEditorSelection(editor, sel);
    }

    private setEditorSelection(editor, range) {
        if (range) {
            // Validate bounds before applying.
            const length = editor.getLength();
            range.index = Math.max(0, Math.min(range.index, range.length-1));
            range.length = length;
        }
        editor.setSelection(range);
    }

    /*
    Returns an weaker, unprivileged proxy object that only
    exposes read-only accessors found on the editor instance,
    without any state-modificating methods.
    */
    private makeUnprivilegedEditor(editor) {
        const e = editor;
        return {
            getLength:    function(){ e.getLength.apply(e, arguments); },
            getText:      function(){ e.getText.apply(e, arguments); },
            getContents:  function(){ e.getContents.apply(e, arguments); },
            getSelection: function(){ e.getSelection.apply(e, arguments); },
            getBounds:    function(){ e.getBounds.apply(e, arguments); },
        };
    }

    private renderContents():JSX.Element {
        return (<div id={this.id} className="nc-quill">
            <div className="editor"></div>
        </div>);
    }

    public render(): JSX.Element {

        const {
        className,
        disabled,
        label,
        required
        } = this.props;
        
        const { isFocused, fallback } = this.state;

        const textFieldClassName = css('ms-TextField', className, {
            ['is-required ']: required,
            ['is-disabled ']: disabled,
            ['is-active ']: isFocused
            });

        return ( 
        <div>

        { (fallback) ? 
        
            <TextField label={label} multiline rows={ 10 } required={ required } 
            onChanged={this.props.onChange } onBlur={this.props.onBlur}  onFocus={this.props.onFocus}
            disabled={disabled} className ={className}
            value={this.props.value} defaultValue={this.props.defaultValue}/>
        : 
            
            <div id={this.id + "-container"} className={textFieldClassName} data-is-focusable={ true }>
            { label && <Label htmlFor={ this.id }>{ label }</Label> }        
            { this.renderContents() }
            </div>
        }

        </div>);
    }

    private onEditorChange (value, delta, source, editor) 
    {
        if (value !== this.getEditorContents()) {
            this.setState({ value: value });
            if (this.props.onChanged) {
                this.props.onChanged(value);
            }
        }
    }

    private onFocus () {
        this.state.editor.focus();
        this.setState({ isFocused: true });
    }

    private onBlur() {
        this.setState({ isFocused: false });
    }



}