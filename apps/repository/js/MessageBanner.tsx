import * as React from 'react';
import Alert from 'reactstrap/lib/Alert';
import {Arrays} from '../../../web/js/util/Arrays';
import {RendererAnalytics} from '../../../web/js/ga/RendererAnalytics';

// <i className="fab fa-github"></i>

// noinspection TsLint
export class MessageBanner extends React.Component<IProps, IState> {

    private message?: Message;

    constructor(props: IProps, context: any) {
        super(props, context);

        this.state = {
            visible: true
        };

        this.onDismiss = this.onDismiss.bind(this);
        this.onClick = this.onClick.bind(this);


    }

    public render() {

        return (

            <div>
                <Alert color="info"
                       isOpen={this.state.visible}
                       toggle={this.onDismiss}
                       fade={false}
                       onClick={() => this.onClick(this.message!)}
                       className="m-1 pl-1 pr-1">

                    {this.message!.element}

                </Alert>

            </div>

        );

    }


    public componentWillMount(): void {

        this.message = Arrays.shuffle(...MESSAGES)[0];

    }

    private onDismiss() {
        this.setState({ visible: false });
    }

    private onClick(message: Message) {
        RendererAnalytics.event({category: 'message-banner-click', action: message.id});
    }

}

interface IState {
    visible: boolean;
}

export interface IProps {

}

interface Message {

    id: string;
    element: JSX.Element;

}

// noinspection TsLint
const MESSAGES: Message[] = [

    // TODO: put links to help and other technical docs.
    // TODO: Make some of these poll options I think.

    {
        id: 'github-star',
        element: <div><b>Do you like POLAR?</b> Would you mind <a href="https://github.com/burtonator/polar-bookshelf">giving us a star on Github?</a></div>,
    },
    {
        id: 'alternativeto-vote',
        element: <div>Can you help other people discover POLAR by <a href="https://alternativeto.net/software/polar-1/">voting for us on alternativeTo?</a></div>
    },
    {
        id: 'ui-ux-help',
        element: <div>Are you a UI/UX developer? <a href="https://github.com/burtonator/polar-bookshelf/labels/uiux">We'd love your help on some UI issues! </a></div>
    },

    {
        id: 'join-discord',
        element: <div>Want to chat about Polar? <a href="https://discord.gg/GT8MhA6">Join our live Discord chat group!</a></div>
    },
    {
        id: 'roadmap',
        element: <div>Interested in the future of Polar? <a href="https://github.com/burtonator/polar-bookshelf/blob/master/docs/ROADMAP.md">Check out our roadmap!</a></div>
    },

    {
        id: 'roadmap',
        element: <div>Interested in the future of Polar? <a href="https://github.com/burtonator/polar-bookshelf/blob/master/docs/ROADMAP.md">Check out our roadmap!</a></div>
    },
    {
        id: 'opencollective-donate',
        element: <div>Polar needs your help to continue future development! <a href="https://opencollective.com/polar-bookshelf/donate">Donate to Support Polar</a></div>
    }
    // {
    //     id: 'opencollective-donate-button',
    //     element: <div>
    //
    //         <div>
    //             <div style={{width: '100%', paddingRight: '40px'}}>
    //
    //                 <div className="flexbar ">
    //
    //                     <div style={{alignSelf: 'center'}}>
    //                         Polar needs your help to continue future development!
    //                     </div>
    //
    //                     <div className="flexbar-right">
    //
    //                         <a href="https://opencollective.com/polar-bookshelf/donate" target="_blank">
    //                             <img src="https://opencollective.com/polar-bookshelf/donate/button@2x.png?color=blue" width="250" />
    //                         </a>
    //
    //                     </div>
    //
    //
    //                 </div>
    //
    //
    //             </div>
    //
    //         </div>
    //
    //     </div>
    // }

];

