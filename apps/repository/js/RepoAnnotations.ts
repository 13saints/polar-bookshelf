import {TextHighlight} from '../../../web/js/metadata/TextHighlight';
import {AreaHighlight} from '../../../web/js/metadata/AreaHighlight';
import {RepoAnnotation, RepoHighlightInfo} from './RepoAnnotation';
import {AnnotationType} from 'polar-shared/src/metadata/AnnotationType';
import {Images} from '../../../web/js/metadata/Images';
import {Img} from '../../../web/js/metadata/Img';
import {PersistenceLayerProvider} from '../../../web/js/datastore/PersistenceLayer';
import {DocFileResolvers} from "../../../web/js/datastore/DocFileResolvers";
import {Tag} from "polar-shared/src/tags/Tags";
import {IDocInfo} from "polar-shared/src/metadata/IDocInfo";
import {IDocMeta} from "polar-shared/src/metadata/IDocMeta";
import {IComment} from "polar-shared/src/metadata/IComment";
import {IFlashcard} from "polar-shared/src/metadata/IFlashcard";
import {ITextHighlight} from "polar-shared/src/metadata/ITextHighlight";
import {IAreaHighlight} from "polar-shared/src/metadata/IAreaHighlight";
import {HighlightColors} from "polar-shared/src/metadata/HighlightColor";
import {Annotations} from "polar-shared/src/metadata/Annotations";

export class RepoAnnotations {

    public static convert(persistenceLayerProvider: PersistenceLayerProvider,
                          docMeta: IDocMeta): ReadonlyArray<RepoAnnotation> {

        const result: RepoAnnotation[] = [];
        const docInfo = docMeta.docInfo;

        for (const pageMeta of Object.values(docMeta.pageMetas)) {

            const textHighlights = Object.values(pageMeta.textHighlights || {});
            const areaHighlights = Object.values(pageMeta.areaHighlights || {});
            const comments = Object.values(pageMeta.comments || {});
            const flashcards = Object.values(pageMeta.flashcards || {}) ;

            for (const textHighlight of textHighlights) {
                result.push(this.toRepoAnnotation(persistenceLayerProvider, textHighlight, AnnotationType.TEXT_HIGHLIGHT, docInfo));
            }

            for (const areaHighlight of areaHighlights) {
                result.push(this.toRepoAnnotation(persistenceLayerProvider, areaHighlight, AnnotationType.AREA_HIGHLIGHT, docInfo));
            }

            for (const comment of comments) {
                result.push(this.toRepoAnnotation(persistenceLayerProvider, comment, AnnotationType.COMMENT, docInfo));
            }

            for (const flashcard of flashcards) {
                result.push(this.toRepoAnnotation(persistenceLayerProvider, flashcard, AnnotationType.FLASHCARD, docInfo));
            }

        }

        return result;

    }

    public static toRepoAnnotation(persistenceLayerProvider: PersistenceLayerProvider,
                                   sourceAnnotation: ITextHighlight | IAreaHighlight | IComment | IFlashcard,
                                   type: AnnotationType,
                                   docInfo: IDocInfo): RepoAnnotation {

        // code shared with DocAnnotations and we should refactor to
        // standardize.

        const text = Annotations.toText(type, sourceAnnotation);

        let meta: RepoHighlightInfo | undefined;

        if (type === AnnotationType.TEXT_HIGHLIGHT) {
            const textHighlight = <TextHighlight> sourceAnnotation;
            meta = {
                color: HighlightColors.withDefaultColor(textHighlight.color)
            };
        }

        let img: Img | undefined;

        if (type === AnnotationType.AREA_HIGHLIGHT) {

            const areaHighlight = <AreaHighlight> sourceAnnotation;
            meta = {
                color: HighlightColors.withDefaultColor(areaHighlight.color)
            };

            const docFileResolver = DocFileResolvers.createForPersistenceLayer(persistenceLayerProvider);
            img = Images.toImg(docFileResolver, areaHighlight.image);

        }

        return {
            id: sourceAnnotation.id,
            guid: sourceAnnotation.guid,
            fingerprint: docInfo.fingerprint,
            text,
            type,
            created: sourceAnnotation.created,
            tags: docInfo.tags || {},
            meta,
            docInfo,
            img,
            original: sourceAnnotation
        };

    }

    public static isValid(repoAnnotation: RepoAnnotation) {
        return true;
    }

    public static toTags(repoAnnotation?: RepoAnnotation): Tag[] {

        if (repoAnnotation) {
            return Object.values(repoAnnotation.tags || {});
        }

        return [];

    }

}
