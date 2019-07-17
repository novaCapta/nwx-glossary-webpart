import { IGloMetaInfo } from '../../../../core/IGloMetaInfo';
import { IUserSearchService } from '../../../../core/IUserSearchService';

export interface IGloMetaInfoEditProps  
{
    metaInfo: IGloMetaInfo;
    updateMetaInfo: (IGloMetaInfo)=>void;
    userSearchService:IUserSearchService;
}