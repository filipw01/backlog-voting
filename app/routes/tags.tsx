import { useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  NavLink,
  useLoaderData,
} from "remix";
import GoogleLogin from "react-google-login";
import { db } from "~/utils/db.server";
import { useUser } from "~/components/UserProvider";
import { CurrentUserAvatar } from "~/components/CurrentUserAvatar";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Link,
  VisuallyHidden,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Tag as TagType } from "@prisma/client";
import { EditableTag } from "~/components/EditableTag";
import { checkTokenValidity } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  await checkTokenValidity(request);
  const form = await request.formData();
  const actionType = form.get("actionType");
  const name = form.get("name");
  if (typeof name !== "string" || typeof actionType !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }
  if (actionType === "ADD_TAG") {
    await db.tag.create({ data: { name } });
  } else if (actionType === "EDIT_TAG") {
    const newName = form.get("newName");
    console.log(newName);
    if (typeof newName !== "string") {
      throw new Error(`Form not submitted correctly.`);
    }
    await db.tag.update({ where: { name }, data: { name: newName } });
  } else if (actionType === "DELETE_TAG") {
    await db.tag.delete({ where: { name } });
  }
  return {};
};

type LoaderData = {
  tags: Array<TagType & { _count: { tasks: number } }>;
};
export const loader: LoaderFunction = async ({ request }) => {
  await checkTokenValidity(request);
  const data: LoaderData = {
    tags: await db.tag.findMany({
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
    }),
  };
  return data;
};

export default function Tags() {
  const data = useLoaderData<LoaderData>();
  const { user } = useUser();
  return (
    <>
      <Box p={4} maxWidth="container.lg" mx="auto">
        <Flex pb={4} justifyContent="space-between" alignItems="center">
          <CurrentUserAvatar user={user} />
          <Flex alignItems="center">
            <Link textDecoration="underline" mr={4} as={NavLink} to="/tasks">
              Tasks
            </Link>
            <Form method="post">
              <Flex>
                <FormControl display="flex">
                  <input type="hidden" name="actionType" value="ADD_TAG" />
                  <VisuallyHidden>
                    <FormLabel htmlFor="name">New tag name</FormLabel>
                  </VisuallyHidden>
                  <Input
                    borderRightRadius={0}
                    id="name"
                    type="text"
                    name="name"
                  />
                </FormControl>
                <Button borderLeftRadius={0} type="submit">
                  Add tag
                </Button>
              </Flex>
            </Form>
          </Flex>
        </Flex>
        <Wrap
          flexWrap="wrap"
          spacing={3}
          maxWidth="container.md"
          mx="auto"
          pt={3}
          pl={3}
          alignItems="start"
        >
          {data.tags.map((tag) => (
            <WrapItem key={tag.name}>
              <EditableTag tag={tag} />
            </WrapItem>
          ))}
        </Wrap>
      </Box>
    </>
  );
}
