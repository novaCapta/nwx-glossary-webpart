import { ITerm } from '../../../../core/ITerm';
export interface IGloTermProps  
{
    term:ITerm;
    showEditLink: boolean;
    showEditorInformation:boolean;
    displayType:TermDisplayType;
    onEditClick?: (term?: ITerm, ev?: React.MouseEvent<HTMLElement>) => void;
}

export enum TermDisplayType {
    Overview,
    Detail,
    Dialog
}