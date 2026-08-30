const config = require('../../config/config');

/**
 * Splits text into chunks of maximum size with overlap.
 * @param {string} text The text to split.
 * @param {number} size Max chunk size.
 * @param {number} overlap Overlap between chunks.
 * @returns {Array<string>} List of text chunks.
 */
function splitText(text, size, overlap) {
  if (!text) return [];
  // Clean text from excessive whitespace and newlines
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  if (cleanedText.length <= size) {
    return [cleanedText];
  }

  const chunks = [];
  let start = 0;
  while (start < cleanedText.length) {
    let end = start + size;
    // Try to adjust end to a space boundary to prevent splitting words
    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(' ', end);
      if (lastSpace > start + (size / 2)) {
        end = lastSpace;
      }
    }
    const chunk = cleanedText.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Shift start position by size minus overlap
    start = end - overlap;
    
    // Avoid infinite loops or overlap issues
    if (start >= cleanedText.length || overlap >= size || (end - start) <= 0) {
      break;
    }
  }
  return chunks;
}

/**
 * Chunks parsed document page data.
 * @param {Array<{page: number, text: string}>} pageData List of pages and text.
 * @param {object} options Override config options.
 * @returns {Array<object>} List of structured chunk objects.
 */
function chunkDocument(pageData, options = {}) {
  const size = options.chunkSize || config.chunkSize;
  const overlap = options.chunkOverlap || config.chunkOverlap;

  const allChunks = [];
  let globalChunkIndex = 0;

  for (const pageItem of pageData) {
    const pageNum = pageItem.page;
    const text = pageItem.text;

    // Skip empty pages
    if (!text || text.trim().length === 0) continue;

    const textChunks = splitText(text, size, overlap);
    textChunks.forEach((chunkContent, idx) => {
      // Estimate section name based on keyword matching
      let sectionName = 'General';
      const contentLower = chunkContent.toLowerCase();
      
      if (contentLower.includes('abstract')) {
        sectionName = 'Abstract';
      } else if (contentLower.includes('introduction')) {
        sectionName = 'Introduction';
      } else if (contentLower.includes('method') || contentLower.includes('architecture') || contentLower.includes('proposed model')) {
        sectionName = 'Methodology / Architecture';
      } else if (contentLower.includes('result') || contentLower.includes('evaluation') || contentLower.includes('experiment')) {
        sectionName = 'Results / Evaluation';
      } else if (contentLower.includes('conclusion') || contentLower.includes('future work') || contentLower.includes('discussion')) {
        sectionName = 'Discussion / Conclusion';
      } else if (contentLower.includes('reference') || contentLower.includes('bibliography')) {
        sectionName = 'References';
      }

      allChunks.push({
        page_number: pageNum,
        chunk_index: globalChunkIndex++,
        section_name: sectionName,
        content: chunkContent,
        bbox: { x: 50, y: 100 + (idx % 4) * 120, w: 500, h: 100 }
      });
    });
  }

  return allChunks;
}

module.exports = {
  splitText,
  chunkDocument
};
