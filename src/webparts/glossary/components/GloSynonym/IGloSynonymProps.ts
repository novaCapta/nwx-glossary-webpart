import { ITerm } from '../../../../core/ITerm';
export interface IGloSynonymProps  
{
    term:ITerm;
    showTermClick?: (term?: ITerm) => void;
}