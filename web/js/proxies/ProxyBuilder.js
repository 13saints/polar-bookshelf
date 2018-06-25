/**
 * Build a listener
 */
const {TraceHandler} = require("./TraceHandler");
const {MutationHandler} = require("./MutationHandler");
const {ObjectPaths} = require("./ObjectPaths");
const {TraceListeners} = require("./TraceListeners");

/**
 * A sequence identifier generator so that we can assign objects a unique value.
 */
var sequence = 0;

class ProxyBuilder {

    constructor(target) {
        this.target = target;
    }


    /**
     * Listen to the stream of mutations and receive callbacks which you can handle directly.
     *
     * @Deprecated we are migrating to trace for everything.
     * @param onMutation
     *
     */
    forMutations(mutationListener) {
        return new Proxy(this.target, new MutationHandler(mutationListener));
    }

    static trace(path, value, traceListeners) {

        if(typeof value !== "object") {
            throw new Error("We can only trace object types.");
        }

        traceListeners = TraceListeners.asArray(traceListeners);

        if(Object.isFrozen(value)) {
            // Do not handle frozen objects but might have to in the future for
            // the initial value.
            return value;
        }

        let traceHandler = new TraceHandler(path, traceListeners, value);

        if(!value.__traceIdentifier) {

            // the __traceIdentifier is a unique key for the object which we use
            // to identify which one is being traced.  This way we essentially
            // have a pointer we can use to work with the object directly.

            Object.defineProperty(value, "__traceIdentifier", {
                value: sequence++,
                enumerable: false,
                writable: false
            });

        }

        if(!value.__traceListeners) {

            // keep the traceListener registers with the object so that I can
            // verify that the object we're working with is actually being used
            // with the same trace and not being re-traced by something else.

            Object.defineProperty(value, "__traceListeners", {
                value: traceListeners,
                enumerable: false,
                writable: false
            });

        }

        if(value.addTraceListener) {
            value.addTraceListener(traceListeners);
        } else {
            Object.defineProperty(value, "addTraceListener", {
                value: traceHandler.addTraceListener.bind(traceHandler),
                enumerable: false,
                writable: false
            });
        }

        return new Proxy(value, traceHandler);

    }

    /**
     * Deeply trace the given object and call back on the traceListener every time
     * we notice a mutation.  The trace listener receives the following arguments:
     *
     *
     */
    deepTrace(traceListeners, pathPrefix) {

        if (!traceListeners) {
            traceListeners = [];
        }

        if (!pathPrefix) {
            pathPrefix = "";
        }

        traceListeners = TraceListeners.asArray(traceListeners);

        let objectPathEntries = ObjectPaths.recurse(this.target);

        let root = null;

        objectPathEntries.forEach(function (objectPathEntry) {

            let proxy = ProxyBuilder.trace(pathPrefix + objectPathEntry.path, objectPathEntry.value, traceListeners);

            // replace the object key in the parent with a new object that is
            // traced.
            if(objectPathEntry.parent != null) {
                objectPathEntry.parent[objectPathEntry.parentKey] = proxy;
            } else {
                root = proxy;
            }

        });

        return root;

    }


}

module.exports.ProxyBuilder = ProxyBuilder;
