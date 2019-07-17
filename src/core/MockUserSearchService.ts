import { IUserSearchService } from './IUserSearchService';
import { IUserInfo } from './IUserInfo';
import { IWebPartContext } from '@microsoft/sp-webpart-base';
/**
 * @class
 * Service implementation to search people in the local workbench
 */
export class MockUserSearchService implements IUserSearchService  {

    private context: IWebPartContext;

    /**
     * @function
     * Service constructor
     */
    constructor(pageContext: IWebPartContext){
        this.context = pageContext;
    }

    private static _results:IUserInfo[] = [
            { fullName: "Brittany Burke", initials: "OC", jobTitle: "Architect", email: "brittany.burke87@example.com", login: "brittany.burke87@example.com", imageUrl: "https://randomuser.me/api/portraits/women/17.jpg"},
            { fullName: "Chris Vargas", initials: "KJ", jobTitle: "VIP Marketing", email: "chris.vargas95@example.com", login: "chris.vargas95@example.com", imageUrl: "https://randomuser.me/api/portraits/men/61.jpg" },
            { fullName: "Lorraine Nelson", initials: "GF", jobTitle: "Sales Lead", email: "lorraine.nelson73@example.com", login: "lorraine.nelson73@example.com", imageUrl: "https://randomuser.me/api/portraits/women/25.jpg" },
            { fullName: "Julie Bennett", initials: "SD", jobTitle: "Assistant", email: "julie.bennett48@example.com", login: "julie.bennett48@example.com", imageUrl: "https://randomuser.me/api/portraits/women/85.jpg" },
            { fullName: "Gordon Cook", initials: "JD", jobTitle: "Developer", email: "gordon.cook12@example.com", login: "gordon.cook12@example.com", imageUrl: "https://randomuser.me/api/portraits/men/52.jpg" }];

    /**
     * @function
     * Search People from a query
     */
    public searchPeople(query: string): Promise<Array<IUserInfo>>
    {
        return new Promise<IUserInfo[]>((resolve) => {
        resolve(MockUserSearchService._results);
        });
    }


}