import {DocMetaMutation, DocMetaSnapshotEvent, DocMetaSnapshotEventListener} from './Datastore';
import {DocMetaComparisonIndex} from './DocMetaComparisonIndex';
import {UUIDs} from '../metadata/UUIDs';
import {filter} from 'rxjs/operators';

export class DocMetaSnapshotEventListeners {

    /**
     * Create a new listener that takes inputs and creates a de-duplicated
     * listener that only emits new or updated documents by the UUID or deleted
     * documents.
     *
     * This work with one ore more listeners which enables us to have
     * existing listeners that sends from IPC as well the firebase listeners
     * and we will just get the earliest one.
     *
     */
    public static createDeduplicatedListener(outputListener: DocMetaSnapshotEventListener) {

        const docMetaComparisonIndex = new DocMetaComparisonIndex();

        // TODO: Should we filter on the consistency level?  We need a way to
        // trigger the first sync when we get the committed writes from the
        // FirebaseDatastore so if we get 'written' consistency level from Firebase
        // and the rest are filtered we can't ever trigger the synchronize ...
        //
        // We could have custom filters for the level... so we could support
        // BOTH, committed, or written levels...

        return async (docMetaSnapshotEvent: DocMetaSnapshotEvent) => {

            const acceptedDocMetaMutations: DocMetaMutation[] = [];

            for (const docMetaMutation of docMetaSnapshotEvent.docMetaMutations) {

                const docInfo = await docMetaMutation.docInfoProvider();
                const mutationType = docMetaMutation.mutationType;

                let doUpdated = false;

                if (mutationType === 'created' && ! docMetaComparisonIndex.contains(docInfo.fingerprint)) {
                    doUpdated = true;
                }

                if (mutationType === 'updated') {

                    const docComparison = docMetaComparisonIndex.get(docInfo.fingerprint);

                    if (!docComparison) {
                        doUpdated = true;
                    }

                    if (docComparison && UUIDs.compare(docComparison.uuid, docInfo.uuid) < 0) {
                        doUpdated = true;
                    }

                }

                if (doUpdated) {
                    // when the doc is created and it's not in the index.
                    docMetaComparisonIndex.putDocInfo(docInfo);
                    acceptedDocMetaMutations.push(docMetaMutation);
                }

                if (mutationType === 'deleted' && docMetaComparisonIndex.get(docInfo.fingerprint)) {
                    // if we're deleting the document and we've seen it before
                    // and it's in the index.
                    docMetaComparisonIndex.remove(docInfo.fingerprint);
                    acceptedDocMetaMutations.push(docMetaMutation);
                }

            }

            if (acceptedDocMetaMutations.length > 0) {

                outputListener({
                    consistency: docMetaSnapshotEvent.consistency,
                    progress: docMetaSnapshotEvent.progress,
                    docMetaMutations: acceptedDocMetaMutations,
                });

            }

        };

    }

}
