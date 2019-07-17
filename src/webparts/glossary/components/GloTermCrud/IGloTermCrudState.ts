
export interface IGloTermCrudState {
  validationErrorOpen?: boolean;
  validationErrorMsg?: string;
  deleteOpen?: boolean;
  termTitle?:string;
  termDefinition?:string;
  termSynonyms?:string[];
  titleErrorMessage?:string;
  definitionErrorMessage?:string;
  synonymErrorMessage?:string;
}