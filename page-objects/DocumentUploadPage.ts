import { Page } from "playwright";
import { expect, request } from "@playwright/test";

export class DocumentUploadPage {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    /**
     * Uploads a supported single file via UI
     * @param filePath Enter the file path
     * @param fileName Optional file name (extracted from path if not provided)
     */
    async uploadSingleFile(filePath: string, fileName?: string) {
        // Set the file input
        await this.page.locator('input[type="file"]#file-input-compact').setInputFiles(filePath);
        
        // Wait for the success toast to appear
        await this.page.locator('li[data-state="open"]').first().waitFor({ state: 'visible', timeout: 5000 });
        
        // Wait for toast to settle
        await this.page.waitForTimeout(1000);
    }

    /**
     * Uploads multiple supported files sequentially via UI
     * @param filePaths Array of file paths
     * @param fileNames Optional array of file names
     */
    async uploadMultipleFiles(filePaths: string[], fileNames?: string[]) {
        for (let i = 0; i < filePaths.length; i++) {
            // Set the file input using the file path
            await this.page.locator('input[type="file"]#file-input-compact').setInputFiles(filePaths[i]);

            // Wait for the success toast to appear
            await this.page.locator('li[data-state="open"]').first().waitFor({ state: 'visible', timeout: 5000 });
            
            // Wait for toast to settle
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Verifies if files were uploaded successfully via API
     * @param fileNames Optional array of specific file names to verify. If not provided, checks that at least one document exists.
     */
    async verifyFileUploadedSuccessfully(fileNames?: string[]) {
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });

        const response = await apiContext.get('/api/documents');
        expect(response.ok()).toBeTruthy();
        const documents = await response.json();
        
        if (fileNames && fileNames.length > 0) {
            for (let i = 0; i < fileNames.length; i++) {
                const uploadedDocument = documents.find((doc: any) => doc.originalName === fileNames[i]);
                expect(uploadedDocument).toBeDefined();
            }
        } else {
            // If no specific file names provided, just verify at least one document exists
            expect(documents.length).toBeGreaterThan(0);
        }

        await apiContext.dispose();
    }

    /**
     * Uploads an unsupported single file and expects it to fail
     * @param filePath Enter the file path
     */
    async uploadUnsupportedFile(filePath: string) {
        // Try to set the file - it might be blocked by accept attribute
        try {
            await this.page.locator('input[type="file"]#file-input-compact').setInputFiles(filePath, { timeout: 5000 });
        } catch (error) {
            // Expected - file type not supported
            console.log('File upload blocked as expected for unsupported file type');
        }
    }

    /**
     * Deletes all uploaded files
     */
    async deleteAllFiles() {
        // Find all delete buttons (× icons in document items)
        const deleteButtons = this.page.locator('button').filter({ 
            has: this.page.locator('text=×') 
        });
        
        let count = await deleteButtons.count();
        
        // Delete all files one by one
        while (count > 0) {
            const firstButton = deleteButtons.first();
            await expect(firstButton).toBeVisible();
            await firstButton.click();
            await this.page.waitForTimeout(500);
            count = await deleteButtons.count();
        }
    }

    /**
     * Clears all documents via the clear all button (trash icon)
     */
    async clearAllDocuments() {
        // Click the trash/clear all button
        const clearButton = this.page.locator('button svg.lucide-trash2').locator('..');
        
        if (await clearButton.count() > 0) {
            await expect(clearButton.first()).toBeVisible();
            await clearButton.first().click();
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Gets the count of uploaded documents from the UI
     */
    async getUploadedDocumentCount(): Promise<number> {
        const documentItems = this.page.locator('span.truncate.max-w-\\[120px\\]');
        return await documentItems.count();
    }

    /**
     * Gets the list of uploaded documents from the UI
     */
    async getUploadedDocumentNames(): Promise<string[]> {
        const documentItems = this.page.locator('span.truncate.max-w-\\[120px\\]');
        const names: string[] = [];
        const count = await documentItems.count();

        for (let i = 0; i < count; i++) {
            const text = await documentItems.nth(i).textContent();
            if (text) {
                names.push(text.trim());
            }
        }

        return names;
    }

    /**
     * Verifies document appears in the list
     */
    async isDocumentInList(fileName: string): Promise<boolean> {
        const documentSpan = this.page.locator(`span.truncate:has-text("${fileName}")`);
        return await documentSpan.count() > 0;
    }

    /**
     * Gets document count from API
     */
    async getDocumentCountViaAPI(): Promise<number> {
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });

        const response = await apiContext.get('/api/documents');
        expect(response.ok()).toBeTruthy();
        const documents = await response.json();

        await apiContext.dispose();
        return documents.length;
    }

    /**
     * Gets all documents from API
     */
    async getDocumentsViaAPI(): Promise<any[]> {
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });

        const response = await apiContext.get('/api/documents');
        expect(response.ok()).toBeTruthy();
        const documents = await response.json();

        await apiContext.dispose();
        return documents;
    }

    /**
     * Uploads a file directly via API
     */
    async uploadFileViaAPI(filePath: string) {
        const fs = require('fs');
        const path = require('path');
        
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);

        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });

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
    }

    /**
     * Clears all documents via API
     */
    async clearAllDocumentsViaAPI() {
        const apiContext = await request.newContext({
            baseURL: 'http://localhost:3000',
        });

        const response = await apiContext.delete('/api/documents');
        expect(response.ok()).toBeTruthy();

        await apiContext.dispose();
    }

    /**
     * Verifies all supported file types
     * @param pdPath Optional PDF path
     * @param docPath Optional DOCX path
     * @param txtPath Optional TXT path
     */
    async verifySupportedFileTypes(pdPath?: string, docPath?: string, txtPath?: string) {
        if (txtPath) {
            await this.uploadSingleFile(txtPath);
        }
        
        if (pdPath) {
            await this.uploadSingleFile(pdPath);
        }
        
        if (docPath) {
            await this.uploadSingleFile(docPath);
        }

        // Verify files are in the list
        const documents = await this.getUploadedDocumentNames();
        expect(documents.length).toBeGreaterThan(0);
    }
}
