import {
  Suspense as ReactSuspense,
  useEffect,
  useState,
  type SuspenseProps,
} from "react";

const Suspense = (props: SuspenseProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted && typeof window !== "undefined") {
      setMounted(true);
    }
  }, [mounted]);

  return mounted ? <ReactSuspense {...props} /> : <>{props.fallback}</>;
};

export default Suspense;
