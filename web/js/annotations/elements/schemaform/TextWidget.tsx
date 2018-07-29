/**
 * This is our main widget for handling text fields which are HTML.
 */
import ReactSummernote from './ReactSummernote';
import React from 'react';
import {Logger} from '../../../logger/Logger';
import {TypedWidgetProps} from './TypedWidgetProps';
const log = Logger.create();

export class TextWidget extends React.Component  {

    private readonly onChangeCallback: OnChangeCallback;

    private readonly onBlurCallback: OnSelectionCallback;
    private readonly onFocusCallback: OnSelectionCallback;

    private readonly typedWidgetProps: TypedWidgetProps;

    private value: string = "";

    constructor(props: any = {}) {
        super(props);

        this.onChangeCallback = props.onChange;
        this.onBlurCallback = props.onBlur;
        this.onFocusCallback = props.onFocus;

        this.typedWidgetProps = new TypedWidgetProps(props);

        console.log("Using ID: " + this.typedWidgetProps.id);

        if(this.typedWidgetProps.value) {
            this.value = this.typedWidgetProps.value;
        }

        // needed because React changes 'this' to the Element it created which
        // is a bit confusing.
        this.onChange = this.onChange.bind(this);
        this.onImageUpload = this.onImageUpload.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onFocus = this.onFocus.bind(this);

    }

    // FIXME: there is an errorSchema here too which I might want to look at.
    onChange(newValue: any) {

        // FIXME: summernote has isEmpty and some other methods I need to use
        // here.

        console.log('FIXME: this: ', this);
        console.log('FIXME: this.onChangeCallback: ', this.onChangeCallback);
        console.log('onChange: newValue: ', newValue);

        log.debug('onChange', newValue);

        this.value = newValue;

        this.onChangeCallback(newValue);

    }

    onBlur() {
        log.info("onBlur");
        this.onBlurCallback(this.typedWidgetProps.id, this.value)

    }

    onFocus() {
        log.info("onFocus");
        this.onFocusCallback(this.typedWidgetProps.id, this.value)
    }

    /**
     * This is a workaround documented here:
     *
     * https://github.com/summernote/react-summernote/issues/38
     */
    onImageUpload(images: any[], insertImage: Function) {

        log.debug('onImageUpload', images);
        /* FileList does not support ordinary array methods */
        for (let i = 0; i < images.length; i++) {
            /* Stores as bas64enc string in the text.
             * Should potentially be stored separately and include just the url
             */
            const reader = new FileReader();

            reader.onloadend = () => {
                insertImage(reader.result);
            };

            reader.readAsDataURL(images[i]);
        }

    };

    render() {

        // https://github.com/summernote/react-summernote/issues/38

        return (
            <ReactSummernote
                value=""
                options={{
                    id: this.typedWidgetProps.id,
                    lang: 'en-US',
                    height: 150,
                    dialogsInBody: false,
                    // toolbar: [
                    //     ['style', []],
                    //     ['font', []],
                    //     ['fontname', []],
                    //     ['para', []],
                    //     ['table', []],
                    //     ['insert', []],
                    //     ['view', []],
                    //     ['image', []]
                    // ]

                    // toolbar: [
                    //     ['style', ['style']],
                    //     ['font', ['bold', 'underline', 'clear']],
                    //     ['fontname', ['fontname']],
                    //     ['para', ['ul', 'ol', 'paragraph']],
                    //     ['table', ['table']],
                    //     ['insert', ['link', 'picture', 'video']],
                    //     ['view', ['fullscreen', 'codeview']]
                    // ]

                }}
                onChange={this.onChange}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                //onSubmit={this.onSubmit}
                onImageUpload={this.onImageUpload}
            />
        );
    }

}

interface OnChangeCallback {
    (newValue: string): void;
}

/**
 * Used for onFocus and onBlur
 */
interface OnSelectionCallback {
    (id: string, value: string): void;
}
