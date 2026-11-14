"use client";

import React, { useState, useEffect } from "react";
import { Joyride, CallBackProps, STATUS, Step } from "react-joyride";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function GuideTour() {
  const [run, setRun] = useState(false);
  const pathname = usePathname();
  const { role } = useAuth();
  
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  const generalSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Welcome to CRM!</h2>
          <p>Let's take a quick tour to help you get started with the main features of your workspace.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#sidebar-menu",
      content: (
        <div>
          <h3 className="font-bold">Navigation Menu</h3>
          <p>This is your main navigation. From here you can access Leads, Customers, Reports, and Settings.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#global-search",
      content: (
        <div>
          <h3 className="font-bold">Global Search</h3>
          <p>Quickly find records, contacts, or pages by typing here. Press ⌘K or Ctrl+K to focus.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#quick-create-btn",
      content: (
        <div>
          <h3 className="font-bold">Quick Create</h3>
          <p>Use this button to quickly add new leads, tasks, or follow-ups without leaving the page.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#start-tour-btn",
      content: (
        <div>
          <h3 className="font-bold">Help & Suggestions</h3>
          <p>If you ever need a refresher, click this icon to restart the tour!</p>
        </div>
      ),
      placement: "bottom",
    }
  ];

  const adminSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Admin Dashboard Tour</h2>
          <p>Welcome, Admin! Let's review the administrative features available to you.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#sidebar-item-administration",
      content: (
        <div>
          <h3 className="font-bold">Administration Hub</h3>
          <p>This section contains all the tools you need to manage your CRM setup. We've opened it for you to explore!</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#sidebar-subitem-users",
      content: (
        <div>
          <h3 className="font-bold">Manage Users</h3>
          <p>Create new users, update their details, and assign them to departments and teams from the Users page.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#sidebar-subitem-teams",
      content: (
        <div>
          <h3 className="font-bold">Manage Teams</h3>
          <p>Group users into teams and assign Team Leaders to structure your organization properly.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#sidebar-subitem-roles",
      content: (
        <div>
          <h3 className="font-bold">Manage Roles & Permissions</h3>
          <p>Create custom roles and define exactly what each role can access and do within the system.</p>
        </div>
      ),
      placement: "right",
    }
  ];

  const notionSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Notion Workspace Tour</h2>
          <p>Welcome to your Notion workspace! Let's explore how you can create and manage pages and sheets.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#notion-sidebar",
      content: (
        <div>
          <h3 className="font-bold">Page Tree</h3>
          <p>Here you can see all your pages and sheets organized hierarchically.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#notion-add-page-btn",
      content: (
        <div>
          <h3 className="font-bold">Create New Page</h3>
          <p>Click here to create a new Document or a Spreadsheet in your workspace.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#notion-main-view",
      content: (
        <div>
          <h3 className="font-bold">Editor & Sheets</h3>
          <p>This is where you can write rich text documents or manage structured data in tables. Use the slash "/" command inside a page to add blocks.</p>
        </div>
      ),
      placement: "left",
    },
    {
      target: "#start-tour-btn",
      content: (
        <div>
          <h3 className="font-bold">Help & Suggestions</h3>
          <p>Click this icon anytime to replay this tour.</p>
        </div>
      ),
      placement: "bottom",
    }
  ];

  const isNotionPage = pathname === "/notion-pages";
  const isAdminDashboard = isAdmin && pathname === "/";
  
  let steps = generalSteps;
  if (isNotionPage) {
    steps = notionSteps;
  } else if (isAdminDashboard) {
    steps = adminSteps;
  }

  useEffect(() => {
    // Check if the user has already seen the tour for the current context
    let storageKey = "hasSeenTour";
    if (isNotionPage) storageKey = "hasSeenNotionTour";
    if (isAdminDashboard) storageKey = "hasSeenAdminTour";
    
    const hasSeenTour = localStorage.getItem(storageKey);
    
    const startTour = () => {
      // Mark as seen immediately so refresh doesn't trigger it again
      localStorage.setItem(storageKey, "true");
      
      if (isAdminDashboard) {
        window.dispatchEvent(new Event("open-admin-menu"));
        // Give sidebar a moment to expand before calculating positions
        setTimeout(() => setRun(true), 350);
      } else {
        setRun(true);
      }
    };

    // Only auto-run if we are on the Notion page or Admin Dashboard
    if (!hasSeenTour && (isNotionPage || isAdminDashboard)) {
      const timer = setTimeout(startTour, 500);
      return () => clearTimeout(timer);
    }

    // Listen for manual trigger from the Help button
    window.addEventListener("start-guide-tour", startTour);

    return () => {
      window.removeEventListener("start-guide-tour", startTour);
    };
  }, [isNotionPage, isAdminDashboard]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      let storageKey = "hasSeenTour";
      if (isNotionPage) storageKey = "hasSeenNotionTour";
      if (isAdminDashboard) storageKey = "hasSeenAdminTour";
      
      localStorage.setItem(storageKey, "true");
    }
  };

  // Only render Joyride if there are steps available
  if (steps.length === 0) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      run={run}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#4f46e5", // brand-500
          textColor: "#333",
        },
        buttonClose: {
          display: "none",
        },
      }}
    />
  );
}
