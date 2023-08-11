
import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const generateUsers = ({
    count
}: {
    count: number
}): User[] => {

    return new Array(count).fill({}).map(() => {

        const exampleIonDid = faker.string.alphanumeric({
            length: 1250
        });

        return ({
            did: faker.helpers.fromRegExp(`did:ion:${exampleIonDid}`),
            username: faker.internet.displayName(),
            room: faker.word.sample(10),
            createdAt: new Date(),
            updatedAt: new Date()
        });
    });

}


export const createUsers = async (): Promise<User[]> => {
    const count = parseInt(process.env.TEST_DATA_ITEM_COUNT ?? '10')
    
    const users = generateUsers({
        count
    });

    for (const user of users){
        await prisma.user.upsert({
            where: {
                did: user.did,
            },
            create: user,
            update: {},
        });
    }

    return users;
}