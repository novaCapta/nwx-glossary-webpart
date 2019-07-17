import { IUserProfile } from './IUserProfile';
/**
 * @interface
 * This interface defines properties and methods for UserProfileService and MockUserProfileService.
 */
export interface IUserProfileService {
  /**
   * @function
   * Retrieves SharePoint user profile properties by account name
   * @param accountName the name of the account
   */
  getUserProfileProperties(accountName: string): Promise<IUserProfile>;
}