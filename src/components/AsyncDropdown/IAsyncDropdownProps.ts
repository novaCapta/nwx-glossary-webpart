import { IDropdownOption } from 'office-ui-fabric-react';
/**
 * @interface
 * This interface serves as the react component properties which gets
	passed to the component AsyncDropdown.
 */
export interface IAsyncDropdownProps {
  label: string;
  loadOptions: () => Promise<IDropdownOption[]>;
  onChanged: (option: IDropdownOption, index?: number) => void;
  selectedKey: string | number;
  disabled: boolean;
  stateKey: string;
  loadingMsg?:string;
  defaultErrorMsg?:string;
  promptMessage?:string;

}