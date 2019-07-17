import { IUserInfo } from '../../../../core/IUserInfo';

export interface IGloMetaInfoEditState  
{
    contactContent?:IUserInfo;
    contactTechnical?:IUserInfo;
    audience?:string;
    guideline?:string;
    showEditPanel?:boolean;
}