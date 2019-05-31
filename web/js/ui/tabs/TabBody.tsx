import * as React from 'react';
import {Tab} from './TabNav';
import {TabStyles} from './TabStyles';
import {ReactWebview} from './ReactWebview';

// TODO: might want to make this a PureComponent
export class TabBody extends React.Component<IProps, IState> {

    constructor(props: IProps, context: any) {
        super(props, context);
    }

    public render() {

        const {tab} = this.props;

        if (typeof tab.content === 'string') {

            // return <webview id={'tab-webview-' + tab.id}
            //                 style={TabStyles.WEBVIEW}
            //                 src={tab.content}/>;

            // return <webview id={'tab-webview-' + tab.id}
            //                 disablewebsecurity={trueAsStr}
            //                 autosize={trueAsStr}
            //                 nodeintegration={trueAsStr}
            //                      // style={{
            //                      //     width: '100%',
            //                      //     height: '100%'
            //                      // }}
            //                 style={TabStyles.WEBVIEW}
            //                 src={tab.content}></webview>;

            return <ReactWebview id={'' + tab.id}
                                 disablewebsecurity
                                 autosize
                                 nodeintegration
                                 cssWidth={TabStyles.WEBVIEW.width!}
                                 cssHeight={TabStyles.WEBVIEW.height!}
                                 src={tab.content}/>;

        } else {
            return tab.content;
        }

    }

}


interface IProps {
    readonly tab: Tab;
}

interface IState {
}

