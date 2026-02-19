# Complete Test Automation Implementation Guide

## Project Status: ✅ COMPLETE for Tasks 2-7

This document summarizes the complete test automation pipeline for the Document Chat Application (SDET Challenge).

## Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Install PromptFoo for Task 6 AI evaluation
npm install -g promptfoo

# Set OpenAI API key (for AI response grading)
export OPENAI_API_KEY=sk-xxx...
```

### Run All Tests
```bash
# Terminal 1: Start application
npm run dev

# Terminal 2: Run all tests
npx playwright test

# View reports
npx playwright show-report          # Playwright results
promptfoo eval && promptfoo view    # AI response evaluation (optional)
```

---

## Architecture Overview

### Technology Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Test Framework | Playwright | UI/API automation |
| Language | TypeScript | Type safety |
| Configuration | TSConfig | TypeScript setup |
| Pattern | Page Object Model | Code organization |
| AI Testing | PromptFoo | Response evaluation |
| Reporting | Playwright HTML + PromptFoo | Visualization |

### Design Pattern: O1 Project Style

**Core Principles:**
1. ✅ Single page object per feature
2. ✅ Mix UI and API methods in same class
3. ✅ No separate data file inheritance chains
4. ✅ Simple, focused test organization
5. ✅ Clear method names matching test purposes

**Example:**
```typescript
// ChatPage.ts - Single file
export class ChatPage {
    // UI methods
    async sendMessage(question: string): Promise<void>
    async getLatestResponse(): Promise<string>
    
    // API methods  
    async sendMessageViaAPI(question: string): Promise<any>
    async getChatHistoryViaAPI(): Promise<any[]>
    
    // Validation methods
    async verifyResponseContainsKeywords(keywords: string[]): Promise<boolean>
}
```

---

## Project Structure

```
Open_I/
├── page-objects/
│   ├── DocumentUploadPage.ts    # Tasks 2-3: File upload automation
│   └── ChatPage.ts              # Tasks 4-7: Chat functionality
├── tests/
│   ├── fileUpload.spec.ts       # Tasks 2-3: Upload tests (13 scenarios)
│   └── chatbot.spec.ts          # Tasks 4-7: Chat tests (16 scenarios)
├── test-resources/
│   ├── sample.txt               # Test document (608 bytes)
│   ├── sample.pdf               # PDF test file (450 bytes)
│   └── sample.docx              # DOCX test file (469 bytes)
├── playwright.config.ts         # Test configuration
├── promptfoo.yaml               # AI response evaluation (Task 6)
│
├── TASKS_4_7_GUIDE.md           # THIS FILE - Implementation guide
├── PROMPTFOO_GUIDE.md           # PromptFoo setup & integration
├── TASK2_READY.md               # Tasks 2-3 documentation
├── README.md                    # Main project guide
└── package.json                 # Dependencies
```

---

## Complete Test Coverage

### Tasks 2-3: File Upload (COMPLETED ✅)

**Scope:** Upload automation and completion verification

**Tests:** 13 scenarios across 2 test describe blocks
- Single file upload (UI + API)
- Multiple file uploads  
- File type support (TXT, PDF, DOCX)
- Upload completion verification
- Document list validation
- Cleanup operations

**Page Object:** DocumentUploadPage.ts (14 methods)
- `uploadSingleFile(path)` - Upload one file
- `uploadMultipleFiles(paths)` - Upload multiple files
- `verifyFileUploadedSuccessfully()` - Check UI confirmation
- `getDocumentsViaAPI()` - Get document list via API
- `getDocumentCountViaAPI()` - Count uploaded documents
- `deleteAllFiles()` - UI clear all
- `clearAllDocumentsViaAPI()` - API clear all
- Plus utility methods

**Location:** [fileUpload.spec.ts](tests/fileUpload.spec.ts)

---

### Task 4: Chat Functionality (COMPLETED ✅)

**Scope:** Verify chat interface loads and accepts input

**Tests:** 4 scenarios
1. Chat interface loads correctly
2. Chat is ready to receive input
3. Send message to chatbot
4. Handle different message types

**Key Methods Used:**
- `isChatFunctional()` - Full readiness check
- `sendMessage(question)` - Send to chatbot
- `getMessageCount()` - Track messages
- `getAllMessages()` - Get conversation

**Status:** ✅ Ready to run

---

### Task 5: Ask Questions (COMPLETED ✅)

**Scope:** Upload documents and ask 5+ questions about content

**Tests:** 5 scenarios
1. General content questions
2. Specific detail queries
3. Multiple documents questions
4. Concept and relationship questions
5. Programmatic API questioning (for PromptFoo integration)

**Implementation:**
- Uploads document via DocumentUploadPage
- Asks multiple questions sequentially
- Validates responses received
- Verifies response length and content

**Key Methods:**
- `uploadSingleFile(path)` - Upload from DocumentUploadPage
- `sendMessage(question)` - Ask via UI
- `askMultipleQuestionsViaAPI(questions)` - Batch via API
- `waitForAIResponse(timeout)` - Wait for bot response

**Status:** ✅ Ready to run

---

### Task 6: Verify AI Responses (COMPLETED ✅)

**Scope:** Validate AI provides relevant, accurate, non-hallucinated responses

**Two-Part Approach:**

#### Part A: Playwright Validation (Included)
5 test scenarios:
1. Relevant answers based on document
2. Accurate and contextually appropriate responses
3. Graceful handling of non-existent content
4. No hallucinations or fabricated info
5. Consistency in repeated questions

**Key Methods:**
- `verifyResponseContainsKeywords(keywords)` - Check content
- `getLatestResponse()` - Get AI message
- `waitForAIResponse(timeout)` - Wait for response
- `verifyIrrelevantQuestionHandling(question)` - Test out-of-scope

#### Part B: PromptFoo Evaluation ⭐ RECOMMENDED
Systematic AI evaluation with 15 test cases:

**Test Categories:**
- Relevance Testing (4 cases) - Is response on-topic?
- Graceful Degradation (4 cases) - How does AI handle out-of-scope?
- Quality Assurance (4 cases) - Are facts accurate?
- Advanced Checks (3 cases) - Relationships and consistency

**Evaluators Used:**
- `llm-rubric` - GPT-4 grades responses (1-5 score)
- `factuality` - Verify facts match source
- `contains` - Pattern matching for expected responses
- `length` - Ensure substantive responses

**Status:** ✅ Configuration ready, see [PROMPTFOO_GUIDE.md](PROMPTFOO_GUIDE.md)

---

### Task 7: Test Pipeline & Visualization (COMPLETED ✅)

**Scope:** Reproducible test execution with clear reporting

**Components:**

1. **Playwright HTML Report** (Automatic)
   - Test status (pass/fail)
   - Screenshots on failure
   - Video recordings
   - Execution traces
   - Browser compatibility (3 browsers)
   
   **View:** `npx playwright show-report`

2. **PromptFoo Report** (For AI Testing)
   - Response grading (1-5 scores)
   - Relevance metrics
   - Factuality checks
   - Hallucination detection
   - Test result breakdown
   
   **View:** `promptfoo view`

**Status:** ✅ Fully configured and ready

---

## Running the Tests

### Option 1: Quick Test (Playwright Only)
```bash
# Start app
npm run dev

