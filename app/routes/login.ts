import { ActionFunction, redirect } from "remix";
import { db } from "~/utils/db.server";
import { authenticateWithToken } from "~/utils/auth.server";
import { authCookie } from "~/cookies";

export const action: ActionFunction = async ({ request }) => {
  const token = await request.text();
  const { email, picture, name } = await authenticateWithToken(token);
  if (!email || !picture || !name) {
    throw new Error("Missing email on payload");
  }
  const user = await db.user.findFirst({ where: { email } });
  if (!user) {
    await db.user.create({ data: { email, picture, name } });
  }

  return new Response(JSON.stringify({ email, picture, name }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await authCookie.serialize(token),
    },
  });
};
