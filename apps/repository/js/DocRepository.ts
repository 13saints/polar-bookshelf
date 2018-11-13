import {IListenablePersistenceLayer} from '../../../web/js/datastore/IListenablePersistenceLayer';
import {Logger} from '../../../web/js/logger/Logger';
import {DocInfo, IDocInfo} from '../../../web/js/metadata/DocInfo';
import {RepoDocInfo} from './RepoDocInfo';
import {Tag} from '../../../web/js/tags/Tag';
import {Tags} from '../../../web/js/tags/Tags';
import {Preconditions} from '../../../web/js/Preconditions';
import {RepoDocInfoIndex} from './RepoDocInfoIndex';
import {TagsDB} from './TagsDB';
import {Optional} from '../../../web/js/util/ts/Optional';
import {DocMetaFileRefs} from '../../../web/js/datastore/DocMetaRef';

const log = Logger.create();

/**
 * The main interface to the DocRepository including updates, the existing
 * loaded document metadata, and tags database.
 */
export class DocRepository {

    public readonly repoDocs: RepoDocInfoIndex = {};

    public readonly tagsDB: TagsDB = new TagsDB();

    private readonly persistenceLayer: IListenablePersistenceLayer;

    // TODO: a great deal of this code could be cleaned up if I made it MVC and
    // had this data be the model and updated the view via events emitted from
    // an AdvertisingPersistenceLayer - which we kind of need anyway for
    // Firestore....

    constructor(persistenceLayer: IListenablePersistenceLayer) {
        this.persistenceLayer = persistenceLayer;
        this.init();
    }

    /**
     * Update the in-memory representation of this doc.
     *
     */
    public updateDocInfo(...repoDocInfos: RepoDocInfo[]) {

        for (const repoDocInfo of repoDocInfos) {
            this.repoDocs[repoDocInfo.fingerprint] = repoDocInfo;
        }

        this.updateTagsDB(...repoDocInfos);
    }

    /**
     * Sync the docInfo to disk.
     *
     */
    public async syncDocInfo(docInfo: IDocInfo) {

        if (await this.persistenceLayer.contains(docInfo.fingerprint)) {

            const docMeta = await this.persistenceLayer.getDocMeta(docInfo.fingerprint);

            if (docMeta === undefined) {
                log.warn("Unable to find DocMeta for: ", docInfo.fingerprint);
                return;
            }

            docMeta.docInfo = new DocInfo(docInfo);

            log.info("Writing out updated DocMeta");

            await this.persistenceLayer.writeDocMeta(docMeta);

        }

    }

    /**
     * Update the RepoDocInfo object with the given tags.
     */
    public async syncDocInfoTitle(repoDocInfo: RepoDocInfo, title: string) {

        Preconditions.assertPresent(repoDocInfo);
        Preconditions.assertPresent(repoDocInfo.docInfo);
        Preconditions.assertPresent(title);

        repoDocInfo = Object.assign({}, repoDocInfo);
        repoDocInfo.title = title;
        repoDocInfo.docInfo.title = title;

        this.updateDocInfo(repoDocInfo);

        return this.syncDocInfo(repoDocInfo.docInfo);

    }

    /**
     * Update the RepoDocInfo object with the given tags.
     */
    public async syncDocInfoTags(repoDocInfo: RepoDocInfo, tags: Tag[]) {

        Preconditions.assertPresent(repoDocInfo);
        Preconditions.assertPresent(repoDocInfo.docInfo);
        Preconditions.assertPresent(tags);

        repoDocInfo = Object.assign({}, repoDocInfo);
        repoDocInfo.tags = Tags.toMap(tags);
        repoDocInfo.docInfo.tags = Tags.toMap(tags);

        this.updateDocInfo(repoDocInfo);

        return this.syncDocInfo(repoDocInfo.docInfo);

    }

    public async syncDeleteDocInfo(repoDocInfo: RepoDocInfo) {

        // delete it from the in-memory index.
        delete this.repoDocs[repoDocInfo.fingerprint];

        // delete it from the repo now.
        const docMetaFileRef = DocMetaFileRefs.createFromDocInfo(repoDocInfo.docInfo);

        return this.persistenceLayer.delete(docMetaFileRef);

    }

    private init() {

        for (const repoDoc of Object.values(this.repoDocs)) {
            this.updateTagsDB(repoDoc);
        }

    }

    private updateTagsDB(...repoDocInfos: RepoDocInfo[]) {

        for (const repoDocInfo of repoDocInfos) {

            // update the tags data.
            Optional.of(repoDocInfo.docInfo.tags)
                .map(tags => {
                    this.tagsDB.register(...Object.values(tags));
                });

        }

    }

}
