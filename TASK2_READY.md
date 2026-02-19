# Task 2 & 3: File Upload Automation - READY TO RUN

## What I Built

Following **O1's exact pattern** - one page object with both UI + API methods mixed together.

### Structure

```
page-objects/DocumentUploadPage.ts    # ← One page object (14 methods)
tests/fileUpload.spec.ts              # ← Test file (13 test scenarios)
test-resources/
  ├── sample.txt                      # ← Test files
  ├── sample.pdf
  └── sample.docx
playwright.config.ts                  # ← Playwright config
```

### Page Object: DocumentUploadPage

**14 methods** combining UI + API:

**Upload Operations:**
- `uploadSingleFile(filePath, fileName)` - UI upload
- `uploadMultipleFiles(filePaths, fileNames)` - UI upload multiple
- `uploadFileViaAPI(filePath)` - Direct API upload

**Verification:**
- `verifyFileUploadedSuccessfully(fileNames)` - API verify
- `getDocumentsViaAPI()` - Get list from API
- `getUploadedDocumentNames()` - Get from UI
- `isDocumentInList(fileName)` - Check UI

**Deletion:**
- `deleteAllFiles()` - UI delete
- `clearAllDocuments()` - UI clear via button
- `clearAllDocumentsViaAPI()` - API delete

**Utilities:**
- `getDocumentCountViaAPI()` - Get count
- `getUploadedDocumentCount()` - UI count
- `uploadUnsupportedFile()` - Error handling
- `verifySupportedFileTypes()` - Type verification

### Tests: 13 Scenarios

**Task 2: Single File (2 tests)**
```
✅ should upload a single TXT file via UI
✅ should upload a single file via UI and verify via API
```

**Task 2: Multiple Files (2 tests)**
```
✅ should upload multiple files sequentially
✅ should verify all uploaded files appear in documents list
```

**Task 2: File Type Support (3 tests)**
```
✅ should support TXT file type
✅ should support PDF file type
✅ should support DOCX file type
```

**Task 3: Upload Completion (4 tests)**
```
✅ should confirm file upload completion via UI
✅ should confirm file upload completion via API
✅ should verify multiple uploads in documents list
✅ should handle document count correctly
```

**Cleanup (2 tests)**
```
✅ should delete all files via UI
✅ should clear all documents via API
```

## Running Tests

### 1. Ensure App is Running

```bash
npm run dev
```

### 2. Run Tests

```bash
# Run all tests
npx playwright test tests/fileUpload.spec.ts

# Run with UI (recommended first time)
npx playwright test tests/fileUpload.spec.ts --ui

# Run Task 2 only
npx playwright test tests/fileUpload.spec.ts -g "Task 2"

# Run Task 3 only
npx playwright test tests/fileUpload.spec.ts -g "Task 3"
```

### 3. View Results

```bash
# View HTML report
npx playwright show-report
```

## Key Design Decisions

✅ **Single Page Object** - Not multiple (like O1)  
✅ **UI + API Mixed** - Same page object has both operations  
✅ **Tasks 2 & 3 Only** - No chatbot (as requested)  
✅ **Clean Methods** - Each method does one thing  
✅ **Locators Hidden** - Inside methods, not in tests  

## Test Coverage

| Requirement | Status | Method |
|------------|--------|--------|
| Single file upload | ✅ | `uploadSingleFile()` |
| Multiple file uploads | ✅ | `uploadMultipleFiles()` |
| Both API & UI | ✅ | Mixed methods |
| File type support | ✅ | `verifySupportedFileTypes()` |
| Upload completion | ✅ | `verifyFileUploadedSuccessfully()` |
| Documents list | ✅ | `getDocumentsViaAPI()` |

## Quick Commands

```bash
# Install & setup
npm install --save-dev @playwright/test
npx playwright install

# Run tests
npx playwright test tests/fileUpload.spec.ts

# Run with browser visible
npx playwright test tests/fileUpload.spec.ts --headed

# UI mode (recommended)
npx playwright test tests/fileUpload.spec.ts --ui

# View report
npx playwright show-report
```

## Files Created

- ✅ `page-objects/DocumentUploadPage.ts` (7.7 KB, 14 methods)
- ✅ `tests/fileUpload.spec.ts` (8.3 KB, 13 tests)
- ✅ `test-resources/sample.txt` (608 B)
- ✅ `test-resources/sample.pdf` (450 B)
- ✅ `test-resources/sample.docx` (469 B)
- ✅ `playwright.config.ts` (config)

## **Status: ✅ READY TO RUN**

Start with: `npx playwright test tests/fileUpload.spec.ts --ui`
