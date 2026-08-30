const { QdrantClient } = require('@qdrant/js-client-rest');
const config = require('../../config/config');
const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const embeddingService = require('../embeddings/embeddingService');

const COLLECTION_NAME = 'paper_chunks';

let qdrantClient = null;
let isQdrantHealthy = false;

try {
  qdrantClient = new QdrantClient({ url: config.qdrantUrl, checkCompatibility: false });
  checkHealth();
} catch (err) {
  console.error('Failed to initialize QdrantClient:', err.message);
}

/**
 * Verifies connection status with Qdrant.
 */
async function checkHealth() {
  if (!qdrantClient) return false;
  try {
    await qdrantClient.getCollections();
    isQdrantHealthy = true;
    return true;
  } catch (err) {
    isQdrantHealthy = false;
    return false;
  }
}

/**
 * Helper to perform Qdrant collection creation logic.
 */
async function createCollectionInternal(dimension) {
  console.log(`Creating Qdrant collection: "${COLLECTION_NAME}" with dimension ${dimension}...`);
  await qdrantClient.createCollection(COLLECTION_NAME, {
    vectors: {
      size: dimension,
      distance: 'Cosine'
    }
  });
  console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
}

/**
 * Initializes the target collection in Qdrant if it doesn't already exist.
 * Recreates collection if vector dimensions mismatch configured dimensions.
 */
async function initializeCollection() {
  if (!qdrantClient) return false;
  try {
    const collectionsResponse = await qdrantClient.getCollections();
    const collectionExists = collectionsResponse.collections.some(
      c => c.name === COLLECTION_NAME
    );

    const dimension = await embeddingService.getEmbeddingDimension();

    if (collectionExists) {
      const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
      const currentSize = collectionInfo.config?.params?.vectors?.size;
      if (currentSize !== dimension) {
        console.warn(`Qdrant collection dimension mismatch: expected ${dimension}, found ${currentSize}. Recreating collection...`);
        await qdrantClient.deleteCollection(COLLECTION_NAME);
        await createCollectionInternal(dimension);
      }
    } else {
      await createCollectionInternal(dimension);
    }
    return true;
  } catch (err) {
    console.warn(`Could not initialize Qdrant collection: ${err.message}.`);
    isQdrantHealthy = false;
    return false;
  }
}

/**
 * Generates a valid UUID v4 format deterministically or randomly.
 * Qdrant points require string IDs in UUID format or integers.
 */
function getValidUuid(idString) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idString)) {
    return idString;
  }
  // DNS Namespace UUID as root
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  try {
    return uuidv5(idString, NAMESPACE);
  } catch {
    return uuidv4();
  }
}

/**
 * Upserts a set of document chunks and their corresponding embeddings into Qdrant.
 */
async function upsertChunks(paperId, chunks, embeddings) {
  const hasQdrant = await checkHealth();
  if (!hasQdrant || !qdrantClient) {
    console.warn('Qdrant is offline. Chunks will only reside in local database/memoryStore.');
    return false;
  }

  try {
    await initializeCollection();

    const points = chunks.map((chunk, idx) => {
      const pointId = getValidUuid(chunk.id || `chunk-${paperId}-${idx}`);
      return {
        id: pointId,
        vector: embeddings[idx],
        payload: {
          paper_id: paperId,
          chunk_id: chunk.id || `chunk-${paperId}-${idx}`,
          page_number: chunk.page_number,
          section_name: chunk.section_name || 'General',
          content: chunk.content
        }
      };
    });

    // Qdrant upsert points
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points
    });

    console.log(`Successfully upserted ${points.length} vectors into Qdrant collection "${COLLECTION_NAME}".`);
    return true;
  } catch (err) {
    console.error(`Qdrant upsert failed: ${err.message}`);
    return false;
  }
}

/**
 * Searches Qdrant for segments similar to queryEmbedding, with option to filter by paperId.
 */
async function searchSimilar(queryEmbedding, topK = 5, paperId = null) {
  const hasQdrant = await checkHealth();
  if (!hasQdrant || !qdrantClient) {
    console.warn('Qdrant is offline. Semantic retrieval will fall back to keyword search.');
    return null;
  }

  try {
    await initializeCollection();

    const searchParams = {
      vector: queryEmbedding,
      limit: topK,
      with_payload: true
    };

    if (paperId) {
      searchParams.filter = {
        must: [
          {
            key: 'paper_id',
            match: {
              value: paperId
            }
          }
        ]
      };
    }

    const url = `${config.qdrantUrl}/collections/${COLLECTION_NAME}/points/search`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Qdrant search HTTP status ${response.status}: ${errText}`);
    }

    const searchJson = await response.json();
    const searchResult = searchJson.result || [];
    
    return searchResult.map(item => ({
      chunk_id: item.payload.chunk_id,
      paper_id: item.payload.paper_id,
      page_number: item.payload.page_number,
      section_name: item.payload.section_name,
      content: item.payload.content,
      relevance_score: item.score
    }));
  } catch (err) {
    console.error(`Qdrant similarity search failed: ${err.message}`);
    return null;
  }
}

module.exports = {
  checkHealth,
  initializeCollection,
  upsertChunks,
  searchSimilar,
  COLLECTION_NAME
};
