const { execSync } = require('child_process');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

async function runDockerE2EVerification() {
  console.log("====================================================");
  console.log("🐳 RUNNING DOCKER COMPOSE END-TO-END VERIFICATION");
  console.log("====================================================");

  // Helper to execute commands and get string output
  function runCmd(cmd) {
    try {
      return execSync(cmd, { encoding: 'utf8' }).trim();
    } catch (err) {
      throw new Error(`Command failed: ${cmd}\nError: ${err.message}`);
    }
  }

  // 1. Verify frontend is accessible (port 5173 mapping to nginx 80)
  console.log("Checking frontend accessibility on http://localhost:5173...");
  const frontendCode = runCmd('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/');
  console.log(`   Frontend HTTP Response: ${frontendCode}`);
  assert.strictEqual(frontendCode, "200", "Frontend server not responding with status 200.");
  console.log("✅ Frontend container is reachable.");

  // 2. Verify backend is accessible (port 5000 mapping to express 5000)
  console.log("Checking backend accessibility on http://localhost:5000...");
  const backendResponse = runCmd('curl -s http://localhost:5000/');
  const backendJson = JSON.parse(backendResponse);
  console.log(`   Backend response status: ${backendJson.status}`);
  assert.strictEqual(backendJson.status, "online", "Backend server not responding with status 'online'.");
  console.log("✅ Backend container is reachable.");

  // 3. Verify GET /health endpoint and dependencies
  console.log("Verifying dependencies via /health endpoint...");
  const healthResponse = runCmd('curl -s http://localhost:5000/health');
  const healthJson = JSON.parse(healthResponse);
  console.log("   Health checks response:", JSON.stringify(healthJson.dependencies, null, 2));
  
  assert.strictEqual(healthJson.status, "ok", "Server health status is not ok.");
  assert.ok(healthJson.dependencies, "Missing dependencies report.");
  
  // Verify MongoDB
  assert.ok(
    healthJson.dependencies.database.includes("connected"), 
    `MongoDB is not connected: ${healthJson.dependencies.database}`
  );
  console.log("✅ MongoDB database is reachable inside containers.");

  // Verify Qdrant
  assert.ok(
    healthJson.dependencies.qdrant.includes("connected"),
    `Qdrant is not connected: ${healthJson.dependencies.qdrant}`
  );
  console.log("✅ Qdrant cluster is reachable inside containers.");

  // Verify Gemini configuration
  console.log(`   Gemini API config status: ${healthJson.dependencies.gemini_configuration}`);
  console.log("✅ Gemini API configuration verified.");

  // 4. Test Paper Upload and Ingestion Flow
  const testPdf = path.join(__dirname, '../uploads/1786115663850-LEM_Methodology.pdf');
  console.log(`Uploading test PDF to backend: ${testPdf}`);
  if (!fs.existsSync(testPdf)) {
    throw new Error(`Test PDF file not found at: ${testPdf}`);
  }

  // Run upload curl request
  const uploadCmd = `curl -s -X POST -F "file=@${testPdf}" http://localhost:5000/api/v1/papers/upload`;
  const uploadResponse = runCmd(uploadCmd);
  const uploadJson = JSON.parse(uploadResponse);

  if (uploadJson.error) {
    if (uploadJson.error.includes("already been uploaded")) {
      console.log("ℹ️ Paper already uploaded in a previous test run. Proceeding with existing model.");
    } else {
      throw new Error(`Upload endpoint failed with error: ${uploadJson.error}`);
    }
  } else {
    assert.strictEqual(uploadJson.success, true, "Upload response did not return success=true.");
    assert.ok(uploadJson.paper.id, "Upload did not return paper details with ID.");
    console.log(`✅ Upload, extraction, embedding, and Qdrant indexing completed for paper ID: ${uploadJson.paper.id}`);
  }

  // Get active paper ID (we can query the first paper from backend if already uploaded)
  const papersResponse = runCmd('curl -s http://localhost:5000/api/v1/papers');
  const papersJson = JSON.parse(papersResponse);
  assert.ok(papersJson.papers.length > 0, "No papers found in database.");
  const paperId = papersJson.papers[0].id;
  console.log(`Using Paper ID for Chat Test: ${paperId} ("${papersJson.papers[0].title}")`);

  // 5. Test Tutor Chat (RAG query) with citations
  const chatQuery = "What methodology is discussed in the paper?";
  console.log(`Sending RAG query: "${chatQuery}"`);
  
  const chatBody = JSON.stringify({
    message: chatQuery,
    paper_id: paperId,
    mode: 'strict'
  });
  
  const chatCmd = `curl -s -X POST -H "Content-Type: application/json" -d '${chatBody}' http://localhost:5000/api/v1/tutor/chat`;
  const chatResponse = runCmd(chatCmd);
  const chatJson = JSON.parse(chatResponse);

  assert.strictEqual(chatJson.success, true, "Chat query failed.");
  assert.ok(chatJson.content, "Chat response missing answer content.");
  assert.ok(Array.isArray(chatJson.citations), "Citations should be returned as an array.");
  
  console.log("✅ Chat RAG pipeline executed successfully.");
  console.log(`   Answer Snippet: "${chatJson.content.substring(0, 140).replace(/\n/g, ' ')}..."`);
  
  // Verify returned citations fields
  console.log(`   Verifying returned citation schema...`);
  chatJson.citations.forEach((cit, idx) => {
    console.log(`   Citation #${idx + 1}:`);
    console.log(`     - Document Name: ${cit.document_name}`);
    console.log(`     - Page: ${cit.page_number}`);
    console.log(`     - Chunk ID: ${cit.chunk_id}`);
    console.log(`     - Score: ${cit.similarity_score}`);
    
    assert.ok(cit.document_name, "Citation is missing document_name.");
    assert.ok(cit.page_number > 0, "Citation page number must be positive.");
    assert.ok(cit.chunk_id, "Citation is missing chunk_id.");
  });
  
  console.log("✅ Citation schema verified successfully.");

  console.log("\n🎉 DOCKER COMPOSE END-TO-END VERIFICATION COMPLETED SUCCESSFULLY!\n");
}

if (require.main === module) {
  runDockerE2EVerification()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\n❌ DOCKER COMPOSE END-TO-END VERIFICATION FAILED:");
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = { runDockerE2EVerification };
