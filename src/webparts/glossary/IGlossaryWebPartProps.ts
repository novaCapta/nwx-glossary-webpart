import { IGloMetaInfo } from '../../core/IGloMetaInfo';
/**
 * Describes properties for the Glossary Webpart
 */
export interface IGlossaryWebPartProps {
  /**
   * Title of your Glossary WebPart.
   */
  title:string;
  /**
   * Description (tooltip) of your Glossary WebPart.
   */
  description:string;
  /**
   * The GUID of the Glossary Term List.
   * You can select an already created list from the dropdown menu or create 
   * a new one entering its name into the textfield "List Name" and 
   * hitting the "Create" button.
   */
  listName: string;
  /**
   * You can decide whether the first available letter should be initially selected and 
   * choose between two different display modes of the letters.
   */
  letterDisplayMode:string;
  /**
   * This property handles the letters on top of your glossary used for the navigation. 
   * You can decide whether the first available letter should be initially 
   * selected and choose between two different display modes of the letters.
   */
  initiallySelectFirstLetter: boolean;
  /**
   * The Terms Display mode gives you the possibility to change the behaviour of the glossary entries. 
   */
  termDisplayMode: string;
  /**
   * Here you can decide whether you want to see 
   * all terms after clicking on "A-Z"
   */
  termsShowAll:boolean;
  /**
   *  Here you can decid whether you want to see who was the 
   * last editor of the term.
   */
  termsShowEditorInformation:boolean;
  /**
   * Provides additional information about glossary
   */
  metaInfo:IGloMetaInfo;

}
