import { redirect } from "next/navigation";
import Lists from "~/components/Lists";
import SettingsMenu from "~/components/SettingsMenu";
import { api } from "~/trpc/server";

export default async function Home() {
  const data = await api.list.getAll().catch((err) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (err.code === "UNAUTHORIZED") {
      redirect("/signin");
    } else {
      throw err;
    }
  });

  return (
    <main className="relative px-4 pt-12 sm:pt-20">
      <SettingsMenu />

      <Lists initialData={data} />

      <div className="fixed bottom-4 right-4 flex gap-2 text-xs">
        <span>Next runtime:</span>
        <pre>{process.env.NEXT_RUNTIME}</pre>
      </div>
    </main>
  );
}
