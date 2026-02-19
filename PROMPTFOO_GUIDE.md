/**
 * PromptFoo Configuration for Document Chat AI Response Validation
 * 
 * This file documents how to use PromptFoo for Task 6: Verify AI Responses
 * 
 * WHAT IS PROMPTFOO?
 * - Open-source framework for evaluating LLM outputs
 * - Specializes in response quality, relevance, and factuality checking
 * - Provides systematic evaluation at scale
 * - Generates detailed reports and metrics
 * 
 * INSTALLATION:
 * npm install -g promptfoo
 * 
 * SETUP STEPS:
 * 1. Create promptfoo.yaml in project root (see template below)
 * 2. Create test cases in promptfoo-tests/ directory
 * 3. Run: promptfoo eval
 * 4. View results: promptfoo view
 */

// This is a TypeScript documentation file explaining the PromptFoo setup
// The actual configuration will be in promptfoo.yaml (YAML format)

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║             PromptFoo Configuration Guide - Task 6                         ║
║                                                                            ║
║  Goal: Validate AI chatbot responses are relevant, accurate, and helpful   ║
╚════════════════════════════════════════════════════════════════════════════╝

STEP 1: Install PromptFoo
═════════════════════════
npm install -g promptfoo

STEP 2: Create promptfoo.yaml
═════════════════════════════
Location: /Open_I/promptfoo.yaml

---
name: Document Chat AI Response Evaluation
description: Evaluates AI responses for relevance and accuracy

providers:
  - id: documentchat-api
    type: http
    config:
      baseUrl: http://localhost:3000
      method: POST
      endpoint: /api/chat

testCases:
  - vars:
      message: "What is the main topic of this document?"
      documentId: "test-doc-1"
    expected: "should contain substantive content about document"
    metrics:
      - similarity
      - relevance
      - wordCount: {min: 20}

  - vars:
      message: "Summarize this document in 2 sentences"
      documentId: "test-doc-1"
    evaluators:
      - type: similarity
        value: reference_summary
      - type: contains
        value: "document"

evaluators:
  similarity:
    type: factuality
    model: gpt-4
    
  relevance:
    type: llm-rubric
    model: gpt-4
    rubric: |
      Score the response on relevance to the question:
      1 = Not relevant at all
      2 = Tangentially relevant
      3 = Somewhat relevant
      4 = Mostly relevant
      5 = Highly relevant

outputPath: ./promptfoo-results

STEP 3: Configure Test Cases
═════════════════════════════
Create: /Open_I/promptfoo-tests/

Three types of evaluations:

A) SIMILARITY MATCHING
   - Compare AI response against expected answer
   - Use for factual Q&A
   - Evaluator: 'similarity'

B) LLM-BASED RUBRIC
   - Use another LLM to grade responses
   - Check relevance, accuracy, hallucination
   - Evaluator: 'llm-rubric'

C) REGEX/CONTAINS
   - Simple pattern matching
   - Verify response structure
   - Evaluator: 'regex', 'contains'

STEP 4: Running PromptFoo
═════════════════════════

Full evaluation (recommended):
> promptfoo eval

View beautiful dashboard:
> promptfoo view

With specific config:
> promptfoo eval -c promptfoo.yaml

Export results:
> promptfoo eval --output-file results.json

STEP 5: Integration with Playwright
════════════════════════════════════

Option A: Sequential Execution
  1. Run Playwright tests: npx playwright test
  2. Run PromptFoo: promptfoo eval
  3. View both reports

Option B: Combined CI/CD (GitHub Actions)
  See workflows/ for example automation

PROMPTFOO EVALUATORS FOR CHATBOT (TASK 6)
═══════════════════════════════════════════

1. RELEVANCE Evaluator
   - Question: "What is X?"
   - AI Response: "The document discusses..."
   - Metric: Is response on-topic?
   - Score: 1-5

2. FACTUALITY Evaluator
   - Question: "What number is mentioned?"
   - AI Response: "The document mentions 42"
   - Metric: Can be verified against document
   - Score: Factually correct/incorrect

3. COMPLETENESS Evaluator
   - Question: "List 3 things from the document"
   - AI Response: "1. X, 2. Y, 3. Z"
   - Metric: All requested items present?
   - Score: 0-1 (binary)

4. NO-HALLUCINATION Evaluator
   - Question: "What about unicorns?" (not in doc)
   - AI Response: "The document doesn't mention..."
   - Metric: Graceful handling of out-of-scope
   - Score: Pass/Fail

5. COHERENCE Evaluator
   - Question: Any question
   - AI Response: Grammar, clarity, structure
   - Metric: Is response well-written?
   - Score: 1-5

EXAMPLE PROMPTFOO.YAML STRUCTURE
════════════════════════════════

---
# API configuration
providers:
  - id: doc-chat-prod
    type: http
    config:
      baseUrl: http://localhost:3000
      method: POST
      endpoint: /api/chat

