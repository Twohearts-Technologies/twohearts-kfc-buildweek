import { useEffect, useState } from "react";
import { defaultContent } from "../data/defaults";
import { deepMerge } from "../lib/deepMerge";
import type { SiteContent } from "../types/content";

export function useContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    fetch("/content.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        return res.json();
      })
      .then((data: unknown) => {
        if (
          data &&
          typeof data === "object" &&
          Object.keys(data as object).length > 0
        ) {
          const merged = deepMerge(
            defaultContent as unknown as Record<string, unknown>,
            data as Record<string, unknown>,
          ) as unknown as SiteContent;

          setContent((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
            return merged;
          });
        }
      })
      .catch(() => {
        // Fall back to bundled defaults so the page can still render in local dev.
      });
  }, []);

  return content;
}
