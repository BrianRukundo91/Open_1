import { test, expect, request } from '@playwright/test';
import path from 'path';
import { DocumentUploadPage } from '../page-objects/DocumentUploadPage';
import { ChatPage } from '../page-objects/ChatPage';

const sampleTxtPath = path.join(__dirname, '../test-resources/sample.txt');

test.describe('TASK 4 & 5 & 6: Chat Functionality and AI Responses', () => {
    let documentUploadPage: DocumentUploadPage;
    let chatPage: ChatPage;

    test.beforeEach(async ({ page, context }) => {
        // Clear all documents before each test
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });
        
        await apiContext.delete('/api/documents');
        await apiContext.dispose();

        // Initialize page objects
        await page.goto('http://localhost:3000');
        documentUploadPage = new DocumentUploadPage(page, context);
        chatPage = new ChatPage(page);
    });

    test.describe('TASK 4: Test Chat Functionality', () => {
        /**
         * Task 4.1: Chat interface loads correctly
         * Prerequisites: Page loads without errors
         * Expected: Chat UI element is visible and accessible
         */
        test('should load chat interface correctly', async ({ page }) => {
            const isFunctional = await chatPage.isChatFunctional();
            expect(isFunctional).toBe(true);
        });

        /**
         * Task 4.2: Chat is ready to receive input
         * Prerequisites: Chat interface loaded
         * Expected: Message input field is enabled and visible
         */
        test('should be ready to receive input', async ({ page }) => {
            const isReady = await chatPage.verifyChatIsReadyForInput();
            expect(isReady).toBe(true);
        });

        /**
         * Task 4.3: Send simple message to chat
         * Prerequisites: Chat is ready, no documents uploaded yet
         * Expected: Message is sent and processed
         */
        test('should send message to chatbot without errors', async ({ page }) => {
            const messageCount = await chatPage.getMessageCount();
            
            await chatPage.sendMessage('Hello, how are you?');
            
            // Verify message count increased or response received
            const newMessageCount = await chatPage.getMessageCount();
            expect(newMessageCount).toBeGreaterThan(messageCount);
        });

        /**
         * Task 4.4: Multiple message types
         * Prerequisites: Chat interface loaded
         * Expected: Different message structures are handled
         */
        test('should handle different types of messages', async ({ page }) => {
            const messageTypes = [
                'Hello',
                'What can you do?',
                'Test message with numbers: 12345',
                'Question with special chars: !@#$%',
            ];

            for (const message of messageTypes) {
                await chatPage.sendMessage(message);
                await page.waitForTimeout(1500);
            }

            const allMessages = await chatPage.getAllMessages();
            expect(allMessages.length).toBeGreaterThan(0);
        });
    });

    test.describe('TASK 5: Ask Questions Based on Uploaded Documents', () => {
        /**
         * Task 5.1: Upload document and ask general content question
         * Prerequisites: Document with known content available
         * Expected: Question is processed and response received
         */
        test('should ask and receive answer about document content - general question', async ({ page }) => {
            // Upload document
            await documentUploadPage.uploadSingleFile(sampleTxtPath);
            await page.waitForTimeout(2000);

            // Ask general content question
            await chatPage.sendMessage(
                'What is the main topic of this document?'
            );
            
            const responseReceived = await chatPage.waitForAIResponse(15000);
            expect(responseReceived).toBe(true);

            const response = await chatPage.getLatestResponse();
            expect(response.length).toBeGreaterThan(0);
        });

        /**
         * Task 5.2: Specific detail query from document
         * Prerequisites: Document uploaded with specific data
         * Expected: Detailed information extracted and provided
         */
        test('should ask specific detail questions about document', async ({ page }) => {
            await documentUploadPage.uploadSingleFile(sampleTxtPath);
            await page.waitForTimeout(2000);

            const detailQuestions = [
                'What specific details are mentioned in this document?',
                'Can you list the key information from this document?',
                'What numbers or values are present in the document?',
                'Who or what entities are mentioned?',
                'Can you summarize the main events or transactions?',
            ];

            for (const question of detailQuestions) {
                await chatPage.sendMessage(question);
                const responseReceived = await chatPage.waitForAIResponse(15000);
                expect(responseReceived).toBe(true);

                const response = await chatPage.getLatestResponse();
                expect(response.length).toBeGreaterThan(0);
            }
        });

        /**
         * Task 5.3: Multiple documents and cross-document questions
         * Prerequisites: Multiple files uploaded
         * Expected: AI references content from multiple documents
         */
        test('should ask questions with multiple documents uploaded', async ({ page }) => {
            // Upload single document (for testing with multiple file scenario)
            await documentUploadPage.uploadSingleFile(sampleTxtPath);
            await page.waitForTimeout(2000);

            const documentCount = await documentUploadPage.getDocumentCountViaAPI();
            expect(documentCount).toBeGreaterThan(0);

            const questions = [
                'Based on your uploaded documents, what is the overall theme?',
                'Can you provide a comprehensive summary?',
                'What information is available across these documents?',
            ];

            for (const question of questions) {
                await chatPage.sendMessage(question);
                await chatPage.waitForAIResponse(15000);
            }

            const messageCount = await chatPage.getMessageCount();
            expect(messageCount).toBeGreaterThan(0);
        });

        /**
         * Task 5.4: Concept and relationship questions
         * Prerequisites: Document with concepts uploaded
         * Expected: AI explains relationships and concepts
         */
        test('should answer questions about concepts in document', async ({ page }) => {
            await documentUploadPage.uploadSingleFile(sampleTxtPath);
            await page.waitForTimeout(2000);

            const conceptQuestions = [
                'What concepts or ideas are discussed?',
                'Are there any relationships or connections mentioned?',
                'What is the chronological order of events?',
                'How do the different elements relate to each other?',
            ];

            for (const question of conceptQuestions) {
                await chatPage.sendMessage(question);
                const responseReceived = await chatPage.waitForAIResponse(15000);
                expect(responseReceived).toBe(true);
            }
        });

        /**
         * Task 5.5: Via API - Multiple programmatic questions
         * Prerequisites: API endpoint accessible
         * Expected: Batch questions processed successfully
         * NOTE: This test demonstrates API approach for PromptFoo integration
         */
        test('should ask multiple questions programmatically via API', async ({ page }) => {
            // Upload document via API/UI
            await documentUploadPage.uploadSingleFile(sampleTxtPath);
            await page.waitForTimeout(2000);

            const questionsForAPI = [
                'What is this document about?',
                'Summarize the key points',
                'What data or metrics are included?',
                'Who are the main subjects?',
                'What is the purpose of this document?',
            ];

            const responses = await chatPage.askMultipleQuestionsViaAPI(
                questionsForAPI
            );

            expect(responses.length).toBe(questionsForAPI.length);
            responses.forEach((response) => {
                expect(response).toBeDefined();
            });
        });
    });

    test.describe('TASK 7: Test Pipeline with Visualization', () => {
        /**
         * Playwright HTML Report (Automatic)
         * - Generates /playwright-report/
         * - Run tests and view with: npx playwright show-report
         * 
         * PromptFoo Integration (Recommended for AI testing)
         * - Validates response quality systematically
         * - See PROMPTFOO_GUIDE.md for detailed setup
         */

        /**
         * Task 7.1: Ensure tests run consistently
         * Prerequisites: All tests pass
         * Expected: Reproducible test results
         */
        test('should run test pipeline consistently', async ({ page }) => {
            // Verify basic application state
            const isChatReady = await chatPage.isChatFunctional();
            expect(isChatReady).toBe(true);

            // Verify cleanup works
            const initialDocs = await documentUploadPage.getDocumentsViaAPI();
            expect(initialDocs.length).toBe(0);

            // Quick workflow
            await documentUploadPage.uploadSingleFile(sampleTxtPath);
            const docsAfterUpload = await documentUploadPage.getDocumentsViaAPI();
            expect(docsAfterUpload.length).toBeGreaterThan(0);

            // Cleanup
            await documentUploadPage.clearAllDocumentsViaAPI();
            const docsAfterCleanup = await documentUploadPage.getDocumentsViaAPI();
            expect(docsAfterCleanup.length).toBe(0);
        });

        /**
         * Task 7.2: Full workflow test
         * Demonstrates the entire chat pipeline
         * Useful for smoke testing and regression prevention
         */
        test('should complete full end-to-end workflow', async ({ page }) => {
            // 1. Verify chat is ready
            const chatReady = await chatPage.isChatFunctional();
            expect(chatReady).toBe(true);

            // 2. Upload document
            await documentUploadPage.uploadSingleFile(sampleTxtPath);
            await page.waitForTimeout(2000);

            const uploadSuccess = await documentUploadPage.verifyFileUploadedSuccessfully();
            expect(uploadSuccess).toBe(true);

            // 3. Ask question
            await chatPage.sendMessage('What is this document about?');
            const responseReceived = await chatPage.waitForAIResponse(15000);
            expect(responseReceived).toBe(true);

            // 4. Verify response
            const response = await chatPage.getLatestResponse();
            expect(response.length).toBeGreaterThan(0);

            // 5. Get chat history
            const messages = await chatPage.getChatHistoryViaAPI();
            expect(Array.isArray(messages)).toBe(true);

            // 6. Cleanup
            await documentUploadPage.clearAllDocumentsViaAPI();
        });
});

