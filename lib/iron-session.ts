// lib/iron-session.ts
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const withSessionApi = (handler: any) => withIronSessionApiRoute(handler, sessionOptions);
export const withSessionSsr = (handler: any) => withIronSessionSsr(handler, sessionOptions);
