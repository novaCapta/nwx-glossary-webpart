import {ITermList } from '../../../../core/ITermList';
import {ITermListService } from '../../../../core/ITermListService';

export interface IGloTermListCreateProps {
    termListService: ITermListService;
    onListCreating(listName:string): void;
    onListCreated(listName:string, newList:ITermList): void;
}