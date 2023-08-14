import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';


test.describe.serial('Single User Room Managment', () => {


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
    
    
    test('User can view default room', async ({ page }) => {
    
        const defaultRoomName = 'default';
    
        const terminalInputLocator = page.locator('.react-terminal-active-input').first();
        await terminalInputLocator.waitFor({
            state: "visible"
        });
    
        const inputText = "whereami";
        const whereamiCommandText = "Current room:";
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        const messageLocator = page.getByText(whereamiCommandText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();
    
        const initialRoomName = await messageLocator.textContent();
        const roomName = initialRoomName?.split(" ").at(2);
        expect(roomName).toEqual(defaultRoomName);
    
    });
    
    
    test('User can create new room', async ({ page }) => {
    
    
        const terminalInputLocator = page.locator('.react-terminal-active-input').first();
    
        const updatedRoomName = faker.word.sample(10);
        const whereamiCommandText = "Current room:";
        let inputText = `join ${updatedRoomName}`;
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        inputText = 'whereami';
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        const updatedMessageLocator = page.getByText(whereamiCommandText, {
            exact: false
        }).first();
        
        await expect(updatedMessageLocator).toBeVisible();
    
        const updatedRoomText = await updatedMessageLocator.textContent();
        const updatedRoom = updatedRoomText?.split(" ").at(2);
        expect(updatedRoom).toEqual(updatedRoomName);    
    
    });
    
    
    test('User messages from previous room do not show in new room', async ({ page }) => {
    
        const terminalInputLocator = page.locator('.react-terminal-active-input').first();
        
        let inputText = 'join default';
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        const messageText = faker.word.sample(10);
    
        await terminalInputLocator.type(messageText);
        await terminalInputLocator.press("Enter");
    
        const messageLocator = page.getByText(messageText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();
    
        inputText = `join ${faker.word.sample(10)}`;
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");
    
        await expect(messageLocator).toHaveCount(0);
    
    });
    
    
    test('User messages show when switching back to previous room', async ({ page }) => {

        let inputText = 'join default';

        const terminalInputLocator = page.locator('.react-terminal-active-input').first();

        const messageText = faker.word.sample(10);
    
        await terminalInputLocator.type(messageText);
        await terminalInputLocator.press("Enter");


        let messageLocator = page.getByText(messageText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();

        inputText = `join ${faker.word.sample(10)}`;
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");

        messageLocator = page.getByText(messageText, {
            exact: false
        }).first();

        await expect(messageLocator).toHaveCount(0);

        inputText = 'join default';
    
        await terminalInputLocator.type(inputText);
        await terminalInputLocator.press("Enter");

        messageLocator = page.getByText(messageText, {
            exact: false
        }).first();
    
        await expect(messageLocator).toBeVisible();
    
    });

});


