import { Page, expect, request } from "@playwright/test";
import fs from "fs";
import path from "path";

export class DocumentUploadPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ── UI Helpers 

    /**
     * Upload a single supported file via UI
     */
    async uploadSupportedSingleFile(filePath: string, fileName?: string): Promise<void> {
        const fileInput = this.page.locator('input[type="file"]').first();
        await fileInput.waitFor({ state: 'attached', timeout: 5000 });
        await fileInput.setInputFiles(filePath);
        await this.page.waitForTimeout(5000);
    }

    /**
     * Upload multiple supported files sequentially via UI
     */
    async uploadSupportedMultipleFiles(filePaths: string[], fileNames?: string[]): Promise<void> {
        for (const filePath of filePaths) {
            await this.uploadSupportedSingleFile(filePath);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Upload an unsupported file and expect it to fail gracefully
     */
    async uploadUnsupportedSingleFile(filePath: string): Promise<void> {
        try {
            const fileInput = this.page.locator('input[type="file"]').first();
            await fileInput.setInputFiles(filePath, { timeout: 5000 });
        } catch {
            console.log('File upload blocked as expected for unsupported file type');
        }
    }

    /**
     * Get uploaded document names from the UI
     */
    async getUploadedDocumentNames(): Promise<string[]> {
        const documentSpans = this.page.locator('div:has(> span.truncate) > span.truncate');
        const names: string[] = [];
        const count = await documentSpans.count();

        for (let i = 0; i < count; i++) {
            const text = await documentSpans.nth(i).textContent();
            if (text) names.push(text.trim());
        }

        return names;
    }

    /**
     * Get uploaded document count from the UI
     */
    async getUploadedDocumentCount(): Promise<number> {
        const spans = this.page.locator('span.font-medium');

        for (let i = 0; i < await spans.count(); i++) {
            const text = await spans.nth(i).textContent();
            if (text && /^\d+$/.test(text.trim())) {
                return parseInt(text.trim(), 10);
            }
        }

        return 0;
    }

    /**
     * Check if a specific document appears in the UI list
     */
    async isDocumentInList(fileName: string): Promise<boolean> {
        const names = await this.getUploadedDocumentNames();
        return names.some(name => name.includes(fileName) || fileName.includes(name.split('.')[0]));
    }

  /**
 * Delete all uploaded files via API
 */
async deleteAllFiles(): Promise<void> {
    await this.clearAllDocumentsAndWait();
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
}

    /**
     * Process all uploaded files via UI
     */
    async processAllUploadedFiles(): Promise<void> {
        const processButtons = this.page.locator('button:has-text("Process"), button:has-text("Submit"), button:has-text("Analyze")');
        const count = await processButtons.count();

        for (let i = 0; i < count; i++) {
            await processButtons.nth(i).click();
            await this.page.waitForTimeout(1000);
        }
    }

    // ── API Helpers 

    /**
     * Get all documents from API
     */
    async getDocumentsViaAPI(): Promise<any[]> {
        const apiContext = await request.newContext({ baseURL: 'http://localhost:3000' });
        const response = await apiContext.get('/api/documents');
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        await apiContext.dispose();
        return data.documents || [];
    }

    /**
     * Get document count from API
     */
    async getDocumentCountViaAPI(): Promise<number> {
        const documents = await this.getDocumentsViaAPI();
        return documents.length;
    }

    /**
     * Verify specific files are uploaded via API
     */
    async verifyIfFileUploadedSuccessfully(fileNames?: string[]): Promise<void> {
        const documents = await this.getDocumentsViaAPI();

        if (fileNames && fileNames.length > 0) {
            for (const fileName of fileNames) {
                const found = documents.find((doc: any) => doc.name === fileName);
                expect(found).toBeDefined();
            }
        } else {
            expect(documents.length).toBeGreaterThan(0);
        }
    }

    /**
     * Upload a file directly via API
     */
    async uploadFileViaAPI(filePath: string): Promise<void> {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);

        const apiContext = await request.newContext({ baseURL: 'http://localhost:3000' });
        const response = await apiContext.post('/api/upload', {
            multipart: {
                file: {
                    name: fileName,
                    mimeType: 'application/octet-stream',
                    buffer: fileBuffer,
                },
            },
        });

        expect(response.ok()).toBeTruthy();
        await apiContext.dispose();

        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Delete a specific document by ID via API
     */
    async deleteDocumentByIdViaAPI(documentId: string): Promise<number> {
        const apiContext = await request.newContext({ baseURL: 'http://localhost:3000' });
        const response = await apiContext.delete(`/api/documents/${documentId}`);
        await apiContext.dispose();
        return response.status();
    }

    /**
     * Clear all documents via API
     */
    async clearAllDocumentsViaAPI(): Promise<void> {
        const apiContext = await request.newContext({ baseURL: 'http://localhost:3000' });
        const response = await apiContext.delete('/api/documents');
        expect(response.ok()).toBeTruthy();
        await apiContext.dispose();
    }

    /**
     * Clear all documents and wait until server confirms 0 documents
     */
    async clearAllDocumentsAndWait(): Promise<void> {
        await this.clearAllDocumentsViaAPI();

        let attempts = 0;
        while (attempts < 10) {
            const count = await this.getDocumentCountViaAPI();
            if (count === 0) return;
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        throw new Error('Documents did not clear after 5 seconds');
    }

    /**
     * Verify supported file types by uploading each and checking the list
     */
    async verifySupportedFileTypes(txtPath?: string, pdfPath?: string, docxPath?: string): Promise<void> {
        if (txtPath) await this.uploadSupportedSingleFile(txtPath);
        if (pdfPath) await this.uploadSupportedSingleFile(pdfPath);
        if (docxPath) await this.uploadSupportedSingleFile(docxPath);

        const documents = await this.getUploadedDocumentNames();
        expect(documents.length).toBeGreaterThan(0);
    }
}