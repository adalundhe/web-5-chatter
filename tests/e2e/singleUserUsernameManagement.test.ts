import { test, expect } from '@playwright/test';
import { z } from 'zod'


test.beforeEach(async ({ page }) => {

    await page.goto(
        process.env.APP_URL ?? 'http://localhost:3000'
    )

});


test('User has initial uuidv4 username', async ({ page }) => {

    const terminalInputLocator = page.locator('.react-terminal-active-input').first();
    await terminalInputLocator.waitFor({
        state: "visible"
    });


    const inputText = "whoami";
    const whoamiCommandText = "Username:";

    await terminalInputLocator.type(inputText);
    await terminalInputLocator.press("Enter");

    const messageLocator = page.getByText(whoamiCommandText, {
        exact: false
    }).first();

    await expect(messageLocator).toBeVisible();

    const initialUsername = await messageLocator.textContent();
    const userUUID = initialUsername?.split(" ").at(1);
    expect(userUUID).not.toBe(undefined);
    
    const uuidSchema = z.string().uuid();
    const parsed = await uuidSchema.safeParseAsync(userUUID);
    expect(parsed.success).toBe(true);

});


test('User can update name', async ({ page }) => {

    const terminalInputLocator = page.locator('.react-terminal-active-input').first();
    await terminalInputLocator.waitFor({
        state: "visible"
    });


    const updatedUsername = 'ada';
    let inputText = `setname ${updatedUsername}`;


    await terminalInputLocator.type(inputText);
    await terminalInputLocator.press("Enter");
    
    inputText = "whoami"
    const whoamiCommandText = "Username:";

    await terminalInputLocator.type(inputText);
    await terminalInputLocator.press("Enter");

    const messageLocator = page.getByText(whoamiCommandText, {
        exact: false
    }).first();

    await expect(messageLocator).toBeVisible();

    const updatedUsernameText = await messageLocator.textContent();
    const username = updatedUsernameText?.split(" ").at(1);
    expect(username).toEqual(updatedUsername);

});


test('User name update retained after reload', async ({ page }) => {

    const terminalInputLocator = page.locator('.react-terminal-active-input').first();
    await terminalInputLocator.waitFor({
        state: "visible"
    });


    const updatedUsername = 'ada';
    let inputText = `setname ${updatedUsername}`;


    await terminalInputLocator.type(inputText);
    await terminalInputLocator.press("Enter");
    

    await page.reload();

    await terminalInputLocator.waitFor({
        state: "visible"
    });


    inputText = "whoami"
    const whoamiCommandText = "Username:";

    await terminalInputLocator.type(inputText);
    await terminalInputLocator.press("Enter");

    const messageLocator = page.getByText(whoamiCommandText, {
        exact: false
    }).first();

    await expect(messageLocator).toBeVisible();

    const updatedUsernameText = await messageLocator.textContent();
    const username = updatedUsernameText?.split(" ").at(1);
    expect(username).toEqual(updatedUsername);

});