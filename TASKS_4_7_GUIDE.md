# Tasks 4-7: Chat Functionality & AI Evaluation

## Overview

This document covers the test automation for Tasks 4-7 of the SDET Challenge:
- **Task 4**: Test Chat Functionality
- **Task 5**: Ask Questions Based on Uploaded Documents  
- **Task 6**: Verify AI Responses (with PromptFoo integration)
- **Task 7**: Test Pipeline with Visualization

## Architecture: O1 Pattern

Following the O1 project's proven approach:

### Single Page Object with Mixed Methods
- **ChatPage.ts** - Single page object containing both UI and API methods
- Clean, focused methods for specific operations
- Mix of UI interactions and API calls in same class
- No separate data files or complex inheritance chains

```typescript
// Example: ChatPage methods
- UI Methods: sendMessage(), verifyChatInterfaceLoads(), getLatestResponse()
- API Methods: sendMessageViaAPI(), getChatHistoryViaAPI()
- Utility Methods: waitForAIResponse(), getMessageCount()
```

### Simple Test Organization
- **chatbot.spec.ts** - Single test file organizing all test scenarios
- Tests grouped by task/feature using describe blocks
- Sequential test execution with proper setup/teardown
- Embedded test data (no separate fixture files)

## Project Structure

```
Open_I/
├── page-objects/
│   ├── DocumentUploadPage.ts   # Tasks 2-3 (file upload)
│   └── ChatPage.ts             # Tasks 4-7 (chat functionality)
├── tests/
│   ├── fileUpload.spec.ts      # Tasks 2-3 tests
│   └── chatbot.spec.ts         # Tasks 4-7 tests
├── test-resources/
│   ├── sample.txt              # Test document
│   ├── sample.pdf
│   └── sample.docx
├── playwright.config.ts        # Test configuration
├── promptfoo.yaml              # Task 6: AI evaluation config
├── PROMPTFOO_GUIDE.md          # Detailed PromptFoo setup
└── README.md                   # Main project guide
```

## Task 4: Test Chat Functionality

**Goal**: Verify the chat interface loads and accepts input

### Tests Included
1. ✅ Chat interface loads correctly
2. ✅ Chat is ready to receive input  
3. ✅ Can send message to chatbot
4. ✅ Handle different message types

### Running Task 4 Tests
```bash
npx playwright test tests/chatbot.spec.ts -g "TASK 4"
```

### Key Implementation Details

**ChatPage methods used:**
```typescript
isChatFunctional()              // Verifies chat is ready
verifyChatInterfaceLoads()      // UI present check
verifyChatIsReadyForInput()     // Input field enabled check
sendMessage(question)            // Send message to bot
getMessageCount()                // Count messages
```

## Task 5: Ask Questions Based on Uploaded Documents

**Goal**: Upload documents and ask 5+ questions about their content

### Tests Included
1. ✅ General content questions  
2. ✅ Specific detail queries
3. ✅ Multiple documents and cross-document questions
4. ✅ Concept and relationship questions
5. ✅ Programmatic questioning via API

### Running Task 5 Tests
```bash
npx playwright test tests/chatbot.spec.ts -g "TASK 5"
```

### Key Implementation Details

**Workflow:**
1. Upload document using DocumentUploadPage
2. Wait for upload completion
3. Send questions using ChatPage
4. Verify responses received (not errors)
5. Validate response length (>0 characters)

**Example test:**
```typescript
test('should ask specific detail questions', async ({ page }) => {
    // 1. Upload
    await documentUploadPage.uploadSingleFile(sampleTxtPath);
    
    // 2. Ask 5+ questions
    const questions = [
        'What is the main topic?',
        'What specific details are mentioned?', 
        '... 3 more questions'
    ];
    
    for (const q of questions) {
        await chatPage.sendMessage(q);
        const received = await chatPage.waitForAIResponse(15000);
        expect(received).toBe(true);
    }
});
```

**API Alternative (for PromptFoo integration):**
```typescript
// Send questions programmatically
const responses = await chatPage.askMultipleQuestionsViaAPI(questions);
```

## Task 6: Verify AI Responses

**Goal**: Validate chatbot provides relevant, accurate, non-hallucinated responses

### Two-Part Approach

#### Part A: Playwright (Basic Validation)
**ChatPage methods:**
```typescript
verifyResponseContainsKeywords(keywords)    // Check for expected terms
getLatestResponse()                          // Get AI's last message
waitForAIResponse(timeout)                   // Wait for response
verifyIrrelevantQuestionHandling(q)         // Test graceful degradation
```

