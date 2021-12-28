import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seed() {
  await db.user.createMany({
    data: [
      {
        email: "filip@chilipiper.com",
        picture:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&q=80",
        name: "Filip Wachowiak",
      },
      {
        email: "danil@chilipiper.com",
        picture:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&q=80",
        name: "Danil",
      },
    ],
  });
  await Promise.all(
    getTags().map((tag) => {
      return db.tag.create({ data: tag });
    })
  );
  await Promise.all(
    getTasks().map((task) => {
      return db.task.create({
        data: task,
      });
    })
  );
}

seed();

function getTags() {
  return [{ name: "Tag" }, { name: "Perf" }];
}

function getTasks() {
  return [
    {
      name: "Rewrite integration",
      creatorEmail: "filip@chilipiper.com",
      description: "TaskComponent description",
    },
    {
      name: "Rewrite code",
      creatorEmail: "danil@chilipiper.com",
      description: "Code description",
    },
    {
      name: "Rewrite tests",
      creatorEmail: "filip@chilipiper.com",
      description: "Test description",
    },
  ];
}
