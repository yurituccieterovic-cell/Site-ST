import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userLogin?: string;
    userTier?: number;
    admVerified?: boolean;
    admPin?: string;
    admPinExpiry?: number;
    admPinUserId?: number;
  }
}
