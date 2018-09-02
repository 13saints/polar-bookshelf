import {HTMLFormat} from './HTMLFormat';
import {PDFFormat} from './PDFFormat';
import {DocFormat} from './DocFormat';


/**
 * Get the proper docFormat to work with.
 */
export class DocFormatFactory {

    /**
     *
     */
    static getInstance(): DocFormat {

        let polarDocFormat = DocFormatFactory.getPolarDocFormat();

        if(polarDocFormat === "html") {
            return new HTMLFormat();
        } else if (polarDocFormat === "pdf") {
            return new PDFFormat();
        } else if(polarDocFormat == null) {
            return new PDFFormat();
        } else {
            throw new Error("Unable to handle the given format: " + polarDocFormat);
        }

    }

    static getPolarDocFormat(): string {

        let polarDocFormatElement = document.querySelector("meta[name='polar-doc-format']");

        if(polarDocFormatElement) {

            let content = polarDocFormatElement.getAttribute("content");

            if(content) {
                return content;
            }

        }

        return "none";

    }

}
