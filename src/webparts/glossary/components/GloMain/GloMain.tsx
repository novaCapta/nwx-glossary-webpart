import * as React from 'react';
import { getId, css, KeyCodes, FocusZone, FocusZoneDirection, Spinner, List, TextField,  
  Panel, PanelType, Label, Button, MessageBar, MessageBarType, Dialog, DialogType, DialogFooter, ButtonType, SearchBox, CommandButton, Pivot, IPivotItemProps, PivotItem, PivotLinkFormat} from 'office-ui-fabric-react';
import * as strings from 'glossaryStrings';
import { IGloMainProps } from './IGloMainProps';
import { IGloMainState } from './IGloMainState';
import {ILetter, LetterType, ITerm} from '../../../../core';
import {StringUtil} from '../../../../core/StringUtil';
import {TermUtil} from '../../../../core/TermUtil';
import GloTerm from '../../components/GloTerm/GloTerm';
import {TermDisplayType} from '../../components/GloTerm/IGloTermProps';
import GloTermCrud from '../../components/GloTermCrud/GloTermCrud';
import GloSynonym from '../../components/GloSynonym/GloSynonym';
import GloMetaInfo from '../../components/GloMetaInfo/GloMetaInfo';

export default class GloMain extends React.Component<IGloMainProps, IGloMainState> {

  private keyToTabIds: { [key: string]: string };
  private keyToTerms: { [key: string]: ITerm[] };
  private keyToNbTerms: { [key: string]: number};
  private allTerms: ITerm[];
  private componentId: string;


  /**
   * @function
   * Simple glossary component contructor.
   */
  constructor(props: IGloMainProps) {
    super(props);

    this.componentId = getId("GloMain");
    
    const letters: ILetter[] = this.props.allLetters;
    this.initLetters(letters);

    let selectedKey: string;

    if (props.initialSelectedKey) {
      selectedKey = props.initialSelectedKey;
    } else if (letters.length && props.initiallySelectFirstLetter) {
      selectedKey = letters[0].key;
    }

     this.state = {
      loaded: false,
      error: undefined,
      selectedKey: selectedKey,
      searchTerm: '',
      terms: null,
      termCount:undefined
    } as IGloMainState;

    this.onLetterLinkClick = this.onLetterLinkClick.bind(this);
    this.onShowCreatePanelClick = this.onShowCreatePanelClick.bind(this);
    this.onShowEditPanelClick = this.onShowEditPanelClick.bind(this);

  }

  public componentWillReceiveProps(nextProps: IGloMainProps): void {

    const letters: ILetter[] = nextProps.allLetters;
    this.initLetters(letters);

    this.setState((prevState, props) => {
      let selectedKey: string;
      if (this.isKeyValid(nextProps.initialSelectedKey)) {
        selectedKey = nextProps.initialSelectedKey;
      }else if (letters.length && nextProps.initiallySelectFirstLetter) {
        selectedKey = letters[0].key;
      }

      return {
        selectedKey,
        selectedTabId: this.keyToTabIds[selectedKey],
      } as IGloMainState;
    });
  }

  public componentDidMount(): void {
    this.loadTerms(true);
  }

  public componentDidUpdate(prevProps: IGloMainProps, prevState: IGloMainState): void {

    if (this.props.stateKey !== prevProps.stateKey) {
      this.loadTerms();
    }else{
      this.updateLetters();
    }
  }

  /* Load data, initializing */
  private initLetters(letters: ILetter[]):void {
    this.keyToTerms = {};
    this.keyToNbTerms = {};
    this.keyToTabIds = {};

    this.keyToTabIds['pi-viewall'] = this.componentId + "-Tab-all";

    letters.map((letter: ILetter, index: number) => 
    {
      const letterKey = letter.key || index.toString();
      this.keyToTabIds[letterKey] = this.componentId + `-Tab${index}`;
    });
  }

  private updateLetter(letterKey:string): void
  {      
      const pi:any = document.getElementById(this.getTabId(letterKey));
      if(pi)
      {
        const isDisabled = this.isLetterDisabled(letterKey);
        pi.disabled = isDisabled;
        if(pi.className.indexOf(" is-disabled") == -1)
        {
          if(isDisabled){
            pi.className += " is-disabled";
          }
        }else{
          if(!isDisabled){
            pi.className = pi.className.toString().replace(" is-disabled", "");
          }
        }
      }
  }

