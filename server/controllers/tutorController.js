const ragPipeline = require('../rag/pipeline/ragPipeline');

exports.queryTutor = async (req, res) => {
  try {
    const { message, paper_id, mode = 'strict' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Delegate to the RAG pipeline coordinator
    const response = await ragPipeline.queryPaper(message, paper_id, mode);

    return res.json({
      success: true,
      sender: 'assistant',
      content: response.content,
      citations: response.citations
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

