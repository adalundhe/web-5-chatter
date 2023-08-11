import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {

    await page.goto(
        process.env.APP_URL ?? 'http://localhost:3000'
    )

});


const getKeyboard = () => {
    const keyboardCharacters: Record<string, number[]> = {};
    let keyboardCharacterNumbers: Array<string | number>[] = [];

    for (let idx=33; idx<127; idx++){

        let character = String.fromCharCode(idx);

        if (idx >= 97 && idx <= 122){

            const upperCaseCode = character.toUpperCase().charCodeAt(0);
            character = String.fromCharCode(upperCaseCode);
            keyboardCharacters[character]?.push(idx)

        } else {
            keyboardCharacters[character] = [
                idx
            ];

            keyboardCharacterNumbers.push([idx, character]);

        }

    }

    return {
        characters: keyboardCharacters,
        charNumbers: keyboardCharacterNumbers
    };
}

test('User can view and type on keyboard', async ({ page }) => {

    const keyboard = getKeyboard();

    const keyboardLocator = page.getByTestId('chatter-keyboard-container');
    await expect(keyboardLocator).toBeVisible();

    for (const [charNumber, character] of keyboard.charNumbers){
        let characterLocator = page.getByTestId(`chatter-keyboard-character-${charNumber}`)
        await expect(characterLocator).toBeVisible();

        await page.keyboard.press(character as string);

        characterLocator = page.getByTestId(`chatter-keyboard-character-${charNumber}-active`)
        await expect(characterLocator).toBeVisible();

    }


});