interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface Document {
  startViewTransition(callback: () => Promise<void>): void;
}

declare module "csstype" {
  interface Properties {
    viewTransitionName?: string;
  }
}
