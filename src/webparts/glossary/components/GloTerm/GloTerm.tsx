import * as React from 'react';
import { css, CommandButton} from 'office-ui-fabric-react';
import * as strings from 'glossaryStrings';
import { IGloTermProps, TermDisplayType } from './IGloTermProps';
import { IGloTermState } from './IGloTermState';
import {TermUtil} from '../../../../core/TermUtil';
import {HtmlUtil} from '../../../../core/HtmlUtil';


const maxDefinitionOverviewHeight:number = 65;
const maxDefinitionDialogHeight:number = 500;

export default class GloTerm extends React.Component<IGloTermProps, IGloTermState> {

    private id:string;
    private fakeElem:any;

    constructor(props: IGloTermProps) {
        super(props);

        this.id = "GloTerm-"+ this.props.term.itemId;

        this.state = {
            showMoreLink: undefined,
            showFullDefinition: false
        } as IGloTermState;

    }

    public componentDidMount ()
    {
        if(this.state.showMoreLink === undefined)
        {
            const clientHeight = document.getElementById(this.id + 'termDefinition').clientHeight;
            const maxHeight = this.props.displayType == TermDisplayType.Overview ? maxDefinitionOverviewHeight : (this.props.displayType == TermDisplayType.Dialog ? maxDefinitionDialogHeight : 0);
            const showMoreLink = clientHeight >= maxHeight;

            this.setState({
            showMoreLink:showMoreLink

            } as IGloTermState);
        }

    }

    public render(): JSX.Element {

        var item = this.props.term;
        var showMore = this.state.showFullDefinition;
        var synonymArr = TermUtil.convertSynonyms(item.synonyms); 
        const termUrl = TermUtil.getTermUrl(item);

        return ( 
        <div id={this.id} className={css(
            'nc-term-itemCell', 
            { ['nc-term-itemCell-dialog']: this.props.displayType == TermDisplayType.Dialog}, 
            { ['nc-term-itemCell-overview']: this.props.displayType == TermDisplayType.Overview}
            )} data-is-focusable={ true }>
            <div className="nc-term-itemContent">
                <div className="nc-term-termName">
                    <span className="ms-font-m-plus">{ item.title } </span>
                    <a className="nc-term-action" href="javascript:void(0)" onClick={this.onCopyLinkClick.bind(this)}>
                        <i className="ms-Icon ms-Icon--Copy" title={strings.CopyToClipboardTerm}></i>
                    </a>
                    {this.props.showEditLink &&
                    <a className="nc-term-action" href="javascript:void(0)" onClick={this.onEditLinkClick.bind(this)}>
                        <i className="ms-Icon ms-Icon--Edit" title={strings.EditTerm}></i>
                    </a>}
                </div>
                <div id={this.id + 'termDefinition'} className={ css(
                        'nc-term-termDefinition',
                        'ms-font-s',
                        {
                            ['show-full ' ]: showMore
                        }
                        ) }>

                    {this.props.children}

                    </div>
                    {this.state.showMoreLink && 
                    
                    <div className="nc-term-more">                        
                        <a className="ms-font-s" href="javascript:void(0)" onClick={ this.onShowMoreClick.bind(this) } ><i 
                        className={ 'ms-Icon ' + (showMore ? 'ms-Icon--ChevronUp' : 'ms-Icon--ChevronDown') }
                        />{showMore ? strings.HideMore : strings.ShowMore}</a>
                        <div className="ms-clear"></div>
                    </div>}

                    {synonymArr!= null && synonymArr.length > 0  && 
                    
                    <div className="nc-term-synonyms ms-font-s">
                        <span className="ms-fontWeight-semibold">{strings.TermSynonyms}</span>&nbsp;
                        {synonymArr.map((synonym, index)=>{
                            return <span>{index > 0 ?  ", " : ""}{synonym}</span>;
                        })}
                    </div>
                    }

                    {this.props.showEditorInformation && 
                    <div className="nc-term-metadata">
                        <div className="nc-term-authorinfo">{strings.TermCreated} {item.created.toLocaleString()} {strings.TermCreatedBy} {item.createdBy}</div>
                        <div className="nc-term-editorinfo">{strings.TermModified} {item.lastModified.toLocaleString()} {strings.TermModifiedBy} {item.modifiedBy}</div>
                    </div>
                    }

                    <div className="nc-term-link ms-font-s">{strings.TermLink } <a className="ms-Link" href={termUrl}>{termUrl}</a></div>

                </div>
            </div>);

    }
    

    private onShowMoreClick(ev: React.MouseEvent<HTMLElement>) {
        ev.preventDefault();

        this.setState({
            showFullDefinition: !this.state.showFullDefinition,
            } as IGloTermState);

    }

    private onCopyLinkClick(ev: React.MouseEvent<HTMLElement>)
    {  
        ev.preventDefault();
        this.copyText();
    }


    private copyText()
    {
        if (this.fakeElem) {
            document.body.removeChild(this.fakeElem);
            this.fakeElem = null;
        }

        const target = document.getElementById(this.id);

        this.fakeElem = document.createElement('div');
        this.fakeElem.innerHTML = target.innerHTML;
        this.fakeElem.classList.add("nc-term-itemCell-print");
        document.body.appendChild(this.fakeElem);
        
        var elms = this.fakeElem.querySelectorAll(".nc-term-action, .nc-term-more");
        for (var j = elms.length-1; j >= 0; j--) {
            if (elms[j].parentNode) {
                elms[j].parentNode.removeChild(elms[j]);
            }
        }

        const selectedText = HtmlUtil.select(this.fakeElem);

        try {
            document.execCommand("copy");
        }
        catch (err) {
        }

        this.fakeElem.blur();
        window.getSelection().removeAllRanges();
        document.body.removeChild(this.fakeElem);
        this.fakeElem = null;
    }

    private onEditLinkClick(ev: React.MouseEvent<HTMLElement>) {
        ev.preventDefault();
        if (this.props.onEditClick) {
            this.props.onEditClick(this.props.term, ev);
        }
    }


}