import React from "react";
import { useApp } from "../context/AppContext";
import { personStatus, fmt } from "../utils/calculations";

const STATUS_STYLE = {
  OK:        "text-green-600 font-semibold",
  CRITICAL:  "text-orange-500 font-bold",
  "OVER CAP": "text-red-600 font-bold",
};

export default function PersonSplitTable() {
  const { users } = useApp();

  return (
    <section className="bg-white rounded-2xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Person-Wise Split</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-left">
              <th className="py-2 px-3 rounded-l-lg">Name</th>
              <th className="py-2 px-3">Budget Cap</th>
              <th className="py-2 px-3">Actual Spent</th>
              <th className="py-2 px-3">Remaining</th>
              <th className="py-2 px-3 rounded-r-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const { remaining, status } = personStatus(user);
              return (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="py-3 px-3 font-medium text-gray-800">{user.name}</td>
                  <td className="py-3 px-3 text-gray-700">{fmt(user.hardCap)}</td>
                  <td className={`py-3 px-3 ${user.totalSpent > user.hardCap ? "text-red-600" : "text-gray-700"}`}>
                    {fmt(user.totalSpent)}
                  </td>
                  <td className={`py-3 px-3 ${remaining < 0 ? "text-red-600" : "text-gray-700"}`}>
                    {fmt(remaining)}
                  </td>
                  <td className={`py-3 px-3 ${STATUS_STYLE[status] || "text-gray-600"}`}>
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
