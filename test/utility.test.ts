import { describe, expect, it } from 'vitest';
import { switching, condition, forLoop, delay } from '../src/utility';

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
    
    it('delay', async () => {
        const val1 = await delay(1000, 1);
        const val2 = await delay(1500, 2);
        expect(val1).toEqual(1);
        expect(val2).toEqual(2);
    });
});
