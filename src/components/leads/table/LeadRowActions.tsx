"use client";

import * as React from "react";

import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  MoreVert,
  Visibility,
  Edit,
  PersonAddAlt,
  PublishedWithChanges,
  Delete,
} from "@mui/icons-material";

import { useRouter } from "next/navigation";

interface LeadRowActionsProps {
  lead: any;

  onAssign?: (lead: any) => void;
  onStatusChange?: (lead: any) => void;
  onDelete?: (lead: any) => void;
}

export default function LeadRowActions({
  lead,
  onAssign,
  onStatusChange,
  onDelete,
}: LeadRowActionsProps) {
  const router = useRouter();

  const [anchorEl, setAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            router.push(`/leads/${lead._id}`);
            handleClose();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>

          <ListItemText>
            View Lead
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            router.push(
              `/leads/${lead._id}/edit`,
            );
            handleClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>

          <ListItemText>
            Edit Lead
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            onAssign?.(lead);
            handleClose();
          }}
        >
          <ListItemIcon>
            <PersonAddAlt fontSize="small" />
          </ListItemIcon>

          <ListItemText>
            Assign Lead
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onStatusChange?.(lead);
            handleClose();
          }}
        >
          <ListItemIcon>
            <PublishedWithChanges fontSize="small" />
          </ListItemIcon>

          <ListItemText>
            Change Status
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          sx={{
            color: "error.main",
          }}
          onClick={() => {
            onDelete?.(lead);
            handleClose();
          }}
        >
          <ListItemIcon
            sx={{
              color: "error.main",
            }}
          >
            <Delete fontSize="small" />
          </ListItemIcon>

          <ListItemText>
            Delete Lead
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}