# Run all Playwright tests  
npx playwright test

# View results
npx playwright show-report
```

**Time:** ~2-3 minutes  
**Coverage:** Tasks 2-5, basic Task 6 validation

### Option 2: Comprehensive (With PromptFoo) ⭐ RECOMMENDED
```bash
# Start app
npm run dev

# Run Playwright tests
npx playwright test

# Run AI evaluation
promptfoo eval -c promptfoo.yaml

# View results (two separate dashboards)
npx playwright show-report    # Playwright
promptfoo view                # PromptFoo
```

**Time:** ~5-10 minutes  
**Coverage:** Tasks 2-7 complete

### Option 3: Specific Test Suite
```bash
# Tasks 2-3 only
npx playwright test tests/fileUpload.spec.ts

# Tasks 4-7 only
npx playwright test tests/chatbot.spec.ts

# Specific task (example: Task 4)
npx playwright test -g "TASK 4"

# Specific test
npx playwright test -g "should handle different types of messages"
```

---

## Test Configuration

### Playwright Config (`playwright.config.ts`)
```typescript
{
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 1,              // Retry failed tests once
  workers: 4,              // Run 4 tests in parallel
  timeout: 30000,          // 30s per test
  expect: {
    timeout: 5000          // 5s for assertions
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true
  },
  reporter: ['html', 'list', 'junit']
}
```

### PromptFoo Config (`promptfoo.yaml`)
```yaml
providers:
  - id: document-chat-api
    type: http
    config:
      baseUrl: http://localhost:3000
      endpoint: /api/chat

testCases:
  # 15 test cases covering relevance, factuality, 
  # hallucination detection, consistency, etc.
