import { IUserProfileService } from './IUserProfileService';
import { IUserProfile } from './IUserProfile';
import { IWebPartContext } from '@microsoft/sp-webpart-base';
/**
 * @class
 * Service implementation to retrieve user profile properties in the local workbench
 */
export class MockUserProfileService implements IUserProfileService  {

    private context: IWebPartContext;

    /**
     * @function
     * Service constructor
     */
    constructor(pageContext: IWebPartContext){
        this.context = pageContext;
    }

    private static _results:IUserProfile[] = [
            {
                accountName: "i:0#.f|membership|brittany.burke87@example.com",
                firstName: "Brittany",
                lastName: "Burke",
                email: "brittany.burke87@example.com",
                workEmail: "brittany.burke87@example.com",
                homePhone: "(374)-260-7123",
                workPhone: "(906)-682-5408",
                displayName: "Brittany Burke",
                department: "Microsoft",
                office: "Microsoft",
                pictureUrl: "https://randomuser.me/api/portraits/women/17.jpg",
                title: "Architect",
                sipAddress: "brittany.burke87@example.com"
            },
            {
                accountName: "i:0#.f|membership|chris.vargas95@example.com",
                firstName: "Chris",
                lastName: "Vargas",
                email: "chris.vargas95@example.com",
                workEmail: "chris.vargas95@example.com",
                homePhone: "(382)-225-4045",
                workPhone: "(577)-420-9916",
                displayName: "Chris Vargas",
                department: "Microsoft",
                office: "Microsoft",
                pictureUrl: "https://randomuser.me/api/portraits/men/61.jpg",
                title: "VIP Marketing",
                sipAddress: "chris.vargas95@example.com"
            },
            {
                accountName: "i:0#.f|membership|lorraine.nelson73@example.com",
                firstName: "Lorraine",
                lastName: "Nelson",
                email: "lorraine.nelson73@example.com",
                workEmail: "lorraine.nelson73@example.com",
                homePhone: "(374)-260-7123",
                workPhone: "(647)-740-5891",
                displayName: "Lorraine Nelson",
                department: "Microsoft",
                office: "Microsoft",
                pictureUrl: "https://randomuser.me/api/portraits/women/25.jpg",
                title: "Sales Lead",
                sipAddress: "lorraine.nelson73@example.com"
            },
                        {
                accountName: "i:0#.f|membership|julie.bennett48@example.com",
                firstName: "Julie",
                lastName: "Bennett",
                email: "julie.bennett48@example.com",
                workEmail: "julie.bennett48@example.com",
                homePhone: "(396)-694-7138",
                workPhone: "(117)-224-1003",
                displayName: "Julie Bennett",
                department: "Microsoft",
                office: "Microsoft",
                pictureUrl: "https://randomuser.me/api/portraits/women/85.jpg",
                title: "Assistant",
                sipAddress: "julie.bennett48@example.com"
            },
                                    {
                accountName: "i:0#.f|membership|gordon.cook12@example.com",
                firstName: "Gordon",
                lastName: "Cook",
                email: "gordon.cook12@example.com",
                workEmail: "gordon.cook12@example.com",
                homePhone: "(596)-773-8542",
                workPhone: "(736)-229-9893",
                displayName: "Gordon Cook",
                department: "Microsoft",
                office: "Microsoft",
                pictureUrl: "https://randomuser.me/api/portraits/men/52.jpg",
                title: "Developer",
                sipAddress: "gordon.cook12@example.com",
            }
        
        ];



    public getUserProfileProperties(accountName: string): Promise<IUserProfile>
    {
        return new Promise<IUserProfile>((resolve) => {

            var result:IUserProfile = null;
            const len = MockUserProfileService._results.length;

            for (var i = 0; i < len; i++) 
            {
                var up = MockUserProfileService._results[i];

                if(up.accountName == accountName || up.accountName == "i:0#.f|membership|" + accountName)
                {
                    result = up;
                    break;
                }

            }
            resolve(result);
        }); 
    }


}