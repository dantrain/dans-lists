import { PrismaClient } from "@prisma/client";
import { LexoRank } from "lexorank";

const prisma = new PrismaClient();

let rank = LexoRank.middle();

const getNextRank = () => {
  rank = rank.genNext();
  return rank.toString();
};

async function main() {
  await prisma.status.create({ data: { name: "PENDING" } });
  await prisma.status.create({ data: { name: "COMPLETE" } });
  await prisma.status.create({ data: { name: "SKIPPED" } });

  await prisma.list.create({
    data: {
      title: "Morning",
      owner: { connect: { email: "dantrain@gmail.com" } },
      rank: getNextRank(),
      items: {
        create: [
          { title: "Exercise", rank: getNextRank() },
          { title: "Shower", rank: getNextRank() },
          { title: "Breakfast", rank: getNextRank() },
        ],
      },
    },
  });

  await prisma.list.create({
    data: {
      title: "Work",
      owner: { connect: { email: "dantrain@gmail.com" } },
      rank: getNextRank(),
      items: {
        create: [
          { title: "Check calendar", rank: getNextRank() },
          { title: "Check email", rank: getNextRank() },
        ],
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