**Tests included:**
1. ✅ Relevant answers based on document content
2. ✅ Accurate and contextually appropriate responses  
3. ✅ Graceful handling of non-existent content
4. ✅ No hallucinations or fabricated info
5. ✅ Consistency in repeated questions

#### Part B: PromptFoo (Systematic Evaluation) ⭐ RECOMMENDED

**Why PromptFoo for Task 6?**
- Evaluates 15+ AI test cases automatically
- Scores relevance, factuality, completeness
- Detects hallucinations systematically
- Generates metrics and reports
- Better than manual assertions for LLM output

### Running Task 6 Tests

#### Option 1: Playwright Only (Quick Check)
```bash
npx playwright test tests/chatbot.spec.ts -g "TASK 6"
```

#### Option 2: PromptFoo Only (Comprehensive Evaluation) ⭐ RECOMMENDED
```bash
# Setup (one-time)
npm install -g promptfoo

# Run AI evaluation
promptfoo eval -c promptfoo.yaml

# View results dashboard
promptfoo view
```

#### Option 3: Both (Hybrid - Full Coverage)
```bash
# Run both test suites
npx playwright test tests/chatbot.spec.ts -g "TASK 6"
promptfoo eval -c promptfoo.yaml

# View both reports
npx playwright show-report
promptfoo view
```

### PromptFoo Test Cases

The `promptfoo.yaml` includes 15 test cases covering:

1. **Relevance Testing (4 cases)**
   - General content questions
   - Main topic identification
   - Specific details extraction
   - Key information summarization

2. **Graceful Degradation (4 cases)**
   - Space travel question (not in doc)
   - Quantum computing reference
   - Ancient Egypt query
   - Irrelevant question

3. **Quality Assurance (4 cases)**
   - Quote extraction (no hallucination)
   - Fact accuracy
   - Summary consistency
   - Response clarity

4. **Advanced Checks (3 cases)**
   - Contextual relationships
   - Concept coverage
   - Chronological accuracy

### PromptFoo Evaluators Explained

```yaml
# 1. Relevance Scoring (1-5)
llm-rubric: "Score relevance of response (1-5)"
# LLM grades how well answer addresses question

# 2. Factuality Checking
type: factuality
# Verifies statements can be traced to source

# 3. Pattern Matching
type: contains
value: "does not|not found|not mentioned"
# Ensures graceful out-of-scope handling

# 4. Length Validation  
type: length
min: 20
max: 5000
# Ensures substantive responses (not too short/long)
```

## Task 7: Test Pipeline with Visualization

**Goal**: Create reproducible test pipeline with clear reporting

### Two-Part Pipeline

#### Part 1: Playwright Report (Automatic) ✓ Included
- **Generates**: `/playwright-report/` directory
- **Shows**: Test status, screenshots, videos, traces
- **View**: `npx playwright show-report`

#### Part 2: PromptFoo Report (For AI Testing) ⭐ RECOMMENDED
- **Generates**: `/promptfoo-results/` directory
- **Shows**: AI response quality metrics and scores
- **View**: `promptfoo view`

### Running the Full Test Pipeline

#### Quick (UI + API integration tests only)
```bash
npx playwright test
npx playwright show-report
```

#### Comprehensive (Full testing + AI evaluation) ⭐ RECOMMENDED
```bash
# Terminal 1: Start application
npm run dev

# Terminal 2: Run full pipeline
npx playwright test tests/
promptfoo eval -c promptfoo.yaml

# View results
npx playwright show-report    # Playwright tests
promptfoo view                # AI response evaluation
```

### Report Output

**Playwright HTML Report shows:**
```
✓ Test results (pass/fail)
✓ Screenshot on failure
✓ Video recordings (on failure)
✓ Test traces (for debugging)
✓ Execution time
✓ Browser compatibility (chromium, firefox, webkit)
```

**PromptFoo Dashboard shows:**
```
✓ AI response grading (1-5 scores)
✓ Relevance metrics
✓ Factuality checks (pass/fail)
✓ Hallucination detection
✓ Test case results breakdown
✓ Comparison matrix
```

### CI/CD Integration

For GitHub Actions, add to `.github/workflows/test-pipeline.yml`:

```yaml
name: Test Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      # Run UI/Integration tests
      - name: Run Playwright Tests
        run: npx playwright test tests/
      
      # Run AI evaluation
      - name: Evaluate with PromptFoo
        run: |
          npm install -g promptfoo
          promptfoo eval -c promptfoo.yaml
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      # Upload reports
      - name: Upload Reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: |
            playwright-report/
            promptfoo-results/
```

