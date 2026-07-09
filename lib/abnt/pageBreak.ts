// Page break detection utility for Tiptap content
// Splits Tiptap HTML into multiple A4-sized pages

// A4 dimensions in cm
const A4_HEIGHT = 29.7;
const A4_WIDTH = 21.0;

// Margins in cm
const MARGIN_TOP = 3.0;
const MARGIN_BOTTOM = 2.0;
const MARGIN_LEFT = 3.0;
const MARGIN_RIGHT = 2.0;

// Available content area
const CONTENT_HEIGHT = A4_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM; // 24.7cm

// Font and line settings
const FONT_SIZE_PT = 12;
const LINE_HEIGHT = 1.5;

// Convert points to centimeters
function ptToCm(pt: number): number {
  return pt * 0.0352778;
}

// Calculate line height in cm
const LINE_HEIGHT_CM = ptToCm(FONT_SIZE_PT) * LINE_HEIGHT;

// Estimate height of a paragraph (lines * line-height)
function estimateParagraphHeight(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  // Rough estimate: 8-10 words per line in 16cm width
  const wordsPerLine = Math.max(6, Math.min(12, Math.floor((A4_WIDTH - MARGIN_LEFT - MARGIN_RIGHT) / 0.5)));
  const lines = Math.max(1, Math.ceil(words / wordsPerLine));
  return lines * LINE_HEIGHT_CM;
}

// Estimate height of a heading
function estimateHeadingHeight(text: string, level: number): number {
  // Headings have more spacing (CSS: margin 1.5em 0 0.8em = ~2.3em total)
  const baseHeight = estimateParagraphHeight(text);
  const spacingAbove = level === 1 ? 1.5 : level === 2 ? 1.2 : 1.0;
  const spacingBelow = 0.8;
  return baseHeight + spacingAbove + spacingBelow;
}

// Estimate height of a list item
function estimateListItemHeight(text: string): number {
  return estimateParagraphHeight(text) + 0.2; // Add some spacing
}

// Parse HTML into content blocks
function parseHtmlToBlocks(html: string): Array<{html: string; height: number; tag: string}> {
  const blocks: Array<{html: string; height: number; tag: string}> = [];
  
  // Create a temporary DOM element to parse HTML
  const container = document.createElement('div');
  container.innerHTML = html;

  // Process each child element
  const processElement = (element: Element) => {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent || '';
    const innerHtml = element.outerHTML;

    // Skip empty elements
    if (!text.trim() && !['img', 'br', 'hr'].includes(tagName)) return;

    let height: number;

    if (tagName.startsWith('h') && tagName.length === 2) {
      const level = parseInt(tagName.charAt(1));
      height = estimateHeadingHeight(text, level);
    } else if (tagName === 'ul' || tagName === 'ol') {
      // Handle lists - count items
      const items = element.querySelectorAll('li');
      let totalHeight = 0;
      items.forEach(item => {
        totalHeight += estimateListItemHeight(item.textContent || '');
      });
      height = totalHeight;
    } else if (tagName === 'table') {
      // Tables are complex - estimate based on rows
      const rows = element.querySelectorAll('tr');
      height = Math.max(2, rows.length * 1.2); // ~1.2cm per row
    } else if (tagName === 'img' || tagName === 'figure') {
      // Images - estimate 5cm height
      height = 5;
    } else if (tagName === 'blockquote') {
      height = estimateParagraphHeight(text) + 1;
    } else if (tagName === 'pre' || tagName === 'code') {
      height = Math.max(3, text.split('\n').length * LINE_HEIGHT_CM);
    } else {
      // Default: paragraph
      height = estimateParagraphHeight(text);
    }

    blocks.push({
      html: innerHtml,
      height,
      tag: tagName,
    });
  };

  // Process all direct children
  Array.from(container.children).forEach(processElement);

  return blocks;
}

// Split blocks into pages based on height
function splitBlocksIntoPages(blocks: Array<{html: string; height: number; tag: string}>): string[] {
  const pages: string[] = [];
  let currentPageHtml: string[] = [];
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const nextBlock = blocks[i + 1];
    const isHeading = block.tag.startsWith('h');
    
    // Check if adding this block would exceed page height
    if (currentHeight + block.height > CONTENT_HEIGHT && currentPageHtml.length > 0) {
      // If this is a heading, check if next block exists
      // If yes, don't split heading from its content - keep heading here
      // The next block will start fresh on new page
      if (isHeading && nextBlock) {
        // End current page, heading stays here
        pages.push(currentPageHtml.join('\n'));
        currentPageHtml = [block.html];
        currentHeight = block.height;
      } else {
        // Normal split - create new page
        pages.push(currentPageHtml.join('\n'));
        currentPageHtml = [block.html];
        currentHeight = block.height;
      }
    } else {
      currentPageHtml.push(block.html);
      currentHeight += block.height;
    }
  }

  // Add the last page if it has content
  if (currentPageHtml.length > 0) {
    pages.push(currentPageHtml.join('\n'));
  }

  return pages;
}

// Main function to split Tiptap HTML into pages
export function splitContentIntoPages(html: string): string[] {
  if (!html || !html.trim()) {
    return ['<p></p>']; // Return empty page if no content
  }

  const blocks = parseHtmlToBlocks(html);
  const pages = splitBlocksIntoPages(blocks);

  // Return HTML strings for each page
  return pages.length > 0 ? pages : [html]; // Fallback to original if parsing fails
}

// Estimate total number of pages
export function estimatePageCount(html: string): number {
  if (!html || !html.trim()) {
    return 1;
  }

  const blocks = parseHtmlToBlocks(html);
  const pages = splitBlocksIntoPages(blocks);
  return pages.length;
}

// Get page break positions (for showing break indicators)
export function getPageBreakPositions(html: string): number[] {
  if (!html || !html.trim()) {
    return [];
  }

  const blocks = parseHtmlToBlocks(html);
  const positions: number[] = [];
  let currentHeight = 0;
  let blockIndex = 0;

  for (const block of blocks) {
    if (currentHeight + block.height > CONTENT_HEIGHT && blockIndex > 0) {
      positions.push(blockIndex);
      currentHeight = block.height;
    } else {
      currentHeight += block.height;
    }
    blockIndex++;
  }

  return positions;
}