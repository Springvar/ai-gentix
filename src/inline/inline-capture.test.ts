import { createInlineCapture, InlineCapture } from '../inline/inline-capture';

describe('InlineCapture module', () => {
    it('should export createInlineCapture function', () => {
        expect(typeof createInlineCapture).toBe('function');
    });

    it('should export InlineCapture class', () => {
        expect(typeof InlineCapture).toBe('function');
    });
});