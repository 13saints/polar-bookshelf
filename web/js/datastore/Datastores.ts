import {Datastore, DocMetaMutation, DocMetaSnapshotBatch, DocMetaSnapshotEvent, DocMetaSnapshotEventListener, FileRef, SnapshotResult} from './Datastore';
import {MemoryDatastore} from './MemoryDatastore';
import {DiskDatastore} from './DiskDatastore';
import {Logger} from '../logger/Logger';
import {DocMetaRef} from './DocMetaRef';
import {DocMeta} from '../metadata/DocMeta';
import {DocMetas} from '../metadata/DocMetas';
import {NULL_FUNCTION} from '../util/Functions';
import {Percentages} from '../util/Percentages';
import {ProgressTracker} from '../util/ProgressTracker';
import {Providers, AsyncProviders} from '../util/Providers';

const log = Logger.create();

const ENV_POLAR_DATASTORE = 'POLAR_DATASTORE';

export class Datastores {

    public static create(): Datastore {

        const name = process.env[ENV_POLAR_DATASTORE];

        if (name === 'MEMORY') {
            log.info("Using memory datastore");
            return new MemoryDatastore();
        }

        return new DiskDatastore();

    }

    public static async getDocMetas(datastore: Datastore,
                                    listener: DocMetaListener,
                                    docMetaRefs?: DocMetaRef[]) {

        if (!docMetaRefs) {
            docMetaRefs = await datastore.getDocMetaFiles();
        }

        for (const docMetaRef of docMetaRefs) {
            const docMetaData = await datastore.getDocMeta(docMetaRef.fingerprint);

            if ( ! docMetaData) {
                throw new Error("Could not find docMeta for fingerprint: " + docMetaRef.fingerprint);
            }

            const docMeta = DocMetas.deserialize(docMetaData);
            listener(docMeta);
        }

    }

    /**
     * Create a committed snapshot from an existing datastore so that legacy
     * ones seem to support snapshots though they might not support updates of
     * the listeners.
     */
    public static async createCommittedSnapshot(datastore: Datastore,
                                                listener: DocMetaSnapshotEventListener,
                                                batch?: DocMetaSnapshotBatch): Promise<SnapshotResult> {

        if (! batch) {

            // for most of our usages we just receive the first batch and we're
            // done at that point.

            batch = {
                id: 0,
                terminated: false
            };

        }

        const docMetaFiles = await datastore.getDocMetaFiles();

        const progressTracker = new ProgressTracker(docMetaFiles.length);

        // TODO: we call the listener too many times here but we might want to
        // batch it in the future so that the listener doesn't get called too
        // often as it would update the UI too frequently.  We need to compute
        // the ideal batch size so we should probably compute it as:

        // const percMax = 100;
        // const minBatchSize = 1;
        // const maxBatchSize = 20;
        //
        // Math.max(minBatchSize, Math.min(maxBatchSize, docMetaFiles.length /
        // percMax))   This will give us an ideal batch size so that we update
        // the UI every 1% OR the maxBatchSize...

        for (const docMetaFile of docMetaFiles) {

            const data = await datastore.getDocMeta(docMetaFile.fingerprint);

            // TODO: in the cloud store implementation it will probably be much
            // faster to use a file JUST for the DocInfo to speed up loading.

            const docMetaProvider = AsyncProviders.memoize(async () => DocMetas.deserialize(data!));
            const docInfoProvider = AsyncProviders.memoize(async () => (await docMetaProvider()).docInfo);

            const docMetaMutation: DocMetaMutation = {
                docMetaProvider,
                docInfoProvider,
                mutationType: 'created'
            };

            listener({
                progress: progressTracker.incr(),
                consistency: 'committed',
                docMetaMutations: [docMetaMutation],
                batch
            });

        }

        listener({
            progress: progressTracker.peek(),
            consistency: 'committed',
            docMetaMutations: [],
            batch: {
                id: batch.id,
                terminated: true,
            }
        });

        return { };

    }

    /**
     * Remove all the docs in a datastore.  Only do this for testing and for
     * very important use cases.
     */
    public static async purge(datastore: Datastore,
                              purgeListener: PurgeListener = NULL_FUNCTION) {

        const docMetaFiles = await datastore.getDocMetaFiles();

        let completed: number = 0;
        const total: number = docMetaFiles.length;

        // TODO: would be more ideal for this to use an AsyncWorkQueue

        for (const docMetaFile of docMetaFiles) {

            const data = await datastore.getDocMeta(docMetaFile.fingerprint);
            const docMeta = DocMetas.deserialize(data!);

            const docFile: FileRef = {
                name: docMeta.docInfo.filename!,
                hashcode: docMeta.docInfo.hashcode
            };

            datastore.delete({
                fingerprint: docMeta.docInfo.fingerprint,
                docInfo: docMeta.docInfo,
                docFile
            });

            ++completed;

            const progress = Percentages.calculate(completed, total);

            purgeListener({completed, total, progress});

        }

        if (total === 0) {
            purgeListener({completed, total, progress: 100});
        }

    }

}

export type DocMetaListener = (docMeta: DocMeta) => void;

export interface PurgeEvent {
    readonly completed: number;
    readonly total: number;
    readonly progress: number;
}

export type PurgeListener = (purgeEvent: PurgeEvent) => void;
