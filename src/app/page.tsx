import { redirect } from "next/navigation";
import Lists from "~/components/Lists";
import Progress from "~/components/Progress";
import SettingsMenu from "~/components/SettingsMenu";
import { api } from "~/trpc/server";
import { cookies } from "next/headers";
import { z } from "zod";

const tzOffsetSchema = z.coerce.number().default(0);
const collapsedListsSchema = z.preprocess(
  (val) => (typeof val === "string" ? JSON.parse(val) : val),
  z.record(z.string().cuid2(), z.boolean()).optional(),
);

export default async function Home() {
  const data = await api.list.getAll().catch((err) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (err.code === "UNAUTHORIZED") {
      redirect("/signin");
    } else {
      throw err;
    }
  });

  const cookieStore = cookies();

  const tzOffset = tzOffsetSchema.parse(cookieStore.get("tzOffset")?.value);
  const collapsedLists = collapsedListsSchema.parse(
    cookieStore.get("collapsedLists")?.value,
  );

  return (
    <main className="relative px-4 pt-12 sm:pt-20" vaul-drawer-wrapper="">
      <Progress />
      <SettingsMenu />
      <Lists
        initialData={data}
        tzOffset={tzOffset}
        collapsedLists={collapsedLists}
      />
    </main>
  );
}
