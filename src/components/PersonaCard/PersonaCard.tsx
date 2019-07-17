import * as React from 'react';
import { Spinner, getId, css,
  IPersonaProps,
  Persona,
  PersonaSize,
  PersonaPresence,
 } from 'office-ui-fabric-react';
import { IPersonaCardProps } from './IPersonaCardProps';
import { IPersonaCardState } from './IPersonaCardState';
import {IUserProfile} from '../../core/IUserProfile';
import {StringUtil} from '../../core/StringUtil';
/**
 * @class
 * Persona Card component provides
 * the visualization of details of an individual including contact details, email, 
 * location information, and organizational placement. 
 */
export default class PersonaCard extends React.Component<IPersonaCardProps, IPersonaCardState> 
{
    private examplePersona:IPersonaProps;
    private id:string;


    constructor(props: IPersonaCardProps, state: IPersonaCardState) {
        super(props);

        this.id = getId("PersonaCard");
        this.loadUserProfile();
    }

    public componentDidMount(): void {
        this.loadUserProfile();
    }

    private loadUserProfile(): void {

        const userInfo = this.props.userInfo;

        this.state = {

            loading:true,
            error:undefined,

            firstName: undefined,
            lastName: undefined,
            userProfileProperties: undefined,
            email: userInfo != null ? userInfo.email: undefined,
            workEmail: undefined,
            homePhone:undefined,
            workPhone: undefined,
            displayName: userInfo != null ? userInfo.fullName: undefined,
            department: undefined,
            office: undefined,
            pictureUrl: userInfo != null ? userInfo.imageUrl: undefined,
            title: undefined,
            sipAddress: undefined,

            selectedKey:"Mail"

            } as IPersonaCardState;


            this.props.userProfileService.getUserProfileProperties(userInfo.login)
            .then((userProfile: IUserProfile): void => {

                if(userProfile == null)
                {
                    this.setState({
                        loading: false,
                        error: undefined
                    });

                }else{

                    this.setState({
                        loading: false,
                        error: undefined,
                        firstName: userProfile.firstName,
                        lastName: userProfile.lastName,
                        userProfileProperties: userProfile.userProfileProperties,
                        email: userProfile.email,
                        workEmail: userProfile.workEmail,
                        homePhone:userProfile.homePhone,
                        workPhone: userProfile.workPhone,
                        displayName: userProfile.displayName,
                        department: userProfile.department,
                        office: userProfile.office,
                        pictureUrl: userProfile.pictureUrl,
                        title: userProfile.title,
                        sipAddress: userProfile.sipAddress
                    });
                }

      }, (error: any): void => {
        this.setState((prevState: IPersonaCardState, props:  IPersonaCardProps): IPersonaCardState => {
          prevState.loading = false;
          prevState.error = error;
          return prevState;
        });
      });


    }

    public componentDidUpdate(prevProps: IPersonaCardProps, prevState: IPersonaCardState): void {
        if (this.props.userInfo.login !== prevProps.userInfo.login) {
            this.loadUserProfile();
        }
    }



