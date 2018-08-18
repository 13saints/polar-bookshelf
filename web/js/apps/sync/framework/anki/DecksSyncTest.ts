import {DecksSync} from './DecksSync';
import {DeckDescriptor} from './DeckDescriptor';
import {assertJSON} from '../../../../test/Assertions';
import {DeckNamesAndIdsClient} from './clients/DeckNamesAndIdsClient';
import {CreateDeckClient} from './clients/CreateDeckClient';
import {Abortable} from '../Abortable';
import {SyncProgressListener} from '../SyncProgressListener';
import {SyncProgress} from '../SyncProgress';
import {SyncQueue} from '../SyncQueue';


describe('DecksSync', function() {

    let deckSync = new DecksSync();

    deckSync.createDeckClient = CreateDeckClient.createMock(1);
    deckSync.deckNamesAndIdsClient = DeckNamesAndIdsClient.createMock({});

    let abortable: Abortable;

    let syncProgress: SyncProgress | undefined;

    let syncProgressListener: SyncProgressListener = _syncProgress => {
        console.log(_syncProgress);
        syncProgress = _syncProgress;
    };

    let syncQueue: SyncQueue;

    beforeEach(function () {

        abortable = {
            aborted: false
        };

        syncQueue = new SyncQueue(abortable, syncProgressListener);

    });

    it("basic sync", async function () {

        let deckDescriptors: DeckDescriptor[] = [
            {
                name: "Test Deck"
            }
        ];

        let createdDescriptors = deckSync.enqueue(syncQueue, deckDescriptors);

        await syncQueue.execute();

        assertJSON(createdDescriptors, [
            {
                "name": "Test Deck"
            }
        ]);

        assertJSON(syncProgress, {
            "percentage": 100,
            "state": "STARTED"
        });

    });

});