```

---

## API Endpoints Tested

| Endpoint | Method | Task | Status |
|----------|--------|------|--------|
| `/api/upload` | POST | 2-3, 5 | ✅ Tested |
| `/api/documents` | GET | 2-3, 5-7 | ✅ Tested |
| `/api/documents` | DELETE | 2-3 | ✅ Tested |
| `/api/chat` | POST | 4-6 | ✅ Tested |
| `/api/messages` | GET | 5-6 | ✅ Tested |
| `/api/documents/:id` | DELETE | Bonus | ⏳ Not yet |

---

## Page Objects Reference

### DocumentUploadPage.ts (Tasks 2-3)
**14 methods** for file operations:
```typescript
// Upload operations
uploadSingleFile(path: string): Promise<void>
uploadMultipleFiles(paths: string[]): Promise<void>
uploadUnsupportedFile(path: string): Promise<void>

// Verification (UI)
verifyFileUploadedSuccessfully(): Promise<boolean>
getUploadedDocumentCount(): Promise<number>
getUploadedDocumentNames(): Promise<string[]>
deleteAllFiles(): Promise<void>

// Verification (API)
verifyFileUploadedSuccessfully(): Promise<boolean>
getDocumentCountViaAPI(): Promise<number>
getDocumentsViaAPI(): Promise<any[]>
uploadFileViaAPI(path: string): Promise<any>
clearAllDocumentsViaAPI(): Promise<void>

// Utilities
verifySupportedFileTypes(): Promise<boolean>
isDocumentInList(name: string): Promise<boolean>
```

### ChatPage.ts (Tasks 4-7)
**17 methods** for chat operations:
```typescript
// Chat interaction
sendMessage(question: string): Promise<void>
getLatestResponse(): Promise<string>
getAllMessages(): Promise<string[]>
getMessageCount(): Promise<number>
clearChatHistory(): Promise<void>

// Chat status
verifyChatInterfaceLoads(): Promise<boolean>
verifyChatIsReadyForInput(): Promise<boolean>
isChatFunctional(): Promise<boolean>
waitForAIResponse(timeout: number): Promise<boolean>

// API operations
sendMessageViaAPI(question: string): Promise<any>
getChatHistoryViaAPI(): Promise<any[]>
askMultipleQuestions(questions: string[]): Promise<void>
askMultipleQuestionsViaAPI(questions: string[]): Promise<any[]>

// Validation
verifyResponseContainsKeywords(keywords: string[]): Promise<boolean>
verifyIrrelevantQuestionHandling(q: string): Promise<string>
```

---

## Expected Test Results

### Playwright Tests
```
✓ TASK 2-3: File Upload (13 tests)
✓ TASK 4: Chat Functionality (4 tests)
✓ TASK 5: Document Questions (5 tests)
✓ TASK 6: AI Response Validation (5 tests)
✓ TASK 7: Pipeline Consistency (2 tests)

Total: 29 tests passing
Time: ~2-3 minutes
```

### PromptFoo Evaluations
```
✓ Relevance Testing: 4/4 passed (1-5 scores)
✓ Graceful Degradation: 4/4 passed (pattern matches)
✓ Quality Assurance: 4/4 passed (factuality checks)
✓ Advanced Checks: 3/3 passed (consistency verified)

Total: 15 evaluations
Coverage: Comprehensive AI response validation
```

---

## PromptFoo Integration for Task 6

### Why PromptFoo for AI Testing?

Traditional test assertions can't evaluate LLM quality:
```typescript
// ❌ Limited: Just checks response exists
const response = await chatPage.getLatestResponse();
expect(response.length).toBeGreaterThan(0);

// ✅ Better: Evaluates with PromptFoo
// Uses GPT-4 to grade relevance: "Score this 1-5"
// Uses semantic similarity checking
// Detects hallucinations systematically
```

### PromptFoo Workflow

1. **Setup** (one-time)
   ```bash
   npm install -g promptfoo
   export OPENAI_API_KEY=sk-xxx...
   ```

2. **Configure** (provided in promptfoo.yaml)
   - Defines API endpoint
   - Lists test cases
   - Defines evaluators

3. **Run**
   ```bash
   promptfoo eval -c promptfoo.yaml
   ```

4. **Review**
   ```bash
   promptfoo view
   ```

### PromptFoo Test Cases

| Test # | Question | Evaluator | Metric |
|--------|----------|-----------|--------|
| 1-4 | Relevance tests | llm-rubric (1-5) | Is response on-topic? |
| 5-8 | Out-of-scope | contains | Does it say "not found"? |
| 9-10 | Factuality | factuality | Are facts verified? |
| 11-12 | Consistency | similarity | Similar responses? |
| 13-15 | Quality | length + llm-rubric | Substantive and clear? |

See [PROMPTFOO_GUIDE.md](PROMPTFOO_GUIDE.md) for complete details.

---

## File Test Data

### sample.txt (Task 2-7 tests)
```
Lorem ipsum dolor sit amet, consectetur adipiscing elit.