  public render(): JSX.Element {

    if(this.props.userInfo == null || this.props.userInfo.login == "")
    {
        return (<div></div>);
    }

    const loading: JSX.Element = this.state.loading ? <div><Spinner /></div> : <div />;
    const error: JSX.Element = this.state.error !== undefined ? <div className={'ms-TextField-errorMessage ms-u-slideDownIn20'}>{this.state.error}</div> : <div />;


    return (

      <div className="nc-persona">

        {loading}
        {/*{error}*/}

        <div className={css('ms-PersonaCard')}>
            <div className={css('ms-PersonaCard-persona')}>
                <div className={css('ms-Persona ms-Persona--xl')}>
                    <div className={css('ms-Persona-imageArea')}>
                        <div className={css('ms-Persona-imageCircle')}>
                            <img className={css('ms-Persona-image')} src={this.state.pictureUrl}></img>
                        </div>
                    </div>
                    <div className={css('ms-Persona-details')}>
                        <div className={css('ms-Persona-primaryText')} title={this.state.displayName}>{this.state.displayName}</div>
                        <div className={css('ms-Persona-secondaryText')}>{this.state.title}</div>
                        <div className={css('ms-Persona-tertiaryText')}>{this.state.office}</div>
                    </div>
                </div>
            </div>

            <ul className="ms-PersonaCard-actions">
                <li id={this.id+"_Mail"} className="ms-PersonaCard-action is-active" onClick={this.showTab.bind(this, "Mail")}>
                    <i className="ms-Icon ms-Icon--Mail"></i>
                </li>
                { !StringUtil.isNullOrEmpty(this.state.sipAddress) &&
                <li id={this.id+"_Chat"} className="ms-PersonaCard-action" onClick={this.showTab.bind(this, "Chat")} >
                    <i className="ms-Icon ms-Icon--Chat"></i>
                </li>}
                { (!StringUtil.isNullOrEmpty(this.state.homePhone) || !StringUtil.isNullOrEmpty(this.state.workPhone)) &&
                <li id={this.id+"_Phone"} className="ms-PersonaCard-action" onClick={this.showTab.bind(this, "Phone")}>
                    <i className="ms-Icon ms-Icon--Phone"></i>
                </li>}
            </ul>

            <div className="ms-PersonaCard-actionDetailBox">
                <div  className="ms-PersonaCard-details is-active" id={this.id+"_Content_Mail"}>
                    <div className="ms-PersonaCard-detailLine"><span className="ms-PersonaCard-detailLabel">Personal: </span> 
                        <a className="ms-Link" href={"mailto:" + this.state.email}>{this.state.email}</a> 
                    </div>
                    {!StringUtil.isNullOrEmpty(this.state.workEmail) && <div className="ms-PersonaCard-detailLine"><span className="ms-PersonaCard-detailLabel">Work: </span> 
                        <a className="ms-Link" href={"mailto:" + this.state.workEmail}>{this.state.workEmail}</a> 
                    </div>}
                </div>
                {this.state.sipAddress &&
                <div className="ms-PersonaCard-details" id={this.id+"_Content_Chat"}>
                    <div className="ms-PersonaCard-detailLine"><span className="ms-PersonaCard-detailLabel">Lync: </span> 
                        <a className="ms-Link" href={"sip:" + this.state.workEmail}​ >Start Lync call</a> 
                    </div>
                </div>}

                { (!StringUtil.isNullOrEmpty(this.state.homePhone) || !StringUtil.isNullOrEmpty(this.state.workPhone)) &&
                <div  className="ms-PersonaCard-details" id={this.id+"_Content_Phone"}>
                    {!StringUtil.isNullOrEmpty(this.state.homePhone) && <div className="ms-PersonaCard-detailLine">
                        <span className="ms-PersonaCard-detailLabel">Personal: </span>{this.state.homePhone}
                    </div>}
                    {!StringUtil.isNullOrEmpty(this.state.workPhone) && <div className="ms-PersonaCard-detailLine">
                        <span className="ms-PersonaCard-detailLabel">Work: </span>{this.state.workPhone}
                    </div>}
                </div>}
            </div>
        </div>
    </div>
    );
  }

    private showTab(linkKey) 
    {
        let{selectedKey} = this.state;
        if(selectedKey){
            document.getElementById(this.id+"_"+ selectedKey).className = "ms-PersonaCard-action";
            document.getElementById(this.id+"_Content_"+ selectedKey).className = "ms-PersonaCard-details";
        }

        document.getElementById(this.id+"_"+ linkKey).className = "ms-PersonaCard-action is-active";
        document.getElementById(this.id+"_Content_"+ linkKey).className = "ms-PersonaCard-details is-active";

        this.setState({selectedKey:linkKey } as IPersonaCardState);

    }

}