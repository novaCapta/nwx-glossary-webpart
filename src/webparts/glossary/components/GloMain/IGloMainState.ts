import { ITerm } from '../../../../core/ITerm';

export interface IGloMainState {
	loaded: boolean;
	error: string;
	successMsg?:string;
	selectedKey?: string;
	selectedTabId?: string;
	searchText?: string;
	terms?: ITerm[];
	nbTotal?:number;
	showCrudPanel?:boolean;
	editingTerm?:ITerm;	
	showSingleTerm?:ITerm;
}