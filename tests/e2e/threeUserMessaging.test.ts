import { test, expect, chromium } from '@playwright/test';
import { faker } from '@faker-js/faker';



test('Users can recieve private messages without public seeing.', async () => {

    const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const secondUserName = 'david';
    let inputText = `setname ${secondUserName}`;

    const firstUserBrowser = await chromium.launch();
    const secondUserBrowser = await chromium.launch();
    const thirdUserBrowser = await chromium.launch();

    const firstUserContext = await firstUserBrowser.newContext();
    const secondUserContext = await secondUserBrowser.newContext();
    const thirdUserContext = await thirdUserBrowser.newContext();

    const firstUserPage = await firstUserContext.newPage();
    const secondUserPage = await secondUserContext.newPage();
    const thirdUserPage = await thirdUserContext.newPage();

    await firstUserPage.goto(applicationUrl);
    await secondUserPage.goto(applicationUrl);
    await thirdUserPage.goto(applicationUrl)

    const firstUserTerminal = firstUserPage.locator('.react-terminal-active-input').first();
    await firstUserTerminal.waitFor({
        state: "visible"
    });

    const secondUserTerminal = secondUserPage.locator('.react-terminal-active-input').first();
    await secondUserTerminal.waitFor({
        state: "visible"
    });

    const thirdUserTerminal = thirdUserPage.locator('.react-terminal-active-input').first();
    await thirdUserTerminal.waitFor({
        state: "visible"
    });

    await secondUserTerminal.type(inputText);
    await secondUserTerminal.press("Enter");
    
    inputText = "whoami"
    const whoamiCommandText = "Username:";

    await secondUserTerminal.type(inputText);
    await secondUserTerminal.press("Enter");

    let secondUserMessageLocator = secondUserPage.getByText(whoamiCommandText, {
        exact: false
    }).first();

    await expect(secondUserMessageLocator).toBeVisible();

    const firstUserMessageText = faker.word.sample(10);
    inputText = `dm david ${firstUserMessageText}`

    await firstUserTerminal.type(inputText);
    await firstUserTerminal.press("Enter");

    const firstUserMessageLocator = firstUserPage.getByText(firstUserMessageText, {
        exact: false
    }).first();

    await expect(firstUserMessageLocator).toBeVisible();

    secondUserMessageLocator = secondUserPage.getByText(firstUserMessageText, {
        exact: false
    }).first();

    await expect(secondUserMessageLocator).toBeVisible();

    const thirdUserMessageLocator = thirdUserPage.getByText(firstUserMessageText, {
        exact: false
    }).first();

    await expect(thirdUserMessageLocator).not.toBeVisible();

    await firstUserBrowser.close()
    await secondUserBrowser.close();

});