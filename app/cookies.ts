import { createCookie } from "remix";

export const authCookie = createCookie("access_token", {
  httpOnly: true,
  sameSite: "strict",
  secure: true,
  maxAge: 60 * 60
});
