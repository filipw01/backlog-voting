import { LoaderFunction, useLoaderData, useNavigate } from "remix";
import { useUser } from "~/components/UserProvider";
import GoogleLogin from "react-google-login";

interface LoaderData {
  clientId: string;
}

export const loader: LoaderFunction = async () => {
  return { clientId: process.env.GOOGLE_CLIENT_ID };
};

export default function Login() {
  const { clientId } = useLoaderData<LoaderData>();
  const { setUser } = useUser();
  const navigate = useNavigate();
  return (
    <GoogleLogin
      clientId={clientId}
      onSuccess={async (response) => {
        if ("accessToken" in response) {
          const res = await fetch("/login-action", {
            method: "POST",
            body: response.tokenId,
          });
          setUser(await res.json());
          navigate("/tasks");
        }
      }}
    />
  );
}