TRANSACTION RECORD
Date: 2024-01-15
Amount: $1,234.56
Account: 98765432
Description: Purchase at retail location

Key details:
- Payment method: Credit card
- Store location: Downtown branch
- Item count: 3 units
- Discount applied: 10%
```

**Used in:**
- All file upload tests (Tasks 2-3)
- All document question tests (Task 5)
- All AI response validation tests (Task 6-7)

### sample.pdf & sample.docx
- Minimal valid files for type verification
- Not used for content testing (sample.txt is used instead)

---

## CI/CD Integration

### GitHub Actions Example
Add `.github/workflows/test-pipeline.yml`:

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
      
      # Run Playwright tests
      - name: Run Playwright Tests
        run: npx playwright test
      
      # Run AI evaluation (optional)
      - name: Evaluate with PromptFoo
        run: |
          npm install -g promptfoo
          promptfoo eval -c promptfoo.yaml
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      # Upload artifacts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-reports
          path: |
            playwright-report/
            promptfoo-results/
```

---

## Troubleshooting

### Application won't start
```
Error: EADDRINUSE: address already in use :::3000
Solution: kill -9 $(lsof -ti:3000)
```

### Tests timeout
```
Error: Timeout waiting for response
Solution: 
1. Check app is running: npm run dev
2. Increase timeout in test: waitForAIResponse(30000)
3. Check network/API response time
```

### PromptFoo errors
```
Error: Invalid API key
Solution: export OPENAI_API_KEY=sk-xxxxx
```

### Locator not found
```
Error: Chat interface element not visible
Solution: 
1. Check UI structure hasn't changed
2. Update ChatPage locators
3. Verify browser is navigating to app
```

---

## Implementation Checklist

### Requirements Met ✅
- [x] Task 1: Application runs successfully
- [x] Task 2: File upload automation (single & multiple)
- [x] Task 3: Upload completion verification
- [x] Task 4: Chat functionality testing
- [x] Task 5: Document-based questioning (5+ questions)
- [x] Task 6: AI response validation (with PromptFoo)
- [x] Task 7: Test pipeline with visualization
- [x] Documentation: Comprehensive guides provided

### Code Quality ✅
- [x] Follow O1 project pattern (single page objects)
- [x] TypeScript throughout
- [x] Clear method naming
- [x] No code duplication
- [x] Proper error handling
- [x] Organized test structure

### Testing Coverage ✅
- [x] 29 Playwright test scenarios
- [x] 15 PromptFoo AI evaluations
- [x] Multi-browser testing (Chromium, Firefox, WebKit)
- [x] API and UI testing
- [x] Edge cases (non-existent content, hallucinations)
- [x] Full workflow integration

---

## Next Steps

1. **Run the tests:**
   ```bash
   npm run dev                    # Terminal 1
   npx playwright test            # Terminal 2
   ```

2. **View reports:**
   ```bash
   npx playwright show-report
   ```

3. **Setup PromptFoo (optional but recommended):**
   ```bash
   npm install -g promptfoo
   export OPENAI_API_KEY=sk-xxx...
   promptfoo eval
   promptfoo view
   ```

4. **Review documentation:**
   - [TASKS_4_7_GUIDE.md](TASKS_4_7_GUIDE.md) - This file
   - [PROMPTFOO_GUIDE.md](PROMPTFOO_GUIDE.md) - AI testing details
   - [TASK2_READY.md](TASK2_READY.md) - Tasks 2-3 details

---

## Summary

✅ **Complete test automation pipeline for Document Chat App**
- Tasks 2-3: File upload (13 tests)
- Tasks 4-5: Chat functionality (9 tests)
- Task 6: AI response validation (5 Playwright + 15 PromptFoo)
- Task 7: Pipeline & reporting (included)

✅ **O1 Pattern Implementation**
- DocumentUploadPage & ChatPage (single page objects)
- Mixed UI + API methods
- Simple, maintainable structure

✅ **Dual Reporting**
- Playwright HTML reports (UI/API testing)
- PromptFoo dashboards (AI evaluation)

**Ready to use. Start with:** `npm run dev` && `npx playwright test`
