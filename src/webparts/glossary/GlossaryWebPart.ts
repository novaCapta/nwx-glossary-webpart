import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version,Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {IWebPartContext, BaseClientSideWebPart, PropertyPaneFieldType, IPropertyPaneConfiguration, PropertyPaneTextField, PropertyPaneToggle, PropertyPaneChoiceGroup} from '@microsoft/sp-webpart-base';
import { SPPermission } from '@microsoft/sp-page-context';
import * as strings from 'glossaryStrings';
import { IGlossaryWebPartProps } from './IGlossaryWebPartProps';
import GloMain from './components/GloMain/GloMain';
import {IGloMainProps} from './components/GloMain/IGloMainProps';
import {StringUtil} from '../../core/StringUtil';
import {ILetter, LetterType, ITermList, IGloMetaInfo, MockGlossaryService, GlossaryService, MockTermListService, TermListService, ITermListService, IUserSearchService, UserSearchService, MockUserSearchService, IUserProfileService, UserProfileService, MockUserProfileService} from '../../core';
import  GloTermListCreate from './components/GloTermListCreate/GloTermListCreate';
import { IGloTermListCreateProps} from './components/GloTermListCreate/IGloTermListCreateProps';
import { PropertyPaneAsyncDropdown} from '../../controls/PropertyPaneAsyncDropdown/PropertyPaneAsyncDropdown';
import { IDropdownOption } from 'office-ui-fabric-react';
import '../../css/glossary.scss';
import '../../css/persona.scss';
import '../../css/tageditor.scss';
import { update, get } from '@microsoft/sp-lodash-subset';
import { getId } from 'office-ui-fabric-react';
import AsyncDropdown from '../../components/AsyncDropdown/AsyncDropdown';
import { IAsyncDropdownProps } from '../../components/AsyncDropdown/IAsyncDropdownProps';
import GloMetaInfoEdit from './components/GloMetaInfoEdit/GloMetaInfoEdit';
import {IGloMetaInfoEditProps } from './components/GloMetaInfoEdit/IGloMetaInfoEditProps';

/**
 * The Glossary Webpart for Microsoft SharePoint Framework (SPFx) provides a webpart for an easy 
 * to use glossary on your SharePoint pages using the modern SharePoint Framework and layout. 
 * Short summary of the features:
 * - Add a new entry directly from the webpart
 * - Edit existing entries from the webpart
 * - Use the navigation links for browsing for entries
 * - Save time finding the right entry using our search functionality
 * - Choose between different display modes
 * - Smart navigation showing only navigation links with available content
 * - Responsive design makes the glossary look good on any device
 */
export default class GlossaryWebPart extends BaseClientSideWebPart<IGlossaryWebPartProps> {

  private termListService:ITermListService = null;
  private userSearchService:IUserSearchService = null;
  private userProfileService:IUserProfileService = null;
  private gloTermListPicker:PropertyPaneAsyncDropdown = null;
  private termlistselectWrapperId: string = null;

  /**
   * @function
   * Web part contructor.
   */
  public constructor(context?: IWebPartContext) {
    super();

    this.onPropertyPaneFieldChanged = this.onPropertyPaneFieldChanged.bind(this);
    this.onTermListCreating = this.onTermListCreating.bind(this);
    this.onTermListCreated = this.onTermListCreated.bind(this);
  }

  public render(): void {

    if (StringUtil.isNullOrEmpty(this.properties.listName))
    {
      this.renderTermListCreateOrSelect(this.domElement);
      return;
    }

    const gloMain: React.ReactElement<IGloMainProps> = React.createElement(GloMain, 
    { 
      glossaryTitle: this.properties.title,
      glossaryDescription: this.properties.description,
      hasPermission: this.hasPermission(),
      letterDisplayMode: this.properties.letterDisplayMode,
      initiallySelectFirstLetter: this.properties.initiallySelectFirstLetter,
      termDisplayMode: this.properties.termDisplayMode,
      termsShowAll: this.properties.termsShowAll,
      termsShowEditorInformation: this.properties.termsShowEditorInformation,
      allLetters: this.getAllLetters(),
      glossaryService: Environment.type == EnvironmentType.Local ? new MockGlossaryService(this.context, this.properties.listName) : new GlossaryService(this.context, this.properties.listName),
      metaInfoProps: { 
        getMetaInfo: this.getMetaInfo.bind(this), 
        userProfileService : this.getUserProfileService(),
        getWebPartInfo: this.getWebPartInfo.bind(this)
       },
      stateKey: new Date().toString()
    });

    ReactDom.render(gloMain, this.domElement);
  }