  private updateLetters(): void
  {
    const letters = this.props.allLetters;
    var _self =this;
    letters.map((letter: ILetter, index: number) => 
    {
      _self.updateLetter(letter.key);
    });
  }

  private loadTerms(onInit:boolean=false): void {
    this.setState({
      loaded: false,
      error: undefined,
      terms: undefined,
      nbTotal:undefined
    });

    this.props.glossaryService.getTermCount()
      .then((nbTotal: number): void => {

        this.setState({
          nbTotal: nbTotal
        } as IGloMainState);

        if(nbTotal>0)
        {
          this.props.glossaryService.getAllTerms()
            .then((terms: ITerm[]): void => {

              this.initTerms(terms);              
              this.startInitialSearch(onInit);
              this.updateLetters();

            }, (error: any): void => {
              this.setState((prevState: IGloMainState, props: IGloMainProps): IGloMainState => {
                prevState.loaded = false;
                prevState.error = error;
                return prevState;
              });
            });

        }else{
          this.initTerms([]);  
          this.updateLetters();
        }

      }, (error: any): void => {
        this.setState((prevState: IGloMainState, props: IGloMainProps): IGloMainState => {
          prevState.loaded = false;
          prevState.error = error;
          return prevState;
        });
      });
  }

  private isKeyValid(key: string) :boolean{
    return key !== undefined && this.keyToTabIds[key] !== undefined;
  }

  private getTabId(itemKey:string): string
  {
    return this.keyToTabIds[itemKey];
  }

  private getNbTerm(key:string) : number{
    if(this.keyToNbTerms[key] !== undefined)
    {
      return this.keyToNbTerms[key];
    }
    return 0;
  }

  private getKeyForTerm (term: string) : string{
    var isNumeric:boolean = false;
    if(!isNaN(parseInt(term[0])))
    {
      isNumeric = true;  
    }

    var nonAlphaNumericLetterKey:string = null;

    for (var i = 0; i < this.props.allLetters.length; i++) 
    {
      const letter = this.props.allLetters[i];
      const letterType = letter.type;
      const letterKey = letter.key;

      if(isNumeric)
      {
        if(letterType == LetterType.Numeric)
        {
          return letterKey;
        }
      }
      else
      {
        if(letterType == LetterType.Alpha && StringUtil.startsWith(term.toLowerCase(), letterKey.toLowerCase()))   
        {
            return letterKey;
        }
        
        if(letterType == LetterType.NonAlphaNumeric)
        {
          nonAlphaNumericLetterKey = letterKey;
        }
      }
    }

    return nonAlphaNumericLetterKey;
  }

  private initTerm(term:ITerm)
  {
      const termTitle: string = term.title;

      // handle title
      if(!StringUtil.isNullOrEmpty(termTitle))
      {
        const termKey: string = this.getKeyForTerm(termTitle);

        if(this.keyToTerms[termKey] == undefined)
        {
          this.keyToTerms[termKey] = [] as ITerm[];
        }
        (this.keyToTerms[termKey] as ITerm[]).push(term);
        
        if(this.keyToNbTerms[termKey] == undefined)
        {
          this.keyToNbTerms[termKey] = 1;
        }
        else
        {
          this.keyToNbTerms[termKey]++;
        }
      }
  }

  private checkIfTermAlreadyListed(termName:string):Boolean
  {
    var result:Boolean = false;

    const termKey: string = this.getKeyForTerm(termName);
    if(this.keyToNbTerms[termKey] != undefined)
    {
      const allTerms = this.keyToTerms[termKey] as ITerm[];
      const len = allTerms.length;

      for (var i = 0; i < len; i++) 
      {
        var value = allTerms[i];
        if (value.title.toLocaleLowerCase() == termName.toLocaleLowerCase()) 
        {
          result = true;
          break;
        }
      }
    }
    
    return result;

  }

