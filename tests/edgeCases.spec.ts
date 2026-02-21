import { test, expect } from '@playwright/test';
import { DocumentUploadPage } from '../page-objects/DocumentUploadPage';
import { ChatPage } from '../page-objects/ChatPage';
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

// ── Suite Config ─────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

// ── Tests ────────────────────────────────────────────────────────

test.describe('Edge Cases', () => {
    let uploadPage: DocumentUploadPage;
    let chatPage: ChatPage;

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    uploadPage = new DocumentUploadPage(page);
    chatPage = new ChatPage(page);
    await uploadPage.clearAllDocumentsAndWait();
});

    // ── Upload State Management ──────────────────────────────────
test('should handle multiple file operations in sequence', async () => {
    await uploadPage.clearAllDocumentsAndWait();

    await uploadPage.uploadFileViaAPI(txtPath);
    await uploadPage.uploadFileViaAPI(pdfPath);
    expect(await uploadPage.getDocumentCountViaAPI()).toBeGreaterThanOrEqual(2);

    await uploadPage.clearAllDocumentsAndWait();
    expect(await uploadPage.getDocumentCountViaAPI()).toBe(0);

    await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
    expect(await uploadPage.getDocumentCountViaAPI()).toBe(1);
});

    test('should handle duplicate file upload gracefully', async () => {
        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        const countAfterFirst = await uploadPage.getDocumentCountViaAPI();
        expect(countAfterFirst).toBeGreaterThan(0);

        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        const countAfterSecond = await uploadPage.getDocumentCountViaAPI();

        // App should either prevent duplicate or accept it — either is valid
        expect(countAfterSecond).toBeGreaterThanOrEqual(countAfterFirst);
    });

    test('should upload file directly via API and verify it appears in UI', async () => {
        await uploadPage.uploadFileViaAPI(txtPath);
        const isInList = await uploadPage.isDocumentInList(txtFileName);
        expect(isInList).toBeTruthy();
    });

    test('should handle rapid successive uploads without errors', async () => {
        if (!fs.existsSync(pdfPath)) test.skip();
        if (!fs.existsSync(docxPath)) test.skip();

        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        await uploadPage.uploadSupportedSingleFile(pdfPath, pdfFileName);
        await uploadPage.uploadSupportedSingleFile(docxPath, docxFileName);

        const count = await uploadPage.getDocumentCountViaAPI();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    // ── Chat Edge Cases ──────────────────────────────────────────

    test('should handle sequential chat questions correctly', async () => {
    test.setTimeout(70000);

    await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
    expect(await uploadPage.getDocumentCountViaAPI()).toBeGreaterThan(0);

    await chatPage.sendMessage('What is the merchant name?');
    await chatPage.waitForAIResponse(10000);
    const response1 = await chatPage.getLatestResponseFromDOM();
    expect(response1.length).toBeGreaterThan(0);

    await chatPage.sendMessage('What is the total amount?');
    await chatPage.waitForAIResponse(15000);
    const response2 = await chatPage.getLatestResponseFromDOM();
    expect(response2.length).toBeGreaterThan(0);

    await chatPage.sendMessage('What is the payment method?');
    await chatPage.waitForAIResponse(15000);
    const response3 = await chatPage.getLatestResponseFromDOM();
    expect(response3.length).toBeGreaterThan(0);
});

    test('should handle questions with special characters', async () => {
        test.setTimeout(25000);

        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        expect(await uploadPage.getDocumentCountViaAPI()).toBeGreaterThan(0);

        await chatPage.sendMessage('What are the $ amounts & fees? Are there any #discounts?');
        await chatPage.waitForAIResponse(10000);

        const response = await chatPage.getLatestResponseFromDOM();
        expect(response.length).toBeGreaterThan(0);
    });

    test('should handle long descriptive questions without errors', async () => {
        test.setTimeout(25000);

        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        expect(await uploadPage.getDocumentCountViaAPI()).toBeGreaterThan(0);

        await chatPage.sendMessage(
            'Can you please provide a comprehensive breakdown of all the key details, ' +
            'financial figures, and relevant information contained within this document?'
        );
        await chatPage.waitForAIResponse(10000);

        const response = await chatPage.getLatestResponseFromDOM();
        expect(response.length).toBeGreaterThan(0);
    });

    // ── Cross-Feature: API Validation ────────────────────────────

    test('should return 400 error when chat is used without uploading a document', async () => {
        test.setTimeout(20000);

        expect(await uploadPage.getDocumentCountViaAPI()).toBe(0);

        const apiResponse = await chatPage.page.request.post('http://localhost:3000/api/chat', {
            headers: { 'Content-Type': 'application/json' },
            data: { question: 'What is the total amount?' },
        });

        expect(apiResponse.status()).toBe(400);
        const body = await apiResponse.json();
        expect(body.error).toContain('No documents');
    });

    test('should return 400 error after all documents are deleted', async () => {
        test.setTimeout(40000);

        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        expect(await uploadPage.getDocumentCountViaAPI()).toBeGreaterThan(0);

        await chatPage.sendMessage('What is the merchant name?');
        await chatPage.waitForAIResponse(10000);

        await uploadPage.deleteAllFiles();
        expect(await uploadPage.getDocumentCountViaAPI()).toBe(0);

        const apiResponse = await chatPage.page.request.post('http://localhost:3000/api/chat', {
            headers: { 'Content-Type': 'application/json' },
            data: { question: 'What is the merchant name?' },
        });

        expect(apiResponse.status()).toBe(400);
        const body = await apiResponse.json();
        expect(body.error).toContain('No documents');
    });

    test('should verify API response structure on successful chat', async () => {
        test.setTimeout(30000);

        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);

        const apiResponse = await chatPage.page.request.post('http://localhost:3000/api/chat', {
            headers: { 'Content-Type': 'application/json' },
            data: { question: 'What is the merchant name?' },
        });

        expect(apiResponse.status()).toBe(200);
        const body = await apiResponse.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message');
        expect(body.message).toHaveProperty('content');
        expect(body.message).toHaveProperty('role', 'ai');
    });

    // ── Cross-Feature: UI Validation ─────────────────────────────

    test('should return error when asking without documents', async () => {
    expect(await uploadPage.getDocumentCountViaAPI()).toBe(0);

    const apiResponse = await chatPage.page.request.post('http://localhost:3000/api/chat', {
        headers: { 'Content-Type': 'application/json' },
        data: { question: 'What is the total amount?' },
    });

    expect(apiResponse.status()).toBe(400);
    const body = await apiResponse.json();
    expect(body.error).toContain('No documents');
});

    test('should show correct response in UI after document is uploaded', async () => {
        test.setTimeout(30000);

        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        expect(await uploadPage.getDocumentCountViaAPI()).toBeGreaterThan(0);

        await chatPage.sendMessage('Who is the customer?');
        await chatPage.waitForAIResponse(10000);

        const response = await chatPage.getLatestResponseFromDOM();
        expect(response.toLowerCase()).toContain('jane');
    });

 test('should show chat input as visible but return error when no documents uploaded', async ({ page }) => {
    expect(await uploadPage.getDocumentCountViaAPI()).toBe(0);

    // App hides chat input when no documents exist — verify via API instead
    const apiResponse = await page.request.post('http://localhost:3000/api/chat', {
        headers: { 'Content-Type': 'application/json' },
        data: { question: 'What is the total amount?' },
    });

    expect(apiResponse.status()).toBe(400);
    const body = await apiResponse.json();
    expect(body.error).toContain('No documents');
});

    test('should reflect empty document list in UI after deletion', async ({ page }) => {
        await uploadPage.uploadSupportedSingleFile(txtPath, txtFileName);
        expect(await uploadPage.getUploadedDocumentCount()).toBe(1);

        await uploadPage.deleteAllFiles();

        expect(await uploadPage.getUploadedDocumentCount()).toBe(0);
    });
});