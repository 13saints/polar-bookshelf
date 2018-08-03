import {AnnotationDescriptor} from './AnnotationDescriptor';
import {AnnotationTypes} from './AnnotationType';
import {Attributes} from '../util/Attributes';

export class AnnotationDescriptors {

    static fromElement(element: HTMLElement): AnnotationDescriptor | undefined {

        let dataAttributes = Attributes.dataToStringMap(element);

        if(! dataAttributes['annotationType']) {
            return undefined;
        }

        let annotationTypeStr = dataAttributes['annotationType'].replace("-", "_").toUpperCase();

        let annotationType = AnnotationTypes.fromString(annotationTypeStr);
        let id = dataAttributes['annotationId'];
        let docFingerprint = dataAttributes['annotationDocFingerprint'];
        let pageNum = parseInt(dataAttributes['annotationPageNum']);

        return new AnnotationDescriptor(annotationType, docFingerprint, id, pageNum);

    }

}
