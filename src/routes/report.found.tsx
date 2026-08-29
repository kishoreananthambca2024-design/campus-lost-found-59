import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/campus/ReportForm";

export const Route = createFileRoute("/report/found")({
  head: () => ({
    meta: [
      { title: "Report a Found Item — CampusFind" },
      {
        name: "description",
        content:
          "Found something on campus? Log it on CampusFind and we'll match it to the owner's lost report.",
      },
      { property: "og:title", content: "Report a Found Item — CampusFind" },
      {
        property: "og:description",
        content: "Log a found item and help return it to its owner in minutes.",
      },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <ReportForm type="FOUND" />
    </main>
  ),
});
