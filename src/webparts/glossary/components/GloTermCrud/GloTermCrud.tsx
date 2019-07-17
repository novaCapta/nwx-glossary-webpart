import * as React from 'react';
import { Label, TextField, Button, ButtonType, Dialog, DialogType, CommandButton, 
  MessageBar, MessageBarType, DelayedRender} from 'office-ui-fabric-react';
import * as strings from 'glossaryStrings';
import { IGloTermCrudProps } from './IGloTermCrudProps';
import { IGloTermCrudState } from './IGloTermCrudState';
import { ITerm} from '../../../../core';
import {StringUtil} from '../../../../core/StringUtil';
import {TermUtil} from '../../../../core/TermUtil';
import QuillText from '../../../../components/QuillText/QuillText';
import  {EditorConstants} from '../../../../core/Constants';
import TagEditor from '../../../../components/TagEditor/TagEditor';


export default class GloTermCrud extends React.Component<IGloTermCrudProps, IGloTermCrudState> {

  constructor(props: IGloTermCrudProps) {
    super(props);

    this.onClickAdd = this.onClickAdd.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickUpdate  = this.onClickUpdate.bind(this);
    this.onClickDelete  = this.onClickDelete.bind(this);
    this.onDismissDelete = this.onDismissDelete.bind(this);
    this.onClickShowDelete = this.onClickShowDelete.bind(this);

    this.getTitleErrorMessage = this.getTitleErrorMessage.bind(this);
    this.getDefinitionErrorMessage = this.getDefinitionErrorMessage.bind(this);

    var termItem = this.props.term;

    this.state = {
      deleteOpen: false,
      validationErrorOpen: false,
      validationErrorMsg: '',
      termTitle: termItem != null ? termItem.title : '',
      termDefinition: termItem != null ? termItem.definition : '',
      termSynonyms: termItem != null ? TermUtil.convertSynonyms(termItem.synonyms) : null,
    } as IGloTermCrudState;

  }

  private handleSnosChange (tagsChanged, allTags, action) {
      this.setState({
          termSynonyms: allTags
      });
  }

