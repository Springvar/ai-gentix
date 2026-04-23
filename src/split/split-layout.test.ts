import { createSplitLayout, SplitLayoutImpl } from '../split/split-layout';

describe('SplitLayout module', () => {
    it('should export createSplitLayout function', () => {
        expect(typeof createSplitLayout).toBe('function');
    });

    it('should export SplitLayoutImpl class', () => {
        expect(typeof SplitLayoutImpl).toBe('function');
    });
});