  protected get dataVersion(): Version {
    
    return Version.parse('2.0.0.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    if(this.gloTermListPicker == null)
    {
      this.gloTermListPicker = new PropertyPaneAsyncDropdown('listName', {
        key:"glossaryListFieldId",
        label: strings.ListNameFieldLabel,
        loadOptions: this.loadLists.bind(this),
        onPropertyChange: this.updateProperty.bind(this),
        selectedKey: this.properties.listName,
        loadingMsg: strings.ListLoadingOptions,
        defaultErrorMsg:strings.ListDefaultErrorMsg
      });
    }else{
      this.gloTermListPicker.properties.selectedKey = this.properties.listName;
    }

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          displayGroupsAsAccordion: true,
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                  onGetErrorMessage: this.validateTitle              
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true
                }),
                {
                  type: PropertyPaneFieldType.Custom,
                  targetProperty: 'metaInfo',                                               
                  properties: {
                    key: 'metaInfo',     
                    onRender: this.metaInfoEditRender.bind(this),
                    value: this.properties.metaInfo,
                    context: this.context
                  }
                }
              ]
            },
            {
              groupName: strings.DataGroupName,
              groupFields: [
                this.gloTermListPicker,
                {
                  type: PropertyPaneFieldType.Custom,
                  targetProperty: '',
                  properties: {
                    key: 'gloTermListPicker',     
                    onRender: this.termListCreateRenderer.bind(this),
                    value: undefined,
                    context: undefined
                  }
                }
              ]
            },
            {
              groupName: strings.LettersGroupName,
              groupFields:[
                PropertyPaneToggle('initiallySelectFirstLetter', {
                  label: strings.InitiallySelectFirstLetterFieldLabel,
                  key: 'initiallySelectFirstLetterFieldId' 
                }),
                PropertyPaneChoiceGroup('letterDisplayMode', {
                  label: strings.LetterDisplayModeFieldLabel,
                  options: [
                    {key: 'tabs', text: strings.LetterDisplayModeTabs},
                    {key: 'links', text: strings.LetterDisplayModeLinks},
                  ]
                })
              ]
            },
            {
              groupName: strings.TermsGroupName,
              groupFields: [
                PropertyPaneToggle('termsShowAll', {
                    label: strings.TermsShowAllFieldLabel,
                    key: 'termsShowAllFieldId'
                  }),
                PropertyPaneToggle('termsShowEditorInformation', {
                    label: strings.TermsShowEditorInformationFieldLabel,
                    key: 'termsShowEditorInformationFieldId'
                  })/*,
                PropertyFieldDisplayMode('termDisplayMode', {
                  label: strings.TermDisplayModeFieldLabel,
                  initialValue: this.properties.termDisplayMode,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'termDisplayModeFieldId'
                })*/
              ]
            },
            {
              groupName: strings.WebPartInfoGroupName, 
              groupFields: [
                {
                  type: PropertyPaneFieldType.Custom,
                  targetProperty: '',
                  properties: {
                    key: 'webPartInfo',
                    onRender: this.webPartInfoRender.bind(this),
                    value: undefined,
                    context: undefined
                  }
                }
              ] 
            }
          ]
        }
      ]
    };
  }

  private renderTermListCreateOrSelect(elem: HTMLElement): void {

    const createId = getId('nc-termlistcreate');
    const selectId = getId('nc-termlistselect');
    const infoId = getId('nc-webpartinfo');
    this.termlistselectWrapperId = selectId + '-wrapper';


    elem.innerHTML = `
        <div class="Placeholder">
          <div class="Placeholder-container ms-Grid">
            <div class="Placeholder-head ms-Grid-row">
              <div class="ms-Grid-col ms-u-hiddenSm ms-u-md3"></div>
              <div class="Placeholder-headContainer ms-Grid-col ms-u-sm12 ms-u-md6">
                <i class="Placeholder-icon ms-fontSize-su ms-Icon ms-Icon--Org"></i>
                <span class="Placeholder-text ms-fontWeight-light ms-fontSize-xxl">${this.properties.title}</span>
              </div>
              <div class="ms-Grid-col ms-u-hiddenSm ms-u-md3"></div>
            </div>
            <div class="Placeholder-description ms-Grid-row">
              <span class="Placeholder-descriptionText">${strings.WebPartDefaultDescription}</span>
            </div>

            
            <div class="Placeholder-description ms-Grid-row">

              <div class="nc-termlist-selectorcreate">
                <div id="${createId}">
                </div>
                <div id="${this.termlistselectWrapperId}">
                  <div class="nc-termlistselect-description">
                  ${strings.TermListSelectDescription}
                  </div>
                  <div id="${selectId}" class="nc-termlistselect-form">
                  </div>
                </div>
              </div>

            </div>

            <div class="Placeholder-description ms-Grid-row nc-webpartinfo-wrapper" id="${infoId}">
            
            </div>


          </div>
        </div>`;

    if(this.hasPermission()){
      this.renderTermListCreate(document.getElementById(createId));
    }
      
    const listSelect: React.ReactElement<IAsyncDropdownProps> = React.createElement(AsyncDropdown, {
      key: "glossaryListSelect",
      label: '',
      loadOptions: this.loadLists.bind(this),
      onChanged: this.onListChange.bind(this),
      selectedKey: this.properties.listName,
      disabled: false,
      loadingMsg:  strings.ListLoadingOptions,
      defaultErrorMsg: strings.ListDefaultErrorMsg,
      promptMessage :strings.TermListSelectPrompt,
      // required to allow the component to be re-rendered by calling this.render() externally
      stateKey: new Date().toString()
    });
    
    ReactDom.render(listSelect, document.getElementById(selectId));

    this.webPartInfoRender(document.getElementById(infoId), this.context);

  }

  private renderTermListCreate(elem: HTMLElement)
  {
    const listCreate: React.ReactElement<IGloTermListCreateProps> = React.createElement(GloTermListCreate, 
    { 
      termListService: this.getTermListService(),
      onListCreated:this.onTermListCreated,
      onListCreating:this.onTermListCreating
    });

    ReactDom.render(listCreate, elem);
  }

  private termListCreateRenderer(elem: HTMLElement, context: any, onChanged?: any): void 
  {
      if(this.hasPermission())
      {
        this.renderTermListCreate(elem);
      }
  } 

  private getWebPartInfo():string{
    const title = StringUtil.format(strings.WebPartInfoWebpart, this.title);

    const version = this.dataVersion.major.toString() + "." + this.dataVersion.minor.toString()  + "." + this.dataVersion.patch.toString();
    const revision = this.dataVersion.toString();

    const versionInfo = StringUtil.format(strings.WebPartInfoVersion, version, revision);

    return `<div class="nc-webpartinfo">${strings.WebPartInfoCopyright}<br/>${versionInfo}<br/>${title}</div>`;

  }

  private webPartInfoRender(elem: HTMLElement, context: any, onChanged?: any): void 
  {
    elem.innerHTML = this.getWebPartInfo();
  }

  private metaInfoEditRender(elem: HTMLElement, context: any, onChanged?: any):void
  {
     const gloMetaInfoEdit: React.ReactElement<IGloMetaInfoEditProps> = React.createElement(GloMetaInfoEdit, 
    { 
      metaInfo: this.getMetaInfo(),
      updateMetaInfo: this.setMetaInfo.bind(this),
      userSearchService: this.getUserSearchService()
    });

    ReactDom.render(gloMetaInfoEdit, elem);
  }
 
  private getAllLetters(): ILetter[]
  {
    const alphabeticTokens:string[] = strings.AlphabeticTokens.split(';');
    var allLetters: ILetter[] = [];
    for(var i = 0; i< alphabeticTokens.length; i++)
    {
      allLetters.push({key:alphabeticTokens[i], title: alphabeticTokens[i], type: LetterType.Alpha});
    }
    allLetters.push({key:strings.NumericToken, title: strings.NumericToken, type: LetterType.Numeric});
    allLetters.push({key:strings.NonAlphaNumericToken, title: strings.NonAlphaNumericToken, type: LetterType.NonAlphaNumeric });
    return allLetters;
  }

  private setMetaInfo(props: IGloMetaInfo): void
  {
    
    this.updateProperty('metaInfo', props);
  }

  private getMetaInfo() : IGloMetaInfo
  {
    return this.properties.metaInfo;
  }

  private getUserSearchService(): IUserSearchService
  {
    if(this.userSearchService == null)
      this.userSearchService = Environment.type == EnvironmentType.Local ? new MockUserSearchService(this.context) : new UserSearchService(this.context);
    return this.userSearchService;
  }

  private getUserProfileService(): IUserProfileService
  {
    if(this.userProfileService == null)
    {

      if(Environment.type == EnvironmentType.Local)
      {
        this.userProfileService = new MockUserProfileService(this.context);
      }else{
        this.userProfileService = new UserProfileService(this.context);
      }
    }

    return this.userProfileService;
  } 

  private hasPermission(): boolean
  {
      if(Environment.type == EnvironmentType.Local)
      {
        return true;
      }else{

        var permissions = this.context.pageContext.web.permissions;
        if (permissions.hasPermission(SPPermission.manageLists)) {
          return true;
        }

      }

      return false;
  }

  private getTermListService(): ITermListService
  {
    if(this.termListService == null)
      this.termListService = Environment.type == EnvironmentType.Local ? new MockTermListService(this.context) : new TermListService(this.context);
    return this.termListService;
  }

  private loadLists(): Promise<IDropdownOption[]> 
  {
    return this.getTermListService().getTermLists().then((response: ITermList[]) => {
      var options:IDropdownOption[] = [];
      response.map((list: ITermList) => {
        var isSelected: boolean = false;
        if (this.properties.listName == list.id) {
          isSelected = true;
        }
        options.push({
          key: list.id,
          text: list.title,
          isSelected: isSelected
        });
      });

      this.onTermListsLoaded(options);
      return options;
    }) as Promise<IDropdownOption[]>;
  }

  private onTermListsLoaded(options:IDropdownOption[])
  {
    if(options.length == 0)
    {
        if(this.termlistselectWrapperId)
        {
          const selectListWrapper = document.getElementById(this.termlistselectWrapperId);
          if(selectListWrapper) selectListWrapper.style.display = 'none';
        }

    }

  }

  private onTermListCreating(listName:string): void
  {
      if(this.gloTermListPicker != null)
      {
        this.gloTermListPicker.properties.disabled = true;
      }
  }

  private onTermListCreated(listName:string, newList:ITermList): void
  {
    if(newList != null)
    {
      const newValue = newList.id;
      this.updateProperty('listName', newValue);

      if(this.gloTermListPicker != null)
      {
        // reset selected values in list dropdown
        this.gloTermListPicker.properties.selectedKey = newValue; 
        // allow to load lists  
        this.gloTermListPicker.properties.disabled = false;
        // load items and re-render lists dropdown
        this.gloTermListPicker.render();
      }      
    }
  }

  private onListChange(option: IDropdownOption, index?: number): void {
    window.setTimeout(
      function() {
        this.updateProperty('listName', option.key);
      }.bind(this),
      2000
    );
  }


  private updateProperty(propertyPath: string, newValue: any): void {
    
    const oldValue: any = get(this.properties, propertyPath);
    // store new value in web part properties
    update(this.properties, propertyPath, (): any => { return newValue; });
    // refresh web part
    this.refreshWebPart(propertyPath, oldValue, newValue);
  }

  private refreshWebPart (propertyPath, oldValue, newValue) {

    //this.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    if (!this.disableReactivePropertyChanges) {
        this.render();
    }
  }

  private validateTitle(value: string): string {
    // If validation is not successful, return a string with error message.
    if (value.length < 1) {
      return strings.RequiredValidationMessage;
    }
    else {
      // If validation is successful, return an empty string.
      return "";
    }
  }

}
