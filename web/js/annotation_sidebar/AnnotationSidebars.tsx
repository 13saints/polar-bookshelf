import {Splitter} from '../ui/splitter/Splitter';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AnnotationSidebar} from './AnnotationSidebar';
import {DocMeta} from '../metadata/DocMeta';
import {Logger} from '../logger/Logger';

const log = Logger.create();

export class AnnotationSidebars {

    public static create(docMeta: DocMeta): Splitter {

        const splitter = new Splitter('#polar-viewer', '#polar-sidebar');

        splitter.collapse();

        ReactDOM.render(
            <AnnotationSidebar docMeta={docMeta} />,
            document.querySelector('#polar-sidebar') as HTMLElement
        );

        return splitter;

    }

    public static scrollToAnnotation(id: string, pageNum: number) {

        const selector = `.page div[data-annotation-id='${id}']`;

        const pageElements: HTMLElement[] = Array.from(document.querySelectorAll(".page"));
        const pageElement = pageElements[pageNum - 1];

        if (!pageElement) {
            log.error(`Could not find page ${pageNum} of N pages: ${pageElements.length}`);
            return;
        }

        this.scrollToElement(pageElement);

        const annotationElement = document.querySelector(selector)! as HTMLElement;

        this.scrollToElement(annotationElement);

        // TODO: disable this for now because with the pagemark the flash does
        // not actually work. Migrate to using some type of pointer showing the
        // place the annotation is marked.
        //
        // const flashClass = 'flash-background-color';
        //
        // document.querySelectorAll(selector).forEach(current => {
        //     current.classList.add(flashClass);
        //     setTimeout(() => current.classList.remove(flashClass), 1000);
        // });

    }

    private static scrollToElement(element: HTMLElement) {

        // NOTE: behavior: smooth won't actually work
        element.scrollIntoView({
            behavior: 'instant',
            block: 'center',
            inline: 'center'
       });

    }


}
