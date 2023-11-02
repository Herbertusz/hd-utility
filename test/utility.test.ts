/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest';
import {
    switching, condition, forLoop, delay, promiseSequence, tryRequest, flagToBool, macrotask, toggleArray, sortDescriptor,
    objectToIndexedArray,
    arrayToMap,
    ArrayOfObjects,
    SVG
} from '../src/utility';

describe('utility', () => {
    it('switching', () => {
        const control = (key) => switching(key, {
            'W': 'accelerate',
            'A': 'turnLeft',
            'S': 'brake',
            'D': 'turnRight'
        }, null);
        expect(control('A')).toEqual('turnLeft');
        expect(control('X')).toEqual(null);
        expect(control('')).toEqual(null);
        expect(control(null)).toEqual(null);
        expect(control(undefined)).toEqual(null);
        const value = (key) => switching(key, {
            true: 'yes',
            false: 'no'
        }, '?');
        expect(value(true)).toEqual('yes');
        expect(value(false)).toEqual('no');
        expect(value(null)).toEqual('?');
        expect(value(undefined)).toEqual('?');
    });

    it('condition', () => {
        const variable = (a, b) => condition([
            [a < b, 1],
            [a > b, -1],
            [a === b, 0]
        ]);
        expect(variable(1, 3)).toEqual(1);
        expect(variable(2, 1)).toEqual(-1);
        expect(variable(2, 2)).toEqual(0);
        expect(condition([[false, 1], [true, 2], [false, 3], [true, 4]])).toEqual(2);
        expect(condition([[true, 1], [true, 2], [false, 3], [true, 4]])).toEqual(1);
        expect(condition([[false, 1], [false, 2], [false, 3], [true, 4]])).toEqual(4);
        expect(condition([[false, 1], [true, 2], [true, 3], [true, 4]])).toEqual(2);
    });

    it('forLoop', () => {
        const fill1: number[] = [];
        const fill2: number[] = [];
        const fill3: number[] = [];
        forLoop(3, (index) => fill1.push(index));
        forLoop(1, (index) => fill2.push(index));
        forLoop(0, (index) => fill3.push(index));
        expect(fill1).toEqual([0, 1, 2]);
        expect(fill2).toEqual([0]);
        expect(fill3).toEqual([]);
    });
    
    it('delay', () => {
        expect(delay(1000, 1)).resolves.toBeDefined();
        expect(delay(1500, 1)).resolves.toBeDefined();
    });

    it.skip('promiseSequence', () => {
        const runPromise = () => promiseSequence([
            () => delay(1000, 1).then(() => 1),
            (value) => delay(2000, value).then((val) => val + 1),
            (value) => delay(1000, value).then((val) => val + 1)
        ]).then(
            (value) => value
        ).catch(
            (error) => error
        );
        expect(runPromise()).resolves.toEqual(3);
    });

    it('tryRequest', () => {
        const runPromise = (url) => tryRequest({
            times: 3,
            url
        }).then(
            (value) => Promise.resolve(value)
        ).catch(
            (error) => Promise.reject(error)
        );
        expect(runPromise('http://example.com')).resolves.toBeInstanceOf(Response);
        expect(runPromise('http://doesntexist12345.com')).rejects.toBeInstanceOf(Error);
    });

    it('macrotask', async () => {
        const callbacks = {
            first: () => 1
        };
        const spy = vi.spyOn(callbacks, 'first');
        expect(await macrotask(callbacks.first)).toEqual(1);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveReturnedWith(1);
    });

    it('flagToBool', () => {
        expect(flagToBool()).toEqual(false);
        expect(flagToBool(undefined)).toEqual(false);
        expect(flagToBool(null)).toEqual(false);
        expect(flagToBool(0)).toEqual(false);
        expect(flagToBool(1)).toEqual(true);
    });

    it('toggleArray', () => {
        expect(toggleArray([1, 2, 3], 2)).toEqual([1, 3]);
        expect(toggleArray([1, 2, 3], 7)).toEqual([1, 2, 3, 7]);
        expect(toggleArray([{ a: 1 }, { a: 2 }], { a: 2 })).toEqual([{ a: 1 }]);
        expect(toggleArray([{ a: 1 }, { a: 2 }], { a: 3 })).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
    });

    it('sortDescriptor', () => {
        const asc = [2, 7, 1, 8, 3].sort(
            (a, b) => sortDescriptor(a, b, 'asc')
        );
        const desc = [2, 7, 1, 8, 3].sort(
            (a, b) => sortDescriptor(a, b, 'desc')
        );
        expect(asc).toEqual([1, 2, 3, 7, 8]);
        expect(desc).toEqual([8, 7, 3, 2, 1]);
    });

    it('objectToIndexedArray', () => {
        expect(objectToIndexedArray({ })).toEqual([]);
        expect(objectToIndexedArray(
            { '1': { name: 'XY' }, '3': { name: 'YX' } }
        )).toEqual(
            [{ index: 1, name: 'XY' }, { index: 3, name: 'YX' }]
        );
    });

    it('arrayToMap', () => {
        expect(arrayToMap([])).toEqual(new Map());
        expect(arrayToMap(['a', 'b'])).toEqual(new Map([[0, 'a'], [1, 'b']]));
    });

    describe('ArrayOfObjects', () => {

        const source0 = [];
        const source1 = [
            { id: 1, name: 'a', age: 20 },
            { id: 2, name: 'b', age: 21 },
            { id: 3, name: 'c', age: 22 },
            { id: 4, name: 'b', age: 23 },
        ];
        const source2 = [
            { num: 1, name: 'a', age: 20 },
            { num: 2, name: 'b', age: 21 },
            { num: 3, name: 'c', age: 22 },
            { num: 4, name: 'b', age: 23 },
        ];

        it('expand', () => {
            expect(ArrayOfObjects.expand({
                from: [2, 4],
                source: source0,
                plusProp: 'name'
            })).toEqual([
                { id: 2, name: null },
                { id: 4, name: null },
            ]);
            expect(ArrayOfObjects.expand({
                from: [2, 4],
                source: source1,
                plusProp: 'name'
            })).toEqual([
                { id: 2, name: 'b' },
                { id: 4, name: 'b' },
            ]);
            expect(ArrayOfObjects.expand({
                from: [2, 4],
                source: source2,
                plusProp: 'name',
                plusPropName: 'nickName',
                identityProp: 'num'
            })).toEqual([
                { num: 2, nickName: 'b' },
                { num: 4, nickName: 'b' },
            ]);
        });

        it('tight', () => {
            expect(ArrayOfObjects.tight(source0, ['id', 'age'])).toEqual([]);
            expect(ArrayOfObjects.tight(source1, ['id', 'age'])).toEqual([
                { id: 1, age: 20 },
                { id: 2, age: 21 },
                { id: 3, age: 22 },
                { id: 4, age: 23 },
            ]);
            expect(ArrayOfObjects.tight(source2, ['num'])).toEqual([
                { num: 1 },
                { num: 2 },
                { num: 3 },
                { num: 4 },
            ]);
        });

        it('take', () => {
            expect(ArrayOfObjects.take(source0, 'age')).toEqual([]);
            expect(ArrayOfObjects.take(source1, 'age')).toEqual([20, 21, 22, 23]);
        });
        
        it('takeOne', () => {
            expect(ArrayOfObjects.takeOne(source0)).toEqual([]);
            expect(ArrayOfObjects.takeOne([
                { prop: 'a' },
                { prop: 'b' },
                { prop: 'c' },
            ])).toEqual(['a', 'b', 'c']);
        });
        
        it('reverseTakeOne', () => {
            expect(ArrayOfObjects.reverseTakeOne([], 'prop')).toEqual([]);
            expect(ArrayOfObjects.reverseTakeOne(['a', 'b', 'c'], 'prop')).toEqual([
                { prop: 'a' },
                { prop: 'b' },
                { prop: 'c' },
            ]);
        });
        
        it('unique', () => {
            expect(ArrayOfObjects.unique(source0, 'name')).toEqual([]);
            expect(ArrayOfObjects.unique(source1, 'name')).toEqual([
                { id: 1, name: 'a', age: 20 },
                { id: 4, name: 'b', age: 23 },
                { id: 3, name: 'c', age: 22 },
            ]);
            expect(ArrayOfObjects.unique([
                { id: 1, name: 'a' },
                { id: 2, name: 'a' },
                { id: 3, name: 'a' },
            ], 'name')).toEqual([
                { id: 3, name: 'a' }
            ]);
        });

    });

    describe('SVG', () => {

        it('codeToElement', () => {
            expect(SVG.codeToElement('<svg></svg>')).toBeInstanceOf(SVGSVGElement);
        });

        it('elementToBase64', () => {
            expect(SVG.elementToBase64(SVG.codeToElement('<svg></svg>'))).toEqual(`
                data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=
            `.trim());
        });
        
        it('elementToDataUrl', () => {
            expect(SVG.elementToDataUrl(SVG.codeToElement('<svg></svg>'))).toEqual(`
                data:image/svg+xml;utf8,%3Csvg%3E%3C%2Fsvg%3E
            `.trim());
        });
        
        it.skip('dataUrlToPng', async () => {
            expect(SVG.dataUrlToPng('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', 10)).resolves.toEqual(`
                data:image/png;base64,
            `.trim());
        });

    });

});
