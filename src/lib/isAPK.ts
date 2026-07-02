"use client";

import { useState, useEffect } from "react";

export function useIsAPK() {
  const [isAPK, setIsAPK] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator) {
      // Detect if user agent has our custom suffix "YosFitAPK"
      setIsAPK(window.navigator.userAgent.includes("YosFitAPK"));
    }
  }, []);

  return isAPK;
}
