"use client";

import { useParams } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import LeadTimeline from "@/components/leads/details/LeadTimeline";

import useLeadDetails from "@/hooks/useLeadDetails";

export default function LeadTimelinePage() {
  const params = useParams();

  const { lead, loading } =
    useLeadDetails(params.id as string);

  if (loading) {
    return <>Loading...</>;
  }

  if (!lead) {
    return <>Lead not found.</>;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Lead Timeline" />

      <LeadTimeline lead={lead} />
    </>
  );
}