  private initSynonym(s:string, num:number, term:ITerm)
  {

    const termSynonym:ITerm = { 
      'itemId': term.itemId + '-s-' + num.toString(),
      'title': s,
      'isSynonym': true,
      'synonymForTerm': term
    };

    this.allTerms.push(termSynonym);
    this.initTerm(termSynonym);

  }

  private initTerms(allTerms:ITerm[]):void {

      this.allTerms = allTerms != null ? allTerms.slice() : null;
      this.keyToTerms = {};
      this.keyToNbTerms = {};

      if(allTerms == null) return;

      let { selectedKey, nbTotal } = this.state;

      // load terms
      var termAdded:boolean = false;
      allTerms.forEach(term=> {

        this.initTerm(term);

        const termSynonymArr: string[] = TermUtil.convertSynonyms(term.synonyms);
        if(termSynonymArr != null && termSynonymArr.length > 0){
          
          termSynonymArr.map((s:string, num:number)=>
          {
            if(!this.checkIfTermAlreadyListed(s)){
              this.initSynonym(s, num, term);
              termAdded = true;
            }
          });

        }

      });

      // sort terms
      if(termAdded)
      {
        this.allTerms = TermUtil.sortTerms(this.allTerms);
        for(var key in this.keyToTerms)
        {
          this.keyToTerms[key] = TermUtil.sortTerms(this.keyToTerms[key]);
        }
      }

      // determine selected key
      if(!StringUtil.isNullOrEmpty(selectedKey) && this.getNbTerm(selectedKey) == 0)
      {
        for (var i = 0; i < this.props.allLetters.length; i++) 
        {
          const letter = this.props.allLetters[i];
          const letterKey = letter.key;

          if(this.getNbTerm(letterKey) > 0)   
          {
            selectedKey = letterKey;
            break;
          }
        }
      }

      this.setState({
        loaded: true,
        error: undefined,
        terms: StringUtil.isNullOrEmpty(selectedKey) ? (this.props.termsShowAll ? this.allTerms : null) : this.keyToTerms[selectedKey],
        nbTotal: termAdded ? this.allTerms.length : nbTotal,
        selectedKey: selectedKey,
        selectedTabId: this.keyToTabIds[selectedKey]
      });

  }



  /* Rendering */
  public render(): JSX.Element {

    const errorMsg: JSX.Element = this.state.error !== undefined ? <MessageBar messageBarType={MessageBarType.error} isMultiline={ true } >{this.state.error}</MessageBar>: <div />;
    const successMsg: JSX.Element = this.state.successMsg !== undefined ? <MessageBar messageBarType={MessageBarType.success} isMultiline={ true } 
    onDismiss={()=>{ this.setState({successMsg:undefined} as IGloMainState);}} >{this.state.successMsg}</MessageBar> : <div />;
    
    if(this.state.successMsg !== undefined){
      var self = this;
      setTimeout(() =>{
        self.setState({successMsg:undefined} as IGloMainState);
      }, 3000);
    }

    const { showCrudPanel, showSingleTerm } = this.state;

    return (
        
        <div className="nc-glossary-container"> 
      
          {errorMsg}
          {successMsg}
          
          {this.renderHeader()}

          <div className="nc-glossary-letters-container">    

            { this.renderTabNav() }
            { this.renderTabContent() }
          </div>

          <Panel
            isOpen={ this.state.showCrudPanel }
            type={ PanelType.extraLarge }
            onDismiss={ this.onCloseCrudPanelClick.bind(this) }
            headerText={ this.state.editingTerm != null && !StringUtil.isNullOrEmpty(this.state.editingTerm.itemId) ? StringUtil.format(strings.EditTermDialogTitle, this.state.editingTerm.title) : strings.AddTermDialogTitle}
          >
            <GloTermCrud cancel = {this.cancelTerm.bind(this)} term={this.state.editingTerm}
              createTerm={this.createTerm.bind(this)} 
              updateTerm={this.updateTerm.bind(this)} 
              deleteTerm={this.deleteTerm.bind(this)} 
              checkTerm={this.checkTerm.bind(this)}  />
          </Panel>

          {showSingleTerm != null &&
            <Dialog
                isOpen={ true }
                type={ DialogType.normal }
                onDismiss={ this.closeTermDialog.bind(this) }
                title={showSingleTerm.title}
                isBlocking={ false }
                containerClassName='ms-dialogMainOverride'>
                <GloTerm key={showSingleTerm.itemId} term={showSingleTerm} showEditLink={false} 
                    showEditorInformation={this.props.termsShowEditorInformation} displayType={TermDisplayType.Dialog} >
                    <div dangerouslySetInnerHTML={{ __html: showSingleTerm.definition }}></div>
                </GloTerm>
                <DialogFooter>
                    <Button buttonType={ButtonType.primary} onClick={(this.closeTermDialog.bind(this))}>{strings.Close}</Button>
                </DialogFooter>
            </Dialog>
          }

        </div>
       
      );
  }

