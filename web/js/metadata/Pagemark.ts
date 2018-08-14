import {Annotation} from './Annotation';
import {Note} from './Note';
import {PagemarkType} from './PagemarkType';
import {PagemarkRect} from './PagemarkRect';
import {MetadataSerializer} from './MetadataSerializer';


export class Pagemark extends Annotation {

    // TODO: should pagemarks support the full nesting model where we can
    // have comments, notes, flashcards, etc?  Probably not but notes might
    // make sense.

    /**
     * The note for this annotation.
     *
     */
    public notes: {[id: string]: Note};

    /**
     * The type of pagemark.
     *
     */
    public type: PagemarkType;

    /**
     * The total percentage of the page that is covered with the page mark.
     * From 0 to 100.  This factors in the total rows and columns on the
     * page and is the raw percentage value of the page.
     *
     */
    public percentage: number;

    /**
     * The column number on which this pagemark is rendered.  This is mostly
     * metadata and we should be migrating to PagemarkRect and PagemarkRange
     * which supports raw rendering of the pagemarks.
     */
    public column: number;

    /**
     * The PagemarkRect for this pagemark. When not specified we use a box of
     *
     * { top: 0, left: 0, width: 100, height: 100 }
     *
     * or the whole page.
     *
     */
    public rect: PagemarkRect;

    constructor(val: Pagemark) {

        super(val);

        // TODO: should pagemarks support the full nesting model where we can
        // have comments, notes, flashcards, etc?  Probably not but notes might
        // make sense.

        this.notes = val.notes;
        this.type = val.type;
        this.percentage = val.percentage;
        this.column = val.percentage;
        this.rect = val.rect;

        // TODO: support 'range' in the future which is a PagemarkRange so that
        // we can start off reading within a smaller page.

        this.init(val);

    }

    setup() {

        super.setup();

        if(!this.notes) {
            this.notes = {}
        }

        if(!this.type) {
            this.type = PagemarkType.SINGLE_COLUMN;
        }

        if(!this.percentage) {
            this.percentage = 100;
        }

        if(!this.column) {
            this.column = 0;
        }

    }

    validate() {
        super.validate();
    }

    toString() {
        return MetadataSerializer.serialize(this);
    }

}
