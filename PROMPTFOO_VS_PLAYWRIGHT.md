# PromptFoo vs Playwright: Action Items for Each Tool

## Overview

For the Document Chat Application test automation, different tools excel at different tasks:
- **Playwright**: UI/API automation and integration testing
- **PromptFoo**: AI/LLM response evaluation

This document clarifies **which actions should be done with which tool** for Tasks 4-7.

---

## TASK 4: Test Chat Functionality

### Framework: Playwright ✅

**Why Playwright:**
- Tests UI interactions (button clicks, form inputs)
- Verifies DOM elements exist and are visible
- Tests browser compatibility
- No LLM evaluation needed

### Actions for Playwright:
```typescript
✅ Verify chat interface loads
   → Check if chat container is visible in DOM
   
✅ Verify chat is ready for input
   → Check if input field is enabled/focused
   
✅ Send message to chatbot
   → Interact with UI elements to send text
   
✅ Handle different message types
   → Send various message formats via UI
```

### PromptFoo Role: ❌ NOT NEEDED
- PromptFoo evaluates response quality
- Task 4 just checks chat loads/accepts input
- No AI evaluation at this stage

### Playwright Code Example:
```typescript
test('should load chat interface correctly', async ({ page }) => {
    // ✅ Playwright handles this
    const isFunctional = await chatPage.isChatFunctional();
    expect(isFunctional).toBe(true);
});
```

---

## TASK 5: Ask Questions Based on Uploaded Documents

### Framework: Playwright PRIMARY + PromptFoo OPTIONAL

**Playwright Actions (Required):**
```typescript
✅ Upload document (use DocumentUploadPage)
   → Interact with file input, click upload button
   
✅ Send questions to chatbot
   → Type question text, click send button
   
✅ Receive and capture responses
   → Extract AI response from chat UI
   
✅ Verify 5+ questions are asked
   → Loop through questions, verify count
```

**PromptFoo Actions (Optional - Better Coverage):**
```
✅ Verify questions are processed correctly
   → Test that API accepts the questions
   
✅ Validate response coverage
   → Check if all 5+ questions got answers
   
✅ Bulk testing (50+ questions if needed)
   → PromptFoo can test many Q&A pairs at once
```

### When to Use PromptFoo for Task 5:

Use PromptFoo if you want to:
- Test with 50+ different questions systematically
- Compare question coverage across document types
- Evaluate whether questions are being fully addressed
- Generate test data programmatically

### Playwright Code Example:
```typescript
test('should ask multiple questions', async ({ page }) => {
    // ✅ Playwright: Upload and ask questions
    const questions = [
        'What is the main topic?',
        'What specific details are included?',
        '... 3 more'
    ];
    
    for (const q of questions) {
        await chatPage.sendMessage(q);           // Playwright
        const received = await chatPage.waitForAIResponse();
        expect(received).toBe(true);
    }
});
```

### Bonus: PromptFoo for Task 5 (Optional)
```typescript
// Use API to send questions programmatically
const responses = await chatPage.askMultipleQuestionsViaAPI(questions);
// Then run: promptfoo eval (with these questions in config)
```

---

## TASK 6: Verify AI Responses ⭐ CRITICAL TOOL CHOICE

### Two-Part Strategy

#### Part A: Basic Playwright Checks ✅
**Limited validation:**
```typescript
✅ Response length check
   → expect(response.length).toBeGreaterThan(0)
   
✅ Keyword presence
   → verify response contains expected words
   
✅ No error indicators
   → ensure no "error" or "failed" in response
   
✅ Graceful degradation
   → check for "not found" when asked about missing content
```

**Limitation:**
```
❌ Can't evaluate relevance
❌ Can't detect subtle hallucinations  
❌ Can't score response quality (1-5)
❌ Can't verify factuality
❌ Can't compare to reference answers
```

#### Part B: PromptFoo Evaluation ⭐ HIGHLY RECOMMENDED
**Comprehensive evaluation:**
```
✅ RELEVANCE SCORING
   → GPT-4 grades: "Is this on-topic?" (1-5 score)
   → Better than keyword matching
   
✅ FACTUALITY CHECKING
   → Verifies response facts match document
   → Detects unsupported claims
   
✅ HALLUCINATION DETECTION
   → Identifies invented information
   → Validates claims against source
   
✅ CONSISTENCY TESTING
   → Compares multiple responses to same question
   → Flags contradictions
   
✅ GRACEFUL DEGRADATION
   → Verifies out-of-scope questions handled well
   → Checks for polite "not in document" responses
```

### Comparison: What Each Can Do

