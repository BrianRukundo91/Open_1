import { Page } from "playwright";
import { expect, request } from "@playwright/test";

export class ChatPage {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    /**
     * Verify the chat interface loads correctly
     */
    async verifyChatInterfaceLoads(): Promise<boolean> {
        // Wait for chat container to be visible
        const chatContainer = this.page.locator('[role="region"], .chat, [class*="chat"]').first();
        
        try {
            await chatContainer.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Verify chat interface is ready for input
     */
    async verifyChatIsReadyForInput(): Promise<boolean> {
        // Look for message input field
        const messageInput = this.page.locator(
            'input[role="textbox"], textarea, [contenteditable="true"]'
        ).first();
        
        try {
            await messageInput.waitFor({ state: 'visible', timeout: 5000 });
            return await messageInput.isEnabled();
        } catch {
            return false;
        }
    }

    /**
     * Send a message to the chatbot
     * @param question The question/message to send
     */
    async sendMessage(question: string): Promise<void> {
        // Find and fill the message input
        const messageInput = this.page.locator(
            'input[role="textbox"], textarea, [contenteditable="true"], [class*="input"]'
        ).first();
        
        await messageInput.fill(question);
        
        // Find and click send button
        const sendButton = this.page.locator(
            'button:has-text("Send"), button:has-text("Ask"), button[type="submit"], button svg.lucide-send'
        ).first();
        
        await sendButton.click();
        
        // Wait for response
        await this.page.waitForTimeout(2000);
    }

    /**
     * Send message via API directly
     * Task 5: Send multiple questions programmatically
     */
    async sendMessageViaAPI(question: string, documentId?: string): Promise<any> {
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });

        const payload: any = {
            message: question,
        };

        if (documentId) {
            payload.documentId = documentId;
        }

        const response = await apiContext.post('/api/chat', {
            data: payload,
        });

        expect(response.ok()).toBeTruthy();
        const result = await response.json();

        await apiContext.dispose();
        return result;
    }

    /**
     * Get latest chatbot response from UI
     */
    async getLatestResponse(): Promise<string> {
        // Get all chat messages
        const messages = this.page.locator(
            '[role="region"] [class*="message"], .chat-message, [class*="response"]'
        );
        
        const count = await messages.count();
        
        if (count > 0) {
            const lastMessage = messages.last();
            const text = await lastMessage.textContent();
            return text ? text.trim() : '';
        }
        
        return '';
    }

    /**
     * Get all chat messages from the conversation
     */
    async getAllMessages(): Promise<string[]> {
        const messages = this.page.locator(
            '[role="region"] [class*="message"], .chat-message, [class*="response"]'
        );
        
        const messageTexts: string[] = [];
        const count = await messages.count();

        for (let i = 0; i < count; i++) {
            const text = await messages.nth(i).textContent();
            if (text) {
                messageTexts.push(text.trim());
            }
        }

        return messageTexts;
    }

    /**
     * Get chat history via API
     * Task 7: Retrieve conversation history
     */
    async getChatHistoryViaAPI(): Promise<any[]> {
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });

        const response = await apiContext.get('/api/messages');
        expect(response.ok()).toBeTruthy();
        
        const messages = await response.json();

        await apiContext.dispose();
        return messages;
    }

    /**
     * Verify response contains expected keywords
     * Task 6: Basic response validation
     */
    async verifyResponseContainsKeywords(expectedKeywords: string[]): Promise<boolean> {
        const response = await this.getLatestResponse();
        
        return expectedKeywords.every(keyword => 
            response.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    /**
     * Ask multiple questions in sequence
     * Task 5: Ask 5+ questions
     */
    async askMultipleQuestions(questions: string[]): Promise<void> {
        for (const question of questions) {
            await this.sendMessage(question);
            await this.page.waitForTimeout(3000); // Wait for response
        }
    }

    /**
     * Ask multiple questions via API
     * Task 5: Programmatic questioning
     */
    async askMultipleQuestionsViaAPI(questions: string[]): Promise<any[]> {
        const responses: any[] = [];

        for (const question of questions) {
            const response = await this.sendMessageViaAPI(question);
            responses.push(response);
        }

        return responses;
    }

    /**
     * Verify chat is visible and functional
     */
    async isChatFunctional(): Promise<boolean> {
        const isLoaded = await this.verifyChatInterfaceLoads();
        const isReady = await this.verifyChatIsReadyForInput();
        
        return isLoaded && isReady;
    }

    /**
     * Clear chat history (if available in UI)
     */
    async clearChatHistory(): Promise<void> {
        const clearButton = this.page.locator(
            'button:has-text("Clear"), button:has-text("Reset"), button:has-text("New Chat")'
        ).first();
        
        if (await clearButton.count() > 0) {
            await clearButton.click();
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Get message count from conversation
     */
    async getMessageCount(): Promise<number> {
        const messages = this.page.locator(
            '[role="region"] [class*="message"], .chat-message, [class*="response"]'
        );
        
        return await messages.count();
    }

    /**
     * Wait for AI response (with timeout)
     * Task 6: Wait for response generation
     */
    async waitForAIResponse(timeout: number = 15000): Promise<boolean> {
        const initialCount = await this.getMessageCount();
        let elapsedTime = 0;
        
        while (elapsedTime < timeout) {
            const currentCount = await this.getMessageCount();
            
            if (currentCount > initialCount) {
                return true;
            }
            
            await this.page.waitForTimeout(500);
            elapsedTime += 500;
        }
        
        return false;
    }

    /**
     * Verify chat handles non-document questions gracefully
     * Task 6: Test irrelevant questions
     */
    async verifyIrrelevantQuestionHandling(irrelevantQuestion: string): Promise<string> {
        await this.sendMessage(irrelevantQuestion);
        await this.waitForAIResponse(15000);
        
        const response = await this.getLatestResponse();
        return response;
    }
}
