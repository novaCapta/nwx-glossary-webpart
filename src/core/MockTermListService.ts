import { ITermListService } from './ITermListService';
import { ITermList } from './ITermList';
import { Guid } from '@microsoft/sp-core-library';
import { IWebPartContext } from '@microsoft/sp-webpart-base';

/**
 * @class
 * Defines a service to request mock data to use the web part with the local workbench
 */
export class MockTermListService implements ITermListService  {

    private context: IWebPartContext;

    /**
     * @function
     * Service constructor
     */
    constructor(pageContext: IWebPartContext){
        this.context = pageContext;
    }


    private allTermLists:ITermList[];


    /**
   * @function
   * Gets the collection of glossary term lists in the current SharePoint site
   */
   public getTermLists(): Promise<ITermList[]>
   {
    return new Promise<ITermList[]>((resolve) => {

            if(this.allTermLists == null)
            {
              this.allTermLists = [
                        { title: 'Mock List One', id: '6770c83b-29e8-494b-87b6-468a2066bcc6' },
                        { title: 'Mock List Two', id: '2ece98f2-cc5e-48ff-8145-badf5009754c' },
                        { title: 'Mock List Three', id: 'bd5dbd33-0e8d-4e12-b289-b276e5ef79c2'}
                    ];

            }
          resolve(this.allTermLists);
      }) ;
   }

    /**
     * @function
     * Create a SharePoint list for terms and returns a guid.
     */
    public createTermList(name:string): Promise<ITermList>
    {
      return new Promise<ITermList>((resolve) => {
            this.getTermLists().then((allTermLists: ITermList[]) => 
            {
                var result: ITermList = null;            
                const len = allTermLists.length;

                for (var i = 0; i < len; i++) 
                {
                    var list = allTermLists[i];
                    if (list.title.toLowerCase() == name.toLowerCase()) 
                    {
                        result = list;
                        break;
                    }
                }

                if(result == null )
                {
                    const newList = {id: Guid.newGuid().toString(), title: name};
                    allTermLists.push(newList);
                    result = newList;
                }
                resolve(result);
            });
        });

    }

  /**
   * @function
   * Check whether the list contains the content type 'GlossaryTerm'
   */
    public isTermList(listId:string): Promise<boolean>
    {
        return new Promise<boolean>((resolve) => {
            resolve(true);
        });
    }

    /**
   * @function
   * Check whether a duplicate list already exists
   */
    public listNameAlreadyExists(name:string): Promise<boolean>
    {
        return new Promise<boolean>((resolve) => {
            this.getTermLists().then((allTermLists: ITermList[]) => 
            {
                var exists:boolean = false;          
                const len = allTermLists.length;

                for (var i = 0; i < len; i++) 
                {
                    var list = allTermLists[i];
                    if (list.title.toLowerCase() == name.toLowerCase()) 
                    {
                        exists = true;
                        break;
                    }
                }
                resolve(exists);
            });
        });
    }
}