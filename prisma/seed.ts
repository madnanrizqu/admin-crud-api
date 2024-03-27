import 'dotenv/config';
import { PrismaClient, User, Post } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const createUserData = async (numOfUser: number) => {
  const keys = [...Array(numOfUser).keys()];

  return await Promise.all(
    keys.map(async (v) => {
      const customer: Omit<User, 'id'> = await {
        name: `John Doe ${v + 1}`,
        email: `johndoe${v + 1}@gmail.com`,
        password: await bcrypt.hash(`johndoe${v + 1}`, 12),
      };

      return customer;
    }),
  );
};

const createPostData = async (numOfProducts: number, users: Array<User>) => {
  const keys = [...Array(numOfProducts).keys()];

  return keys.map((v, index) => {
    const posts: Omit<Post, 'id'> = {
      title: `Post ${index + 1}`,
      published: false,
      authorId: users[Math.floor(Math.random() * users.length)].id,
      content: `Content ${index + 1} Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione mollitia nesciunt ducimus magnam?`,
    };

    return posts;
  });
};

async function main() {
  console.log('Start seeding database...');

  console.log('Deleting any lingering data...');
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();

  console.log('Seeding users...');
  const users = await createUserData(5);

  await prisma.user.createMany({
    data: users,
  });

  console.log('Seeding products...');
  const resUsers = await prisma.user.findMany();
  const posts = await createPostData(30, resUsers);
  await prisma.post.createMany({
    data: posts,
  });

  console.log(
    `Success! Seeded ${users.length + 1} users and ${posts.length} products`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
