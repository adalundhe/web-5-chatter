import { test, expect, defineConfig } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';



const helpText = `
Web5 Chatter Help

Commands:
                    
    - clear: Clear terminal.
    - setname: Change display username.
    - whoami: Show current display username.
    - showdid: Show user DID.
    - whoishere: Show all currently active users.
    - dm <user> <message>: Send a DM to the specified user.
    - join <room>: Switch to or create a public room.
    - help: Show help.

To send a message to the current room (default), click the terminal, type, and press enter!

`

export default defineConfig({
    timeout: parseInt(process.env.TEST_TOTAL_TIMEOUT ?? "120000"),
});



test.describe.serial('Single User Messaging', () => {

    test.beforeAll(async () => {


        const client = new PrismaClient()
        await client.$connect()

        await client.user.deleteMany();
        await client.post.deleteMany();

    });

    test.beforeEach(async ({ page }) => {
            
        await page.goto(
            process.env.APP_URL ?? 'http://localhost:3000'
        )
     
    });

    
    test('User can open the application and see the terminal', async ({ page }) => {

    
        const terminalLocator = page.locator('.react-terminal-wrapper').first();
        await expect(terminalLocator).toBeVisible();
    
    });
    
    
    test('User can open the application and submit a message', async ({ page }) => {

        const terminalInputLocator = page.locator('.react-terminal-active-input').first();
        await terminalInputLocator.waitFor({
            state: "visible"
        });
    
        const inputText = faker.word.sample(10);
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        const messageLocator = page.getByText(inputText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();
    
    });
    
    
    test('User cannot submit an empty message', async ({ page }) => {
       
        const terminalInputLocator = page.locator('.react-terminal-active-input').first();
    
        const inputText = '        ';
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        const messageLocator = page.getByTestId('chatter-message-1');
    
        await expect(messageLocator).not.toBeVisible();
    
    });
    
    
    test('User can clear terminal after submitting a message', async ({ page }) => {
    
        const terminalInputLocator = page.locator('.react-terminal-active-input').first();

        const inputText = faker.word.sample(10);
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        let messageLocator = page.getByText(inputText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();
    
        const clearCommand = 'clear';
    
        await terminalInputLocator.type(clearCommand);
        await terminalInputLocator.press("Enter");
    
        messageLocator = page.getByText(helpText, {
            exact: false
        }).first();
    
        await expect(messageLocator).not.toBeVisible();
    });
    
    
    test('User can view and clear help message', async ({ page }) => {
    
        const terminalInputLocator = page.locator('.react-terminal-active-input').first();

        const helpText = "help";
    
        await terminalInputLocator.type(helpText);
        await terminalInputLocator.press("Enter");
    
        let messageLocator = page.getByText(helpText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();
    
        const clearCommand = 'clear';
    
        await terminalInputLocator.type(clearCommand);
        await terminalInputLocator.press("Enter");
    
        messageLocator = page.getByText(helpText, {
            exact: false
        }).first();
    
        await expect(messageLocator).not.toBeVisible();
    
    
    
    });

    test('User can submit long messages.', async ({
        page
    }) => {
       
        const terminalInputLocator = page.locator('.react-terminal-active-input').first();
    
        const inputText = faker.lorem.sentence(100);
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        const messageLocator = page.getByText(inputText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();

    });

})


