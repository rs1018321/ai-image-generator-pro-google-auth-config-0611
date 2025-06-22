import { ReactNode } from "react";
import { User } from "./user";

export interface ContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  showSignModal: boolean;
  setShowSignModal: (show: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  userCredits: number;
  setUserCredits: (credits: number | ((prev: number) => number)) => void;
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: (show: boolean) => void;
  pendingRedirect: string | null;
  setPendingRedirect: (url: string | null) => void;
}
