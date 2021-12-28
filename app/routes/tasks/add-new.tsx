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
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { Tag } from "@prisma/client";
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
  const name = form.get("name");
  const description = form.get("description");
  if (typeof name !== "string" || typeof description !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  const fields = { name, description, creatorEmail: "filip@chilipiper.com" };

  await db.task.create({ data: fields });
  return redirect(`/tasks`);
};

type LoaderData = Array<Tag & { _count: { tasks: number } }>;

export const loader: LoaderFunction = async ({ request }) => {
  await checkTokenValidity(request);
  return db.tag.findMany({
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
};

export default function AddNew() {
  const tags = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const closeModal = () => {
    navigate("/tasks");
  };
  return (
    <Modal isOpen onClose={closeModal}>
      <ModalOverlay />
      <ModalContent p={7}>
        <Heading as="h2" size="lg" mb={4}>
          Add new task
        </Heading>
        <Form method="post">
          <Stack spacing={4}>
            <FormControl>
              <FormLabel htmlFor="name">Name:</FormLabel>
              <Input id="name" type="text" name="name" />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="description">Description:</FormLabel>
              <Textarea id="description" name="description" />
            </FormControl>
          </Stack>
          <Flex pt={3} flexWrap="wrap">
            {tags.map((tag) => {
              return (
                <Checkbox key={tag.name} name={`tag-${tag.name}`} mr={3} mb={3}>
                  {`${tag.name} (${tag._count.tasks})`}
                </Checkbox>
              );
            })}
          </Flex>
          <Button type="submit">Add</Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
