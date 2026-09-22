"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";

export interface NotionPageItem {
  id: string;
  _id?: string;
  title: string;
  pageType: "PAGE" | "SHEET" | "DATABASE";
  section: "PRIVATE" | "SHARED" | "WORKSPACE";
  parentId?: string | null;
  ownerId?: string;
  assignedMemberId?: string;
  columns?: Array<{ key: string; name: string; type?: string }>;
  rowsCount?: number;
  sharedWithEmails?: string[];
  children?: NotionPageItem[];
}

export default function useNotionPages() {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<{
    shared: NotionPageItem[];
    private: NotionPageItem[];
    workspace: NotionPageItem[];
    tree: NotionPageItem[];
  }>({ shared: [], private: [], workspace: [], tree: [] });

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<any>(null);
  const [error, setError] = useState("");

  // Helper to unpack NestJS ResponseInterceptor { success, statusCode, message, data }
  const unpackData = (res: any) => {
    if (res?.data?.data !== undefined) return res.data.data;
    if (res?.data !== undefined) return res.data;
    return res;
  };

  // 1. Fetch Nested Tree View from MongoDB
  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/notion-pages/tree");
      const data = unpackData(response);
      if (data && typeof data === "object") {
        setTreeData({
          shared: data.shared || [],
          private: data.private || [],
          workspace: data.workspace || [],
          tree: data.tree || [],
        });
      }
    } catch (err: any) {
      console.error("Error fetching MongoDB page tree:", err);
      setError(err?.response?.data?.message || "Failed to load page tree from MongoDB");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Single Page Details & Rows from MongoDB
  const fetchPageDetails = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/notion-pages/${id}`);
      const pageDoc = unpackData(response);
      setActivePage(pageDoc);
      setSelectedPageId(pageDoc?._id || pageDoc?.id || id);
      return pageDoc;
    } catch (err: any) {
      console.error("Error fetching MongoDB page details:", err);
      setError(err?.response?.data?.message || "Failed to fetch page details");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Create Page / Sheet directly in MongoDB
  const createPage = async (dto: {
    title: string;
    pageType?: string;
    section?: string;
    parentId?: string;
  }) => {
    try {
      setLoading(true);
      const response = await api.post("/notion-pages", dto);
      const created = unpackData(response);
      await fetchTree();
      return created;
    } catch (err: any) {
      console.error("Error creating page in MongoDB:", err);
      setError(err?.response?.data?.message || "Failed to create page in MongoDB");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Share Page via Email Invite directly in MongoDB
  const sharePageViaEmail = async (pageId: string, email: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/notion-pages/${pageId}/share-email`, { email });
      return unpackData(response);
    } catch (err: any) {
      console.error("Error sharing page in MongoDB:", err);
      setError(err?.response?.data?.message || "Failed to send invitation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. Accept Email Invitation Token in MongoDB
  const acceptInvite = async (token: string) => {
    try {
      setLoading(true);
      const response = await api.post("/notion-pages/accept-invite", { token });
      const res = unpackData(response);
      await fetchTree();
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired token");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 6. Clone Sheet Format directly in MongoDB
  const cloneFormat = async (pageId: string, targetParentId?: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/notion-pages/${pageId}/clone`, { targetParentId });
      const cloned = unpackData(response);
      await fetchTree();
      return cloned;
    } catch (err: any) {
      console.error("Error cloning format in MongoDB:", err);
      setError(err?.response?.data?.message || "Failed to clone sheet format");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 7. Add Record Row to Page directly in MongoDB
  const addRecord = async (pageId: string, rowData: any) => {
    try {
      setLoading(true);
      const currentRows = activePage?.rows || [];
      const updatedRows = Array.isArray(rowData)
        ? [...rowData, ...currentRows]
        : [rowData, ...currentRows];

      const response = await api.patch(`/notion-pages/${pageId}`, { rows: updatedRows });
      const updatedDoc = unpackData(response);
      setActivePage(updatedDoc);
      return updatedDoc;
    } catch (err: any) {
      console.error("Error adding record to MongoDB:", err);
      setError(err?.response?.data?.message || "Failed to add record to MongoDB");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 8. Update Page Title directly in MongoDB
  const updatePageTitle = async (pageId: string, newTitle: string) => {
    try {
      const response = await api.patch(`/notion-pages/${pageId}`, { title: newTitle });
      const updatedDoc = unpackData(response);
      setActivePage(updatedDoc);
      await fetchTree();
      return updatedDoc;
    } catch (err: any) {
      console.error("Error updating page title:", err);
      setError(err?.response?.data?.message || "Failed to update title");
      throw err;
    }
  };

  // 9. Delete Page directly in MongoDB
  const deletePage = async (pageId: string) => {
    try {
      setLoading(true);
      const response = await api.delete(`/notion-pages/${pageId}`);
      const res = unpackData(response);
      await fetchTree();
      setSelectedPageId(null);
      setActivePage(null);
      return res;
    } catch (err: any) {
      console.error("Error deleting page:", err);
      setError(err?.response?.data?.message || "Failed to delete page");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 10. Assign Page to Employee directly in MongoDB
  const assignPage = async (pageId: string, assignedMemberId: string) => {
    try {
      setLoading(true);
      const response = await api.patch(`/notion-pages/${pageId}`, { assignedMemberId });
      const updatedDoc = unpackData(response);
      setActivePage(updatedDoc);
      await fetchTree();
      return updatedDoc;
    } catch (err: any) {
      console.error("Error assigning page:", err);
      setError(err?.response?.data?.message || "Failed to assign page");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    loading,
    error,
    treeData,
    selectedPageId,
    activePage,
    fetchTree,
    fetchPageDetails,
    createPage,
    sharePageViaEmail,
    acceptInvite,
    cloneFormat,
    addRecord,
    updatePageTitle,
    deletePage,
    assignPage,
    setSelectedPageId,
    setActivePage,
  };
}
