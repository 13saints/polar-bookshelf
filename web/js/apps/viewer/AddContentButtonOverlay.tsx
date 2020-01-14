import * as React from 'react';
import Button from 'reactstrap/lib/Button';

export class AddContentButtonOverlay  extends React.PureComponent<IProps, IState> {

    constructor(props: IProps, context: any) {
        super(props, context);
    }

    public render() {

        // TODO: Add RendererAnalytics for when this is loaded ... and added...

        return (

            <div className=""
                 style={{
                     position: 'fixed',
                     top: '70px',
                     right: '60px',
                     zIndex: 100
                 }}>

                <div>

                    <Button id="add-content-overlay"
                            direction="down"
                            style={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                fontFamily: 'sans-serif'
                            }}
                            color="success"
                            className="btn-lg shadow ml-auto mr-auto"
                            onClick={() => this.props.onClick()}
                            size="lg">

                        <i className="fas fa-plus" style={{marginRight: '5px'}}/>
                        Add to Polar

                    </Button>

                    <Button id="download-content-overlay"
                            direction="down"
                            style={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                fontFamily: 'sans-serif'
                            }}
                            color="primary"
                            className="btn-lg shadow ml-auto mr-auto"
                            onClick={() => this.handleDownload()}
                            size="lg">

                        <i className="fas fa-file-download mr-1" />
                        Download

                    </Button>


                </div>

            </div>

        );

    }

    private handleDownload() {
        const url = new URL(document.location.href);
        const file = url.searchParams.get('file');
        document.location.href = file!;
    }

}

interface IProps {
    onClick: () => void;
}

interface IState {
}
