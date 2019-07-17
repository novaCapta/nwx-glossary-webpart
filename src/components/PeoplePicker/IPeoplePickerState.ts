import { IUserInfo } from '../../core/IUserInfo';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
/**
 * @interface
 * This interface serves as the state of the component PeoplePicker. 
 */
export interface IPeoplePickerState {
  resultsPeople?: Array<IUserInfo>;
  resultsPersonas?: Array<IPersonaProps>;
  errorMessage?: string;
} 