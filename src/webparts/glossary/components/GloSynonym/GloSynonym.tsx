import * as React from 'react';
import * as strings from 'glossaryStrings';
import { IGloSynonymProps } from './IGloSynonymProps';
import { IGloSynonymState } from './IGloSynonymState';
import {ITerm} from '../../../../core/ITerm';

export default class GloSynonym extends React.Component<IGloSynonymProps, IGloSynonymState> {

    private id:string;

    constructor(props: IGloSynonymProps) {
        super(props);

        this.id = "GloSynonym-"+ this.props.term.itemId;
        this.state = {
        } as IGloSynonymState;
    }

    public render(): JSX.Element {

        var item:ITerm = this.props.term;
        var parentItem:ITerm = item.synonymForTerm;

        return ( 
        <div id={this.id} className="nc-term-itemCell nc-term-itemCell-overview" data-is-focusable={ true }>
            <div className="nc-term-itemContent">
                <div className="nc-term-termName">
                    <span className="ms-font-m-plus">{ item.title } {strings.TermSynonymFor}</span>&nbsp;&nbsp;<i className="ms-Icon ms-Icon--Forward" aria-hidden="true"></i>&nbsp;&nbsp;<a href="javascript:void(0)" 
                    className="ms-font-m-plus" onClick={this.onShowParentTermClick.bind(this, parentItem)} >{parentItem.title}</a>
                </div>
            </div>
        </div>);

    }

  private onShowParentTermClick() {
    if(this.props.showTermClick)
    this.props.showTermClick(this.props.term.synonymForTerm);
  }

}