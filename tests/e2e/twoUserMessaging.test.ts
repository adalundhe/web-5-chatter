import { test, expect, chromium } from '@playwright/test';
import { faker } from '@faker-js/faker';



test('Two users can open application.', async () => {

    const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const inputText = "whoami";
    const whoamiCommandText = "Username:";

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

    await firstUserTerminal.type(inputText);
    await firstUserTerminal.press("Enter");

    await secondUserTerminal.type(inputText);
    await secondUserTerminal.press("Enter");

    const firstUserMessageLocator = firstUserPage.getByText(whoamiCommandText, {
        exact: false
    }).first();

    await expect(firstUserMessageLocator).toBeVisible();

    const secondUserMessageLocator = secondUserPage.getByText(whoamiCommandText, {
        exact: false
    }).first();

    await expect(secondUserMessageLocator).toBeVisible();

    const firstUserNameText = await firstUserMessageLocator.textContent();
    const firstUserName = firstUserNameText?.split(" ").at(1);


    const secondUserNameText = await secondUserMessageLocator.textContent();
    const secondUserName = secondUserNameText?.split(" ").at(1);

    console.log(firstUserName, secondUserName)

    expect(firstUserName).not.toEqual(secondUserName);

    await firstUserBrowser.close()
    await secondUserBrowser.close();

});


test('Two users can see public messages.', async () => {

    const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const inputText = faker.word.sample(10);

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

    await firstUserTerminal.type(inputText);
    await firstUserTerminal.press("Enter");

    const firstUserMessageLocator = firstUserPage.getByText(inputText, {
        exact: false
    }).first();

    await expect(firstUserMessageLocator).toBeVisible();

    const secondUserMessageLocator = secondUserPage.getByText(inputText, {
        exact: false
    }).first();

    await expect(secondUserMessageLocator).toBeVisible();

    await firstUserBrowser.close()
    await secondUserBrowser.close();

});


test('Users can recieve private messages.', async () => {

    const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const secondUserName = 'david';
    let inputText = `setname ${secondUserName}`;

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

    await firstUserBrowser.close()
    await secondUserBrowser.close();

});


test('Users can view private messages at old name after updating name.', async () => {

    const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const secondUserName = 'david';
    let inputText = `setname ${secondUserName}`;

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

    const updatedSecondUserName = 'darcy';
    inputText = `setname ${updatedSecondUserName}`;

    await secondUserTerminal.type(inputText);
    await secondUserTerminal.press("Enter");
    
    inputText = "whoami"

    await secondUserTerminal.type(inputText);
    await secondUserTerminal.press("Enter");

    secondUserMessageLocator = secondUserPage.getByText(whoamiCommandText, {
        exact: false
    }).first();

    await expect(secondUserMessageLocator).toBeVisible();

    secondUserMessageLocator = secondUserPage.getByText(firstUserMessageText, {
        exact: false
    }).first();

    await expect(secondUserMessageLocator).toBeVisible();

    await firstUserBrowser.close()
    await secondUserBrowser.close();

});