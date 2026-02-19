# File Upload Test Automation

## Overview

Comprehensive test automation for the Document Chat Application's file upload functionality. Includes both API and UI tests covering single uploads, multiple uploads, and all supported file types (PDF, DOCX, TXT).

## Test Structure

```
tests/
├── setup.ts                 # Test data generation
├── api-upload.test.ts      # API endpoint tests (Vitest)
└── ui-upload.spec.ts       # UI interaction tests (Playwright)

test-data/
├── sample.pdf              # PDF test file
├── sample.docx             # DOCX test file
└── sample.txt              # TXT test file
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Test Data

```bash
npm run test:setup
```

This creates sample test files in `test-data/` directory:
- `sample.pdf` - PDF document for testing
- `sample.docx` - Word document for testing  
- `sample.txt` - Text file for testing

### 3. Start the Application

Ensure the application is running on `http://localhost:3000`:

```bash
npm run dev
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run API Tests Only

```bash
npm run test:api
```

Tests file uploads via HTTP endpoints without browser automation.

**Covered:**
- Single file uploads (PDF, DOCX, TXT)
- Multiple file uploads
- File size validation (1MB limit)
- Document list retrieval
- Each file type support verification

### Run UI Tests Only

```bash
npm run test:ui
```

Tests file uploads through the web interface using Playwright.

**Covered:**
- UI file upload interaction
- Document display verification
- File list updates
- Document removal
- UI element visibility
- Drag & drop (if supported)

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Browser UI (Debug)

```bash
npm run test:debug
```

Opens Playwright Inspector for debugging tests in real-time.

### Run Tests Headed (Show Browser)

```bash
npm run test:headed
```

Shows browser window while running tests.

## Test Scenarios

### API Tests (Vitest)

#### Single File Upload ✓
- ✓ Upload PDF file successfully
- ✓ Upload DOCX file successfully
- ✓ Upload TXT file successfully
- ✓ Return 400 for files exceeding 1MB
- ✓ Verify document metadata

#### Multiple File Upload ✓
- ✓ Upload multiple files sequentially
- ✓ Verify all files in documents list
- ✓ Support all 3 file types simultaneously
- ✓ Handle rapid sequential uploads

#### Upload Verification ✓
- ✓ Uploaded document appears in list
- ✓ Correct document metadata returned
- ✓ Document ID is accessible

#### File Type Support ✓
- ✓ PDF support verified
- ✓ DOCX support verified
- ✓ TXT support verified

### UI Tests (Playwright)

#### Single File Upload ✓
- ✓ Upload PDF through UI
- ✓ Upload DOCX through UI
- ✓ Upload TXT through UI
- ✓ Upload button visible
- ✓ Success message displayed

#### Multiple File Upload ✓
- ✓ Sequential file uploads work
- ✓ All files displayed in list
- ✓ Individual file removal supported

#### UI Elements ✓
- ✓ Upload area visible
- ✓ Document list displayed
- ✓ File type support info shown

#### File Display ✓
- ✓ Filename displays after upload
- ✓ Document indicator/icon visible

#### Drag & Drop (Optional) ✓
- ✓ Drag and drop support (if enabled)

## Test Reports

### Playwright HTML Report

```bash
npm run test:ui
npx playwright show-report
```

Opens detailed HTML report with:
- Test results summary
- Screenshots of failures
- Video recordings
- Detailed trace information

### Test Results Output

Tests generate multiple report formats:
- **Console Output**: Real-time test progress
- **HTML Report**: `playwright-report/index.html`
- **JUnit XML**: `test-results/junit.xml` (for CI/CD)

## Key Features

### ✅ Comprehensive Coverage
- Both API and UI testing approaches
- All file types supported (PDF, DOCX, TXT)
- Single and multiple file scenarios
- Edge cases (file size, rapid uploads)

### ✅ Multiple File Type Support
- PDF documents
- Word documents (DOCX)
- Text files (TXT)
- File size validation (1MB limit)

### ✅ Parallel Execution
- Tests can run in parallel
- Multiple browsers (Chrome, Firefox, Safari)
- Isolated test data per run

### ✅ Cross-Browser Testing
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### ✅ Detailed Reporting
- HTML reports with screenshots
- Video recordings of failures
- JUnit XML for CI/CD integration
- Trace information for debugging

## Configuration

### Test Configuration (`vitest.config.ts`)

```typescript
export default {
  testEnvironment: 'node',
  testTimeout: 30000,
}
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
- Base URL: http://localhost:3000
- Trace: on-first-retry
- Screenshots: only-on-failure
- Video: retain-on-failure
- Parallel: Enabled
- Retries: 2 (CI), 0 (local)
```

## Troubleshooting

### Tests Fail with "Cannot find test files"

```bash
npm run test:setup    # Generate test data first
```

### "Connection refused" Error

```bash
npm run dev    # Start application in another terminal
```

### Browser Not Launching

```bash
npx playwright install    # Install required browsers
```

### Timeout Errors

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60000,  // 60 seconds
```

### Tests Run But No Results

Check that the server is running:
```bash
curl http://localhost:3000
```

## Performance Metrics

- **Single File Upload (API)**: ~500-800ms
- **Multiple File Upload (API)**: ~1-2s per file
- **UI File Upload**: ~1-3s per file
- **Full Test Suite**: ~30-45s

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:setup
      - run: npm run dev &
      - run: npm test
```

### Command for CI

```bash
npm run test:ci
```

## Debugging

### Run Single Test

```bash
npx vitest tests/api-upload.test.ts
npx playwright test tests/ui-upload.spec.ts
```

### Debug Mode

```bash
npm run test:debug
```

### Check Test Output

```bash
npm test -- --reporter=verbose
```

## Dependencies

### Testing Frameworks
- **Vitest**: API test runner
- **Playwright**: Browser automation for UI tests
- **@playwright/test**: Playwright test utilities
- **form-data**: Multipart form handling for API tests

### File Handling
- **fs**: Node.js file system
- **path**: Node.js path utilities

## Advantages & Disadvantages

### Advantages ✅
- **Comprehensive**: Both API and UI coverage
- **Maintainable**: Well-organized test structure
- **Fast**: Parallel execution capability
- **Reliable**: Retries and error handling
- **Detailed Reports**: Multiple output formats
- **Cross-Browser**: Tests on multiple browsers
- **Easy to Extend**: Clear test patterns

### Disadvantages ⚠️
- **Setup Overhead**: Requires running application
- **Flakiness**: UI tests can be affected by timing
- **Resource Intensive**: Browser tests consume memory
- **Platform Dependent**: Some features OS-specific
- **Maintenance**: Must update with UI changes

## Future Enhancements

- [ ] Performance/load testing
- [ ] Security testing (file type validation)
- [ ] Error recovery testing
- [ ] Accessibility testing
- [ ] Mobile responsive testing
- [ ] Docker containerization
- [ ] Allure reporting integration
- [ ] API contract testing

## Support

For issues or questions:
1. Check test output and error messages
2. Review Playwright documentation: https://playwright.dev
3. Review Vitest documentation: https://vitest.dev
4. Check application logs at `http://localhost:3000`

## License

MIT
