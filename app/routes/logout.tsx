import { useEffect } from "react";
import { useNavigate } from "remix";
import { useUser } from "~/components/UserProvider";

export default function Logout() {
  const { deleteUser } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    deleteUser();
    navigate("/login");
  }, []);
  return null;
}
