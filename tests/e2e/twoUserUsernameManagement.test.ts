import { test, expect, chromium } from '@playwright/test';
import { faker } from '@faker-js/faker';
import exp from 'constants';


test('Users can see all users that have sent messages in a room', async () => {

    const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const firstUserBrowser = await chromium.launch();
    const secondUserBrowser = await chromium.launch();

    const firstUserContext = await firstUserBrowser.newContext();
    const secondUserContext = await secondUserBrowser.newContext();

    const firstUserPage = await firstUserContext.newPage();
    const secondUserPage = await secondUserContext.newPage();

    await firstUserPage.goto(applicationUrl);
    await secondUserPage.goto(applicationUrl);

    const firstUserTerminal = firstUserPage.locator('.react-terminal-active-input').first();
    await firstUserTerminal.waitFor({
        state: "visible"
    });

    const secondUserTerminal = secondUserPage.locator('.react-terminal-active-input').first();
    await secondUserTerminal.waitFor({
        state: "visible"
    });

    const userMessage = faker.word.sample(10);

    await firstUserTerminal.type(userMessage);
    await firstUserTerminal.press("Enter");

    let firstUserMessageLocator = firstUserPage.getByText(userMessage, {
        exact: false
    }).first();

    await expect(firstUserMessageLocator).toBeVisible();

    let secondUserMessageLocator = secondUserPage.getByText(userMessage, {
        exact: false
    }).first();


    await expect(secondUserMessageLocator).toBeVisible();

    let inputText = 'whoishere';
    
    await firstUserTerminal.type(inputText);
    await firstUserTerminal.press("Enter");

    await secondUserTerminal.type(inputText);
    await secondUserTerminal.press("Enter");

    const activeUsersText = "Active users include: ";

    const firstUserActiveText = await firstUserMessageLocator.textContent();
    const firstUserActive = firstUserActiveText?.replace(activeUsersText, '').split(", ");

    const secondUserActiveText = await secondUserMessageLocator.textContent();
    const secondUserActive = secondUserActiveText?.replace(activeUsersText, '').split(", ");

    expect(firstUserActive?.length).toEqual(secondUserActive?.length);


    await firstUserBrowser.close();
    await secondUserBrowser.close();


});