| Capability | Playwright | PromptFoo |
|------------|-----------|-----------|
| Response exists | ✅ | ✅ |
| Contains keywords | ✅ | ✅ |
| Response length | ✅ | ✅ |
| Relevance scoring (1-5) | ❌ | ✅ |
| Factuality checking | ❌ | ✅ |
| Hallucination detection | ❌ | ✅ |
| Consistency verification | ❌ | ✅ |
| No error indicators | ✅ | ✅ |
| Graceful degradation | ✅ | ✅ |
| Bulk test 50+ cases | ❌ | ✅ |
| Cost analysis | ❌ | ✅ |

### PromptFoo Evaluation Categories (15 Test Cases)

```
GROUP 1: RELEVANCE (4 tests)
  ✅ General content question
  ✅ Main topic identification  
  ✅ Specific details extraction
  ✅ Key information summary
  → Evaluator: llm-rubric (GPT-4 grades 1-5)

GROUP 2: GRACEFUL DEGRADATION (4 tests)
  ✅ Space travel question (not in doc)
  ✅ Quantum computing mention (not in doc)
  ✅ Ancient Egypt query (not in doc)
  ✅ Irrelevant question (not in doc)
  → Evaluator: contains (checks for "not found" type responses)

GROUP 3: QUALITY ASSURANCE (4 tests)
  ✅ Quote extraction (no hallucination)
  ✅ Fact accuracy check
  ✅ Summary consistency (first ask)
  ✅ Summary consistency (second ask)
  → Evaluator: factuality + similarity

GROUP 4: ADVANCED CHECKS (3 tests)
  ✅ Response clarity evaluation
  ✅ Contextual relationship understanding
  ✅ Complete concept coverage
  → Evaluator: llm-rubric (quality assessment)
```

### Recommended Approach for Task 6:

**Option 1: Hybrid (BEST) ⭐**
```bash
# Use Playwright for basic checks
npx playwright test tests/chatbot.spec.ts -g "TASK 6"

# Use PromptFoo for comprehensive evaluation
promptfoo eval -c promptfoo.yaml

# View both reports
npx playwright show-report
promptfoo view
```

**Option 2: PromptFoo Only (IF TIME LIMITED)**
```bash
# Skip Playwright Task 6 tests, go straight to PromptFoo
promptfoo eval -c promptfoo.yaml
promptfoo view
```

**Option 3: Playwright Only (QUICK BUT LIMITED)**
```bash
# Just run basic Playwright checks
npx playwright test tests/chatbot.spec.ts -g "TASK 6"
npx playwright show-report
```

---

## TASK 7: Test Pipeline with Visualization

### Two Reporting Systems

#### Playwright Reports ✅ AUTOMATIC
```
📊 What it generates:
  ✓ HTML dashboard at /playwright-report/
  ✓ Test execution timeline
  ✓ Pass/fail status for each test
  ✓ Screenshots on failure
  ✓ Video recordings of failures
  ✓ Test execution traces
  ✓ Browser compatibility results (3 browsers)
  
📈 Shows:
  ✓ Total tests run: 29
  ✓ Tests passed/failed
  ✓ Execution time
  ✓ Flakiness reports
  
🎯 Best for:
  ✓ UI/API test results
  ✓ Regression detection
  ✓ Visual validation
```

#### PromptFoo Reports ✅ FOR AI TESTING
```
📊 What it generates:
  ✓ Dashboard at http://localhost:3000 (after: promptfoo view)
  ✓ AI response grading (1-5 scores)
  ✓ Test result breakdown
  ✓ Metric comparisons
  ✓ Cost analysis
  
📈 Shows:
  ✓ Relevance scores (1-5)
  ✓ Factuality pass/fail
  ✓ Hallucination detection
  ✓ Response quality metrics
  ✓ Test pass rate (%)
  
🎯 Best for:
  ✓ AI/LLM response quality
  ✓ Consistency verification
  ✓ Factuality validation
```

### Running the Pipeline

#### Quick Pipeline (Playwright only)
```bash
# 1. Start app
npm run dev

# 2. Run tests
npx playwright test

# 3. View results
npx playwright show-report
```
**Output:** HTML report showing all 29 tests + Tasks 2-5, basic Task 6

#### Full Pipeline (Playwright + PromptFoo) ⭐ RECOMMENDED
```bash
# 1. Start app
npm run dev

# 2. Run all tests
npx playwright test tests/

# 3. Run AI evaluation
promptfoo eval -c promptfoo.yaml

# 4. View both reports
npx playwright show-report    # Shows: All test results
promptfoo view                # Shows: AI response evaluation
```
**Output:** Complete coverage - tests + AI evaluation metrics

