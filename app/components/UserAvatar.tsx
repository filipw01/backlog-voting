import React from "react";
import { User } from "@prisma/client";
import { Avatar, Tooltip } from "@chakra-ui/react";

interface Props {
  user: User;
}

export const UserAvatar = ({ user }: Props) => {
  return (
    <Tooltip placement="top" offset={[0, 4]} label={user.email}>
      <Avatar size="xs" name={user.name} src={user.picture} />
    </Tooltip>
  );
};
