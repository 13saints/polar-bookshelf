import {assert} from 'chai';
import {FilePaths} from './FilePaths';

describe('FilePaths', function() {

    describe('toWindowsPath', () => {

        it("basic", async function () {

            assert.equal(FilePaths.toWindowsPath('/tmp/test/hello.txt'), 'C:\\tmp\\test\\hello.txt');

        });

    });

    describe('textToWindowsPath', () => {

        it("basic", async function () {

            assert.equal(FilePaths.textToWindowsPath('some text /tmp/test/hello.txt then this'), 'some text C:\\tmp\\test\\hello.txt then this');

        });

        it("real world", async function () {

            let text = '     at Function.getCaller (/home/burton/projects/polar-bookshelf/web/js/test/MyTest.jsx:5:17)';
            let expected = '     at Function.getCaller (C:\\home\\burton\\projects\\polar-bookshelf\\web\\js\\test\\MyTest.jsx:5:17)';

            assert.equal(FilePaths.textToWindowsPath(text), expected);

        });

    });


});

