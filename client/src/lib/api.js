const API_BASE = 'http://localhost:5000/api/v1';

export async function fetchPapers() {
  try {
    const res = await fetch(`${API_BASE}/papers`);
    const data = await res.json();
    return data.success ? data.papers : [];
  } catch (err) {
    console.warn('API server unreachable, using offline papers fallback', err);
    return null;
  }
}

export async function fetchPaperById(id) {
  try {
    const res = await fetch(`${API_BASE}/papers/${id}`);
    const data = await res.json();
    return data.success ? data : null;
  } catch (err) {
    console.warn('API error fetching paper by ID', err);
    return null;
  }
}

export async function uploadPaperFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${API_BASE}/papers/upload`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  } catch (err) {
    console.error('Paper upload error:', err);
    return { success: false, error: err.message };
  }
}

export async function askTutor(message, paperId, mode = 'strict') {
  try {
    const res = await fetch(`${API_BASE}/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, paper_id: paperId, mode })
    });
    return await res.json();
  } catch (err) {
    console.error('Tutor chat API error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchMindMap(paperId) {
  try {
    const res = await fetch(`${API_BASE}/papers/${paperId}/mindmap`);
    const data = await res.json();
    return data.success ? data.mindmap : null;
  } catch (err) {
    console.error('MindMap API error:', err);
    return null;
  }
}

export async function fetchKnowledgeGraph() {
  try {
    const res = await fetch(`${API_BASE}/graph`);
    const data = await res.json();
    return data.success ? data.graph : null;
  } catch (err) {
    console.error('KnowledgeGraph API error:', err);
    return null;
  }
}

export async function fetchPeerReview(paperId) {
  try {
    const res = await fetch(`${API_BASE}/papers/${paperId}/reviewer`);
    const data = await res.json();
    return data.success ? data.review : null;
  } catch (err) {
    console.error('Peer Review API error:', err);
    return null;
  }
}

export async function fetchComparison(paper1Id, paper2Id) {
  try {
    const res = await fetch(`${API_BASE}/papers/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paper1_id: paper1Id, paper2_id: paper2Id })
    });
    const data = await res.json();
    return data.success ? data.comparison : null;
  } catch (err) {
    console.error('Compare API error:', err);
    return null;
  }
}

export async function fetchQuiz(paperId) {
  try {
    const res = await fetch(`${API_BASE}/quizzes/${paperId}`);
    const data = await res.json();
    return data.success ? data.quiz : null;
  } catch (err) {
    console.error('Quiz API error:', err);
    return null;
  }
}

export async function submitQuizAnswers(answers) {
  try {
    const res = await fetch(`${API_BASE}/quizzes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    return await res.json();
  } catch (err) {
    console.error('Submit Quiz API error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchFlashcards() {
  try {
    const res = await fetch(`${API_BASE}/flashcards`);
    const data = await res.json();
    return data.success ? data.flashcards : null;
  } catch (err) {
    console.error('Flashcards API error:', err);
    return null;
  }
}

export async function reviewFlashcardItem(id, rating) {
  try {
    const res = await fetch(`${API_BASE}/flashcards/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    });
    return await res.json();
  } catch (err) {
    console.error('Review Flashcard API error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    const data = await res.json();
    return data.success ? data.analytics : null;
  } catch (err) {
    console.error('Analytics API error:', err);
    return null;
  }
}
