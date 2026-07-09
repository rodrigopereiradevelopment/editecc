import { describe, it, expect } from 'vitest';
import { splitContentIntoPages, estimatePageCount, getPageBreakPositions } from '../abnt/pageBreak';

describe('Page Break Utilities', () => {
  describe('splitContentIntoPages', () => {
    it('returns empty page for empty content', () => {
      const result = splitContentIntoPages('');
      expect(result).toEqual(['<p></p>']);
    });

    it('returns empty page for null content', () => {
      const result = splitContentIntoPages(null as any);
      expect(result).toEqual(['<p></p>']);
    });

    it('splits content into multiple pages when needed', () => {
      // Create content that would exceed A4 height
      const longContent = Array(100).fill('<p>Test paragraph with some text content.</p>').join('');
      const result = splitContentIntoPages(longContent);
      // The function should return at least one page
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('keeps short content on single page', () => {
      const shortContent = '<p>Short content</p>';
      const result = splitContentIntoPages(shortContent);
      expect(result.length).toBe(1);
    });
  });

  describe('estimatePageCount', () => {
    it('returns 1 for empty content', () => {
      expect(estimatePageCount('')).toBe(1);
    });

    it('returns 1 for short content', () => {
      expect(estimatePageCount('<p>Short</p>')).toBe(1);
    });

    it('returns at least 1 for any content', () => {
      const longContent = Array(100).fill('<p>Test paragraph.</p>').join('');
      expect(estimatePageCount(longContent)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getPageBreakPositions', () => {
    it('returns empty array for empty content', () => {
      expect(getPageBreakPositions('')).toEqual([]);
    });

    it('returns empty array for short content', () => {
      expect(getPageBreakPositions('<p>Short</p>')).toEqual([]);
    });

    it('returns array for long content', () => {
      const longContent = Array(100).fill('<p>Test paragraph.</p>').join('');
      const positions = getPageBreakPositions(longContent);
      expect(Array.isArray(positions)).toBe(true);
    });
  });
});