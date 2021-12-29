import {
  ActionFunction,
  LoaderFunction,
  NavLink,
  Outlet,
  useLoaderData,
} from "remix";
import type { TagsOnTasks, Task, User } from "@prisma/client";
import { db } from "~/utils/db.server";
import { TaskComponent } from "~/components/TaskComponent";
import { useUser } from "~/components/UserProvider";
import { CurrentUserAvatar } from "~/components/CurrentUserAvatar";
import { Box, Button, Flex, Link, Stack } from "@chakra-ui/react";
import { checkTokenValidity } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const { email } = await checkTokenValidity(request);
  const form = await request.formData();
  const newUpvoted = form.get("upvoted");
  const taskId = form.get("taskId");
  if (
    typeof taskId !== "string" ||
    typeof newUpvoted !== "string" ||
    typeof email !== "string"
  ) {
    throw new Error(`Form not submitted correctly.`);
  }
  try {
    if (newUpvoted === "true") {
      await db.task.update({
        where: { id: taskId },
        data: {
          voters: {
            create: {
              voterEmail: email,
            },
          },
        },
      });
    } else {
      await db.task.update({
        where: { id: taskId },
        data: {
          voters: {
            delete: {
              voterEmail_taskId: {
                taskId: taskId,
                voterEmail: email,
              },
            },
          },
        },
      });
    }
  } catch {}
  return {};
};

type LoaderData = {
  tasks: Array<
    Task & {
      creator: User;
      assignee: User | null;
      voters: { voterEmail: string }[];
      tags: TagsOnTasks[];
    }
  >;
};
export const loader: LoaderFunction = async ({ request }) => {
  await checkTokenValidity(request);
  const data: LoaderData = {
    tasks: await db.task.findMany({
      orderBy: { createdAt: "desc" },
      include: { creator: true, assignee: true, voters: true, tags: true },
    }),
  };
  return data;
};

export default function Tasks() {
  const data = useLoaderData<LoaderData>();
  const sortedPendingTasks = data.tasks
    .filter((task) => !task.completed)
    .sort((taskA, taskB) => taskB.voters.length - taskA.voters.length);
  const sortedCompletedTasks = data.tasks
    .filter((task) => task.completed)
    .sort((taskA, taskB) => taskB.voters.length - taskA.voters.length);

  const { user } = useUser();
  return (
    <>
      <Outlet />
      <Box p={4} maxWidth="container.lg" mx="auto">
        <Flex pb={4} justifyContent="space-between" alignItems="center">
          <CurrentUserAvatar user={user} />
          <Flex alignItems="center">
            <Link textDecoration="underline" mr={4} as={NavLink} to="/tags">
              Tags
            </Link>
            <NavLink to="/tasks/add-new">
              <Button as="div">Add new task</Button>
            </NavLink>
          </Flex>
        </Flex>
        <Stack spacing={3} maxWidth="container.md" mx="auto" pt={3} pl={3}>
          {sortedPendingTasks.map((task) => (
            <TaskComponent
              tags={task.tags}
              key={task.id}
              task={task}
              author={task.creator}
              assignee={task.assignee}
              upvoters={task.voters}
            />
          ))}
          {sortedCompletedTasks.map((task) => (
            <TaskComponent
              tags={task.tags}
              key={task.id}
              task={task}
              author={task.creator}
              assignee={task.assignee}
              upvoters={task.voters}
            />
          ))}
        </Stack>
      </Box>
    </>
  );
}
