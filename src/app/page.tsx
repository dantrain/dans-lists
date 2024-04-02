import { redirect } from "next/navigation";
import Lists from "~/components/Lists";
import Progress from "~/components/Progress";
import SettingsMenu from "~/components/SettingsMenu";
import { api } from "~/trpc/server";
import { cookies } from "next/headers";

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
  const tzOffset = +(cookieStore.get("tzOffset")?.value ?? 0);

  return (
    <main className="relative px-4 pt-12 sm:pt-20">
      <Progress />
      <SettingsMenu />
      <Lists initialData={data} tzOffset={tzOffset} />
    </main>
  );
}
