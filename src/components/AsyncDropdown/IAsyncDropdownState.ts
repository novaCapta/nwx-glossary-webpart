import { IDropdownOption } from 'office-ui-fabric-react';

/**
 * @interface
 * This interface serves as the state of the component AsyncDropdown. 
 */
export interface IAsyncDropdownState {
  loading: boolean;
  options: IDropdownOption[];
  error: string;
} 