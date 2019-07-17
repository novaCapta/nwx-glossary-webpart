import {IUserInfo} from './IUserInfo';
/**
 * @interface
 * This interface defiens properties for the GloMetaInfo which provides 
 * additional information about glossary.
 */
export interface IGloMetaInfo  
{
    contactContent:IUserInfo;
    contactTechnical:IUserInfo;
    audience:string;
    guideline:string;
}