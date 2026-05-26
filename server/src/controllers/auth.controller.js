import { env } from "../config/env.js";
import { createAccount, authenticate } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { publicUser } from "../utils/presenters.js";
import { authCookieOptions, clearAuthCookieOptions, signToken } from "../utils/token.js";

const attachSession = (res, user) => {
  res.cookie(env.COOKIE_NAME, signToken(user.id), authCookieOptions);
};

export const register = asyncHandler(async (req, res) => {
  const user = await createAccount(req.body);
  attachSession(res, user);
  res.status(201).json({ user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authenticate(req.body);
  attachSession(res, user);
  res.json({ user: publicUser(user) });
});

export const logout = (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, clearAuthCookieOptions);
  res.status(204).send();
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });
