import { Avatar } from "@chakra-ui/react";
import React from "react";
import { User } from "~/components/UserProvider";

interface Props {
  user: User;
}

export const CurrentUserAvatar = ({ user }: Props) => {
  return <Avatar size="md" name={user.name} src={user.picture} />;
};
