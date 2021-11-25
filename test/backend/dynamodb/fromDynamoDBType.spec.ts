import { describe, test, expect } from '@jest/globals';
import { fromDynamoDBType, fromDynamoDBObject } from '../../../src/dynamodb';


describe('fromDynamoDBType', () => {
    test('Input undefined', () => {
        const result = fromDynamoDBType(undefined);

        expect(result).toBeUndefined();
    });
    test('Input SMember', () => {
        const result = fromDynamoDBType({ 'S': 'Hello' });

        expect(result).toBe('Hello');
    });
    test('Input NMember', () => {
        const result = fromDynamoDBType({ 'N': '5' });

        expect(result).toBe(5);
    });
    test('Input true BOOLMember', () => {
        const result = fromDynamoDBType({ 'BOOL': true });

        expect(result).toBe(true);
    });
    test('Input false BOOLMember', () => {
        const result = fromDynamoDBType({ 'BOOL': false });

        expect(result).toBe(false);
    });
    test('Input MMember', () => {
        const result = fromDynamoDBType({ 'M': {
            'Hello': { 'S': 'World' },
            'Number': { 'N': '5' }
        } });

        expect(result).toEqual({
            'Hello': 'World',
            'Number': 5
        });
    });
    test('Input LMember', () => {
        const result = fromDynamoDBType({ 'L': [
            { 'S': 'World' },
            { 'S': 'Hello' },
            { 'N': '5' }
        ] });

        expect(result).toEqual(['World', 'Hello', 5]);
    });
    test('Input SSMember', () => {
        const result = fromDynamoDBType({ 'SS': ['World', 'Hello'] });

        expect(result).toEqual(['World', 'Hello']);
    });
    test('Input NSMember', () => {
        const result = fromDynamoDBType({ 'NS': ['5', '10', '-5'] });

        expect(result).toEqual([5, 10, -5]);
    });
    test('Invalid input', () => {
        expect(() => fromDynamoDBType({ 'Foo': ['5', '10', '-5'] } as any)).toThrow();
    });
});

describe('fromDynamoDBObject', () => {
    test('Simple object', () => {
        const result = fromDynamoDBObject({
            Name: { 'S': 'Scrooge' },
            Surname: { 'S': 'McDuck' },
            Age: { 'N': 100 },
            IsRich: { 'BOOL': true },
            Password: { 'NULL': true }
        });

        expect(result).toEqual({
            Name: 'Scrooge',
            Surname: 'McDuck',
            Age: 100,
            IsRich: true,
            Password: null
        });
    });

    test('Complex object', () => {
        const result = fromDynamoDBObject({
            Name: { 'S': 'Scrooge' },
            Surname: { 'S': 'McDuck' },
            Age: { 'N': 100 },
            IsRich: { 'BOOL': true },
            Password: { 'NULL': true },
            Relatives: {
                'L': [{
                    'M': {
                        Name: { 'S': 'Donald' },
                        Surname: { 'S': 'Duck' }
                    }
                }]
            }
        });

        expect(result).toEqual({
            Name: 'Scrooge',
            Surname: 'McDuck',
            Age: 100,
            IsRich: true,
            Password: null,
            Relatives: [
                {
                    Name: 'Donald',
                    Surname: 'Duck'
                }
            ]
        });
    });
});

