import * as Checkbox from "@radix-ui/react-checkbox";
import { cloneDeep, first, isNil, set } from "lodash";
import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import { Suspense } from "react";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Dan&apos;s Lists
        </h1>
        <Suspense fallback={<></>}>
          <Lists />
        </Suspense>
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    </main>
  );
};

export default Home;

const Lists = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [lists] = api.example.getLists.useSuspenseQuery({ timezone });

  const utils = api.useContext();

  const upsertEvent = api.example.upsertEvent.useMutation({
    onMutate: async (input) => {
      await utils.example.getLists.cancel();
      const prevData = utils.example.getLists.getData({ timezone });
      const optimisticData = cloneDeep(prevData);

      let itemIndex;
      const listIndex = optimisticData?.findIndex((list) => {
        itemIndex = list.items.findIndex((item) => item.id === input.itemId);
        return itemIndex >= 0;
      });

      if (
        !isNil(optimisticData) &&
        !isNil(listIndex) &&
        !isNil(itemIndex) &&
        itemIndex >= 0
      ) {
        set(
          optimisticData,
          [listIndex, "items", itemIndex, "events", "0", "status", "name"],
          input.statusName
        );
      }

      utils.example.getLists.setData({ timezone }, optimisticData);

      return { prevData };
    },
    onError: (_err, _input, ctx) => {
      // Roll back
      utils.example.getLists.setData({ timezone }, ctx?.prevData);
    },
  });

  const deleteEvents = api.example.deleteEvents.useMutation({
    onSettled: () => void utils.example.getLists.invalidate(),
  });

  return (
    <>
      <ul className="list-disc text-white">
        {lists.map(({ id, title, items }) => (
          <li key={id} className="mb-5">
            <div className="mb-2">{title}</div>
            <ul className="ml-4">
              {items.map(({ id, title, events }) => {
                const checked = first(events)?.status.name === "COMPLETE";

                return (
                  <li key={id} className="mb-2 flex items-center">
                    <Checkbox.Root
                      className="cursor-default text-gray-200"
                      id={id}
                      checked={checked}
                      onCheckedChange={() =>
                        upsertEvent.mutate({
                          timezone,
                          itemId: id,
                          statusName:
                            first(events)?.status.name === "COMPLETE"
                              ? "PENDING"
                              : "COMPLETE",
                        })
                      }
                    >
                      <Checkbox.Indicator>
                        <svg
                          focusable="false"
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="currentColor"
                        >
                          <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </Checkbox.Indicator>
                      {!checked && (
                        <span className="pointer-events-none">
                          <svg
                            focusable="false"
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="currentColor"
                          >
                            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                          </svg>
                        </span>
                      )}
                    </Checkbox.Root>
                    <label className="pl-1" htmlFor={id}>
                      {title}
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => deleteEvents.mutate()}
      >
        Delete events
      </button>
    </>
  );
};
