/**
 * @interface
 * This interface serves as the state of the component PersonaCard. 
 */
export interface IPersonaCardState {

  loading:boolean;
  error?:string;

  firstName?: string;
  lastName?: string;
  userProfileProperties?: Array<any>;
  email?: string;
  workEmail?: string;
  homePhone?:string;
  workPhone?: string;
  displayName?: string;
  department?: string;
  office?: string;
  pictureUrl?: string;
  title?: string;
  sipAddress?:string;

  selectedKey?:string;
}