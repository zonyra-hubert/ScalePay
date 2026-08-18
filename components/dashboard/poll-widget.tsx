"use client";

import { useEffect, useRef } from "react";
import JamPolls from "@jampolls/sdk";

export default function PollWidget() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const widget = JamPolls.embed(
      "dviFtAItfilV5fTbkt8BMb8c5CFPg5Bh",
      ref.current,
      {
        theme: "auto",
        layout: "auto",
        vars: {
          "--jp-primary": "var(--foreground)",
          "--jp-radius": "8px",
          "--jp-option-radius": "6px",
          "max-width": "100%",
        },
        onVote: (event) => {
          if ("optionId" in event) {
            return;
          }
        },
      },
    );

    return () => {
      widget?.destroy();
    };
  }, []);

  return <div ref={ref} className="w-full text-xs" />;
}
