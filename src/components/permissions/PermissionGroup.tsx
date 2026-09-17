"use client";

interface Props {
  title: string;
  permissions: {
    key: string;
    action: string;
    description?: string;
  }[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

export default function PermissionGroup({
  title,
  permissions,
  selectedPermissions,
  onChange,
}: Props) {
  const togglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      onChange(
        selectedPermissions.filter((item) => item !== key)
      );
    } else {
      onChange([...selectedPermissions, key]);
    }
  };

  const toggleAll = () => {
    const allSelected = permissions.every((item) =>
      selectedPermissions.includes(item.key)
    );

    if (allSelected) {
      onChange(
        selectedPermissions.filter(
          (item) =>
            !permissions.some((permission) => permission.key === item)
        )
      );
    } else {
      onChange([
        ...new Set([
          ...selectedPermissions,
          ...permissions.map((item) => item.key),
        ]),
      ]);
    }
  };

  const allChecked = permissions.every((item) =>
    selectedPermissions.includes(item.key)
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

      {/* Header */}

      <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-3">

        <div className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />

          <h3 className="text-base font-semibold text-gray-800">
            {title}
          </h3>

        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {permissions.length} Permissions
        </span>

      </div>

      {/* Permissions */}

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">

        {permissions.map((permission) => (
          <label
            key={permission.key}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-blue-500 hover:bg-blue-50"
          >
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permission.key)}
              onChange={() =>
                togglePermission(permission.key)
              }
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
            />

            <div>

              <h4 className="font-medium text-gray-800">
                {permission.action}
              </h4>

              <p className="mt-1 text-xs text-gray-500">
                {permission.description ||
                  permission.key}
              </p>

            </div>
          </label>
        ))}

      </div>

    </div>
  );
}