#### CI/CD Pipeline (GitHub Actions)
```yaml
# Uses both Playwright and PromptFoo
# Runs on every push/PR
# Uploads both reports as artifacts
# See example in IMPLEMENTATION_COMPLETE.md
```

---

## Action Items Summary

### What Playwright DOES (25 out of 29 tests)
```
TASK 2-3: File Upload
  ✅ Playwright: 13 tests (upload, verify, cleanup)
  ❌ PromptFoo: Not applicable

TASK 4: Chat Functionality  
  ✅ Playwright: 4 tests (load, input, send, types)
  ❌ PromptFoo: Not needed

TASK 5: Ask Questions
  ✅ Playwright: 5 tests (upload, ask, verify)
  🟡 PromptFoo: Bonus for bulk testing

TASK 6: Verify Responses
  ✅ Playwright: 5 basic tests
  ⭐ PromptFoo: 15 comprehensive evaluations (RECOMMENDED)

TASK 7: Pipeline
  ✅ Playwright: Automatic HTML report
  ✅ PromptFoo: AI evaluation dashboard
```

### What PromptFoo DOES (Task 6 Focus)
```
PRIMARY USE: Task 6 - AI Response Evaluation
  ✅ Relevance scoring (GPT-4 grades 1-5)
  ✅ Factuality checking
  ✅ Hallucination detection
  ✅ Consistency verification
  ✅ Graceful degradation testing
  ✅ Reports & visualization

BONUS USE: 
  ✅ Task 5 enhancement (bulk question testing)
  ✅ Task 7 reporting (AI test metrics)
```

---

## Execution Timeline

### Option A: Standard Execution
```
Time: ~3 minutes

1. npm run dev                      (30 sec setup)
2. npx playwright test              (2 min 30 sec)
3. npx playwright show-report       (view results)
```

### Option B: With PromptFoo ⭐ RECOMMENDED
```
Time: ~8 minutes

1. npm run dev                      (30 sec setup)
2. npx playwright test              (2 min 30 sec)
3. promptfoo eval                   (4-5 min AI evaluation)
4. npx playwright show-report       (view Playwright results)
5. promptfoo view                   (view PromptFoo results)
```

---

## Decision Matrix: When to Use What

### Use PLAYWRIGHT for:
- ✅ File upload/download automation
- ✅ Button clicks and form inputs
- ✅ UI element verification
- ✅ Navigation and routing
- ✅ API setup/teardown operations
- ✅ Quick validation of basic functionality
- ✅ Cross-browser testing
- ✅ Visual/screenshot validation

### Use PROMPTFOO for:
- ✅ LLM response quality evaluation
- ✅ Relevance scoring
- ✅ Factuality checking
- ✅ Hallucination detection
- ✅ Prompt comparison testing
- ✅ Bulk question evaluation
- ✅ Consistency metrics
- ✅ Cost analysis for LLM calls

### For THIS PROJECT:
```
Tasks 2-3 (File Upload)    → Playwright ✅
Task 4 (Chat UI)           → Playwright ✅
Task 5 (Questions)         → Playwright ✅ (+ PromptFoo bonus)
Task 6 (AI Validation)     → Playwright ✅ basic + PromptFoo ⭐ recommended
Task 7 (Pipeline)          → Both (Playwright + PromptFoo reports)
```

---

## Quick Reference: Tool Capabilities

### Playwright Capabilities
```
✅ Browser automation (Chromium, Firefox, WebKit)
✅ API testing via request context
✅ Page interactions (click, type, select)
✅ DOM element verification
✅ Screenshot/video recording
✅ HTML reporting
✅ Multi-browser parallel testing
```

### PromptFoo Capabilities
```
✅ LLM provider integration (OpenAI, Claude, etc.)
✅ Automated response evaluation
✅ Rubric-based grading (1-5 scores)
✅ Factuality checking
✅ Hallucination detection
✅ Semantic similarity comparison
✅ Batch test execution (100+ cases)
✅ Cost tracking and analysis
✅ Web-based dashboard view
```

---

## Summary

| Task | Primary Tool | Why | Secondary | Notes |
|------|-------------|-----|-----------|-------|
| 2-3 | Playwright | UI/API interaction | None | ✅ Complete |
| 4 | Playwright | Chat UI testing | None | ✅ Complete |
| 5 | Playwright | UI interaction | PromptFoo | ✅ Complete, bonus with PromptFoo |
| 6 | PromptFoo ⭐ | AI evaluation | Playwright | ⭐ Recommended hybrid approach |
| 7 | Both | Reporting | None | Both reports provide full coverage |

**Recommendation:** Use **Playwright for automation + PromptFoo for AI evaluation** = Complete, professional test coverage.