  private renderHeader()
  {
    const { selectedKey, terms, nbTotal, searchText} = this.state;

    const nbShown = terms != null ? terms.length: 0;
    
    let titleText = this.props.glossaryTitle;
    let resultText = null;
    
    if(nbTotal !== undefined)
    {
      if(selectedKey != null || !StringUtil.isNullOrEmpty(searchText))
      {
        titleText += ": ";
        if(selectedKey != null)
          titleText += selectedKey;
        if(!StringUtil.isNullOrEmpty(searchText))
        {
          if(selectedKey != null)
            titleText += ", ";
          titleText += "'" + searchText + "'";
        }
        resultText = StringUtil.format(`${strings.TermsShowResult}`, nbShown, nbTotal);
      }
      else{
        resultText = StringUtil.format(`${strings.TermsTotal}`, nbTotal);  
      }
    }else{
      resultText = "";
    }

    return (
      
      <div className="nc-glossary-header">
        <h2 className="nc-glossary-title" title={this.props.glossaryDescription}><span className="ms-font-xl">{titleText}</span></h2>
        <div className="nc-glossary-total ms-font-m">{resultText}</div>
        <div className="ms-clear"></div>        
        <GloMetaInfo {... this.props.metaInfoProps}></GloMetaInfo>
        <div className="ms-clear"></div>    
      </div>
      );
  }

  private renderTabNav(): JSX.Element
  {
    const showSearch = this.state.selectedKey == null;

    let pivotArray: React.ReactElement<IPivotItemProps>[] = [];

    pivotArray.push(
      <PivotItem linkText={ strings.ViewAllToken } itemKey='pi-viewall' key='pi-viewall' 
      ></PivotItem>
    );

    this.props.allLetters.map((letter:ILetter)=>{
        const letterKey = letter.key;
        const isDisabled = this.isLetterDisabled(letterKey);
        pivotArray.push(
        <PivotItem linkText={ letter.title } itemKey={letterKey} key={letterKey}         
        headerButtonProps={{"disabled": isDisabled}}
        className={css({['is-disabled ']:isDisabled})}>
        </PivotItem>
        );

    });

    return (
      
      <FocusZone direction={ FocusZoneDirection.horizontal }>
        <Pivot getTabId={(itemKey)=>{return this.keyToTabIds[itemKey];}} selectedKey={this.state.selectedKey ? this.state.selectedKey : 'pi-viewall'} onLinkClick={ this.onLetterLinkClick } linkFormat={ this.props.letterDisplayMode === "tabs" ? PivotLinkFormat.tabs : PivotLinkFormat.links } headersOnly={ true }>
          { pivotArray }
        </Pivot>
      </FocusZone>
    );
  }

  private isLetterDisabled(letterKey:string):boolean
  {
    if(this.state.selectedKey && this.state.selectedKey == letterKey) return false;
    return this.getNbTerm(letterKey) == 0;
  }

