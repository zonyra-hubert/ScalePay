"use client";

import { useEffect, useRef } from "react";
import JamPolls from "@jampolls/sdk";

export default function PollWidget() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const widget = JamPolls.embed(
      "XAO620UddYeGmhbBoM5cYkF643N3VsvW",
      ref.current,
      {
        theme: "auto",
        layout: "auto",
        vars: {
          "--jp-primary": "#FFA946",
          "--jp-radius": "22px",
          "--jp-option-radius": "16px",
          "max-width": "460px",
        },
        onVote: (event) => {
          if ("optionId" in event) {
            console.log("voted", event.optionId);
            return;
          }

          console.log("voted", event.optionIds);
        },
      },
    );

    return () => {
      widget?.destroy();
    };
  }, []);

  return <div ref={ref} className="w-full" />;
}
