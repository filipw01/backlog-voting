import React, { useState } from "react";
import { Form } from "remix";
import { Box, Flex, Input, Tag } from "@chakra-ui/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import { Tag as TagType } from "@prisma/client";

interface Props {
  tag: TagType & { _count: { tasks: number } };
}

export const EditableTag = ({ tag }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const value = `${tag.name}`;
  return (
    <Tag>
      <Form method="post">
        <Flex alignItems="center">
          <Input
            size="xs"
            name="newName"
            readOnly={!isEditing}
            border={!isEditing ? "none" : undefined}
            defaultValue={value}
          />
          ({tag._count.tasks})
          <input type="hidden" name="actionType" value="EDIT_TAG" />
          <input type="hidden" name="name" value={tag.name} />
          <Box
            as="button"
            p={2}
            lineHeight={0}
            type={isEditing ? "button" : "submit"}
            onClick={() => setIsEditing((prevState) => !prevState)}
          >
            {isEditing ? <CheckIcon w={3} h={3} /> : <EditIcon w={3} h={3} />}
          </Box>
        </Flex>
      </Form>
      <Form method="post">
        <input type="hidden" name="actionType" value="DELETE_TAG" />
        <input type="hidden" name="name" value={tag.name} />
        <Box as="button" p={2} mr={-1} lineHeight={0}>
          <CloseIcon w={2} h={2} />
        </Box>
      </Form>
    </Tag>
  );
};
