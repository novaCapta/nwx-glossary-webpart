import * as React from 'react';
import { Panel, PanelType, Button, ButtonType, Label, TextField} from 'office-ui-fabric-react';
import {IGloMetaInfoEditProps} from './IGloMetaInfoEditProps';
import {IGloMetaInfoEditState} from './IGloMetaInfoEditState';
import {IGloMetaInfo} from '../../../../core/IGloMetaInfo';
import {IUserInfo} from '../../../../core/IUserInfo';

import * as strings from 'glossaryStrings';
import QuillText from '../../../../components/QuillText/QuillText';
import PeoplePicker from '../../../../components/PeoplePicker/PeoplePicker';
import  {EditorConstants} from '../../../../core/Constants';
import {StringUtil} from '../../../../core/StringUtil';

export default class GloMetaInfoEdit extends React.Component<IGloMetaInfoEditProps, IGloMetaInfoEditState> {

    constructor(props: IGloMetaInfoEditProps) {

        super(props);

        this.state = {
            contactContent: props.metaInfo.contactContent,
            contactTechnical: props.metaInfo.contactTechnical,
            audience: props.metaInfo.audience,
            guideline: props.metaInfo.guideline,
            showEditPanel: false
        } as IGloMetaInfoEditState;

        this.onClickOk = this.onClickOk.bind(this);
        this.onClickCancel = this.onClickCancel.bind(this);
        this.showEditPanel = this.showEditPanel.bind(this);
        this.closeEditPanel = this.closeEditPanel.bind(this);

    }

    public render(): JSX.Element {

        
        var initialContactContent:IUserInfo[] = new Array<IUserInfo>();
        if(this.state.contactContent != null && !StringUtil.isNullOrEmpty(this.state.contactContent.login)){
            initialContactContent.push(this.state.contactContent);
        }

        var initialContactTechnical:IUserInfo[] = new Array<IUserInfo>();
        if(this.state.contactTechnical != null && !StringUtil.isNullOrEmpty(this.state.contactTechnical.login)){
            initialContactTechnical.push(this.state.contactTechnical);
        }


        return ( 
            <div>
                <a className="ms-Link" href="javascript:void(0)" onClick={this.showEditPanel}>
                <i className="ms-Icon ms-Icon--Edit nc-glossary-edit" title={strings.EditGlossaryMetaInfo}></i> {strings.EditGlossaryMetaInfo}
            </a>
          
            <Panel
                isOpen={ this.state.showEditPanel }
                type={ PanelType.extraLarge }
                onDismiss={ this.closeEditPanel}
                headerText={ strings.EditGlossaryMetaInfo}
                headerClassName="nc-glossary-edit-header"
            >

            <div className="nc-glossary-edit-form">
            
                <PeoplePicker 
                    label={strings.GlossaryContactContentFieldLabel} 
                    limit={1}
                    noResultsFoundText={strings.PeoplePickerNoResults}
                    loadingText={strings.PeoplePickerLoading}
                    suggestionsHeaderText = {strings.PeoplePickerSuggestedContacts}
                    limitErrorMessage={strings.PeoplePickerLimitErrorMessage}
                    initialData={initialContactContent}   
                    onValueChange={ (oldValue:IUserInfo[], results:IUserInfo[]) => this.setState({contactContent: results != null ? results[0] : null}) }
                    searchService={this.props.userSearchService}
                ></PeoplePicker>

                <PeoplePicker 
                    label={strings.GlossaryContactTechnicalFieldLabel} 
                    limit={1}
                    noResultsFoundText={strings.PeoplePickerNoResults}
                    loadingText={strings.PeoplePickerLoading}
                    suggestionsHeaderText = {strings.PeoplePickerSuggestedContacts}
                    limitErrorMessage={strings.PeoplePickerLimitErrorMessage}
                    initialData={initialContactTechnical}   
                    onValueChange={ (oldValue:IUserInfo[],results:IUserInfo[]) => this.setState({contactTechnical: results != null ? results[0] : null}) }
                    searchService={this.props.userSearchService}
                ></PeoplePicker>

                <QuillText label={strings.GlossaryAudienceFieldLabel} required={ false } 
                    value={this.state.audience}
                    onChanged={ (text) => this.setState({ audience: text}) } 
                    insertImageWithUrl = {true}
                    theme="snow"/>

                <QuillText label={strings.GlossaryGuidelineFieldLabel} required={ false } 
                    value={this.state.guideline}
                    onChanged={ (text) => this.setState({guideline : text}) } 
                    insertImageWithUrl = {true}
                    theme="snow"/>

            </div>

            <div className="nc-glossary-edit-buttons">
                <Button buttonType={ButtonType.primary} onClick={this.onClickOk}>{strings.OK}</Button>&nbsp;
                <Button buttonType={ButtonType.normal} onClick={this.onClickCancel}>{strings.Cancel}</Button>
            </div>

          </Panel>
          </div>
          );
    }

    public showEditPanel() {
        this.setState({ showEditPanel: true });
    }

    public closeEditPanel() {
        this.setState({ showEditPanel: false });
    }

  
    private onClickCancel(): void 
    {
      this.closeEditPanel();
    }

    private onClickOk(): void 
    {
        let {contactContent, contactTechnical, audience, guideline} = this.state;

        if(audience != null) 
        {
             audience = audience.trim();
            if(audience == EditorConstants.EditorEmptyText) audience = null;    
        }

        if(guideline != null) 
        {
             guideline = guideline.trim();
            if(guideline == EditorConstants.EditorEmptyText) guideline = null;    
        }

        const metaInfo:IGloMetaInfo = {
            contactContent: contactContent,
            contactTechnical: contactTechnical,
            audience:audience,
            guideline:guideline
        };
        this.props.updateMetaInfo(metaInfo);

        this.closeEditPanel();
        
    }
}