# Test cases for different scenarios
testCases:
  # Scenario 1: Relevance to document
  - name: "General content question"
    vars:
      message: "What is this document talking about?"
    expected: "Should answer about document content"
    rubric:
      - type: relevance
        prompt: "Is this response relevant to the question?"
      
  # Scenario 2: Specific fact extraction
  - name: "Specific details"
    vars:
      message: "What specific numbers or values are in the document?"
    evaluators:
      - type: factuality
        model: gpt-4
        
  # Scenario 3: Graceful handling
  - name: "Question about non-existent content"
    vars:
      message: "Does this document discuss quantum mechanics?"
    evaluators:
      - type: contains
        value: "not found|no mention|doesn't discuss"
        
  # Scenario 4: Response quality
  - name: "Summary request"
    vars:
      message: "Summarize this document"
    evaluators:
      - type: length
        min: 50
        max: 500

# Output path for results
outputPath: ./promptfoo-results

VIEWING RESULTS
═══════════════
After running: promptfoo eval

View dashboard:
> promptfoo view

The dashboard shows:
✓ Pass/Fail status for each test case
✓ Metric scores (1-5 ratings)
✓ Response quality breakdown
✓ Time and cost analysis
✓ Comparison matrix

GITHUB ACTIONS INTEGRATION
═══════════════════════════
Create: .github/workflows/test-pipeline.yml

name: Test Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Run Playwright tests
      - name: Run Playwright Tests
        run: npx playwright test
        
      # Run PromptFoo evaluation
      - name: Evaluate with PromptFoo
        run: |
          npm install -g promptfoo
          promptfoo eval -c promptfoo.yaml
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          
      # Upload reports
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-reports
          path: |
            playwright-report/
            promptfoo-results/

BEST PRACTICES FOR PROMPTFOO IN THIS PROJECT
═════════════════════════════════════════════

1. USE SIMILARITY FOR FACTUAL QUESTIONS
   ✓ Question: "What transaction occurred?"
   ✓ Expected: Specific factual answer
   ✓ Evaluator: Similarity to reference

2. USE LLM-RUBRIC FOR QUALITY ASSESSMENT
   ✓ Question: "Explain the document"
   ✓ Rubric: "Score relevance 1-5"
   ✓ Evaluator: LLM-based assessment

3. USE CONTAINS FOR OUT-OF-SCOPE HANDLING
   ✓ Question: "Tell me about space travel"
   ✓ Expected: "doesn't mention" type response
   ✓ Evaluator: Regex/Contains

4. COMBINE WITH PLAYWRIGHT FOR E2E
   ✓ Playwright: Upload → Ask → Get UI response
   ✓ PromptFoo: Systematically evaluate 50+ questions
   ✓ Together: Complete coverage

METRICS EXPLAINED
═════════════════

Relevance (1-5 score)
  1 = Not relevant, off-topic
  3 = Somewhat relevant, missing info
  5 = Highly relevant, complete answer

Factuality (True/False)
  True = Statement can be verified from source
  False = Statement contradicts or isn't in source

Completeness (0-1)
  0 = Missing key information
  1 = All requested info present

Hallucination (True/False)
  True = AI invented information
  False = All statements sourced from document

Coherence (1-5)
  1 = Incoherent, unreadable
  3 = Readable but some issues
  5 = Well-written, clear, professional

EXAMPLE TEST CASE FILE
══════════════════════
Create: promptfoo-tests/document-qa.json

[
  {
    "id": "q1-general",
    "prompt": "What is this document about?",
    "expected": "Should discuss main topic",
    "evaluators": [
      {
        "type": "llm-rubric",
        "model": "gpt-4",
        "rubric": "Rate relevance to question (1-5)"
      }
    ]
  },
  {
    "id": "q2-factuality",
    "prompt": "What numbers are mentioned?",
    "expected": "Specific numbers from document",
    "evaluators": [
      {
        "type": "factuality",
        "model": "gpt-4"
      }
    ]
  },
  {
    "id": "q3-out-of-scope",
    "prompt": "Does this mention space travel?",
    "expected": "Should indicate content not found",
    "evaluators": [
      {
        "type": "contains",
        "value": "does not|not found|no mention"
      }
    ]
  }
]

RUNNING THE FULL PIPELINE
═════════════════════════

# Terminal 1: Start application
npm run dev

# Terminal 2: Run tests
# Option A: Playwright only
npx playwright test

# Option B: Full pipeline (Recommended for Task 7)
npx playwright test && promptfoo eval && promptfoo view

# View reports
npx playwright show-report
promptfoo view

EXPECTED WORKFLOW FOR TASKS 4-7
═══════════════════════════════

Task 4 (Chat Functionality):
  ✓ Playwright: Tests chat loads, sends messages
  • PromptFoo: Not needed

Task 5 (Ask Questions):
  ✓ Playwright: Tests asking 5+ questions
  • PromptFoo: Could validate content coverage

Task 6 (Verify Responses):
  • Playwright: Basic validation only
  ✓ PromptFoo: PRIMARY tool for response quality
    - Relevance scoring
    - Factuality checking
    - Hallucination detection
    - Consistency verification

Task 7 (Test Pipeline):
  ✓ Playwright Report: HTML dashboard
  ✓ PromptFoo Results: Evaluation metrics
  • Combined: Shows full test coverage + AI quality
`);
