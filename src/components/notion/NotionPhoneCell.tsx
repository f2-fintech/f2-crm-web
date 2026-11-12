"use client";

import React, { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Phone, PhoneCall, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export interface NotionPhoneCellProps {
  displayPhone: string;
  dialPhone: string;
}

/**
 * Detects whether a table cell value represents a mobile/phone number
 * using both column name heuristics and phone number regex matching.
 */
export function detectPhoneNumber(
  val: any,
  colName?: string
): { isPhone: boolean; displayPhone: string; dialPhone: string } {
  if (val === null || val === undefined) {
    return { isPhone: false, displayPhone: "", dialPhone: "" };
  }
  const str = String(val).trim();
  if (!str) {
    return { isPhone: false, displayPhone: "", dialPhone: "" };
  }

  const cName = (colName || "").toLowerCase();
  const isPhoneColumn =
    /phone|mobile|contact|calling|caller|dial|cell|whatsapp|\bph\b|\btel\b/.test(
      cName
    );

  // Clean out common formatting: spaces, hyphens, parentheses, dots
  const stripped = str.replace(/[\s\-\(\)\.]/g, "");

  // If column name explicitly indicates phone/mobile/contact:
  if (isPhoneColumn) {
    const digitsOnly = stripped.replace(/\D/g, "");
    if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
      const dial = stripped.startsWith("+") ? stripped : digitsOnly;
      return { isPhone: true, displayPhone: str, dialPhone: dial };
    }
  }

  // Value-based detection for 10-digit Indian mobile numbers (starts with 6,7,8,9)
  // Optional country code +91, 91, or leading 0
  const indianMobileMatch = stripped.match(/^(\+?91|0)?([6-9]\d{9})$/);
  if (indianMobileMatch) {
    const tenDigits = indianMobileMatch[2];
    const dial = stripped.startsWith("+") ? stripped : tenDigits;
    return { isPhone: true, displayPhone: str, dialPhone: dial };
  }

  // Standard 10 digits
  if (/^[6-9]\d{9}$/.test(stripped)) {
    return { isPhone: true, displayPhone: str, dialPhone: stripped };
  }

  return { isPhone: false, displayPhone: "", dialPhone: "" };
}

export default function NotionPhoneCell({
  displayPhone,
  dialPhone,
}: NotionPhoneCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const textToCopy = dialPhone || displayPhone;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success(`Copied: ${textToCopy}`, {
        duration: 1800,
        id: `phone-copy-${textToCopy}`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1,
        py: 0.35,
        borderRadius: "7px",
        bgcolor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        transition: "all 0.15s ease",
        "&:hover": {
          bgcolor: "#dcfce7",
          borderColor: "#86efac",
          boxShadow: "0 2px 4px rgba(22, 163, 74, 0.08)",
        },
      }}
    >
      {/* Click-to-dial text link */}
      <Tooltip title="Click to call / open dialpad" arrow placement="top">
        <Box
          component="a"
          href={`tel:${dialPhone}`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            textDecoration: "none",
            color: "#15803d",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "12.5px",
            fontWeight: 600,
            letterSpacing: "0.2px",
            "&:hover": {
              textDecoration: "underline",
              color: "#166534",
            },
          }}
        >
          <PhoneCall size={12} className="text-emerald-600" />
          <span>{displayPhone}</span>
        </Box>
      </Tooltip>

      {/* Subtle Divider */}
      <Box
        sx={{
          width: "1px",
          height: "12px",
          bgcolor: "#86efac",
          mx: 0.25,
          opacity: 0.8,
        }}
      />

      {/* Dedicated Dialpad / Call Icon Button */}
      <Tooltip title="Call / Open Dialpad" arrow placement="top">
        <IconButton
          component="a"
          href={`tel:${dialPhone}`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          size="small"
          sx={{
            p: 0.35,
            color: "#16a34a",
            borderRadius: "5px",
            "&:hover": {
              bgcolor: "#bbf7d0",
              color: "#15803d",
            },
          }}
          aria-label={`Call ${displayPhone}`}
        >
          <Phone size={12} />
        </IconButton>
      </Tooltip>

      {/* Copy Button */}
      <Tooltip
        title={copied ? "Copied!" : "Copy mobile number"}
        arrow
        placement="top"
      >
        <IconButton
          onClick={handleCopy}
          size="small"
          sx={{
            p: 0.35,
            color: copied ? "#16a34a" : "#64748b",
            borderRadius: "5px",
            "&:hover": {
              bgcolor: "#bbf7d0",
              color: "#0f172a",
            },
          }}
          aria-label={`Copy ${displayPhone}`}
        >
          {copied ? (
            <Check size={12} className="text-emerald-600" />
          ) : (
            <Copy size={12} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

