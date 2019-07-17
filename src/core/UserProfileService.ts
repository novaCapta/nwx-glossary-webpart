import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IUserProfileService } from './IUserProfileService';
import { IUserProfile } from './IUserProfile';
import { SPPermission } from '@microsoft/sp-page-context';

/**
 * @class
 * Service implementation to read SharePoint user profile properties
 */
export class UserProfileService implements IUserProfileService{

    private context: IWebPartContext;

    /**
     * @function
     * Service constructor
     */
    constructor(pageContext: IWebPartContext){
        this.context = pageContext;
    }

    private hasPermission(): boolean
    {
        var permissions = this.context.pageContext.web.permissions;
        if (permissions.hasPermission(SPPermission.browserUserInfo)) 
        {

            return true;
        }

        return false;
    }

    public getUserProfileProperties(login: string): Promise<IUserProfile>
    {

        if(!this.hasPermission())
        {
            return new Promise<IUserProfile>((resolve) => {
                resolve(null);
            });
        }

        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/sp.userprofiles.peoplemanager/GetPropertiesFor(accountName=@v)?@v=%27i:0%23.f|membership|${login}%27`;

        return this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
            return response.json().then((object:any): any => 
            {
                var userProfile: IUserProfile = {
                    'accountName' : object["AccountName"],  
                    'displayName' : object["DisplayName"],
                    'pictureUrl' : object["PictureUrl"],
                    'title' : object["Title"],
                    'personalUrl' : object["PersonalUrl"],
                    'email': object["Email"]
                };

                var userProfileProps = object.UserProfileProperties;
                if(userProfileProps != null)
                {

                    userProfileProps.map((o: any) => {

                        const key = o.Key;
                        const val = o.Value;

                        if(key == "FirstName")
                        {
                            userProfile.firstName = val;    
                        }
                        else if (key == "LastName")
                        {
                            userProfile.lastName = val;  
                        }
                        else if (key == "WorkPhone")
                        {
                            userProfile.workPhone = val;  
                        }
                        else if (key == "HomePhone")
                        {
                            userProfile.homePhone = val;  
                        }
                        else if (key == "Department")
                        {
                            userProfile.department = val;  
                        }
                        else if (key == "Title")
                        {
                            userProfile.title = val;  
                        }
                        else if (key == "PictureURL")
                        {
                            if(userProfile.pictureUrl == null)
                            {
                                userProfile.pictureUrl = val;
                            }
                        }

                        else if (key == "Office")
                        {
                            userProfile.office = val;  
                        }
                        else if (key == "WorkEmail")
                        {
                            userProfile.workEmail = val;  
                        }
                        else if (key == "SPS-SipAddress")
                        {
                            userProfile.sipAddress = val;  
                        }
                    });
                }
                userProfile.userProfileProperties = userProfileProps; 
                return userProfile;

            });
        });
    }
}