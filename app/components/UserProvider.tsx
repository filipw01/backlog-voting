import { createContext, useContext, useEffect, useState } from "react";

export interface User {
  email: string;
  picture: string;
  name: string;
}

interface UserContextType {
  user?: User;
  deleteUser: () => void;
  setUser: (user: User) => void;
}

const userContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  useEffect(() => {
    const localStorageUser = window.localStorage.getItem("user");
    setUser(localStorageUser ? JSON.parse(localStorageUser) : undefined);
  }, []);
  const handleSetUser = (user: User) => {
    window.localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };
  const deleteUser = () => {
    window.localStorage.removeItem("user");
    setUser(undefined);
  };
  return (
    <userContext.Provider value={{ user, setUser: handleSetUser, deleteUser }}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) {
    throw new Error("used hook outside of UserProvider");
  }
  return context;
};