  public render(): JSX.Element {

    var termItem = this.props.term;
    const {titleErrorMessage, definitionErrorMessage, synonymErrorMessage} = this.state;

    return (
      <div>
        { termItem == null ? 
          <div className="nc-term-crud-header">
            <CommandButton disabled={true} iconProps={{ iconName: 'Add' }}>{strings.AddTerm}</CommandButton>
            <CommandButton  onClick={this.onClickCancel} iconProps={{ iconName: 'Back' }}>{strings.Cancel}</CommandButton>
          </div>
        : ''}

        { termItem != null ? 
          <div>
          <Dialog type={DialogType.close} isOpen={this.state.deleteOpen} title={strings.TermConfirmDel}
            onDismiss={this.onDismissDelete}  isDarkOverlay={false} isBlocking={true}>
              <div>
                <div>
                  <Label>{strings.TermConfirmDelMsg}</Label>
                </div>
                <div className="nc-term-dialog-buttons">
                  <Button buttonType={ButtonType.primary} onClick={this.onClickDelete}>{strings.Yes}</Button>&nbsp;
                  <Button buttonType={ButtonType.normal} onClick={this.onDismissDelete}>{strings.No}</Button>
                </div>
              </div>
            </Dialog>
            <div className="nc-term-crud-header">
            <CommandButton disabled={true} iconProps={{ iconName: 'Edit' }}>{strings.EditTerm}</CommandButton>
            <CommandButton onClick={this.onClickCancel} iconProps={{ iconName: 'Back' }}>{strings.Cancel}</CommandButton>
          </div>
        </div>
        : ''}

        { this.state.validationErrorOpen === true && !StringUtil.isNullOrEmpty(this.state.validationErrorMsg)?
        <MessageBar messageBarType={ MessageBarType.error }>{this.state.validationErrorMsg}</MessageBar>
        : ''}

        <div className="nc-term-crud-form">
          
          <TextField label={strings.TermTitleFieldLabel} required={true } 
          onChanged={ (text) => this.setState({ termTitle: text, titleErrorMessage: this.getTitleErrorMessage(text)}) } 
          value={this.state.termTitle}/>

          { titleErrorMessage &&
          <span>
            <div aria-live='assertive'>
              <DelayedRender>
                <p
                  className='ms-TextField-errorMessage ms-u-slideDownIn20'
                  data-automation-id='error-message'>
                  { titleErrorMessage }
                </p>
              </DelayedRender>
            </div>
          </span>
          }

          <QuillText label={strings.TermDefinitionFieldLabel} required={ true } 
            value={this.state.termDefinition}
            onChanged={ (text) => this.setState({ termDefinition: text, definitionErrorMessage : this.getDefinitionErrorMessage(text)}) } 
            insertImageWithUrl = {true}
            theme="snow"/>

          { definitionErrorMessage &&
          <span>
            <div aria-live='assertive'>
              <DelayedRender>
                <p
                  className='ms-TextField-errorMessage ms-u-slideDownIn20'
                  data-automation-id='error-message'>
                  { definitionErrorMessage }
                </p>
              </DelayedRender>
            </div>
          </span>
          }

          <TagEditor
              ref="tagEditor"
              label={strings.TermSynonymsFieldLabel}
              tags={this.state.termSynonyms}
              delimiters={[13,11,';', ',']}    
              validate={this.validateSynonyms.bind(this)} 
              onChange={(tagsChanged, allTags, action) =>this.setState({ termSynonyms: allTags, synonymErrorMessage: null}) }      
              onError={this.handleSynonymsError.bind(this)}   
              placeholder={strings.TermSynonymsPlaceholder}
              emptyErrorMessage={strings.SynonymEmptyErrorMessage}
              repeatErrorMessage={strings.SynonymRepeatErrorMessage}
              />
              <span>
                <div aria-live='assertive'>
                  <DelayedRender>
                    <p
                      className='ms-TextField-errorMessage ms-u-slideDownIn20'
                      data-automation-id='error-message'>
                      { synonymErrorMessage }
                    </p>
                  </DelayedRender>
                </div>
              </span>
          </div>

        { termItem == null ?  
        
          <div className="nc-term-crud-buttons">
            <Button buttonType={ButtonType.primary} onClick={this.onClickAdd}>{strings.OK}</Button>&nbsp;
            <Button buttonType={ButtonType.normal} onClick={this.onClickCancel}>{strings.Cancel}</Button>
          </div>
        : 
          <div className="nc-term-crud-buttons">
            <Button buttonType={ButtonType.primary} onClick={this.onClickShowDelete}>{strings.DeleteTerm}</Button>&nbsp;
            <Button buttonType={ButtonType.primary} onClick={this.onClickUpdate}>{strings.OK}</Button>&nbsp;
            <Button buttonType={ButtonType.normal} onClick={this.onClickCancel}>{strings.Cancel}</Button>
          </div>
          
          }

        </div>
        );

    }

    private getTitleErrorMessage(value: string): string {

      if(value != null) value = value.trim();
      const len = value.length;

      if(len < 1)
      {
          return strings.TermValidationTitleRequired;
      }
      if(len > EditorConstants.MaxTermDefinitionLength)
      {
          return StringUtil.format(strings.TermValidationTitleLength, EditorConstants.MaxTermTitleLength) ;
      }
      return '';
    }

    private getDefinitionErrorMessage(value: string): string {
      
      
      if(value != null) value = value.trim();
      const len = value.length;

      if(len < 1 || value == EditorConstants.EditorEmptyText)
      {
          return strings.TermValidationDefinitionRequired;
      }
      if(len > EditorConstants.MaxTermDefinitionLength)
      {
          return  StringUtil.format(strings.TermValidationDefinitionLength, EditorConstants.MaxTermDefinitionLength) ;
      }
      return '';
    }

    private onClickShowDelete(): void {
      this.setState({deleteOpen:true});
    }

    private onClickDelete(): void 
    {
      this.onDismissDelete();
      this.props.deleteTerm(this.props.term);
    }

