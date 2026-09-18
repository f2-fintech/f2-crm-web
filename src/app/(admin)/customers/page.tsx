export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your CRM customers here.
          </p>
        </div>
      </div>

      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]">
        <p className="text-gray-500 dark:text-gray-400">
          Customers module is under construction.
        </p>
      </div>
    </div>
  );
}