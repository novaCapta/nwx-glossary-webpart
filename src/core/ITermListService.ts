import { ITermList } from './ITermList';
/**
 * @interface
 * This interface defines properties and methods for TermListService and MockTermListService.
 */
export interface ITermListService {

  /**
   * @function
   * Gets the collection of glossary term lists in the current SharePoint site
   */
  getTermLists(): Promise<ITermList[]>;

  /**
   * @function
   * Create a SharePoint list for terms and returns a guid.
   */
  createTermList(name:string): Promise<ITermList>;

  /**
   * @function
   * Check whether the list contains the content type 'GlossaryTerm'
   */
  isTermList(listId:string): Promise<boolean>;

    /**
   * @function
   * Check whether a duplicate list already exists
   */
  listNameAlreadyExists(listName:string): Promise<boolean>;
}