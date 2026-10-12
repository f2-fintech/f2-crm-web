"use client";

import { GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip, Typography } from "@mui/material";
import StatusChip from "../chips/StatusChip";
import PriorityChip from "../chips/PriorityChip";
import SourceChip from "../chips/SourceChip";
import LeadRowActions from "./LeadRowActions";

export const getLeadColumns = (handlers?: {
  onViewJourney?: (lead: any) => void;
  onDelete?: (lead: any) => void;
  onAssign?: (lead: any) => void;
  onStatusChange?: (lead: any) => void;
}): GridColDef[] => [
  {
    field: "leadId",
    headerName: "Lead ID",
    width: 120,
  },

  {
    field: "fullName",
    headerName: "Customer",
    flex: 1,
    minWidth: 180,
  },

  {
    field: "phone",
    headerName: "Phone",
    width: 140,
  },

  {
    field: "city",
    headerName: "City",
    width: 120,
  },

  {
    field: "loanType",
    headerName: "Loan Type",
    width: 150,
  },

  {
    field: "loanAmount",
    headerName: "Loan Amount",
    width: 150,
    valueFormatter: (value: any) => {
      return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
    },
  },


  {
    field: "omsTicketStatus",
    headerName: "OMS Status",
    width: 140,
    renderCell: ({ value }) => {
      let bg = '#F3F4F6';
      let color = '#374151';
      const s = (value || '').toUpperCase();
      if (s.includes('DISBURSE') || s.includes('APPROV')) { bg = '#D1FAE5'; color = '#065F46'; }
      else if (s.includes('CARRY FORWARD')) { bg = '#DBEAFE'; color = '#1E40AF'; }
      else if (s.includes('REJECT')) { bg = '#FEE2E2'; color = '#991B1B'; }
      else if (s.includes('FILE SEND')) { bg = '#FEF3C7'; color = '#92400E'; }
      
      return (
        <Box sx={{
          px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
          bgcolor: bg, color: color,
          textTransform: 'uppercase'
        }}>
          {value || '-'}
        </Box>
      );
    },
  },

  {
    field: "omsApprovedAmount",
    headerName: "Approved",
    width: 130,
    valueFormatter: (value: any) => value ? `₹ ${Number(value).toLocaleString("en-IN")}` : '-',
  },

  {
    field: "omsDisbursedAmount",
    headerName: "Disbursed",
    width: 130,
    valueFormatter: (value: any) => value ? `₹ ${Number(value).toLocaleString("en-IN")}` : '-',
  },

  // {
  //   field: "omsUserId",
  //   headerName: "OMS User ID",
  //   width: 120,
  //   valueFormatter: (value: any) => value ? `User #${value}` : '-',
  // },

  {
    field: "omsProvider",
    headerName: "Provider",
    width: 150,
    valueFormatter: (value: any) => value || '-',
  },

  {
    field: "omsLeadType",
    headerName: "Lead Type",
    width: 120,
    valueFormatter: (value: any) => value || '-',
  },

  {
    field: "omsTenure",
    headerName: "Tenure (Years)",
    width: 130,
    valueFormatter: (value: any) => value ? `${value} Years` : '-',
  },


  {
    field: "leadSource",
    headerName: "Source",
    width: 140,
    renderCell: ({ row, value }) => {
      // Agent name from either new fields or fallback
      const agentName = row.omsAppliedByName || row.appliedByName || (row.omsUserId ? `Agent ID: ${row.omsUserId}` : null);
      
      return (
        <Box display="flex" flexDirection="column" gap={0.2} justifyContent="center" py={1.5}>
          <SourceChip source={value} />
          {agentName && (
            <Box 
              sx={{ 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                color: '#6366f1', // Indigo brand color 
                letterSpacing: '0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px'
              }}
            >
              {agentName}
            </Box>
          )}
        </Box>
      );
    },
  },

  {
    field: "touchpoints",
    headerName: "Touchpoints",
    width: 140,
    renderCell: ({ row }) => {
      const tooltipContent = row.latestTimelineItem ? (
        <Box sx={{ p: 1, maxWidth: 250 }}>
          <Typography variant="overline" display="block" color="#94a3b8" fontWeight={800} mb={1} sx={{ letterSpacing: '1px' }}>Latest Action</Typography>
          <Typography variant="body2" color="#fff" fontWeight={700} sx={{ lineHeight: 1.4 }}>
            {row.latestTimelineItem.title || row.latestTimelineItem.action}
          </Typography>
          {row.latestTimelineItem.description && (
            <Typography variant="caption" color="#cbd5e1" display="block" mt={0.5}>
              {row.latestTimelineItem.description}
            </Typography>
          )}
          <Typography variant="caption" color="#64748b" display="block" mt={1} fontWeight={600}>
            {new Date(row.latestTimelineItem.createdAt).toLocaleString()}
          </Typography>
        </Box>
      ) : (
        <Typography variant="caption" color="#94a3b8" p={1} display="block">No history available</Typography>
      );

      return (
        <Box display="flex" alignItems="center" height="100%">
          <Tooltip 
            title={tooltipContent} 
            placement="right" 
            arrow 
            componentsProps={{
              tooltip: { sx: { bgcolor: '#0f172a', borderRadius: 2, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' } },
              arrow: { sx: { color: '#0f172a' } }
            }}
          >
            <button
              onClick={() => handlers?.onViewJourney?.(row)}
              style={{
                background: 'rgba(99, 102, 241, 0.1)', 
                color: '#4f46e5', 
                border: '1px solid rgba(99, 102, 241, 0.2)', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                cursor: 'pointer',
                fontSize: '12px', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
            >
              <span style={{ 
                background: '#4f46e5', color: '#fff', 
                borderRadius: '50%', width: '16px', height: '16px', 
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px'
              }}>
                {row.touchpointsCount || 0}
              </span>
              View
            </button>
          </Tooltip>
        </Box>
      );
    },
  },

  {
    field: "createdAt",
    headerName: "Created At",
    width: 170,
    valueFormatter: (value: any) =>
      value
        ? new Date(value).toLocaleString()
        : "-",
  },

  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => (
      <LeadRowActions
        lead={row}
        onDelete={() => handlers?.onDelete?.(row)}
        onAssign={() => handlers?.onAssign?.(row)}
        onStatusChange={() => handlers?.onStatusChange?.(row)}
      />
    ),
  },
];