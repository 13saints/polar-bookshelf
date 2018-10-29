import {IMutableReactor, IReactor, Reactor} from './Reactor';
import {Listener} from './Listener';
import {isPresent} from '../Preconditions';

/**
 * A reactor that allows dispatchEvents to be queue'd up until the first
 * listener is added for an event at which point the existing values are
 * drained.
 */
export class QueuedReactor<V> implements IReactor<V>, IMutableReactor<V> {

    private readonly delegate: Reactor<V>;

    private readonly queue: {[name: string]: V[]} = {};

    constructor(delegate = new Reactor<V>()) {
        this.delegate = delegate;
    }

    public addEventListener(eventName: string, listener: Listener<V>): Listener<V> {

        this.delegate.addEventListener(eventName, listener);

        // now call all the events on the delegate directly.

        if (this.hasEnqueued(eventName)) {

            for (const current of this.clearEnqueued(eventName)) {
                this.delegate.dispatchEvent(eventName, current);
            }

        }

        return listener;

    }


    public once(eventName: string): Promise<V> {

        return new Promise<V>((resolve => {

            const listener = (event: V) => {
                resolve(event);
                this.removeEventListener(eventName, listener);
            };

            this.addEventListener(eventName, listener);

        }));

    }

    public dispatchEvent(eventName: string, value: V): void {

        if (this.delegate.hasEventListeners(eventName)) {

            // we already have listeners for this so dispatch it directly
            this.delegate.dispatchEvent(eventName, value);

        } else {

            // no listeners yet so enqueue it until the first listener is ready.
            this.enqueue(eventName, value);

        }

    }

    public getEventListeners(eventName: string) {
        return this.delegate.getEventListeners(eventName);
    }

    public hasEventListeners(eventName: string): boolean {
        return this.delegate.hasEventListeners(eventName);
    }

    public registerEvent(eventName: string): this {
        this.delegate.registerEvent(eventName);
        return this;
    }

    public hasRegisteredEvent(eventName: string): boolean {
        return this.delegate.hasRegisteredEvent(eventName);
    }

    public clearEvent(eventName: string): void {
        this.delegate.clearEvent(eventName);
    }

    public removeEventListener(eventName: string, listener: Listener<V>): boolean {
        return this.delegate.removeEventListener(eventName, listener);
    }

    private enqueue(eventName: string, value: V): this {

        if (! isPresent(this.queue[eventName])) {
            this.queue[eventName] = [];
        }

        this.queue[eventName].push(value);

        return this;

    }

    /**
     * Clear the enqueued queue for this event name and return the data there
     * previously.
     */
    private clearEnqueued(eventName: string): V[] {

        if (isPresent(this.queue[eventName])) {

            const data = this.queue[eventName];
            delete this.queue[eventName];
            return data;

        } else {
            return [];
        }

    }

    private hasEnqueued(eventName: string): boolean {
        return isPresent(this.queue[eventName]) && this.queue[eventName].length > 0;
    }

}
