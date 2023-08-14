import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';


test.describe.serial(() => {

    let browser: Browser;
    let firstUserPage: Page;
    let secondUserPage: Page;
    let thirdUserPage: Page;
    let firstUserName: string;
    let secondUserName: string;
    let thirdUserName: string;

    test.beforeAll(async () => {

        const client = new PrismaClient()
        await client.$connect()

        await client.user.deleteMany();
        await client.post.deleteMany();

        browser = await chromium.launch();

        const firstUserContext = await browser.newContext();
        const secondUserContext = await browser.newContext();
        const thirdUserContext = await browser.newContext();

        firstUserPage = await firstUserContext.newPage();
        secondUserPage = await secondUserContext.newPage();
        thirdUserPage = await thirdUserContext.newPage();

    });

    test.beforeEach(async () => {

        const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';

        await firstUserPage.goto(applicationUrl);
        await secondUserPage.goto(applicationUrl);
        await thirdUserPage.goto(applicationUrl);

    });

    test.afterAll(async () => {


        await browser.close()

    });


    test('More than two users can open application.', async () => {

        const inputText = "whoami";
        const whoamiCommandText = "Username:";

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
    
        await firstUserTerminal.type(inputText);
        await firstUserTerminal.press("Enter");
    
        await secondUserTerminal.type(inputText);
        await secondUserTerminal.press("Enter");

        await thirdUserTerminal.type(inputText);
        await thirdUserTerminal.press("Enter");
    
        const firstUserMessageLocator = firstUserPage.getByText(whoamiCommandText, {
            exact: false
        }).first();
    
        await expect(firstUserMessageLocator).toBeVisible();
    
        const secondUserMessageLocator = secondUserPage.getByText(whoamiCommandText, {
            exact: false
        }).first();
    
        await expect(secondUserMessageLocator).toBeVisible();

        const thirdUserMessageLocator = thirdUserPage.getByText(whoamiCommandText, {
            exact: false
        }).first();
    
        await expect(thirdUserMessageLocator).toBeVisible();
    
        const firstUserNameText = await firstUserMessageLocator.textContent();
        firstUserName = firstUserNameText?.split(" ").at(1) as string;
    
    
        const secondUserNameText = await secondUserMessageLocator.textContent();
        secondUserName = secondUserNameText?.split(" ").at(1) as string;

        const thirdUserNameText = await thirdUserMessageLocator.textContent();
        thirdUserName = thirdUserNameText?.split(" ").at(1) as string;
    
    
        expect(firstUserName).not.toEqual(secondUserName);
        expect(firstUserName).not.toEqual(thirdUserName);
        expect(secondUserName).not.toEqual(thirdUserName);
    
    });


    test('Unmentioned users cannot see DMs.', async () => {
        
        const firstUserInputText = faker.word.sample(10);
        const secondUserInputText = faker.word.sample(10);
        const thirdUserInputText = faker.word.sample(10);

        const firstUserTerminal = firstUserPage.locator('.react-terminal-active-input').first();
        const secondUserTerminal = secondUserPage.locator('.react-terminal-active-input').first();
        const thirdUserTerminal = thirdUserPage.locator('.react-terminal-active-input').first();

        await firstUserTerminal.type(firstUserInputText);
        await firstUserTerminal.press("Enter");

        await secondUserPage.reload();
        await secondUserTerminal.waitFor({
            state: "visible"
        });

        let secondUserMessageLocator = secondUserPage.getByText(firstUserInputText, {
            exact: false
        }).first();
    
        await expect(secondUserMessageLocator).toBeVisible();

        await thirdUserPage.reload();
        await thirdUserTerminal.waitFor({
            state: "visible"
        });

        let thirdUserMessageLocator = thirdUserPage.getByText(firstUserInputText, {
            exact: false
        }).first();
    
        await expect(thirdUserMessageLocator).toBeVisible();
    
        await secondUserTerminal.type(secondUserInputText);
        await secondUserTerminal.press("Enter");

        await firstUserPage.reload();
        await firstUserTerminal.waitFor({
            state: "visible"
        });

        let firstUserMessageLocator = firstUserPage.getByText(secondUserInputText, {
            exact: false
        }).first();
    
        await expect(firstUserMessageLocator).toBeVisible();
    

        await thirdUserPage.reload();
        await thirdUserTerminal.waitFor({
            state: "visible"
        });

        thirdUserMessageLocator = thirdUserPage.getByText(secondUserInputText, {
            exact: false
        }).first();
    
        await expect(thirdUserMessageLocator).toBeVisible();
    
        await thirdUserTerminal.type(thirdUserInputText);
        await thirdUserTerminal.press("Enter");


        await firstUserPage.reload();
        await firstUserTerminal.waitFor({
            state: "visible"
        });
                
        firstUserMessageLocator = firstUserPage.getByText(thirdUserInputText, {
            exact: false
        }).first();
    
        await expect(firstUserMessageLocator).toBeVisible();

        await secondUserPage.reload();
        await secondUserTerminal.waitFor({
            state: "visible"
        });
        
        secondUserMessageLocator = secondUserPage.getByText(thirdUserInputText, {
            exact: false
        }).first();
    
        await expect(secondUserMessageLocator).toBeVisible();

        const firstUserMessage = faker.word.sample(10);

        const inputText = `dm ${secondUserName} ${firstUserMessage}`
        await firstUserTerminal.type(inputText);
        await firstUserTerminal.press("Enter");

        await secondUserPage.reload();
        await secondUserTerminal.waitFor({
            state: "visible"
        })

        secondUserMessageLocator = secondUserPage.getByText(firstUserMessage, {
            exact: false
        }).first();
    
        await expect(secondUserMessageLocator).toBeVisible();

        thirdUserMessageLocator = thirdUserPage.getByText(firstUserMessage, {
            exact: false
        }).first();
    
        await expect(thirdUserMessageLocator).not.toBeVisible();
    
    });

});
