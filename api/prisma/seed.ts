import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  const email = 'haydenbriese@gmail.com';
  if (!(await prisma.user.findUnique({ where: { email } }))) {
    await prisma.user.create({
      data: {
        email: 'haydenbriese@gmail.com',
        name: 'Hayden Briese',
        posts: {
          createMany: {
            data: [
              {
                title: 'Test post :)',
                content: 'This is a test post',
              },
              {
                title: 'Test post 2 :)',
                content: 'This is a test post',
              },
            ],
          },
        },
      },
    });
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
