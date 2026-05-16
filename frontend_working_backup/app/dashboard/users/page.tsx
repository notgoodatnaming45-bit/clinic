export default function UsersPage() {
  const users = [
    ["Admin User", "admin@ruf.ai", "Admin"],
    ["Physician User", "physician@ruf.ai", "Physician"],
    ["Medical Assistant", "assistant@ruf.ai", "Medical Assistant"],
    ["Legal Liaison", "legal@ruf.ai", "Legal Liaison"],
  ];

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500">Manage roles, access, and MFA status.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">MFA</th></tr>
          </thead>
          <tbody>
            {users.map(([name, email, role]) => (
              <tr key={email} className="border-t">
                <td className="p-4 font-semibold">{name}</td>
                <td className="p-4">{email}</td>
                <td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{role}</span></td>
                <td className="p-4"><span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">Enabled</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}