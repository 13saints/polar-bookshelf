import {Preconditions} from '../Preconditions';
import {Optional} from './ts/Optional';

export class Dictionaries {

    public static values<T>(dict: {[key: string]: T} | undefined | null): T[] {

        const result: T[] = [];

        if (!dict) {
            // TODO: this can go away once we migrate to typescript everywhere
            return result;
        }

        return Object.values(dict);

    }

    /**
     * We iterate over all keys in the dictionary
     *
     * @param dict
     * @param callback
     */
    public static forDict<T>(dict: {[key: string]: T}, callback: ForDictCallbackFunction<T> ) {

        Preconditions.assertNotNull(dict, "dict");
        Preconditions.assertNotNull(callback, "callback");

        for (const key in dict) {

            if (dict.hasOwnProperty(key)) {
                const value = dict[key];
                callback(key, value);
            }

        }

    }

    /**
     * Returns a dictionary with sorted keys. Dictionaries by definition aren't
     * sorted by they're implemented internally as linked hash tables.  We return
     * the same set-theoretic dictionaries where the key set are identical, just
     * in a different key order.
     *
     * This is primarily used for testing.
     *
     */
    public static sorted(dict: any): any {

        if (dict === undefined || dict === null) {
            // nothing to do here.
            return dict;
        }

        if (! (typeof dict === 'object')) {
            // if we're not a dictionary we're done
            return dict;
        }

        const result: any = {};

        Object.keys(dict).sort().forEach(key => {
            result[key] = this.sorted(dict[key]);
        });

        return result;

    }

    /**
     *
     * Recursively work through this object and remove any fields that are stored
     * with unassigned values.
     *
     * @param dict
     */
    static onlyDefinedProperties(dict: any): any {

        if(dict === undefined || dict === null) {
            // nothing to do here.
            return dict;
        }

        if(! (typeof dict === 'object')) {
            // if we're not a dictionary we're done
            return dict;
        }

        let result: any = {};

        for (const key of Object.keys(dict).sort()) {
            const value = dict[key];

            if (value === undefined) {
                continue;
            }

            result[key] = this.sorted(value);
        }

        return result;

    }


    /**
     * Create a deep copy of the given dictionary.
     *
     * @param dict
     */
    public static copyOf(dict: any): any {

        if (dict === undefined || dict === null) {
            // nothing to do here.
            return dict;
        }

        if (typeof dict !== 'object') {
            // if we're not a dictionary we're just return the default dictionary.
            return dict;
        }

        const result: any = {};

        Object.keys(dict).forEach(key => {
            result[key] = this.copyOf(dict[key]);
        });

        return result;

    }

    /**
     * Easily convert an array to a dict.
     */
    public static toDict<V>(values: V[], converter: (value: V) => string): {[key: string]: V} {

        const result: { [key: string]: V } = {};

        values.forEach(value => {
            result[converter(value)] = value;
        });

        return result;

    }

    public static countOf<V>(dict: {[key: string]: V} | null | undefined) {

        return Optional.of(dict)
            .map(current => Object.keys(current).length)
            .getOrElse(0);

    }

}

interface ForDictCallbackFunction<T> {
    (key: string, value: T): void;
}

