

/**
 * @interface
 * Defines a term
 */
export interface ITerm {
  title: string;
  itemId: string;
  definition?: string;
  created?: Date;
  lastModified?: Date;
  createdBy?:string;
  modifiedBy?:string;
  synonyms?: string;
  isSynonym?: boolean;
  synonymForTerm?: ITerm;
}