
import { IGloMetaInfo } from '../../../../core/IGloMetaInfo';
import { IUserProfileService } from '../../../../core/IUserProfileService';
export interface IGloMetaInfoProps  
{
    getMetaInfo: ()=>IGloMetaInfo;
    userProfileService: IUserProfileService;
    getWebPartInfo:()=>string; 
}