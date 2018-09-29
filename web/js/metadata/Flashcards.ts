import {Dicts} from '../util/Dicts';
import {FlashcardType} from './FlashcardType';
import {Hashcodes} from '../Hashcodes';
import {Preconditions} from '../Preconditions';
import {Flashcard} from './Flashcard';
import {Texts} from './Texts';
import {Text} from './Text';
import {TextType} from './TextType';
import {DocMeta} from './DocMeta';
import {ISODateTimeStrings} from './ISODateTimeStrings';

export class Flashcards {

    public static create(type: FlashcardType, fields: {[key: string]: Text }, archetype: string) {

        Preconditions.assertNotNull(fields, "fields");

        const created = ISODateTimeStrings.create();
        const lastUpdated = created;

        // TODO: implement 'machine codes' here where we have a unique code per
        // physical device.  This way two people can create the same flashcard
        // and never conflict.  This way we support distributed behavior.
        const id = Hashcodes.createID({fields});

        return Flashcard.newInstance(id, id, created, lastUpdated, type, fields, archetype);

    }

    /**
     * Create a flashcard from the raw, completed, schema form data.
     */
    public static createFromSchemaFormData(formData: {[key: string]: string }, archetype: string) {

        // TODO: the markdown needs to be converted to HTML as well.  The text
        // we get from the markdown widget is markdown. Not HTML and I confirmed
        // this is the case.

        const fields: {[key: string]: Text } = {};

        // now work with the formData to create the fields.
        Dicts.ownKeys(formData, (key, value) => {
            fields[key] = Texts.create(value, TextType.HTML);
        });

        return Flashcards.create(FlashcardType.BASIC_FRONT_BACK, fields, archetype);

    }

}

export class MockFlashcards {

    /**
     * Attach mock flashcards on the given DocMeta for testing
     */
    public static attachFlashcards(docMeta: DocMeta) {

        let idx = 0;

        Object.values(docMeta.pageMetas).forEach(pageMeta => {

            const archetype = "9d146db1-7c31-4bcf-866b-7b485c4e50ea";

            // noinspection TsLint
            const front = Texts.create("What is the capital of California? <img src=\"data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7\" />\n" + idx, TextType.HTML);
            const back = Texts.create("Sacramento", TextType.TEXT);

            const fields = {
                'Front': front,
                'Back': back,
            };

            const flashcard = Flashcards.create(FlashcardType.CLOZURE, fields, archetype);

            pageMeta.flashcards[flashcard.id] = flashcard;

            ++idx;

        });

        return docMeta;

    }

}