    private onDismissDelete(): void {
      this.setState({deleteOpen:false});
    }

    private onClickUpdate(): void
    {

      let {termTitle, termDefinition, termSynonyms } = this.state;
      
      var termSynonymsString:string = null;
      if(termTitle != null) termTitle = termTitle.trim();
      if(termDefinition != null) termDefinition = termDefinition.trim();
      if(termSynonyms != null) termSynonymsString = termSynonyms.join(';');

      var titleErr = this.getTitleErrorMessage(termTitle);
      var defErr = this.getDefinitionErrorMessage(termDefinition);

      this.setState({titleErrorMessage: titleErr, definitionErrorMessage: defErr});
      
      if(!StringUtil.isNullOrEmpty(titleErr) || !StringUtil.isNullOrEmpty(defErr))
      {       
        return;
      }

      const originalTitle = this.props.term.title;
      if(originalTitle.toLowerCase() == termTitle.toLowerCase())
      {

        var term:ITerm = { title: termTitle, definition: termDefinition, itemId: this.props.term.itemId, synonyms: termSynonymsString};
        this.props.updateTerm(term);

      }else{

          this.props.checkTerm(termTitle).then((ok: boolean): void => {

            if(!ok)
            {
              var termToUpdate:ITerm = { title: termTitle, definition: termDefinition, itemId: this.props.term.itemId, synonyms: termSynonymsString};
              this.props.updateTerm(termToUpdate);

            }else{
                this.setState({validationErrorOpen : true, validationErrorMsg: strings.TermValidationTitleExists});

            }

        });

      }


    }

    private onClickCancel(): void 
    {
      this.setState({validationErrorOpen:false});
      this.props.cancel();
    }

    private onClickAdd(): void 
    {
      let {termTitle, termDefinition, termSynonyms } = this.state;
      
      var termSynonymsString:string = null;
      if(termTitle != null) termTitle = termTitle.trim();
      if(termDefinition != null) termDefinition = termDefinition.trim();
      if(termSynonyms != null) termSynonymsString = termSynonyms.join(';');

      var titleErr = this.getTitleErrorMessage(termTitle);
      var defErr = this.getDefinitionErrorMessage(termDefinition);

      this.setState({titleErrorMessage: titleErr, definitionErrorMessage: defErr});
      
      if(!StringUtil.isNullOrEmpty(titleErr) || !StringUtil.isNullOrEmpty(defErr))
      {       
        return;
      }

      this.props.checkTerm(termTitle).then((ok: boolean): void => {

        if(!ok)
        {
          var term:ITerm = { title: termTitle, definition: termDefinition, itemId: "", synonyms: termSynonymsString};
          this.props.createTerm(term);
        }else{
            this.setState({validationErrorOpen : true, validationErrorMsg: strings.TermValidationTitleExists});

        }

      });


  }

  private validateSynonyms(currentTag, tags): string | PromiseLike<string>
  {

    this.setState({
      synonymErrorMessage: null
    });


    if (tags.length > EditorConstants.MaxNumberOfSynonyms) {
        return StringUtil.format(strings.SynonymLimitErrorMessage, EditorConstants.MaxNumberOfSynonyms);
    }

    if(StringUtil.isNullOrEmpty(currentTag)) return "";

    const title = this.state.termTitle;
    
    if(!StringUtil.isNullOrEmpty(title))
    {
      if(title.toLowerCase() == currentTag.toLowerCase())
      {
        return strings.SynonymRepeatTitleErrorMessage; 
      }
    }

    return this.props.checkTerm(currentTag).then((ok: boolean): string => 
    {
        if(!ok)
        {
          return "";
        }else{
          this.setState({
            synonymErrorMessage: StringUtil.format(strings.SynonymExistsAlreadyErrorMessage, currentTag)
          });
          return strings.SynonymExistsAlreadyErrorMessage;
        }

    });  

  }

  private handleSynonymsError (error) {

    // bypass the empty error
    if (error.name === 'TagEmptyError') { return; }
    this.setState({
      synonymErrorMessage: error.message
    });
  }

}