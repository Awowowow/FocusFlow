import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, post } from "../api/client";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api("/auth/me").then((data) => data.user),
    retry: false,
  });

  const login = async (credentials) => {
    const { user } = await post("/auth/login", credentials);
    queryClient.setQueryData(["session"], user);
    return user;
  };

  const register = async (details) => {
    const { user } = await post("/auth/register", details);
    queryClient.setQueryData(["session"], user);
    return user;
  };

  const logout = async () => {
    await post("/auth/logout", {});
    queryClient.setQueryData(["session"], null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "session" });
  };

  return <AuthContext.Provider value={{ user: session.data, loading: session.isLoading, login, register, logout }}>{children}</AuthContext.Provider>;
};
