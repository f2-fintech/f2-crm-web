import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modals",
};

export default function ModalsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Modals" />

      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">

        <h2 className="text-xl font-semibold">
          Modal Examples
        </h2>

        <p className="mt-2 text-gray-500">
          Demo modal components have been removed.
        </p>

      </div>
    </div>
  );
}