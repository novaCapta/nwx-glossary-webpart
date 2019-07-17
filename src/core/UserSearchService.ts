import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IUserSearchService } from './IUserSearchService';
import { IUserInfo } from './IUserInfo';

/**
 * @class
 * Service implementation to search people in SharePoint
 */
export class UserSearchService implements IUserSearchService  {

    private context: IWebPartContext;

    /**
     * @function
     * Service constructor
     */
    constructor(pageContext: IWebPartContext){
        this.context = pageContext;
    }

  /**
   * @function
   * Search People from a query
   */
  public searchPeople(query: string): Promise<Array<IUserInfo>>
  {
    
    //If the running env is SharePoint, loads from the peoplepicker web service
      var contextInfoUrl: string = this.context.pageContext.web.absoluteUrl + "/_api/contextinfo";
      var userRequestUrl: string = this.context.pageContext.web.absoluteUrl + "/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser";
      var httpPostOptions: ISPHttpClientOptions = {
        headers: {
          "accept": "application/json",
          "content-type": "application/json"
        }
      };
      return this.context.spHttpClient.post(contextInfoUrl, SPHttpClient.configurations.v1, httpPostOptions).then((response: SPHttpClientResponse) => {
        return response.json().then((jsonResponse: any) => {
          var formDigestValue: string = jsonResponse.FormDigestValue;
          var data = {
            'queryParams': {
              //'__metadata': {
              //    'type': 'SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters'
              //},
              'AllowEmailAddresses': true,
              'AllowMultipleEntities': false,
              'AllUrlZones': false,
              'MaximumEntitySuggestions': 20,
              'PrincipalSource': 15,
              //PrincipalType controls the type of entities that are returned in the results.
              //Choices are All - 15, Distribution List - 2 , Security Groups - 4,
              //SharePoint Groups &ndash; 8, User &ndash; 1. These values can be combined
              'PrincipalType': 1,
              'QueryString': query
              //'Required':false,
              //'SharePointGroupID':null,
              //'UrlZone':null,
              //'UrlZoneSpecified':false,
            }
          };
          httpPostOptions = {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              "X-RequestDigest": formDigestValue
            },
            body: JSON.stringify(data)
          };
          return this.context.spHttpClient.post(userRequestUrl, SPHttpClient.configurations.v1, httpPostOptions).then((searchResponse: SPHttpClientResponse) => {
            return searchResponse.json().then((usersResponse: any) => {
              var res: IUserInfo[] = [];
              var values: any = JSON.parse(usersResponse.value);
              values.map(element => {
                var user: IUserInfo = { fullName: element.DisplayText, login: element.Description };
                user.email = element.EntityData.Email;
                user.jobTitle = element.EntityData.Title;
                user.initials = this.getFullNameInitials(user.fullName);
                user.imageUrl = this.getUserPhotoUrl(user.email, this.context.pageContext.web.absoluteUrl);
                res.push(user);
              });
              return res;
            });
          });
        });
      });
  }

    /**
   * @function
   * Generates Initials from a full name
   */
  private getFullNameInitials(fullName: string): string {
    if (fullName == null)
      return fullName;
    var words: string[] = fullName.split(" ");
    if (words.length == 0) {
      return "";
    }
    else if (words.length == 1) {
      return words[0].charAt(0);
    }
    else {
      return (words[0].charAt(0) + words[1].charAt(0));
    }
  }

    /**
   * @function
   * Gets the user photo url
   */
  private getUserPhotoUrl(accountName: string, siteUrl: string): string {
    return `${siteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${accountName}`;
  }

}