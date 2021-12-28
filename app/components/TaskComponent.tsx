import React from "react";
import { Tag, TagsOnTasks, Task, User } from "@prisma/client";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { UserAvatar } from "./UserAvatar";
import { Form, NavLink } from "remix";
import { ChevronUpIcon } from "@chakra-ui/icons";
import { useUser } from "~/components/UserProvider";

interface Props {
  task: Task;
  author: User;
  assignee: User | null;
  tags: TagsOnTasks[];
  upvoters: { voterEmail: string }[];
}

export const TaskComponent = ({
  task,
  author,
  assignee,
  upvoters,
  tags,
}: Props) => {
  const { user } = useUser();
  const isUpvoted = upvoters.some(
    (upvoter) => upvoter.voterEmail === user?.email
  );
  return (
    <Flex
      opacity={task.completed ? "0.5" : undefined}
      py={4}
      px={6}
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      as="article"
      justifyContent="space-between"
    >
      <Flex>
        <Flex
          as={Form}
          method="post"
          borderRadius="lg"
          flexDirection="column"
          alignItems="center"
          bg="white"
          mr={3}
          mb={-1}
          ml={-10}
          alignSelf="center"
          transform="translateX(0.5px)"
        >
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="upvoted" value={String(!isUpvoted)} />
          <Button
            bg={isUpvoted ? "green.100" : undefined}
            _hover={{
              bg: isUpvoted ? "green.200" : undefined,
            }}
            type="submit"
            variant="outline"
            aria-label="Upvote"
            size="xs"
            py={3.5}
          >
            <ChevronUpIcon />
          </Button>
          <Tooltip
            placement="top"
            offset={[0, 4]}
            isDisabled={upvoters.length === 0}
            label={upvoters.map(({ voterEmail }) => (
              <React.Fragment key={voterEmail}>
                {voterEmail}
                <br />
              </React.Fragment>
            ))}
          >
            <Text py={1} fontSize="xs">
              {upvoters.length}
            </Text>
          </Tooltip>
        </Flex>
        <Box>
          <Flex>
            <Heading as="h2" size="md" mb={2}>
              {task.name}
            </Heading>
            <Text mx={2}>by</Text>
            <UserAvatar user={author} />
          </Flex>
          <Text>{task.description}</Text>
        </Box>
      </Flex>
      <Flex flexDirection="column" justifyContent="space-between">
        <Box>
          {assignee ? (
            <Flex alignItems="center" justifyContent="flex-end">
              <Text whiteSpace="nowrap" mx={2}>
                {task.completed ? "completed by" : "assigned to"}
              </Text>
              <UserAvatar user={assignee} />
            </Flex>
          ) : null}
        </Box>
        <Flex flexWrap="wrap" justifyContent="flex-end" my={1} mr={-1}>
          {tags.map((tag) => {
            return (
              <Badge m={1} key={tag.tagName}>
                {tag.tagName}
              </Badge>
            );
          })}
        </Flex>
        <Flex alignItems="center" flexWrap="wrap" justifyContent="flex-end">
          <Text textAlign="right" fontSize="xs" mx={2} whiteSpace="nowrap">
            {(task.createdAt as unknown as string).split("T")[0]}
          </Text>
          <NavLink to={`/tasks/edit/${task.id}`}>
            <Button as="div" size="xs">
              Edit
            </Button>
          </NavLink>
        </Flex>
      </Flex>
    </Flex>
  );
};
