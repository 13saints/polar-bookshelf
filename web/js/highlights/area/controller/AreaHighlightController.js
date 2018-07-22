const {AnnotationRects} = require("../../../metadata/AnnotationRects");
const {AreaHighlights} = require("../../../metadata/AreaHighlights");
const {Preconditions} = require("../../../Preconditions");
const {DocFormatFactory} = require("../../../docformat/DocFormatFactory");
const {ipcRenderer} = require('electron');

const log = require("../../../logger/Logger").create();

class AreaHighlightController {

    constructor(model) {
        this.model = Preconditions.assertNotNull(model, "model");
        this.docFormat = DocFormatFactory.getInstance();

        ipcRenderer.on('context-menu-command', (event, arg) => {

            switch (arg.command) {

                case "delete-area-highlight":
                    this.onDeleteAreaHighlight(event);
                    break;

                default:
                    console.warn("Unhandled command: " + arg.command);
                    break;
            }

        });

    }

    onDocumentLoaded() {
        log.info("onDocumentLoaded: ", this.model.docMeta);
    }

    start() {

        this.model.registerListenerForDocumentLoaded(this.onDocumentLoaded.bind(this));

        window.addEventListener("message", event => this.onMessageReceived(event), false);

    }

    onMessageReceived(event) {

        if (event.data && event.data.type === "create-area-highlight") {
            this.onCreateAreaHighlight(event.data);
        }

        if (event.data && event.data.type === "delete-area-highlight") {
            this.onDeleteAreaHighlight(event.data);
        }

    }

    /**
     *
     * @param contextMenuLocation {ContextMenuLocation}
     */
    onCreateAreaHighlight(contextMenuLocation) {

        log.info("Creating area highlight: ", contextMenuLocation);

        let annotationRect = AnnotationRects.createFromEvent(contextMenuLocation);

        log.info("annotationRect", annotationRect);

        let areaHighlight = AreaHighlights.create({rect: annotationRect});

        log.info("areaHighlight", areaHighlight);

        let docMeta = this.model.docMeta;
        let pageMeta = docMeta.getPageMeta(contextMenuLocation.pageNum);

        pageMeta.areaHighlights[areaHighlight.id] = areaHighlight;


    }

    onDeleteAreaHighlight(contextMenuEvent) {

        log.info("Deleting area highlight: ", contextMenuEvent);


        // should we just send this event to all the the windows?
        contextMenuEvent.matchingSelectors[".area-highlight"].annotationDescriptors.forEach(annotationDescriptor => {

            log.info("Deleting annotationDescriptor: ", JSON.stringify(annotationDescriptor, null, "  "));

            let pageMeta = this.model.docMeta.getPageMeta(annotationDescriptor.pageNum);
            delete pageMeta.areaHighlights[annotationDescriptor.annotationId];

        });

    }

}

module.exports.AreaHighlightController = AreaHighlightController;
