import { useNProgress } from "@tanem/react-nprogress";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const Progress = () => {
  const isLoading = useIsFetching() + useIsMutating() > 0;

  const [isAnimating, setIsAnimating] = useState(false);

  const [minProgress, setMinProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      setMaxProgress(0);
      setMinProgress(0);

      timeout = setTimeout(() => {
        setIsAnimating(true);
        setMaxProgress(1);
      }, 500);
    } else {
      setMinProgress(1);
      setIsAnimating(false);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating,
  });

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden"
      style={{
        opacity: isFinished ? 0 : 1,
        transition: `opacity ${animationDuration}ms linear`,
      }}
    >
      <div
        className="absolute left-0 z-50 h-[2px] w-full"
        style={{
          marginLeft: `${
            (-1 + Math.max(minProgress, Math.min(maxProgress, progress))) * 100
          }%`,
          transition: `margin-left ${animationDuration}ms linear`,
        }}
      >
        <div
          className="absolute right-0 h-full w-28 translate-x-[1px] translate-y-[-4px] rotate-3 bg-gray-100"
          style={{ boxShadow: "0 0 10px #f1f5f9, 0 0 5px #f1f5f9" }}
        />
        <div className="relative z-10 h-full w-full bg-gray-100"></div>
      </div>
    </div>
  );
};

export default Progress;
