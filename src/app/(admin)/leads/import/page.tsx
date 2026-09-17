"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import BulkUploadDialog from "@/components/leads/dialogs/BulkUploadDialog";

import useBulkUpload from "@/hooks/useBulkUpload";

export default function LeadImportPage() {
  const {
    file,
    setFile,
    loading,
    progress,
    summary,
    errors,
    upload,
  } = useBulkUpload();

  return (
    <>
      <PageBreadcrumb pageTitle="Import Leads" />

      <BulkUploadDialog
        open={true}
        loading={loading}
        file={file}
        progress={progress}
        summary={summary}
        errors={errors}
        onFileChange={setFile}
        onUpload={upload}
        onClose={() => history.back()}
        onDownloadTemplate={() => {}}
      />
    </>
  );
}