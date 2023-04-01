import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.status.create({ data: { name: "PENDING" } });
  await prisma.status.create({ data: { name: "COMPLETE" } });

  await prisma.list.create({
    data: {
      title: "Morning",
      owner: { connect: { email: "dantrain@gmail.com" } },
      items: {
        create: [
          { title: "Exercise" },
          { title: "Shower" },
          { title: "Breakfast" },
        ],
      },
    },
  });

  await prisma.list.create({
    data: {
      title: "Work",
      owner: { connect: { email: "dantrain@gmail.com" } },
      items: {
        create: [{ title: "Check calendar" }, { title: "Check email" }],
      },
    },
  });
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
