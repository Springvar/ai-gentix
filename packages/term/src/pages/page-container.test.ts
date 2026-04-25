import { createPageContainer, PageContainer } from '../pages/page-container';

describe('PageContainer module', () => {
    it('should export createPageContainer function', () => {
        expect(typeof createPageContainer).toBe('function');
    });

    it('should export PageContainer class', () => {
        expect(typeof PageContainer).toBe('function');
    });
});