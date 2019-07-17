import * as React from 'react';
import { NormalPeoplePicker, IBasePickerSuggestionsProps } from 'office-ui-fabric-react/lib/Pickers';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { IPersonaProps, PersonaPresence, PersonaInitialsColor } from 'office-ui-fabric-react/lib/Persona';
import { Async } from 'office-ui-fabric-react/lib/Utilities';
import { IPeoplePickerProps } from './IPeoplePickerProps';
import { IPeoplePickerState } from './IPeoplePickerState';
import { IUserInfo } from '../../core/IUserInfo';

/**
 * @class
 * People picker component
 */
export default class PeoplePicker extends React.Component<IPeoplePickerProps, IPeoplePickerState> {


  private initialPersonas: Array<IPersonaProps> = new Array<IPersonaProps>();
  private resultsPeople: Array<IUserInfo> = new Array<IUserInfo>();
  private resultsPersonas: Array<IPersonaProps> = new Array<IPersonaProps>();
  private selectedPeople: Array<IUserInfo> = new Array<IUserInfo>();
  private selectedPersonas: Array<IPersonaProps> = new Array<IPersonaProps>();
  private async: Async;
  private delayedValidate: (value: IUserInfo[]) => void;

  /**
   * @function
   * Constructor
   */
  constructor(props: IPeoplePickerProps) {
    super(props);

    this.onSearchFieldChanged = this.onSearchFieldChanged.bind(this);
    this.onItemChanged = this.onItemChanged.bind(this);

    this.createInitialPersonas();

    this.state = {
      resultsPeople: this.resultsPeople,
      resultsPersonas: this.resultsPersonas,
      errorMessage: ''
    };

    this.async = new Async(this);
    this.validate = this.validate.bind(this);
    this.notifyAfterValidate = this.notifyAfterValidate.bind(this);
    this.delayedValidate = this.async.debounce(this.validate, this.props.deferredValidationTime);
  }

  /**
   * @function
   * Renders the PeoplePicker controls with Office UI  Fabric
   */
  public render(): JSX.Element {

    var suggestionProps: IBasePickerSuggestionsProps = {
      suggestionsHeaderText: this.props.suggestionsHeaderText,
      noResultsFoundText: this.props.noResultsFoundText,
      loadingText: this.props.loadingText
    };

    //Renders content
    return (
      <div>
        <Label>{this.props.label}</Label>
        <NormalPeoplePicker
          pickerSuggestionsProps={suggestionProps}
          onResolveSuggestions={this.onSearchFieldChanged}
          onChange={this.onItemChanged}
          defaultSelectedItems={this.initialPersonas}
          />
        { this.state.errorMessage != null && this.state.errorMessage != '' && this.state.errorMessage != undefined ?
              <div style={{paddingBottom: '8px'}}><div aria-live='assertive' className='ms-u-screenReaderOnly' data-automation-id='error-message'>{  this.state.errorMessage }</div>
              <span>
                <p className='ms-TextField-errorMessage ms-u-slideDownIn20'>{ this.state.errorMessage }</p>
              </span>
              </div>
            : ''}
      </div>
    );
  }


  /**
   * @function
   * A search field change occured
   */
  private onSearchFieldChanged(searchText: string, currentSelected: IPersonaProps[]): IPersonaProps[] | Promise<IPersonaProps[]> {
    if (searchText.length >= 2) 
    {
      //Clear the suggestions list
      this.setState({ resultsPeople: this.resultsPeople, resultsPersonas: this.resultsPersonas });
      //Request the search service
      var result = this.props.searchService.searchPeople(searchText).then((response: IUserInfo[]) => 
      {
        this.resultsPeople = [];
        this.resultsPersonas = [];
        response = this.removeDuplicates(response);

        response.map((element: IUserInfo, index: number) => 
        {
          //Fill the results Array
          this.resultsPeople.push(element);
          //Transform the response in IPersonaProps object
          this.resultsPersonas.push(this.getPersonaFromPeople(element, index));
        });
        //Refresh the component's state
        this.setState({ resultsPeople: this.resultsPeople, resultsPersonas: this.resultsPersonas });
        return this.resultsPersonas;
      });
      return result;
    }
    else {
      return [];
    }
  }

  /**
   * @function
   * Remove the duplicates 
   */
  private removeDuplicates(responsePeople: IUserInfo[]): IUserInfo[] {
    if (this.selectedPeople == null || this.selectedPeople.length == 0)
      return responsePeople;
    var res: IUserInfo[] = [];
    responsePeople.map((element: IUserInfo) => {
      var found: boolean = false;
      for (var i: number = 0; i < this.selectedPeople.length; i++) {
        var responseItem: IUserInfo = this.selectedPeople[i];
        if (responseItem.login == element.login) {
          found = true;
          break;
        }
      }
      if (found === false)
        res.push(element);
    });
    return res;
  }

