import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { isValidUuid, logPageView } from "@/lib/analytics";

const shouldTrackPath = (pathname: string) => {
  return !pathname.startsWith("/admin");
};

const AnalyticsTracker = () => {
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    const previousPath = lastPathRef.current;
    if (previousPath === path) return;

    lastPathRef.current = path;

    if (!shouldTrackPath(location.pathname)) {
      return;
    }

    const segments = location.pathname.split("/").filter(Boolean);
    const productId =
      segments[0] === "products" && isValidUuid(segments[1]) ? segments[1] : null;

    const referrer = previousPath ?? document.referrer ?? null;
    const metadata = location.hash ? { hash: location.hash } : null;

    void logPageView({
      path,
      productId,
      referrer,
      metadata,
    }).catch((error) => {
      console.error("Failed to log page view", error);
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default AnalyticsTracker;
