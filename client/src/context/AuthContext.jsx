import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, post } from "../api/client";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api("/auth/me").then((data) => data.user),
    retry: false,
  });

  async function login(credentials) {
    const { user } = await post("/auth/login", credentials);
    queryClient.setQueryData(["session"], user);
    return user;
  }

  async function register(details) {
    const { user } = await post("/auth/register", details);
    queryClient.setQueryData(["session"], user);
    return user;
  }

  async function logout() {
    await post("/auth/logout", {});
    queryClient.clear();
    queryClient.setQueryData(["session"], null);
  }

  return <AuthContext.Provider value={{ user: session.data, loading: session.isLoading, login, register, logout }}>{children}</AuthContext.Provider>;
}