  /**
   * @function
   * Creates the collection of initial personas from initial IPropertyFieldPeople collection
   */
  private createInitialPersonas(): void {
    if (this.props.initialData == null || typeof (this.props.initialData) != typeof Array<IUserInfo>())
      return;
    this.props.initialData.map((element: IUserInfo, index: number) => {
      var persona: IPersonaProps = this.getPersonaFromPeople(element, index);
      this.initialPersonas.push(persona);
      this.selectedPersonas.push(persona);
      this.selectedPeople.push(element);
    });
  }

  /**
   * @function
   * Generates a IPersonaProps object from a IPropertyFieldPeople object
   */
  private getPersonaFromPeople(element: IUserInfo, index: number): IPersonaProps {
    return {
      primaryText: element.fullName, secondaryText: element.jobTitle, imageUrl: element.imageUrl,
      imageInitials: element.initials, presence: PersonaPresence.none, initialsColor: this.getRandomInitialsColor(index)
    };
  }


  /**
   * @function
   * Refreshes the web part properties
   */
  private refreshWebPartProperties(): void {
    this.delayedValidate(this.selectedPeople);
  }

   /**
   * @function
   * Validates the new custom field value
   */
  private validate(value: IUserInfo[]): void {

    if(this.props.limit > 0 && value!= null && value.length>this.props.limit)
    {
        this.setState({ errorMessage: this.props.limitErrorMessage });
        return;
    }

    if (this.props.onGetErrorMessage === null || this.props.onGetErrorMessage === undefined) {
      this.notifyAfterValidate(this.props.initialData, value);
      return;
    }

    var result: string | PromiseLike<string> = this.props.onGetErrorMessage(value || []);
    if (result !== undefined) {
      if (typeof result === 'string') 
      {
        if (result === undefined || result === '')
        {
          this.notifyAfterValidate(this.props.initialData, value);
        }        
        this.setState({ errorMessage: result });
      }
      else 
      {
        result.then((errorMessage: string) => 
        {
          if (errorMessage === undefined || errorMessage === '')
          {
            this.notifyAfterValidate(this.props.initialData, value);
          }
          this.setState({ errorMessage: errorMessage });
        });
      }
    }
    else 
    {
      this.notifyAfterValidate(this.props.initialData, value);
    }
  }

  /**
   * @function
   * Notifies the parent Web Part of a property value change
   */
  private notifyAfterValidate(oldValue: IUserInfo[], newValue: IUserInfo[]) {
    if (this.props.onValueChange && newValue != null) {
      this.props.onValueChange(oldValue, newValue);
    }
  }

  /**
   * @function
   * Called when the component will unmount
   */
  public componentWillUnmount() {
    this.async.dispose();
  }

  /**
   * @function
   * Event raises when the user changed people from hte PeoplePicker component
   */

  private onItemChanged(selectedItems: IPersonaProps[]): void {
    if (selectedItems.length > 0) {
      if (selectedItems.length > this.selectedPersonas.length) {
        var index: number = this.resultsPersonas.indexOf(selectedItems[selectedItems.length - 1]);
        if (index > -1) {
          var people: IUserInfo = this.resultsPeople[index];
          this.selectedPeople.push(people);
          this.selectedPersonas.push(this.resultsPersonas[index]);
          this.refreshWebPartProperties();
        }
      } else {
        this.selectedPersonas.map((person, index2) => {
            var selectedItemIndex: number = selectedItems.indexOf(person);
            if (selectedItemIndex === -1) {
              this.selectedPersonas.splice(index2, 1);
              this.selectedPeople.splice(index2, 1);
            }
          });
      }

    } else {
      this.selectedPersonas.splice(0, this.selectedPersonas.length);
      this.selectedPeople.splice(0, this.selectedPeople.length);
    }

    this.refreshWebPartProperties();
  }

  /**
   * @function
   * Generate a PersonaInitialsColor from the item position in the collection
   */
  private getRandomInitialsColor(index: number): PersonaInitialsColor {
    var num: number = index % 13;
    switch (num) {
      case 0: return PersonaInitialsColor.blue;
      case 1: return PersonaInitialsColor.darkBlue;
      case 2: return PersonaInitialsColor.teal;
      case 3: return PersonaInitialsColor.lightGreen;
      case 4: return PersonaInitialsColor.green;
      case 5: return PersonaInitialsColor.darkGreen;
      case 6: return PersonaInitialsColor.lightPink;
      case 7: return PersonaInitialsColor.pink;
      case 8: return PersonaInitialsColor.magenta;
      case 9: return PersonaInitialsColor.purple;
      case 10: return PersonaInitialsColor.black;
      case 11: return PersonaInitialsColor.orange;
      case 12: return PersonaInitialsColor.red;
      case 13: return PersonaInitialsColor.darkRed;
      default: return PersonaInitialsColor.blue;
    }
  }

}