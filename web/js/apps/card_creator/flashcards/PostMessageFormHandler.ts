import {SchemaFormFlashcardConverter} from './SchemaFormFlashcardConverter';
import {FormHandler} from '../elements/schemaform/FormHandler';
import {AnnotationContainer} from '../../../metadata/AnnotationContainer';
import {AnnotationDescriptor} from '../../../metadata/AnnotationDescriptor';
import {Logger} from '../../../logger/Logger';
import {AnnotationType} from '../../../metadata/AnnotationType';
import {SchemaFormData} from '../elements/schemaform/SchemaFormData';
import {ElectronContext} from '../../../ipc/handler/ElectronContext';
import {IPCClient} from '../../../ipc/handler/IPCClient';
import {IPCClients} from '../../../ipc/handler/IPCClients';
import {IPCEvent} from '../../../ipc/handler/IPCEvent';

const log = Logger.create();

export class PostMessageFormHandler extends FormHandler {

    private readonly annotationDescriptor: AnnotationDescriptor;

    private readonly targetContext: ElectronContext;

    private readonly client: IPCClient<IPCEvent>;

    constructor(annotationDescriptor: AnnotationDescriptor, targetContext: ElectronContext) {
        super();
        this.annotationDescriptor = annotationDescriptor;
        this.targetContext = targetContext;
        this.client = IPCClients.rendererProcess();
    }

    onChange(data: any) {
        log.info("onChange: ", data);
    }

    /**
     *
     * @param schemaFormData
     */
    onSubmit(schemaFormData: SchemaFormData) {

        log.info("onSubmit: ", schemaFormData);

        let archetype = "9d146db1-7c31-4bcf-866b-7b485c4e50ea";

        let flashcard = SchemaFormFlashcardConverter.convert(schemaFormData, archetype);

        let annotationDescriptor
            = AnnotationDescriptor.newInstance(AnnotationType.FLASHCARD,
                                               flashcard.id,
                                               this.annotationDescriptor.docFingerprint,
                                               this.annotationDescriptor.pageNum);

        let annotationContainer = AnnotationContainer.newInstance(annotationDescriptor, flashcard);

        (async () => {

            await this.client.execute('/api/annotations/create-annotation', annotationContainer, this.targetContext)

        })().catch(err => log.error("Could not handle form", err));

    }

    onError(data: any) {
        log.info("onError: ", data);
        //window.postMessage({ type: "onError", data: dataToExternal(data)},
        // "*");
    }

}

