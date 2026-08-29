import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/campus/ReportForm";

export const Route = createFileRoute("/report/lost")({
  head: () => ({
    meta: [
      { title: "Report a Lost Item — CampusFind" },
      {
        name: "description",
        content:
          "Report an item you lost on campus and let CampusFind's smart matching scan every found report instantly.",
      },
      { property: "og:title", content: "Report a Lost Item — CampusFind" },
      {
        property: "og:description",
        content: "File a lost report and get matched with found items automatically.",
      },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <ReportForm type="LOST" />
    </main>
  ),
});
