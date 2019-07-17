import { ITerm } from './ITerm';
/**
 * @interface
 * This interface defines properties and methods for GlossaryService and MockGlossaryService.
 */
export interface IGlossaryService {

  /**
   * @function
   * Gets the list of all term definitions
   */
  getAllTerms(): Promise<ITerm[]>;

    /**
   * @function
   * Gets the number of all term definitions
   */
  getTermCount(): Promise<number>;

  /**
   * @function
   * Checks if a term name already exists
   */
  checkIfTermExists(name:string): Promise<Boolean>;

  /**
   * @function
   * Create a term
   */
  createTerm(term:ITerm): Promise<ITerm>;

  /**
   * @function
   * Update a term
   */
  updateTerm(term:ITerm): Promise<boolean>;

  /**
   * @function
   * Delete a term
   */
  deleteTerm(itemId:string): Promise<boolean>;


  

}