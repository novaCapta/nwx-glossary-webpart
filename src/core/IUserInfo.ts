/**
 * @interface
 * User properties for the specified user.
 */
export interface IUserInfo {
  /**
   * @var
   * User's login
   */
  login: string;
  /**
   * @var
   * User's email (optional)
   */
  email?: string;
    /**
   * @var
   * User's full name
   */
  fullName: string;
  /**
   * @var
   * User's job title (optional)
   */
  jobTitle?: string;

  /**
   * @var
   * User's initials (optional)
   */
  initials?: string;
  /**
   * @var
   * User's image url (optional)
   */
  imageUrl?: string;

}