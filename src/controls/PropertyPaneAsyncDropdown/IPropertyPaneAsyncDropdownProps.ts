import { IDropdownOption } from 'office-ui-fabric-react';

/**
 * @interface
 * This interface serves as the react component properties which gets
	passed to the component PropertyPaneAsyncDropdown.
 */
export interface IPropertyPaneAsyncDropdownProps {
  key: string;
  label: string;
  loadOptions: () => Promise<IDropdownOption[]>;
  onPropertyChange: (propertyPath: string, newValue: any) => void;
  selectedKey: string | number;
  disabled?: boolean;
  loadingMsg?:string;
  defaultErrorMsg?:string;
}