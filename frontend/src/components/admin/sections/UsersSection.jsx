export default function UsersSection({
  users,
  newUser,
  roleOptions,
  creatingUser,
  savingUserId,
  canManageAdmins,
  setNewUser,
  onCreateRoleChange,
  handleCreateManagedUser,
  updateRole,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">User Management</h2>
      <form
        onSubmit={handleCreateManagedUser}
        className="mt-4 rounded-lg border border-gray-200 p-4 text-black"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <select
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            value={newUser.role}
            onChange={(e) => onCreateRoleChange(e.target.value)}
          >
            {roleOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={creatingUser}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {creatingUser ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 text-black">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-black">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => {
              const isAdminRoleTarget =
                item.role === "admin" || item.role === "super_admin";
              const rowCanManageAdmin = canManageAdmins || !isAdminRoleTarget;
              return (
                <tr key={item.userId} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={item.role || "user"}
                      onChange={(e) => updateRole(item.userId, e.target.value)}
                      disabled={savingUserId === item.userId || !rowCanManageAdmin}
                      className="rounded border border-gray-300 px-2 py-1"
                    >
                      {roleOptions.map((itemRole) => (
                        <option key={itemRole} value={itemRole}>
                          {itemRole}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {!rowCanManageAdmin
                      ? "Locked"
                      : savingUserId === item.userId
                        ? "Saving..."
                        : "Ready"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
