import { test, expect } from '@playwright/test';

test.describe('选择功能测试套件', () => {
    test('has title and links to selection page', async ({ page }) => {
        // Store captured API requests (GET and POST)
        const capturedRequests: { url: string; method: string; postData?: any; response: any }[] = [];

        // Intercept all API requests (GET and POST)
        page.on('response', async response => {
            const request = response.request();
            const method = request.method();
            const url = request.url();

            // Only capture API requests (skip static resources)
            if (!url.includes('/api/')) return;

            let responseBody = null;
            try {
                responseBody = await response.json();
            } catch {
                try {
                    responseBody = await response.text();
                } catch {
                    responseBody = 'Unable to read response body';
                }
            }

            if (method === 'GET') {
                capturedRequests.push({
                    url: url,
                    method: method,
                    response: {
                        status: response.status(),
                        statusText: response.statusText(),
                        body: responseBody
                    }
                });
            } else if (method === 'POST') {
                let postData = null;
                try {
                    postData = request.postDataJSON();
                } catch {
                    postData = request.postData();
                }

                capturedRequests.push({
                    url: url,
                    method: method,
                    postData: postData,
                    response: {
                        status: response.status(),
                        statusText: response.statusText(),
                        body: responseBody
                    }
                });
            }
        });

        // Register dialog handler first
        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.dismiss();
        });

        await page.goto('/');

        // Expect a title "to contain" a substring.
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Next.js + PrimeReact');

        // Click the get started link.
        await page.getByRole('link', { name: 'Go to Selection' }).click();

        // Expects page to have a URL with the name of installation.
        await expect(page).toHaveURL(/.*selection/);

        await test.step('选择城市', async () => {
            // Click first dropdown and wait for panel to appear
            await page.locator('.p-dropdown').first().click();
            await page.waitForSelector('.p-dropdown-panel', { state: 'visible' });
            await page.locator('.p-dropdown-item').filter({ hasText: 'London' }).click();

            // Screenshot at end of step
            const screenshot = await page.screenshot();
            await test.info().attach('选择城市-截图', { body: screenshot, contentType: 'image/png' });
        });

        await test.step('保存设置', async () => {
            // Wait for button to be enabled and click save
            await page.waitForSelector('button:has-text("设置"):not([disabled])', { timeout: 5000 });
            await page.getByRole('button', { name: '设置' }).click();

            // Wait a bit for request to complete
            await page.waitForTimeout(500);

            // Screenshot at end of step
            const screenshot = await page.screenshot();
            await test.info().attach('保存设置-截图', { body: screenshot, contentType: 'image/png' });
        });

        // Attach captured POST requests to the report
        if (capturedRequests.length > 0) {
            await test.info().attach('POST请求记录', {
                body: JSON.stringify(capturedRequests, null, 2),
                contentType: 'application/json'
            });
        }

        // Attach JSON data to the report
        const testData = {
            testName: 'Selection Test',
            selectedCity: 'London',
            timestamp: new Date().toISOString(),
            environment: {
                browser: 'chromium',
                baseURL: 'http://localhost:3000'
            }
        };
        await test.info().attach('测试数据', {
            body: JSON.stringify(testData, null, 2),
            contentType: 'application/json'
        });
    });


    test('test2', async ({ page }) => {
        // Register dialog handler first
        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.dismiss();
        });

        await page.goto('/');

        // Expect a title "to contain" a substring.
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Next.js + PrimeReact');

        // Click the get started link.
        await page.getByRole('link', { name: 'Go to Selection' }).click();

        // Expects page to have a URL with the name of installation.
        await expect(page).toHaveURL(/.*selection/);
    });
});
