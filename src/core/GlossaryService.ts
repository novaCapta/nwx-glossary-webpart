
//import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IGlossaryService } from './IGlossaryService';
import { ITerm } from './ITerm';
import  {TermFields} from './Constants';
import { times } from '@microsoft/sp-lodash-subset';

/**
 * @class
 * Service implementation to get list items from current SharePoint site
 */
export class GlossaryService implements IGlossaryService {

    private context: IWebPartContext;
    private listName:string;
    private listItemEntityTypeName: string = undefined;

    /**
     * @function
     * Service constructor
     */
    constructor(pageContext: IWebPartContext, listName:string){
        this.context = pageContext;
        this.listName = listName;
    }

    /**
   * @function
   * Gets the number of all term definitions
   */
    public getTermCount(): Promise<number>{

        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${this.listName}')/ItemCount`;

        return this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
            return response.json().then((responseFormated:any): number => 
            {
                return responseFormated.value;
            });
        })as Promise<number>;

    }

    /**
     * @function
     * Gets the list of all term definitions
     */
    public getAllTerms(): Promise<ITerm[]>{

        const limit:number = 500;

        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${this.listName}')/items`;
        restUrl += `?$Select=Title,${TermFields.Definition.Name},${TermFields.Synonyms.Name},Created,Modified,Author/Title,Editor/Title,ID`;
        restUrl += `&$expand=Author/Id,Editor/Id`;
        restUrl += `&$top=${limit}`;

        var terms: ITerm[] = [];
        return this.getTermsPaged(terms, restUrl);
    }

    private getTermsPaged(terms, restUrl): Promise<ITerm[]>{

        return this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
            return response.json().then((responseFormated: any) => {
                
                responseFormated.value.map((object: any, i: number) => 
                {
                  const term:ITerm = this.prepareTerm(object);
                  terms.push(term);
                });

                var nextLink = responseFormated["@odata.nextLink"];
                if(nextLink)
                {
                    return this.getTermsPaged(terms, nextLink);
                }
 
                return terms;
            });
        }) as Promise<ITerm[]>;
    } 

   /**
   * @function
   * Checks if a term name already exists
   */
    public checkIfTermExists(termName:string): Promise<Boolean>
    {
        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${this.listName}')/items`;
        restUrl += `?$Select=Title,ID&$filter=Title%20eq%20'${encodeURIComponent(termName)}'&$top=1`;

        return this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
            return response.json().then((responseFormated: any) => {
                var result: Boolean = false;
                if(responseFormated != null && responseFormated.value != null && 
                responseFormated.value.length > 0 && responseFormated.value[0]['Title'] != null)
                {
                    result = true;
                }
                return result;
            });
        }) as Promise< Boolean>;

    }


    /**
     * @function
     * Create a term
     */
    public createTerm(term:ITerm): Promise<ITerm>{

        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${this.listName}')/items`;

        let listItemEntityTypeName: string = undefined;

        const promiseEntityType = this.getListItemEntityTypeName().then((listItemEType: string) =>{
            listItemEntityTypeName = listItemEType;
            return listItemEntityTypeName;
        });
        
        return Promise.all([promiseEntityType]).then((results): Promise<SPHttpClientResponse> =>{

            listItemEntityTypeName = results[0];

            const data = {
                '__metadata': {
                    'type': listItemEntityTypeName
                },
                'Title': term.title
            };
            
            data[`${TermFields.Definition.Name}`] = term.definition;
            data[`${TermFields.Synonyms.Name}`] = term.synonyms;
            
            const body: string = JSON.stringify(data);

            return this.context.spHttpClient.post(restUrl,
            SPHttpClient.configurations.v1,
            {
                headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=verbose',
                'odata-version': ''
                },
                body: body
            });
        })
        .then((response: SPHttpClientResponse): Promise<any> => {
            return response.json();
        })
        .then((object: any): ITerm => {

            return this.prepareTerm(object);

        }) as Promise<ITerm>;

    }

    /**
     * @function
     * Update a term
     */
    public updateTerm(term:ITerm): Promise<boolean>{

        let etag: string = undefined;
        let listItemEntityTypeName: string = undefined;

        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${this.listName}')/items(${term.itemId})`;


        const promiseEntityType = this.getListItemEntityTypeName().then((listItemEType: string) =>{
            listItemEntityTypeName = listItemEType;
            return listItemEntityTypeName;
        });

      
        return Promise.all([promiseEntityType]).then((results): Promise<SPHttpClientResponse> =>{

            listItemEntityTypeName = results[0];

            return this.context.spHttpClient.get(`${restUrl}?$select=Id`,
            SPHttpClient.configurations.v1,
            {
                headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': ''
                }
            });
        })
        .then((response: SPHttpClientResponse): Promise<any> => {
            etag = response.headers.get('ETag');
            return response.json();
        })
        .then((item: any): Promise<SPHttpClientResponse> => {

            const data = {
                '__metadata': {
                    'type': listItemEntityTypeName
                },
                'Title': term.title
            };
            
            data[`${TermFields.Definition.Name}`] = term.definition;
            data[`${TermFields.Synonyms.Name}`] = term.synonyms;
            
            const body: string = JSON.stringify(data);
        
            return this.context.spHttpClient.post(restUrl,
            SPHttpClient.configurations.v1,
            {
                headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=verbose',
                'odata-version': '',
                'IF-MATCH': etag,
                'X-HTTP-Method': 'MERGE'
                },
                body: body
            });
        })
      .then((response: SPHttpClientResponse): boolean => {
            return true;
        }) as Promise< boolean>;
    }

    /**
     * @function
     * Delete a term
     */
    public deleteTerm(itemId:string): Promise<boolean>
    {
        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${this.listName}')/items(${itemId})`;

        let etag: string = undefined;

        return this.context.spHttpClient.get(`${restUrl}?$select=Id`, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse): Promise<any> => {
            etag = response.headers.get('ETag');
            return response.json();
        })
        .then((item: any): Promise<SPHttpClientResponse> => {
            return this.context.spHttpClient.post(restUrl, SPHttpClient.configurations.v1,
            {
                headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=verbose',
                'odata-version': '',
                'IF-MATCH': etag,
                'X-HTTP-Method': 'DELETE'
                }
            });
        })
      .then((response: SPHttpClientResponse): boolean => {
            return true;
        }) as Promise< boolean>;

    }

    private getListItemEntityTypeName(): Promise<string> {

        return new Promise<string>((resolve: (listItemEntityTypeName: string) => void, reject: (error: any) => void): void => {
        if (this.listItemEntityTypeName) {
            resolve(this.listItemEntityTypeName);
            return;
        }

        var restUrl: string = this.context.pageContext.web.absoluteUrl;
        restUrl += `/_api/Web/Lists(guid'${this.listName}')?$select=ListItemEntityTypeFullName`;

        this.context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1)
            .then((response: SPHttpClientResponse): Promise<{ ListItemEntityTypeFullName: string }> => {
                return response.json();
            }, (error: any): void => {
                reject(error);
            })
            .then((response: { ListItemEntityTypeFullName: string }): void => {
                this.listItemEntityTypeName = response.ListItemEntityTypeFullName;
                resolve(this.listItemEntityTypeName);
            });
        });
    }


    private prepareTerm(object): ITerm
    {
        var term: ITerm = {
            'itemId': object["ID"],
            'title': object['Title'],
            'definition': object[`${TermFields.Definition.Name}`],
            'synonyms': object[`${TermFields.Synonyms.Name}`],
            'created': new Date(object['Created']),
            'lastModified': new Date(object['Modified']),
            'createdBy': object['Author'] ? object['Author']['Title'] : null,
            'modifiedBy': object['Editor'] ? object['Editor']['Title'] : null,
        };

        return term;
    }
}