import { IUserInfo } from './IUserInfo';

/**
 * @interface
 * Defines properties and methods for the UserSearchService and MockUserSearchService
 */
export interface IUserSearchService {
 /**
  * @function searches user in SharePoint from a query
  * @param query 
  */
  searchPeople(query: string): Promise<Array<IUserInfo>>;
}