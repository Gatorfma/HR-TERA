import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const targetId = hash.replace("#", "");
    const delays = [0, 300, 900];
    const timeouts: number[] = [];

    const scrollToHash = (behavior: ScrollBehavior) => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior, block: "start" });
      }
    };

    requestAnimationFrame(() => {
      delays.forEach((delay, index) => {
        const behavior = index === 0 ? "smooth" : "auto";
        timeouts.push(window.setTimeout(() => scrollToHash(behavior), delay));
      });
    });

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