  private renderTabContent(): JSX.Element
  {
    if(!this.state.loaded)
    {

      const { nbTotal } = this.state;

        return (
        <div className="nc-spinner"><Spinner label={StringUtil.format(strings.TermLoadingSpinnerText, nbTotal !== undefined ? nbTotal.toString() : "")} /></div>
      );
    }

    const { selectedKey, selectedTabId } = this.state;
    const isLetterSelected = this.state.selectedKey != null;

    return (
      <div
        role='tabpanel'
        aria-labelledby={ selectedTabId }>
        <FocusZone direction={ FocusZoneDirection.vertical }>

          <div className="nc-filter">
            <div className="nc-filter-TextField">{!isLetterSelected ? <SearchBox labelText={strings.SearchTerm}
              onChange={this.onSearchTermChanged.bind(this)}
              onSearch={this.onSearchClick.bind(this)} value={this.state.searchText}
            /> : <SearchBox labelText={strings.FilterTerm}
              onChange={this.onFilterChanged.bind(this)}
              onSearch={this.onFilterClick.bind(this)} value={this.state.searchText}
            />}</div>
                 
            { this.props.hasPermission &&  
            <div className="nc-glossary-addTerm2"><CommandButton   
            iconProps={ { iconName: 'Add' } } 
            onClick={this.onShowCreatePanelClick} 
            text={strings.AddTerm} 
            /></div>}
            <div className="ms-clear"></div>
          </div>

          <List
            items={ this.state.terms}
            onRenderCell={ (item:ITerm, index) => item.isSynonym ? (

                <GloSynonym key={item.itemId} term={item} showTermClick={this.showTermDialog.bind(this)}></GloSynonym>

            ): (  
                <GloTerm key={item.itemId} term={item} displayType={TermDisplayType.Overview} showEditLink={this.props.hasPermission} onEditClick={this.onShowEditPanelClick} showEditorInformation={this.props.termsShowEditorInformation} >
                  <div dangerouslySetInnerHTML={{ __html: item.definition }}></div>
                </GloTerm>

            ) }
          />

          {!isLetterSelected && (this.state.terms == null || this.state.terms.length == 0) && !StringUtil.isNullOrEmpty(this.state.searchText) &&
          <div>{strings.TermNotFound} <strong>{this.state.searchText}</strong></div>
          }

        </FocusZone>

      </div>

    );

  }

  /* Handlers impl */
  private updateTabContent(letterKey: string, ev?: React.MouseEvent<HTMLElement>) {
    this.setState({
      selectedKey: letterKey,
      selectedTabId: this.keyToTabIds[letterKey],
      terms: this.keyToTerms[letterKey],
      searchText:''
    } as IGloMainState);
  }

  private updateSearch(text:string){
    if(StringUtil.isNullOrEmpty(text))
    {
      this.setState({   
        searchText: '',
        terms: null
      }as IGloMainState); 
    }
    else{
      
        const textTr = text.trim();
        this.setState({   
        searchText: text,
        terms: this.allTerms.filter(item => TermUtil.termContains(item, text, true, true))
      }as IGloMainState); 
    }
  }


  private updateFilter(text:string){
    const { selectedKey } = this.state;
    const terms = this.keyToTerms[selectedKey];

    this.setState({   
      searchText: text,
      terms: text ? terms.filter(item => TermUtil.termContains(item, text, false, true)) : terms
    }as IGloMainState);

  }

  private startInitialSearch(onInit:boolean)
  {
    var searchText = onInit ? TermUtil.parseTermNameFromUrl() : this.state.searchText;

    if(!StringUtil.isNullOrEmpty(searchText))
    {
      // search first term by name and show term-popup
      var resultsByTitle:ITerm[] = null;
      if(onInit)
      {
        resultsByTitle = this.allTerms.filter(item => item.title.toLocaleLowerCase() == searchText.toLocaleLowerCase()  && !item.isSynonym);
        if(resultsByTitle.length == 0)
        {
          resultsByTitle = this.allTerms.filter(item => TermUtil.termContains(item, searchText, false, false)  && !item.isSynonym);
        }
      }
      const resultsByAll = this.allTerms.filter(item => TermUtil.termContains(item, searchText, true, true));

      this.setState({
        selectedKey: null,
        searchText: searchText,
        showSingleTerm: resultsByTitle != null && resultsByTitle.length > 0 ? resultsByTitle[0]: null,
        terms: resultsByAll

       } as IGloMainState);

    } 
  }

  private cancelTerm() {
            this.setState({
        showCrudPanel:false,

        } as IGloMainState);
  }

