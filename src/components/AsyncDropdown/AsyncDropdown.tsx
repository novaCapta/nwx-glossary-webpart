import * as React from 'react';
import {  Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IAsyncDropdownProps } from './IAsyncDropdownProps';
import { IAsyncDropdownState } from './IAsyncDropdownState';

/**
 * @class
 * Represents a drop-down that loads its options asynchronously.
 */
export default class AsyncDropdown extends React.Component<IAsyncDropdownProps, IAsyncDropdownState> {
  constructor(props: IAsyncDropdownProps, state: IAsyncDropdownState) {
    super(props);

    this.state = {
      loading: false,
      options: undefined,
      error: undefined
    };
  }

  /**
   * Called once after initial rendering
   */
  public componentDidMount(): void {
    this.loadOptions();
  }

/**
 * Called immediately after updating occurs
 * @param prevProps 
 * @param prevState 
 */
  public componentDidUpdate(prevProps: IAsyncDropdownProps, prevState: IAsyncDropdownState): void {
    if (this.props.disabled !== prevProps.disabled ||
      this.props.stateKey !== prevProps.stateKey) {
      this.loadOptions();
    }
  }
/**
 * Loads the checklist items asynchronously
 */
  private loadOptions(): void {
    this.setState({
      loading: true,
      error: undefined,
      options: undefined
    });

    this.props.loadOptions()
      .then((options: IDropdownOption[]): void => {

        var optionList = [];

        if(this.props.promptMessage != null && this.props.promptMessage.length > 0)
        {
          var promptOption:IDropdownOption = {"key": "", "text": this.props.promptMessage };
          optionList.push(promptOption);
        }

        options.forEach(o=>{optionList.push(o);});

        this.setState({
          loading: false,
          error: undefined,
          options: optionList
        });
      }, (error: any): void => {
        this.setState((prevState: IAsyncDropdownState, props: IAsyncDropdownProps): IAsyncDropdownState => {
          prevState.loading = false;
          prevState.error = error;
          return prevState;
        });
      });
  }

/**
 * Renders the result 
 */
  public render(): JSX.Element {
    const loading: JSX.Element = this.state.loading ? <div><Spinner label={this.props.loadingMsg} /></div> : <div />;
    const error: JSX.Element = this.state.error !== undefined ? <div className={'ms-TextField-errorMessage ms-u-slideDownIn20'}>{this.props.defaultErrorMsg}{this.state.error}</div> : <div />;

    return (
      <div>
        <Dropdown label={this.props.label}
          isDisabled={this.props.disabled || this.state.loading || this.state.error !== undefined}
          onChanged={this.props.onChanged}
          selectedKey={this.props.selectedKey}
          options={this.state.options} />
        {loading}
        {error}
      </div>
    );
  }
}