import Record from '../../screens/Record';

describe('Record', () => {
    it('can import Record component', () => {
        // Since Record.tsx is empty, we just test that it can be imported
        expect(Record).toBeDefined();
    });

    it('Record is an object (empty export)', () => {
        // Empty file exports an empty object
        expect(typeof Record).toBe('object');
    });
});
