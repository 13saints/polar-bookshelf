import * as React from 'react';
import {PersistenceLayerManager} from '../../../../web/js/datastore/PersistenceLayerManager';
import {Group} from "../../../../web/js/datastore/sharing/db/Groups";
import {VerticalAlign} from "../../../../web/js/ui/util/VerticalAlign";
import {LeftRightSplit} from "../../../../web/js/ui/left_right_split/LeftRightSplit";
import {GroupJoinButton} from "./GroupJoinButton";

export class GroupCard extends React.Component<IProps, IState> {

    constructor(props: IProps, context: any) {
        super(props, context);
    }

    public render() {

        const {group} = this.props;

        return (

            <div className="border-top border-left border-right p-2">

                <LeftRightSplit left={<div style={{display: 'flex'}}>

                                    <VerticalAlign>
                                        <a className="text-lg" href={'#group/' + group.id}>{group.name}</a>
                                    </VerticalAlign>

                                </div>}
                                right={<GroupJoinButton groupID={group.id}/>}/>

                <p>
                    {group.description}
                </p>

                <div style={{display: 'flex'}}>

                    <VerticalAlign>
                        <i className="fa fa-users mr-1 text-muted" aria-hidden="true"></i>
                    </VerticalAlign>

                    <VerticalAlign>
                        {group.nrMembers} members
                    </VerticalAlign>


                </div>

            </div>

        );
    }

}

export interface IProps {
    readonly group: Group;
}

export interface IState {
}
