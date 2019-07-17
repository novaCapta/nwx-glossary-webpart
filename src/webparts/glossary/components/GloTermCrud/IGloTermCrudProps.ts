import { ITerm } from '../../../../core/ITerm';

export interface IGloTermCrudProps  
{
    term?:ITerm;
    createTerm: (ITerm)=>void;
    updateTerm: (ITerm)=>void;
    deleteTerm: (ITerm)=>void;
    checkTerm: (string)=>Promise<boolean>;
    cancel: ()=>void;
}