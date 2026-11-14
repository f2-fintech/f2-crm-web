"use client";

import React, { useState } from "react";
import { Box, ButtonBase, Popover, Stack, Typography } from "@mui/material";
import { ChevronDown, Check } from "lucide-react";
import {
  ALL_DISPOSITIONS_LIST,
  getDispositionConfig,
  isDispositionPending,
} from "./dispositionConstants";

interface NotionDispositionSelectProps {
  value?: string | null;
  onChange: (newValue: string) => void;
  disabled?: boolean;
}

export default function NotionDispositionSelect({
  value,
  onChange,
  disabled = false,
}: NotionDispositionSelectProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const isPending = isDispositionPending(value);
  const currentConfig = getDispositionConfig(value);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    handleClose();
  };

  return (
    <>
      <ButtonBase
        onClick={handleClick}
        disabled={disabled}
        focusRipple
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
          maxWidth: 185,
          minHeight: 28,
          px: 1.1,
          py: 0.4,
          borderRadius: "7px",
          bgcolor: isPending ? "#ffffff" : currentConfig.bg,
          border: isPending
            ? "1px dashed rgba(239, 68, 68, 0.6)"
            : `1px solid ${currentConfig.border}`,
          color: isPending ? "#64748b" : currentConfig.text,
          transition: "all 0.15s ease",
          cursor: disabled ? "default" : "pointer",
          "&:hover": disabled
            ? {}
            : {
                filter: "brightness(0.97)",
                borderColor: isPending ? "#ef4444" : currentConfig.dot,
                transform: "translateY(-0.5px)",
              },
        }}
      >
        <Stack direction="row" spacing={0.8} sx={{ alignItems: "center", minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: isPending ? "#ef4444" : currentConfig.dot,
              flexShrink: 0,
            }}
          />

          <Typography
            noWrap
            sx={{
              fontSize: "12px",
              fontWeight: isPending ? 500 : 600,
              color: isPending ? "#64748b" : currentConfig.text,
            }}
          >
            {isPending ? (
              <span>
                Select disposition <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
              </span>
            ) : (
              currentConfig.label
            )}
          </Typography>
        </Stack>

        <ChevronDown
          size={12}
          style={{
            flexShrink: 0,
            opacity: 0.6,
            transition: "transform 0.18s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </ButtonBase>

      {/* Clean Dropdown Menu */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              width: 210,
              maxHeight: 320,
              borderRadius: "10px",
              bgcolor: "#ffffff",
              border: "1px solid rgba(15, 23, 42, 0.1)",
              boxShadow: "0 10px 25px -4px rgba(0,0,0,0.12)",
              overflowY: "auto",
              py: 0.5,
            },
          },
        }}
      >
        {ALL_DISPOSITIONS_LIST.map((opt) => {
          const isSelected = value?.trim().toLowerCase() === opt.value.toLowerCase();

          return (
            <ButtonBase
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1.4,
                py: 0.65,
                bgcolor: isSelected ? "rgba(37, 99, 235, 0.08)" : "transparent",
                transition: "background-color 0.1s ease",
                "&:hover": {
                  bgcolor: opt.bg,
                },
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: opt.dot,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12.5px",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? opt.text : "#334155",
                  }}
                >
                  {opt.label}
                </Typography>
              </Stack>

              {isSelected && <Check size={13} color={opt.dot} strokeWidth={2.5} />}
            </ButtonBase>
          );
        })}
      </Popover>
    </>
  );
}
