import { test, expect } from '@playwright/test';
import { DocumentUploadPage } from '../page-objects/DocumentUploadPage';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ── Constants ────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const txtFileName  = 'transaction_receipt.txt';
const pdfFileName  = 'transaction_receipt.pdf';
const docxFileName = 'transaction_receipt.docx';
const txtPath  = path.resolve(__dirname, `../test-resources/${txtFileName}`);
const pdfPath  = path.resolve(__dirname, `../test-resources/${pdfFileName}`);
const docxPath = path.resolve(__dirname, `../test-resources/${docxFileName}`);
const multiFilePaths = [txtPath, docxPath];
const multiFileNames = [txtFileName, docxFileName];

// ── Suite Config ─────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

// ── Tests ────────────────────────────────────────────────────────

test.describe('Document Upload', () => {
    let uploadPage: DocumentUploadPage;

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
        expect(page.url()).toBe('http://localhost:3000/');
        uploadPage = new DocumentUploadPage(page);
        await uploadPage.clearAllDocumentsViaAPI();
    });

    // ── Single File Upload ───────────────────────────────────────

    test('should upload a single TXT file and verify via UI', async () => {
        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        const isInList = await uploadPage.isDocumentInList(txtFileName);
        expect(isInList).toBeTruthy();
    });

    test('should upload a single TXT file and verify via API', async () => {
        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        await uploadPage.verifyIfFileUploadedSuccessfully([txtFileName]);
    });

  test('should upload a single PDF file and verify via API', async () => {
    await uploadPage.uploadFileViaAPI(pdfPath);
    const documents = await uploadPage.getDocumentsViaAPI();
    expect(documents.length).toBeGreaterThan(0);
});

    test('should upload a single DOCX file and verify via API', async () => {
        if (!fs.existsSync(docxPath)) test.skip();
        await uploadPage.uploadSupportedSingleFile(docxPath, docxFileName);
        await uploadPage.verifyIfFileUploadedSuccessfully([docxFileName]);
    });

    test('should not upload an unsupported file type', async () => {
        const unsupportedPath = path.resolve(__dirname, '../test-resources/sample.xyz');
        await uploadPage.uploadUnsupportedSingleFile(unsupportedPath);
        const count = await uploadPage.getDocumentCountViaAPI();
        expect(count).toBe(0);
    });

    // ── Multiple File Upload ─────────────────────────────────────

    test('should upload multiple files sequentially via UI', async () => {
        await uploadPage.uploadSupportedMultipleFiles(multiFilePaths, multiFileNames);
        const count = await uploadPage.getUploadedDocumentCount();
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should verify all multiple uploaded files via API', async () => {
        await uploadPage.uploadSupportedMultipleFiles(multiFilePaths, multiFileNames);
        const documents = await uploadPage.getDocumentsViaAPI();
        expect(documents.length).toBeGreaterThanOrEqual(2);
    });

    // ── Upload Confirmation ──────────────────────────────────────

    test('should confirm document count matches between UI and API', async () => {
        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        const uiCount = await uploadPage.getUploadedDocumentCount();
        const apiCount = await uploadPage.getDocumentCountViaAPI();
        expect(uiCount).toBe(apiCount);
    });

    test('should confirm specific document appears in API response', async () => {
        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        const documents = await uploadPage.getDocumentsViaAPI();
        const found = documents.find((doc: any) => doc.name === txtFileName);
        expect(found).toBeDefined();
    });

    test('should verify document metadata fields in API response', async () => {
    await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
    const documents = await uploadPage.getDocumentsViaAPI();
    const doc = documents.find((d: any) => d.name === txtFileName);
    expect(doc).toHaveProperty('id');
    expect(doc).toHaveProperty('name', txtFileName);
    expect(doc).toHaveProperty('size');
    expect(doc).toHaveProperty('type');

});

 
// ── Delete & Cleanup ─────────────────────────────────────────

    test('should delete all files and verify count is zero via API', async () => {
        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        expect(await uploadPage.getDocumentCountViaAPI()).toBeGreaterThan(0);
        await uploadPage.clearAllDocumentsViaAPI();
        expect(await uploadPage.getDocumentCountViaAPI()).toBe(0);
    });

 test('should delete all files and verify count is zero via UI', async () => {
    await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
    expect(await uploadPage.getUploadedDocumentCount()).toBe(1);
    await uploadPage.deleteAllFiles();
    expect(await uploadPage.getUploadedDocumentCount()).toBe(0);
});

test('should delete a specific document by ID', async () => {
    await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
    const documents = await uploadPage.getDocumentsViaAPI();
    const docId = documents[0].id;

    const response = await uploadPage.deleteDocumentByIdViaAPI(docId);
    expect(response).toBe(200);
    expect(await uploadPage.getDocumentCountViaAPI()).toBe(0);
});

});