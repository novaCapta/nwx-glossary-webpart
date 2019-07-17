import * as React from 'react';
import { Dialog, DialogType, DialogFooter, Button, ButtonType, CommandButton, Link} from 'office-ui-fabric-react';
import {IGloMetaInfoProps} from './IGloMetaInfoProps';
import {IGloMetaInfoState} from './IGloMetaInfoState';
import * as strings from 'glossaryStrings';
import PersonaCard from '../../../../components/PersonaCard/PersonaCard';
import {StringUtil} from '../../../../core/StringUtil';
import {IGloMetaInfo} from '../../../../core/IGloMetaInfo';

export default class GloMetaInfo extends React.Component<IGloMetaInfoProps, IGloMetaInfoState> {

    constructor(props: IGloMetaInfoProps) {
        super(props);
        this.state = {
            showDialog:false
        } as IGloMetaInfoState;

        this.showDialog = this.showDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }

    public render(): JSX.Element {

        const metaInfo = this.props.getMetaInfo();

        if(!this.hasMetaInfo(metaInfo))
            return (<span></span>);

        return ( <div>
        <div className="nc-glossary-about"><Link onClick={this.showDialog}>{strings.ShowGlossaryMetaInfo}</Link></div>

            <Dialog
            isOpen={ this.state.showDialog }
            type={ DialogType.close }
            onDismiss={ this.closeDialog }
            title={strings.ShowGlossaryMetaInfo}
            isBlocking={ false } 
            containerClassName='ms-dialogMainOverride'
                            >
            <div className="nc-glossary-metainfo">
                
                {metaInfo.contactContent != null && !StringUtil.isNullOrEmpty(metaInfo.contactContent.login) &&
                    <div className="nc-glossary-metainfo-ccontent"><span className="ms-font-m-plus">{strings.GlossaryContactContentFieldLabel}:</span> 
                     <PersonaCard userInfo={metaInfo.contactContent} userProfileService={this.props.userProfileService}></PersonaCard></div>}

                {metaInfo.contactTechnical != null && !StringUtil.isNullOrEmpty(metaInfo.contactTechnical.login) && 
                    <div className="nc-glossary-metainfo-ctechnical"><span className="ms-font-m-plus">{strings.GlossaryContactTechnicalFieldLabel}:</span> 
                     <PersonaCard userInfo={metaInfo.contactTechnical} userProfileService={this.props.userProfileService}></PersonaCard></div>}
                    
                {!StringUtil.isNullOrEmpty(metaInfo.audience) && 
                <div className="nc-glossary-metainfo-audience"><span className="ms-font-m-plus">{strings.GlossaryAudienceFieldLabel}:</span>
                    <div className="ms-font-m" dangerouslySetInnerHTML={{ __html: metaInfo.audience }}></div>
                </div>}

                {!StringUtil.isNullOrEmpty(metaInfo.guideline) &&<div className="nc-glossary-metainfo-guideline"><span className="ms-font-m-plus">{strings.GlossaryGuidelineFieldLabel}:</span>
                    <div className="ms-font-m" dangerouslySetInnerHTML={{ __html: metaInfo.guideline }}></div> 
                </div>}

                <div className="nc-webpartinfo-wrapper" dangerouslySetInnerHTML={{ __html: this.props.getWebPartInfo() }}></div>

            </div>

          <DialogFooter>
            <Button buttonType={ButtonType.primary} onClick={this.closeDialog}>{strings.Close}</Button>
          </DialogFooter>

                </Dialog>

        </div>);
    }

    private hasMetaInfo(metaInfo: IGloMetaInfo):boolean
    {
        if(metaInfo == null) return false;
        if(metaInfo.contactContent == null &&
            metaInfo.contactTechnical == null &&
            StringUtil.isNullOrEmpty(metaInfo.audience) &&
            StringUtil.isNullOrEmpty(metaInfo.guideline))
            return false;
        return true;
    }

    private showDialog() {
        this.setState({ showDialog: true });
    }

    private closeDialog() {
        this.setState({ showDialog: false });
    }

}