declare interface IGlossaryStrings {
  AlphabeticTokens: string;
  NumericToken: string;
  NonAlphaNumericToken: string;
  ViewAllToken:string;

  PropertyPaneDescription: string;
  RequiredValidationMessage:string;
  BasicGroupName:string;
  TitleFieldLabel:string;
  DescriptionFieldLabel:string;

  DataGroupName: string;
  ListNameFieldLabel: string;  
  ListLoadingOptions:string;
  ListDefaultErrorMsg:string;

  LettersGroupName:string;
  LetterDisplayModeFieldLabel:string;
  LetterDisplayModeLinks:string;
  LetterDisplayModeTabs:string;
  InitiallySelectFirstLetterFieldLabel:string;

  TermsGroupName:string;
  TermDisplayModeFieldLabel:string;
  TermsShowAllFieldLabel:string;
  TermsShowEditorInformationFieldLabel:string;

  WebPartInfoGroupName:string;
  WebPartInfoCopyright:string;
  WebPartInfoVersion:string;
  WebPartInfoWebpart:string;

  TermLoadingSpinnerText:string;
  SearchTerm:string;
  AddTerm:string;
  EditTerm:string;
  DeleteTerm:string;
  CopyToClipboardTerm: string;
  FilterTerm:string;
  TermsTotal: string;
  TermsShowResult: string;
  TermNotFound:string;
  ShowMore:string;
  HideMore:string;
  TermCreated:string;
  TermCreatedBy:string;
  TermModified:string;
  TermModifiedBy:string;
  TermSynonyms:string;
  TermSynonymFor:string;
  TermLink:string;

  AddTermDialogTitle:string;
  EditTermDialogTitle:string;

  TermTitleFieldLabel:string;
  TermDefinitionFieldLabel:string;
  TermSynonymsFieldLabel:string;
  TermSynonymsPlaceholder:string;
  
  TermCreatedSuccessMsg:string;
  TermUpdatedSuccessMsg:string;
  TermDeletedSuccessMsg:string;

  TermCreatedErrorMsg:string;
  TermUpdatedErrorMsg:string;
  TermDeletedErrorMsg:string;

  TermPermissionMsg:string;
  TermValidationTitleRequired:string;
  TermValidationDefinitionRequired:string;
  TermValidationTitleLength:string;
  TermValidationDefinitionLength:string;
  TermValidationTitleExists:string;

  TermConfirmDel:string;
  TermConfirmDelMsg:string;

  OK:string;
  Cancel:string;
  Close:string;

  Yes:string;
  No:string;

  TermListCreateFieldLabel:string;
  TermListCreateRequiredMessage:string;
  TermListCreateButtonCreate:string;
  TermListCreateDescription:string;
  TermListCreateSpinnerText:string;
  TermListCreateDuplicateFound:string;

  TermListSelectDescription:string;
  TermListSelectPrompt:string;

  WebPartDefaultDescription:string;

  ShowGlossaryMetaInfo:string;
  EditGlossaryMetaInfo:string;
  
  GlossaryContactContentFieldLabel: string;
  GlossaryContactTechnicalFieldLabel: string;
  GlossaryAudienceFieldLabel: string;
  GlossaryGuidelineFieldLabel: string;

  PeoplePickerSuggestedContacts:string;
  PeoplePickerNoResults:string;
  PeoplePickerLoading:string;
  PeoplePickerLimitErrorMessage:string;
 
  SynonymEmptyErrorMessage:string;
  SynonymRepeatErrorMessage:string;
  SynonymLimitErrorMessage:string;
  SynonymExistsAlreadyErrorMessage:string;
  SynonymRepeatTitleErrorMessage:string;

}

declare module 'glossaryStrings' {
  const strings: IGlossaryStrings;
  export = strings;
}
