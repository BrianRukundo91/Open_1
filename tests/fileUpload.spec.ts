import { expect, test } from '@playwright/test';
import { DocumentUploadPage } from '../page-objects/DocumentUploadPage';
import path from 'path';

const sampleTxtPath = path.resolve(__dirname, '../test-resources/sample.txt');
const samplePdfPath = path.resolve(__dirname, '../test-resources/sample.pdf');
const sampleDocxPath = path.resolve(__dirname, '../test-resources/sample.docx');

test.describe('Task 2 & 3: File Upload Automation', () => {
    let uploadPage: DocumentUploadPage;

    test.beforeEach('should launch application', async ({ page, request }) => {
        // Clear all documents via API before each test
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });
        await apiContext.delete('/api/documents');
        await apiContext.dispose();

        // Navigate to application
        const url = 'http://localhost:3000/';
        await page.goto(url);
        
        // Verify page loaded
        expect(page.url()).toBe(url);
        
        // Initialize page object
        uploadPage = new DocumentUploadPage(page);
    });

    test.describe('Task 2: Single File Upload', () => {
        test('should upload a single TXT file via UI', async () => {
            // Act
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Assert - UI verification
            const count = await uploadPage.getUploadedDocumentCount();
            expect(count).toBeGreaterThan(0);

            const isInList = await uploadPage.isDocumentInList('sample.txt');
            expect(isInList).toBeTruthy();
        });

        test('should upload a single file via UI and verify via API', async () => {
            // Act
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Assert - API verification
            await uploadPage.verifyFileUploadedSuccessfully(['sample.txt']);

            const apiCount = await uploadPage.getDocumentCountViaAPI();
            expect(apiCount).toBe(1);
        });

        test('should verify document appears in documents list', async () => {
            // Act
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Assert - Get list from API (Task 3)
            const documents = await uploadPage.getDocumentsViaAPI();
            expect(documents.length).toBe(1);
            expect(documents[0].originalName).toBe('sample.txt');
        });
    });

    test.describe('Task 2: Multiple File Upload', () => {
        test('should upload multiple files sequentially', async () => {
            // Act
            await uploadPage.uploadMultipleFiles(
                [sampleTxtPath, sampleTxtPath],
                ['sample1.txt', 'sample2.txt']
            );

            // Assert
            const count = await uploadPage.getUploadedDocumentCount();
            expect(count).toBeGreaterThanOrEqual(2);
        });

        test('should verify all uploaded files appear in documents list', async () => {
            // Act
            await uploadPage.uploadMultipleFiles(
                [sampleTxtPath, sampleTxtPath],
                ['sample1.txt', 'sample2.txt']
            );

            // Assert - via API (Task 3)
            const documents = await uploadPage.getDocumentsViaAPI();
            expect(documents.length).toBeGreaterThanOrEqual(2);
        });
    });

    test.describe('Task 2: File Type Verification', () => {
        test('should support TXT file type', async () => {
            // Act
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Assert
            const documents = await uploadPage.getUploadedDocumentNames();
            const hasTxt = documents.some(doc => doc.toLowerCase().includes('.txt'));
            expect(hasTxt).toBeTruthy();
        });

        test('should support PDF file type', async ({ page }) => {
            // Check if PDF file exists, skip if not
            const fs = require('fs');
            if (!fs.existsSync(samplePdfPath)) {
                test.skip();
            }

            // Act
            await uploadPage.uploadSingleFile(samplePdfPath, 'sample.pdf');

            // Assert
            const documents = await uploadPage.getUploadedDocumentNames();
            const hasPdf = documents.some(doc => doc.toLowerCase().includes('.pdf'));
            expect(hasPdf).toBeTruthy();
        });

        test('should support DOCX file type', async ({ page }) => {
            // Check if DOCX file exists, skip if not
            const fs = require('fs');
            if (!fs.existsSync(sampleDocxPath)) {
                test.skip();
            }

            // Act
            await uploadPage.uploadSingleFile(sampleDocxPath, 'sample.docx');

            // Assert
            const documents = await uploadPage.getUploadedDocumentNames();
            const hasDocx = documents.some(doc => doc.toLowerCase().includes('.docx'));
            expect(hasDocx).toBeTruthy();
        });
    });

    test.describe('Task 3: Verify File Upload Completion', () => {
        test('should confirm file upload completion via UI', async () => {
            // Act
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Assert - UI shows file
            const isInList = await uploadPage.isDocumentInList('sample.txt');
            expect(isInList).toBeTruthy();

            const count = await uploadPage.getUploadedDocumentCount();
            expect(count).toBe(1);
        });

        test('should confirm file upload completion via API', async () => {
            // Act - Upload via UI
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Assert - Verify via API (GET /api/documents)
            const documents = await uploadPage.getDocumentsViaAPI();
            expect(documents.length).toBeGreaterThan(0);
            
            const found = documents.find((doc: any) => doc.originalName === 'sample.txt');
            expect(found).toBeDefined();
            expect(found.originalName).toBe('sample.txt');
        });

        test('should verify multiple uploads in documents list', async () => {
            // Act
            await uploadPage.uploadMultipleFiles(
                [sampleTxtPath, sampleTxtPath],
                ['sample1.txt', 'sample2.txt']
            );

            // Assert - via GET /api/documents
            const documents = await uploadPage.getDocumentsViaAPI();
            expect(documents.length).toBeGreaterThanOrEqual(2);
            
            const names = documents.map((doc: any) => doc.originalName);
            expect(names.length).toBeGreaterThanOrEqual(2);
        });

        test('should handle document count correctly', async () => {
            // Act - Upload one file
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Assert - verify count from both UI and API
            const uiCount = await uploadPage.getUploadedDocumentCount();
            const apiCount = await uploadPage.getDocumentCountViaAPI();

            expect(uiCount).toBe(apiCount);
            expect(uiCount).toBeGreaterThan(0);
        });
    });

    test.describe('Cleanup Operations', () => {
        test('should delete all files via UI', async () => {
            // Arrange - Upload a file
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Verify file was uploaded
            let count = await uploadPage.getUploadedDocumentCount();
            expect(count).toBe(1);

            // Act - Delete all
            await uploadPage.deleteAllFiles();
            await page.waitForTimeout(1000);

            // Assert
            count = await uploadPage.getUploadedDocumentCount();
            expect(count).toBe(0);
        });

        test('should clear all documents via API', async () => {
            // Arrange - Upload a file
            await uploadPage.uploadSingleFile(sampleTxtPath, 'sample.txt');

            // Verify file was uploaded
            let apiCount = await uploadPage.getDocumentCountViaAPI();
            expect(apiCount).toBeGreaterThan(0);

            // Act - Clear via API
            await uploadPage.clearAllDocumentsViaAPI();

            // Assert
            apiCount = await uploadPage.getDocumentCountViaAPI();
            expect(apiCount).toBe(0);
        });
    });
});
