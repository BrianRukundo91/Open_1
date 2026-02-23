import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocumentUploadPage } from '../page-objects/DocumentUploadPage';
import { ChatPage } from '../page-objects/ChatPage';


// ── Constants 

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receiptTxtPath = path.join(__dirname, '../test-resources/transaction_receipt.txt');
const receiptFileName = 'transaction_receipt.txt';

// ── Test Data 

const questionsAndAnswers: Array<{ question: string; expected: string | RegExp }> = [
    { question: 'What is the total amount paid?',      expected: '$212.40'          },
    { question: 'What is the transaction status?',     expected: 'PAID'             },
    { question: 'What is the transaction date?',       expected: '19 February 2026' },
    { question: 'How many services were purchased?',   expected: /Asset Registration|Annual Maintenance|2 service|Two service/i },
    { question: 'What is the reference number?',       expected: 'MM28473910'       },
];

const conceptQuestions = [
    'What are the main service categories offered?',
    'How is the pricing structured in this receipt?',
    'What payment methods are supported?',
    'What is the tax rate applied?',
];

// ── Suite Config 

test.describe.configure({ mode: 'serial' });

// ── Tests 

test.describe('AI Chatbot - Response Verification', () => {
    let documentUploadPage: DocumentUploadPage;
    let chatPage: ChatPage;

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        documentUploadPage = new DocumentUploadPage(page);
        chatPage = new ChatPage(page);
        await chatPage.setup();
        await documentUploadPage.uploadSupportedSingleFile(receiptTxtPath, receiptFileName);
    });

    test('should load chat interface and be ready for input', async () => {
        await chatPage.verifyChatIsReady();
    });

    test('should send a message without errors', async ({ page }) => {
        await chatPage.sendMessage('Hello, how are you?');
        await expect(page.locator('textarea[placeholder*="Ask a question"]')).toBeVisible();
    });

    test('should respond to a relevant question about document content', async () => {
        const success = await chatPage.askQuestionAndWait('What is the main topic of this document?');
        expect.soft(success).toBe(true);
    });

    test('should answer specific questions about the document accurately', async () => {
        test.setTimeout(60000);
        await chatPage.askMultipleQuestions(questionsAndAnswers);
    });

    test('should handle conceptual questions about the document', async () => {
        test.setTimeout(50000);
        await chatPage.askQuestionsWithoutValidation(conceptQuestions);
    });

    test('should verify document is uploaded via API', async () => {
        await chatPage.verifyDocumentUploaded();
    });

  test('should verify AI response contains expected keywords via API', async () => {
    test.setTimeout(40000);
    await chatPage.sendMessage('Who is the customer on this receipt?');
    await chatPage.waitForAIResponse();
    await chatPage.page.waitForTimeout(3000);
    await chatPage.verifyResponseContainsKeywords(['jane', 'smith']);
});

    test('should retrieve chat history via API after conversation', async () => {
        test.setTimeout(30000);
        await chatPage.sendMessage('What is the total amount paid?');
        await chatPage.waitForAIResponse();
        const history = await chatPage.getChatHistoryViaAPI();
        expect(history.length).toBeGreaterThan(0);
    });

  test('should verify messages API returns correct structure with user and AI messages', async () => {
    test.setTimeout(30000);

    await chatPage.sendMessage('What is the merchant name?');
    await chatPage.waitForAIResponse();
    await chatPage.page.waitForTimeout(2000);

    const history = await chatPage.getChatHistoryViaAPI();
    expect(history.length).toBeGreaterThan(0);

    const aiMessage = history.find((m: any) => m.role === 'ai' || m.role === 'assistant');
    expect(aiMessage).toBeDefined();
    expect(aiMessage).toHaveProperty('id');
    expect(aiMessage).toHaveProperty('content');
    expect(aiMessage).toHaveProperty('role');
    expect(aiMessage.content.length).toBeGreaterThan(0);
});

    test('should track message count increasing after each question', async () => {
        test.setTimeout(30000);
        const before = await chatPage.getMessageCount();
        await chatPage.sendMessage('What is the merchant name?');
        await chatPage.waitForAIResponse();
        const after = await chatPage.getMessageCount();
        expect(after).toBeGreaterThan(before);
    });

});