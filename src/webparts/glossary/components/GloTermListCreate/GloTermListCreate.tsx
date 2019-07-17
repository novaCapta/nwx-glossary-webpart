import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IGloTermListCreateProps } from './IGloTermListCreateProps';
import { IGloTermListCreateState } from './IGloTermListCreateState';
import { Spinner, TextField, Label, Button, ButtonType, MessageBar, MessageBarType, DelayedRender } from 'office-ui-fabric-react';
import * as strings from 'glossaryStrings';
import {StringUtil} from '../../../../core/StringUtil';
import {ITermList } from '../../../../core/ITermList';

export default class GloTermListCreate extends React.Component<IGloTermListCreateProps, IGloTermListCreateState> {

  constructor(props: IGloTermListCreateProps) {
    super(props);

    this.onClickCreate = this.onClickCreate.bind(this);
    this.getListNameErrorMessage = this.getListNameErrorMessage.bind(this);

    this.state = {
        listName: '',
        requiredValidationMessage:undefined,
        errorMessage: undefined,
        creating:false
    } as IGloTermListCreateState;

  }

    /**
   * @function
   * Renders the GloTermListPicker controls with Office UI Fabric
   */
    public render(): JSX.Element {

        const {validationMessage, errorMessage} = this.state;
        const loading: JSX.Element = this.state.creating ? <div><Spinner label={strings.TermListCreateSpinnerText} /></div> : <div />;

        return (
        <div>

            <div className="nc-termlistcreate-description">
                {strings.TermListCreateDescription}
            </div>

            <div className="nc-termlistcreate-form">
                <div>
                    <TextField placeholder={strings.TermListCreateFieldLabel} 
                    onChanged={ (text) => this.setState({ listName: text}) } 
                    value={this.state.listName}/>
                    <div className="nc-termlistcreate-buttons">
                    <Button buttonType={ButtonType.primary} onClick={this.onClickCreate} disabled={this.state.creating}>{strings.TermListCreateButtonCreate}</Button></div>
                    <div className="ms-clear"></div>
                </div>

                { validationMessage &&
                <span>
                    <div aria-live='assertive'>
                    <DelayedRender>
                        <p
                        className='ms-TextField-errorMessage ms-u-slideDownIn20'
                        data-automation-id='error-message'>
                        { validationMessage }
                        </p>
                    </DelayedRender>
                    </div>
                </span>
                }
            </div>
            {loading}
            { errorMessage != null && errorMessage != '' && errorMessage != undefined ?
        <MessageBar messageBarType={MessageBarType.error} isMultiline={ true } >{this.state.errorMessage}</MessageBar>
                : ''}
            </div>
        );
    }

    private getListNameErrorMessage(value: string): string {

      if(value != null) value = value.trim();
      const len = value.length;

      if(len < 1)
      {
          return strings.TermListCreateRequiredMessage;
      }


      return '';
    }

    private onClickCreate(): void 
    {
        let {listName } = this.state;

        if(listName != null) listName = listName.trim();
        var listNameErr = this.getListNameErrorMessage(listName);

        this.setState({validationMessage: listNameErr});

        if(!StringUtil.isNullOrEmpty(listNameErr))
        {       
            return;
        }
        

        this.props.termListService.listNameAlreadyExists(listName).then((ok: boolean): void => 
        {
            if(!ok)
            {
                this.createTermList(listName);

            }else{
                this.setState({validationMessage : StringUtil.format(strings.TermListCreateDuplicateFound, listName)});
            }

        });

    }

    private createTermList(listName:string)
    {

        this.setState({
            creating: true,
            errorMessage: undefined
        });

        if(this.props.onListCreating)
            this.props.onListCreating(listName);

        this.props.termListService.createTermList(listName)
        .then((termList: ITermList): void => {

            this.setState({
                creating: false,
                errorMessage: undefined,
                listName:''
            });

            if(this.props.onListCreated)
                this.props.onListCreated(listName, termList);

        }, (error: any): void => {
            this.setState((prevState: IGloTermListCreateState, props: IGloTermListCreateProps): IGloTermListCreateState => {
            prevState.creating = false;
            prevState.errorMessage = error;
            return prevState;
            });
        });

    }
}