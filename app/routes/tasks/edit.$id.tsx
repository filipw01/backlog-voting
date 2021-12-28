import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalContent,
  ModalOverlay,
  Select,
  Stack,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import { Tag, Task, User } from "@prisma/client";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from "remix";
import { db } from "~/utils/db.server";
import { checkTokenValidity } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  await checkTokenValidity(request);
  const form = await request.formData();
  const id = form.get("id");
  const actionType = form.get("actionType");
  if (typeof id !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }
  if (actionType === "DELETE_TASK") {
    await db.task.delete({ where: { id } });
    return redirect("/tasks");
  }
  const name = form.get("name");
  const description = form.get("description");
  const completed = form.get("completed");
  const assignee = form.get("assignee");
  const tags = form.getAll("tag");
  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    (typeof completed !== "string" && completed !== null) ||
    tags.some((tag) => typeof tag !== "string")
  ) {
    throw new Error(`Form not submitted correctly.`);
  }
  await db.task.update({
    where: { id },
    data: {
      name,
      description,
      completed:
        completed === null
          ? null
          : completed === "not completed"
          ? new Date(Date.now()).toISOString()
          : completed,
      tags: {
        connectOrCreate: (tags as string[]).map((tag) => ({
          create: {
            tagName: tag,
          },
          where: {
            tagName_taskId: {
              tagName: tag,
              taskId: id,
            },
          },
        })),
        deleteMany: {
          taskId: id,
          tagName: { notIn: tags as string[] },
        },
      },
      assigneeEmail: assignee as string,
    },
  });
  return redirect(`/tasks`);
};

type LoaderData = {
  task: Task & { assignee: User; tags: Array<{ tagName: string }> };
  tags: Array<Tag & { _count: { tasks: number } }>;
  users: Array<User>;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  await checkTokenValidity(request);
  const id = params.id;
  const task = await db.task.findFirst({
    where: { id },
    include: {
      assignee: true,
      tags: true,
    },
  });
  const tags = await db.tag.findMany({
    orderBy: [
      {
        tasks: {
          _count: "desc",
        },
      },
      {
        name: "asc",
      },
    ],
    include: { _count: { select: { tasks: true } } },
  });
  const users = await db.user.findMany();
  return {
    users,
    task,
    tags,
  };
};

export default function AddNew() {
  const { task, tags, users } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const closeModal = () => {
    navigate("/tasks");
  };
  return (
    <Modal isOpen onClose={closeModal}>
      <ModalOverlay />
      <ModalContent p={7}>
        <Heading as="h2" size="lg" mb={4}>
          Edit task
        </Heading>
        <Form method="post">
          <input type="hidden" name="id" value={task.id} />
          <Stack spacing={4}>
            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                type="text"
                name="name"
                defaultValue={task.name}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Textarea
                id="description"
                name="description"
                defaultValue={task.description}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="completed">Completed</FormLabel>
              <Switch
                id="completed"
                name="completed"
                value={(task.completed as unknown as string) ?? "not completed"}
                defaultChecked={Boolean(task.completed)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="assignee">Assignee</FormLabel>
              <Select
                id="assignee"
                name="assignee"
                defaultValue={task.assignee?.email}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Flex pt={3} flexWrap="wrap">
            {tags.map((tag) => {
              return (
                <Checkbox
                  key={tag.name}
                  value={tag.name}
                  name="tag"
                  mr={3}
                  mb={3}
                  defaultChecked={task.tags.some(
                    (activeTag) => activeTag.tagName === tag.name
                  )}
                >
                  {`${tag.name} (${tag._count.tasks})`}
                </Checkbox>
              );
            })}
          </Flex>
          <Flex justifyContent="space-between" mt={4}>
            <Form method="post">
              <input type="hidden" name="actionType" value="DELETE_TASK" />
              <input type="hidden" name="id" value={task.id} />
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
                type="submit"
              >
                Delete
              </Button>
            </Form>
            <Button type="submit">Save</Button>
          </Flex>
        </Form>
      </ModalContent>
    </Modal>
  );
}
