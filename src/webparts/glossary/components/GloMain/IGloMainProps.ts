import { ILetter } from '../../../../core/ILetter';
import { IGlossaryService } from '../../../../core/IGlossaryService';
import { IGloMetaInfoProps } from '../../components/GloMetaInfo/IGloMetaInfoProps';

export interface IGloMainProps  
{
    glossaryTitle:string;
    glossaryDescription:string;
    hasPermission: boolean;
    letterDisplayMode:string;
    initialSelectedKey?: string;
    initiallySelectFirstLetter: boolean;
    termDisplayMode: string;
    termsShowAll:boolean;
    termsShowEditorInformation:boolean;
    allLetters: ILetter[];
    glossaryService: IGlossaryService; 
    metaInfoProps: IGloMetaInfoProps;
    stateKey:string;
}