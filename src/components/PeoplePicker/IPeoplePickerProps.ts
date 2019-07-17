import { IUserInfo } from '../../core/IUserInfo';
import { IUserSearchService } from '../../core/IUserSearchService';
/**
 * @interface
 * Defines people picker component properties
 */
export interface IPeoplePickerProps {

  /**
   * @var
   * Property field label
   */
  label: string;
  /**
   * @var
   * Intial data to load in the people picker (optional)
   */
  initialData?: IUserInfo[];
  /**
   * @var
   * Defines if the limit of items that can be selected (optional)
   */
  limit?: number;

  limitErrorMessage?:string;

  /**
  * Custom Field will start to validate after users stop typing for `deferredValidationTime` milliseconds.
  * Default value is 200.
  */
  deferredValidationTime?: number;


  searchService:IUserSearchService;

  /**
   * The method is used to get the validation error message and determine whether the input value is valid or not.
   *
   *   When it returns string:
   *   - If valid, it returns empty string.
   *   - If invalid, it returns the error message string and the text field will
   *     show a red border and show an error message below the text field.
   *
   *   When it returns Promise<string>:
   *   - The resolved value is display as error message.
   *   - The rejected, the value is thrown away.
   *
   */
   onGetErrorMessage?: (value: IUserInfo[]) => string | Promise<string>;


   onValueChange(oldValue: any, newValue: any): void;

         suggestionsHeaderText: string;
      noResultsFoundText: string;
      loadingText: string;
} 