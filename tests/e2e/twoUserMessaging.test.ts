import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';


test.describe.serial(() => {

    let browser: Browser;
    let firstUserPage: Page;
    let secondUserPage: Page;
    let firstUserName: string;
    let secondUserName: string

    test.beforeAll(async () => {

        const client = new PrismaClient()
        await client.$connect()

        await client.user.deleteMany();
        await client.post.deleteMany();

        browser = await chromium.launch();

        const firstUserContext = await browser.newContext();
        const secondUserContext = await browser.newContext();

        firstUserPage = await firstUserContext.newPage();
        secondUserPage = await secondUserContext.newPage();

    });

    test.beforeEach(async () => {

        const applicationUrl = process.env.APP_URL ?? 'http://localhost:3000';
        await firstUserPage.goto(applicationUrl);
        await secondUserPage.goto(applicationUrl);

    });

    test.afterAll(async () => {


        await browser.close()

    });

    test('Two users can open application.', async () => {

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
        firstUserName = firstUserNameText?.split(" ").at(1) as string;
    
    
        const secondUserNameText = await secondUserMessageLocator.textContent();
        secondUserName = secondUserNameText?.split(" ").at(1) as string;
    
        expect(firstUserName).not.toEqual(secondUserName);
    
    });

    test('Two users can send and view public messages.', async () => {

        const inputText = faker.word.sample(10);
    
        const firstUserTerminal = firstUserPage.locator('.react-terminal-active-input').first();
  
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
    
    });

    test('Users can send and view public reply.', async () => {

        const firstUserTerminal = firstUserPage.locator('.react-terminal-active-input').first();
        const secondUserTerminal = secondUserPage.locator('.react-terminal-active-input').first();
 
        const secondUserMessage = faker.word.sample(10);
        
        await secondUserTerminal.type(secondUserMessage);
        await secondUserTerminal.press("Enter");

        const secondUserMessageLocator = secondUserPage.getByText(secondUserMessage, {
            exact: false
        }).first();
    
        await expect(secondUserMessageLocator).toBeVisible();

        await firstUserPage.reload()
        await firstUserTerminal.waitFor({
            state: "visible"
        })


        const firstUserMessageLocator = firstUserPage.getByText(secondUserMessage, {
            exact: false
        }).first();

        await expect(firstUserMessageLocator).toBeVisible();

    });

    test('Users can send and view private messages', async () => {

        const firstUserMessage = faker.word.sample(10);

        const firstUserTerminal = firstUserPage.locator('.react-terminal-active-input').first();
        const secondUserTerminal = secondUserPage.locator('.react-terminal-active-input').first();
        
        const inputText = `dm ${secondUserName} ${firstUserMessage}`
        await firstUserTerminal.type(inputText);
        await firstUserTerminal.press("Enter");

        await secondUserPage.reload();
        await secondUserTerminal.waitFor({
            state: "visible"
        })

        const secondUserMessageLocator = secondUserPage.getByText(firstUserMessage, {
            exact: false
        }).first();
    
        await expect(secondUserMessageLocator).toBeVisible();

    });

    test('Users can view private messages after updating name.', async () => {

        const updatedUserName = faker.word.sample(10);
        const firstUserMessage = faker.word.sample(10);

        const firstUserTerminal = firstUserPage.locator('.react-terminal-active-input').first();
        const secondUserTerminal = secondUserPage.locator('.react-terminal-active-input').first();
        
        let inputText = `setname ${updatedUserName}`
        await secondUserTerminal.type(inputText);
        await secondUserTerminal.press("Enter");

        const secondUserMessage = faker.word.sample(10);
        
        await secondUserTerminal.type(secondUserMessage);
        await secondUserTerminal.press("Enter");


        inputText = `dm ${secondUserName} ${firstUserMessage}`
        await firstUserTerminal.type(inputText);
        await firstUserTerminal.press("Enter");

        await secondUserPage.reload();
        await secondUserTerminal.waitFor({
            state: "visible"
        })

        const secondUserMessageLocator = secondUserPage.getByText(firstUserMessage, {
            exact: false
        }).first();
    
        await expect(secondUserMessageLocator).toBeVisible();

    });
    


});
