"use client";

interface Props {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

const permissionGroups = [
  {
    title: "Dashboard",
    permissions: [
      "dashboard.view",
    ],
  },

  {
    title: "Users",
    permissions: [
      "user.view",
      "user.create",
      "user.update",
      "user.delete",
      "user.import",
      "user.export",
      "user.change-password",
    ],
  },

  {
    title: "Roles",
    permissions: [
      "role.view",
      "role.create",
      "role.update",
      "role.delete",
    ],
  },

  {
    title: "Branches",
    permissions: [
      "branch.view",
      "branch.create",
      "branch.update",
      "branch.delete",
    ],
  },

  {
    title: "Departments",
    permissions: [
      "department.view",
      "department.create",
      "department.update",
      "department.delete",
    ],
  },

  {
    title: "Leads",
    permissions: [
      "lead.view",
      "lead.create",
      "lead.update",
      "lead.delete",
      "lead.assign",
      "lead.import",
      "lead.export",
    ],
  },

  {
    title: "Customers",
    permissions: [
      "customer.view",
      "customer.create",
      "customer.update",
      "customer.delete",
    ],
  },

  {
    title: "Applications",
    permissions: [
      "application.view",
      "application.create",
      "application.update",
      "application.approve",
      "application.reject",
    ],
  },

  {
    title: "Reports",
    permissions: [
      "report.view",
      "report.export",
    ],
  },

  {
    title: "Settings",
    permissions: [
      "setting.view",
      "setting.update",
    ],
  },
];

export default function PermissionMatrix({
  selectedPermissions,
  onChange,
}: Props) {
  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      onChange(
        selectedPermissions.filter(
          (item) => item !== permission
        )
      );
    } else {
      onChange([
        ...selectedPermissions,
        permission,
      ]);
    }
  };

  const toggleGroup = (
    permissions: string[]
  ) => {
    const allSelected = permissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      onChange(
        selectedPermissions.filter(
          (p) => !permissions.includes(p)
        )
      );
    } else {
      onChange([
        ...new Set([
          ...selectedPermissions,
          ...permissions,
        ]),
      ]);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          Permissions
        </h3>

        <p className="text-sm text-gray-500">
          Select permissions for this role.
        </p>
      </div>

      {permissionGroups.map((group) => {
        const checked = group.permissions.every((item) =>
          selectedPermissions.includes(item)
        );

        return (
          <div
            key={group.title}
            className="rounded-xl border border-gray-200"
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-3">

              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggleGroup(group.permissions)
                  }
                  className="h-4 w-4 rounded"
                />

                <h4 className="font-semibold text-gray-800">
                  {group.title}
                </h4>

              </div>

              <span className="text-xs text-gray-500">
                {group.permissions.length} Permissions
              </span>

            </div>

            {/* Permissions */}

            <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-3 lg:grid-cols-4">

              {group.permissions.map((permission) => (
                <label
                  key={permission}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(
                      permission
                    )}
                    onChange={() =>
                      togglePermission(permission)
                    }
                    className="h-4 w-4 rounded"
                  />

                  <span className="text-sm text-gray-700">
                    {permission
                      .split(".")[1]
                      .replace("-", " ")
                      .replace(
                        /\b\w/g,
                        (c) => c.toUpperCase()
                      )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}