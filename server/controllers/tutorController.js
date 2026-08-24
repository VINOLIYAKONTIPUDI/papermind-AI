const { memoryStore } = require('../config/db');

exports.queryTutor = async (req, res) => {
  try {
    const { message, paper_id, mode = 'strict' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const paperChunks = memoryStore.chunks.filter(c => c.paper_id === paper_id);
    const fallbackChunk = paperChunks[0] || { page_number: 1, section_name: 'Abstract', content: 'Self-attention allows the model to process tokens in parallel across all layers.' };

    // Calculate term overlap score
    let bestChunk = fallbackChunk;
    let maxScore = -1;
    const queryTerms = message.toLowerCase().split(/\s+/);

    paperChunks.forEach(chunk => {
      let matchCount = 0;
      const textLower = chunk.content.toLowerCase();
      queryTerms.forEach(term => {
        if (textLower.includes(term)) matchCount++;
      });
      if (matchCount > maxScore) {
        maxScore = matchCount;
        bestChunk = chunk;
      }
    });

    const citations = [
      {
        chunk_id: bestChunk.id || 'chunk-1',
        page_number: bestChunk.page_number || 1,
        section_name: bestChunk.section_name || 'Section 3',
        snippet: bestChunk.content ? bestChunk.content.substring(0, 140) + '...' : 'Key architecture statement...'
      }
    ];

    const answer = `Based on **${bestChunk.section_name} (Page ${bestChunk.page_number})**:\n\n` +
      `To answer your question regarding *"${message}"*:\n\n` +
      `1. **Core Mechanism**: The document explicitly details that "${bestChunk.content.substring(0, 200)}..."\n` +
      `2. **Key Implication**: By replacing recurrence with self-attention, computation is fully parallelized across GPU memory matrix multiplications.\n\n` +
      `*Click the citation badge below to jump directly to Page ${bestChunk.page_number} in the PDF Reader!*`;

    return res.json({
      success: true,
      sender: 'assistant',
      content: answer,
      citations
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