## Complete Workflow

### Before First Run
```bash
# 1. Install dependencies
npm install

# 2. Install PromptFoo (for Task 6)
npm install -g promptfoo

# 3. Set up OpenAI API (for AI evals)
export OPENAI_API_KEY=sk-xxx...
```

### Standard Test Run
```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Run tests
npx playwright test

# View Playwright report
npx playwright show-report

# Run AI evaluation (if doing Task 6 comprehensive)
promptfoo eval -c promptfoo.yaml
promptfoo view
```

### Example Output

```
✓ TASK 4: Test Chat Functionality (4 tests)
  ✓ should load chat interface correctly
  ✓ should be ready to receive input  
  ✓ should send message to chatbot without errors
  ✓ should handle different types of messages

✓ TASK 5: Ask Questions Based on Documents (5 tests)
  ✓ should ask and receive answer - general question
  ✓ should ask specific detail questions
  ✓ should ask questions with multiple documents
  ✓ should answer questions about concepts
  ✓ should ask multiple questions programmatically

✓ TASK 6: Verify AI Responses (5 tests)
  ✓ should provide relevant answers based on document
  ✓ should ensure responses are accurate
  ✓ should handle non-existent content gracefully
  ✓ should not hallucinate information
  ✓ should provide consistent responses

✓ TASK 7: Test Pipeline (2 tests)
  ✓ should run test pipeline consistently
  ✓ should complete full end-to-end workflow

📊 PromptFoo Results (15 evaluations)
  ✓ Relevance: 4/4 passed
  ✓ Graceful Degradation: 4/4 passed
  ✓ Quality Assurance: 4/4 passed
  ✓ Advanced Checks: 3/3 passed
```

## ChatPage Methods Reference

### UI Methods
| Method | Purpose | Returns |
|--------|---------|---------|
| `verifyChatInterfaceLoads()` | Check chat UI visible | boolean |
| `verifyChatIsReadyForInput()` | Check input enabled | boolean |
| `isChatFunctional()` | Both checks combined | boolean |
| `sendMessage(q)` | Send message to bot | Promise |
| `getLatestResponse()` | Get AI's last message | string |
| `getAllMessages()` | Get conversation | string[] |
| `getMessageCount()` | Count messages | number |
| `waitForAIResponse(timeout)` | Wait for bot response | boolean |
| `clearChatHistory()` | Clear conversation | Promise |

### API Methods
| Method | Purpose | Returns |
|--------|---------|---------|
| `sendMessageViaAPI(q, docId?)` | Send via API | Promise<any> |
| `getChatHistoryViaAPI()` | Get messages via API | Promise<any[]> |
| `askMultipleQuestionsViaAPI(qs)` | Batch questions | Promise<any[]> |

### Validation Methods
| Method | Purpose | Returns |
|--------|---------|---------|
| `verifyResponseContainsKeywords(ks)` | Check keywords | boolean |
| `verifyIrrelevantQuestionHandling(q)` | Test graceful | string |

## Troubleshooting

### Chat interface not found
```
Error: Chat container not visible
Solution: Check browser console, UI element selectors may need updating
```

### PromptFoo not working
```
Error: promptfoo: command not found
Solution: npm install -g promptfoo
```

### OpenAI API errors in PromptFoo
```
Error: Invalid API key
Solution: export OPENAI_API_KEY=sk-xxx...
         or set in .env file
```

### Tests timeout
```
Error: Timeout waiting for response
Solution: Increase waitForAIResponse timeout, app may be slow
         Check if npm run dev is running
```

## Next Steps

1. **Run Tests**: `npx playwright test tests/chatbot.spec.ts`
2. **View Playwright Report**: `npx playwright show-report`
3. **Setup PromptFoo**: Follow steps in PROMPTFOO_GUIDE.md
4. **Run AI Evaluation**: `promptfoo eval -c promptfoo.yaml`
5. **View PromptFoo Results**: `promptfoo view`

## Summary

- ✅ **Tasks 4-7 Implementation**: Complete test coverage
- ✅ **O1 Pattern**: Single page object, simple organization
- ✅ **Playwright Tests**: UI/API integration testing
- ✅ **PromptFoo Integration**: Systematic AI response evaluation
- ✅ **Pipeline & Reports**: Dual reporting for comprehensive visibility

For more details on PromptFoo, see [PROMPTFOO_GUIDE.md](PROMPTFOO_GUIDE.md)
