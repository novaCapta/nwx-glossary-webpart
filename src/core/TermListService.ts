
import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ITermListService } from './ITermListService';
import { ITermList } from './ITermList';
import  {TermFields} from './Constants';


/**
 * @class
 * Service implementation to get lists from current SharePoint site
 */
export class TermListService implements ITermListService{

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
     * Gets the collection of glossary term lists in the current SharePoint site
     */
    public getTermLists(): Promise<ITermList[]>{

        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += "/_api/web/lists?$select=Title,id";
        restUrl += "&$filter=BaseTemplate%20eq%20100";
        restUrl += "%20and%20Hidden%20eq%20false";  
        restUrl += "&$orderby=Title";  

        return this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
           return response.json().then((responseFormated: any) => {
                
                var promises = [];

                responseFormated.value.map((object: any) => 
                {
                    var list: ITermList = {
                        'id': object['Id'],
                        'title': object['Title']
                    };

                    var promise = this.isTermList(list.id).then((valid:boolean)=>
                    {
                        if(!valid)
                        {
                            list.title = '';
                        }
                        return list;
                    });

                    promises.push(promise);
                 });
            
                return Promise.all(promises).then((results: ITermList[]) =>{
                    var termLists: ITermList[] = [];  
                    results.map((list:ITermList) => {
                        if(list.title != '') { termLists.push(list);}
                    } );
                    return termLists;
                });

            });

        });

    }

    /**
   * @function
   * Check whether a duplicate list already exists
   */
    public listNameAlreadyExists(listName:string): Promise<boolean>
    {
        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/lists/GetByTitle('${encodeURIComponent(listName)}')?$select=Id,Name&$top=1`;

        return this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
           return response.json().then((responseFormated: any) => {
              if(responseFormated != null && responseFormated.Id != null)
              {
                return true;
              }
              return false;
          });

        }).catch((err:any)=>{
            return false;
        });

    }

    /**
   * @function
   * Check whether the list contains the field 'ncGlossaryDefinition'
   */
    public isTermList(listId:string): Promise<boolean>
    {
        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${listId}')/Fields?$filter=InternalName%20eq%20%27${encodeURIComponent(TermFields.Definition.Name)}%27&$top=1`;

        return this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
           return response.json().then((responseFormated: any) => {
              return responseFormated.value.length > 0;
          });

        });
    }

    /**
     * @function
     * Create a SharePoint list for terms and returns a guid.
     */
    public createTermList(name:string): Promise<ITermList>
    {
        let newTermList: ITermList = undefined;

        return this.createList(name).
        then((list:ITermList)=>
        {
            newTermList = list;
            return this.addFieldsToList(newTermList.id)
            .then((result: boolean): ITermList =>
                {
                    return newTermList;    
                }); 

        }) as Promise<ITermList>;            
    }

    private createList(name:string): Promise<ITermList>
    {
        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists`;

        const body: string = JSON.stringify({ 
            '__metadata': { 'type': 'SP.List' }, 
            'AllowContentTypes': true, 
            'BaseTemplate': 100, 
            'ContentTypesEnabled': true, 
            'Title': name }
            );

            return this.context.spHttpClient.post(restUrl,
            SPHttpClient.configurations.v1,
            {
                headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=verbose',
                'odata-version': ''
                },
                body: body
            }).then((response: SPHttpClientResponse): Promise<any> => {
                return response.json();
            })
            .then((object: any): ITermList =>
            {
                var newTermList: ITermList = {
                    'id': object["Id"],
                    'title': object['Title']
                };
                return newTermList;

            }) as Promise<ITermList>;
            
    } 

    private addFieldToList(listId:string, fieldSchemaXml:string): Promise<Boolean>
    {
        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${listId}')/fields/createfieldasxml`;

        var fieldData = JSON.stringify({ 'parameters': { '__metadata': { 'type': 'SP.XmlSchemaFieldCreationInformation' },
            'SchemaXml': fieldSchemaXml} });

        return this.context.spHttpClient.post(restUrl,
        SPHttpClient.configurations.v1,
        {
            headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=verbose',
            'odata-version': ''
            },
            body: fieldData
        })
        .then((response: SPHttpClientResponse): Promise<any> => {
            return response.json();
        })
        .then((data: any): Boolean =>
        {
            if(data.Id != null)
                return true;
            return false;

        }) as Promise<Boolean>;
    }

    private addFieldsToList(listId:string): Promise<Boolean>
    {

        return this.addFieldToList(listId, TermFields.Definition.SchemaXml).then((res:boolean)=>{

            if(res)
            {
                return this.addFieldToList(listId, TermFields.Synonyms.SchemaXml);
            }
            return false;

        });

    }

}