  private createTerm(term: ITerm) {

    if(!this.props.hasPermission)
    {
          this.setState({
          showCrudPanel:false,
          error: strings.TermPermissionMsg

        } as IGloMainState);
        
        return;
    }

    this.props.glossaryService.createTerm(term)
      .then((newTerm: ITerm): void => 
      {
        this.setState({
        showCrudPanel:false,
        successMsg: StringUtil.format(strings.TermCreatedSuccessMsg, term.title)

        } as IGloMainState);
      
        this.loadTerms();

      }, (error: any): void => {
        this.setState((prevState: IGloMainState, props: IGloMainProps): IGloMainState => {
          prevState.error = StringUtil.format(strings.TermCreatedErrorMsg, error);
          return prevState;
        });
      });

  }

  private deleteTerm(term: ITerm)  {

      if(!this.props.hasPermission)
      {
            this.setState({
            showCrudPanel:false,
            error: strings.TermPermissionMsg

          } as IGloMainState);
          
          return;
      }

    this.props.glossaryService.deleteTerm(term.itemId)
      .then((result: boolean): void => 
      {
          this.setState({
          showCrudPanel:false,
          successMsg: result ? StringUtil.format(strings.TermDeletedSuccessMsg, term.title) : StringUtil.format(strings.TermDeletedErrorMsg, "")

          } as IGloMainState);
        
          this.loadTerms();

      }, (error: any): void => {
        this.setState((prevState: IGloMainState, props: IGloMainProps): IGloMainState => {
          prevState.error = StringUtil.format(strings.TermDeletedErrorMsg, error);
          return prevState;
        });
      });
  }

  private updateTerm(term: ITerm)
  {
      if(!this.props.hasPermission)
      {
          this.setState({
            showCrudPanel: false,
            error: strings.TermPermissionMsg

          } as IGloMainState);
          
          return;
      }

    this.props.glossaryService.updateTerm(term)
      .then((result: boolean): void => 
      {
        this.setState({
        showCrudPanel:false,
        successMsg: result ? StringUtil.format(strings.TermUpdatedSuccessMsg, term.title) : StringUtil.format(strings.TermUpdatedErrorMsg, "")

        } as IGloMainState);
      
        this.loadTerms();

      }, (error: any): void => {
        this.setState((prevState: IGloMainState, props: IGloMainProps): IGloMainState => {
          prevState.error = StringUtil.format(strings.TermUpdatedErrorMsg, error);
          return prevState;
        });
      });
  }

  private checkTerm(termName:string):Promise<boolean>
  {
    return this.props.glossaryService.checkIfTermExists(termName)
          .then((result: boolean): boolean => 
          {
            return result;

          }
      ) as Promise<boolean>;

  }

  /* Event handlers*/
  private onLetterLinkClick(item: PivotItem): void 
  {     
   
    const letterKey = item.props.itemKey;
    if(letterKey == 'pi-viewall')
    {
      this.onShowSearchClick();
    }
    else
    {
      this.updateTabContent(letterKey, null);
    }
      
  }

  private onShowSearchClick() 
  {
    this.setState({
    selectedKey: null,
    searchText: '',
    terms: this.props.termsShowAll ? this.allTerms : null

    } as IGloMainState);
  }

  private onSearchClick(newValue) {
    this.updateSearch(newValue);
  }

  private onSearchTermChanged(newValue){
    this.updateSearch(newValue);
  }

  private onFilterClick(newValue) {
    this.updateFilter(newValue);
  }

  private onFilterChanged(newValue){
    this.updateFilter(newValue);
  }

  private onShowEditPanelClick(term: ITerm, ev: React.MouseEvent<HTMLElement>) {
    ev.preventDefault();

    this.setState({
      editingTerm: term,
    showCrudPanel:true

    } as IGloMainState);
  }

  private onShowCreatePanelClick() {

    this.setState({
    showCrudPanel:true,
    editingTerm:null

    } as IGloMainState);
  }

  private onCloseCrudPanelClick(ev?: React.MouseEvent<HTMLElement>) {
    
    this.setState({
    showCrudPanel:false

    } as IGloMainState);
  }

  private closeTermDialog()
  {
    this.setState({
      showSingleTerm: null
    } as IGloMainState);
  }

  private showTermDialog(term: ITerm)
  {
    this.setState({
      showSingleTerm: term
    } as IGloMainState);
  }

}


