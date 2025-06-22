"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { cacheGet, cacheRemove } from "@/lib/cache";

import { CacheKey } from "@/services/constant";
import { ContextValue } from "@/types/context";
import { User } from "@/types/user";
import moment from "moment";
import useOneTapLogin from "@/hooks/useOneTapLogin";
import { useSession } from "next-auth/react";

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  if (
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
  ) {
    useOneTapLogin();
  }

  const { data: session } = useSession();

  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || "";
  });

  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);

  const fetchUserInfo = async function () {
    try {
      const resp = await fetch("/api/get-user-info", {
        method: "POST",
      });

      if (!resp.ok) {
        throw new Error("fetch user info failed with status: " + resp.status);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message);
      }

      setUser(data);
      if (data.credits) {
        setUserCredits(data.credits.left_credits);
      }

      updateInvite(data);
    } catch (e) {
      console.log("fetch user info failed");
      
      // 如果数据库不可用，直接使用session中的用户信息
      if (session && session.user) {
        const fallbackUser: User = {
          uuid: session.user.uuid || '',
          email: session.user.email || '',
          nickname: session.user.name || session.user.email?.split('@')[0] || '',
          avatar_url: session.user.image || '',
          created_at: new Date().toISOString(),
          signin_type: 'oauth',
          signin_provider: 'google',
          signin_openid: '',
          signin_ip: '',
          credits: {
            left_credits: 0,
            total_credits: 0,
            used_credits: 0,
            is_pro: false
          }
        };
        setUser(fallbackUser);
        setUserCredits(0);
        console.log("Using fallback user info from session:", fallbackUser);
      }
    }
  };

  const updateInvite = async (user: User) => {
    try {
      if (user.invited_by) {
        // user already been invited
        console.log("user already been invited", user.invited_by);
        return;
      }

      const inviteCode = cacheGet(CacheKey.InviteCode);
      if (!inviteCode) {
        // no invite code
        return;
      }

      const userCreatedAt = moment(user.created_at).unix();
      const currentTime = moment().unix();
      const timeDiff = Number(currentTime - userCreatedAt);

      if (timeDiff <= 0 || timeDiff > 7200) {
        // user created more than 2 hours
        console.log("user created more than 2 hours");
        return;
      }

      // update invite relation
      console.log("update invite", inviteCode, user.uuid);
      const req = {
        invite_code: inviteCode,
        user_uuid: user.uuid,
      };
      const resp = await fetch("/api/update-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });
      if (!resp.ok) {
        throw new Error("update invite failed with status: " + resp.status);
      }
      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message);
      }

      setUser(data);
      if (data.credits) {
        setUserCredits(data.credits.left_credits);
      }
      cacheRemove(CacheKey.InviteCode);
    } catch (e) {
      console.log("update invite failed: ", e);
    }
  };

  useEffect(() => {
    if (session && session.user) {
      fetchUserInfo();
    } else {
      // 当session为null时，重置用户状态
      setUser(null);
      setUserCredits(0);
      setPendingRedirect(null);
    }
  }, [session]);

  // 处理登录成功后的跳转
  useEffect(() => {
    if (user && pendingRedirect) {
      // 关闭登录模态框并清除pendingRedirect状态，因为NextAuth会通过callbackUrl处理跳转
      setShowSignModal(false);
      setPendingRedirect(null);
    }
  }, [user, pendingRedirect]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        showSignModal,
        setShowSignModal,
        user,
        setUser,
        userCredits,
        setUserCredits,
        showFeedback,
        setShowFeedback,
        showSubscriptionModal,
        setShowSubscriptionModal,
        pendingRedirect,
        setPendingRedirect,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
