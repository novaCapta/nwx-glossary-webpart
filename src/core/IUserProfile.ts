/**
 * @interface
 * This interface defines properties for the UserProfile.
 */
export interface IUserProfile {
  accountName:string;
  firstName?: string;
  lastName?: string;
  userProfileProperties?: Array<any>;
  email: string;
  workEmail?: string;
  homePhone?:string;
  workPhone?: string;
  displayName?: string;
  department?: string;
  office?: string;
  pictureUrl?: string;
  title?: string;
  sipAddress?:string;
  personalUrl?:string;
}