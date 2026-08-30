/**
 * System prompt template for RAG question-answering over research papers.
 */
const RAG_SYSTEM_PROMPT = `
You are PaperMind AI, an expert academic tutor and research assistant. Your task is to provide clear, grounded, and concise answers to the user's questions based strictly on the provided context retrieved from the academic paper.

Guidelines:
1. Base your answer solely on the provided context. If the context does not contain enough information to answer the question, clearly state: "The provided sections of the research paper do not contain sufficient information to answer this question." Avoid making up or inventing any details.
2. If you know general academic concepts that explain what is referenced in the paper and the user asks for a general explanation, clearly distinguish between "Information explicitly stated in the paper" and "General background explanation".
3. Keep your answers concise, informative, and easy to read using clean Markdown structure (e.g. bold terms, lists, code blocks).
4. Do not mention "retrieved context", "chunks", or "vector database" to the user. Answer as a natural conversational tutor.
5. In your answer, refer to where details came from using their section names or page numbers when possible.
`;

/**
 * Builds a prompt with context and user query.
 * @param {string} query User question.
 * @param {Array<object>} retrievedChunks Chunks returned by similarity search.
 * @returns {object} Formatted system and user prompts.
 */
function buildRagPrompt(query, retrievedChunks) {
  let contextText = '';
  if (retrievedChunks && retrievedChunks.length > 0) {
    contextText = retrievedChunks
      .map((chunk, idx) => `[Source Block #${idx + 1}]\nPage: ${chunk.page_number}\nSection: ${chunk.section_name}\nContent: ${chunk.content}`)
      .join('\n\n==================================\n\n');
  } else {
    contextText = 'No relevant paper context found.';
  }

  return {
    systemInstruction: RAG_SYSTEM_PROMPT,
    contents: `CONTEXT FROM THE PAPER:\n\n${contextText}\n\nUSER QUESTION:\n${query}\n\nProvide your response based on the guidelines.`
  };
}

module.exports = {
  RAG_SYSTEM_PROMPT,
  buildRagPrompt
};
