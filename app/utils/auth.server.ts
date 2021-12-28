import { LoginTicket, OAuth2Client } from "google-auth-library";
import { redirect } from "remix";
import { authCookie } from "~/cookies";

export const authenticateWithToken = async (token: string) => {
  const googleClient = new OAuth2Client({
    clientId: `${process.env.GOOGLE_CLIENT_ID}`,
  });
  let ticket: LoginTicket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: token,
    });
  } catch {
    throw redirect("/logout");
  }
  const payload = ticket.getPayload();
  if (payload?.hd !== "chilipiper.com") {
    throw new Error("You must log in using chilipiper account");
  }
  return payload;
};

export const checkTokenValidity = async (request: Request) => {
  try {
    const token = await authCookie.parse(request.headers.get("Cookie"));
    return await authenticateWithToken(token);
  } catch {
    throw redirect("/logout");
  }
};
