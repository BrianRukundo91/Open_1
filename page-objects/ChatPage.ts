import { Page, expect, request } from "@playwright/test";

export class ChatPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── UI Helpers

  /**
   * Verify the chat interface is visible and ready for input
   */
  async verifyChatIsReady(): Promise<void> {
    const messageInput = this.page.getByRole("textbox", {
      name: /Ask a question/i,
    });
    await expect(messageInput).toBeVisible({ timeout: 5000 });
    await expect(messageInput).toBeEnabled();
  }

  /**
   * Send a message to the chatbot
   */
  async sendMessage(question: string): Promise<void> {
    const closeButton = this.page.locator('[toast-close]');
    if (await closeButton.isVisible()) {
        await closeButton.click();
        await this.page.waitForSelector('[toast-close]', { state: 'hidden', timeout: 5000 });
    }

    const messageInput = this.page.getByRole('textbox', { name: /Ask a question/i });
    await messageInput.fill(question);
    await this.page.locator('[data-testid="send-button"]').click();
}

  /**
   * Wait for the latest AI response to appear in the DOM
   */
  async waitForAIResponse(timeout: number = 60000): Promise<void> {
    await this.page.waitForSelector('[data-testid="loading-indicator"]', {
      state: "visible",
      timeout: 10000,
    });
    await this.page.waitForSelector('[data-testid="loading-indicator"]', {
      state: "hidden",
      timeout,
    });
  }

  /**
   * Get the latest AI response text from the DOM
   */
  async getLatestResponseFromDOM(): Promise<string> {
    const aiMessages = this.page.locator("div.rounded-2xl.px-4.py-3.bg-card");
    const count = await aiMessages.count();
    return (
      (await aiMessages
        .nth(count - 1)
        .locator("p")
        .textContent()) || ""
    );
  }

  /**
   * Get total number of message bubbles in the conversation
   */
  async getMessageCount(): Promise<number> {
    return await this.page.locator("div.rounded-2xl.px-4.py-3").count();
  }

  // ── API Helpers

  /**
   * Get all messages from chat history via API
   */
  async getChatHistoryViaAPI(): Promise<any[]> {
    const apiContext = await request.newContext({
      baseURL: "http://localhost:3000",
    });
    const response = await apiContext.get("/api/messages");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    await apiContext.dispose();
    return Array.isArray(data.messages) ? data.messages : [];
  }

  /**
   * Get the latest AI message content via API
   */
  async getLatestAIResponseViaAPI(): Promise<string> {
    const messages = await this.getChatHistoryViaAPI();
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "ai" || messages[i].role === "assistant") {
        return messages[i].content || "";
      }
    }
    return "";
  }

  /**
   * Get uploaded documents via API
   */
  async getDocumentsViaAPI(): Promise<any[]> {
    const response = await this.page.request.get(
      "http://localhost:3000/api/documents",
    );
    const data: any = await response.json();
    return data.documents || [];
  }

  /**
   * Clear all documents via API
   */
  async clearAllDocumentsViaAPI(): Promise<void> {
    await this.page.request.delete("http://localhost:3000/api/documents");
  }

  /**
   * Verify at least one document is uploaded via API
   */
  async verifyDocumentUploaded(): Promise<void> {
    const docs = await this.getDocumentsViaAPI();
    expect(docs.length).toBeGreaterThan(0);
  }

  // ── High-Level Actions

  /**
   * Ask a single question and assert the response contains expected text
   */
  async askSingleQuestion(
    question: string,
    expectedAnswer: string,
  ): Promise<void> {
    await this.sendMessage(question);
    await this.waitForAIResponse();
    expect(await this.getLatestResponseFromDOM()).toContain(expectedAnswer);
  }

  /**
   * Ask multiple questions and assert each response (soft assertions)
   */
  async askMultipleQuestions(questionsAndAnswers: Array<{ question: string; expected: string | RegExp }>): Promise<void> {
    for (const { question, expected } of questionsAndAnswers) {
      const beforeCount = await this.page
        .locator("div.rounded-2xl.px-4.py-3.bg-card")
        .count();

      await this.sendMessage(question);

      await this.page.waitForSelector('[data-testid="loading-indicator"]', {
        state: "visible",
        timeout: 10000,
      });

      await this.page.waitForSelector('[data-testid="loading-indicator"]', {
        state: "hidden",
        timeout: 60000,
      });

      await this.page.waitForFunction(
        (count) =>
          document.querySelectorAll("div.rounded-2xl.px-4.py-3.bg-card")
            .length > count,
        beforeCount,
        { timeout: 60000 },
      );

      expect.soft(await this.getLatestResponseFromDOM()).toMatch(expected);
    }
  }

  /**
   * Ask questions without assertions (for exploratory or concept questions)
   */
  async askQuestionsWithoutValidation(questions: string[]): Promise<void> {
    for (const question of questions) {
      await this.sendMessage(question);
      await this.waitForAIResponse();
    }
  }

  /**
   * Ask a question and wait for response without asserting content
   */
  async askQuestionAndWait(
    question: string,
    timeout: number = 10000,
  ): Promise<boolean> {
    await this.sendMessage(question);
    try {
      await this.waitForAIResponse(timeout);
      return true;
    } catch {
      return false;
    }
  }

  /**

    /**
 * Verify response contains all expected keywords via API
 */
 async verifyResponseContainsKeywords(expectedKeywords: string[]): Promise<void> {
    await this.page.waitForFunction(
        async () => {
            const response = await fetch('http://localhost:3000/api/messages');
            const data = await response.json();
            const messages = data.messages || [];
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].role === 'ai' || messages[i].role === 'assistant') {
                    return messages[i].content !== '';
                }
            }
            return false;
        },
        { timeout: 30000 }
    );
    const response = await this.getLatestAIResponseViaAPI();
    for (const keyword of expectedKeywords) {
        expect(response.toLowerCase()).toContain(keyword.toLowerCase());
    }
}

  /**
   * Setup: clear documents before each test
   */
  async setup(): Promise<void> {
    await this.clearAllDocumentsViaAPI();
  }
}
