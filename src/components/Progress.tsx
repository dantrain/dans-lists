import { useNProgress } from "@tanem/react-nprogress";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import {
  type RefObject,
  createRef,
  forwardRef, useEffect, useRef, useState
} from "react";
import {
  Transition,
  TransitionGroup,
  type TransitionStatus,
} from "react-transition-group";

const Bar = forwardRef<HTMLDivElement, { state: TransitionStatus }>(
  ({ state }, ref) => {
    const { animationDuration, isFinished, progress } = useNProgress({
      isAnimating: state === "entered",
    });

    return (
      <div
        className="absolute left-0 z-50 h-[2px] w-full"
        ref={ref}
        style={{
          marginLeft: `${(-1 + progress) * 100}%`,
          opacity:
            (state === "exiting" || state === "exited") && isFinished ? 0 : 1,
          transition: `all ${animationDuration}ms linear`,
        }}
      >
        <div
          className="absolute right-0 h-full w-28 translate-x-[1px] translate-y-[-4px] rotate-3 bg-gray-100"
          style={{
            boxShadow: "0 0 10px #f1f5f9, 0 0 5px #f1f5f9",
          }}
        />
        <div className="relative z-10 h-full w-full bg-gray-100" />
      </div>
    );
  },
);

Bar.displayName = "Bar";

export default function Progress() {
  const isLoading = useIsFetching() + useIsMutating() > 0;

  const [bar, setBar] = useState<{
    key: number;
    nodeRef: RefObject<HTMLDivElement>;
  } | null>(null);

  const isLoadingRef = useRef(isLoading);
  const keyRef = useRef(0);

  useEffect(() => {
    if (isLoading && !isLoadingRef.current) {
      keyRef.current++;
      setBar({ key: keyRef.current, nodeRef: createRef() });
    } else if (!isLoading && isLoadingRef.current) {
      setBar(null);
    }

    isLoadingRef.current = isLoading;
  }, [isLoading]);

  return (
    <TransitionGroup className="pointer-events-none fixed inset-x-0 top-0 h-1 overflow-hidden">
      {bar ? (
        <Transition
          key={bar.key}
          mountOnEnter
          nodeRef={bar.nodeRef}
          timeout={{
            enter: 800,
            exit: 500,
          }}
          unmountOnExit
        >
          {(state) => <Bar ref={bar.nodeRef} state={state} />}
        </Transition>
      ) : null}
    </TransitionGroup>
  );
}



