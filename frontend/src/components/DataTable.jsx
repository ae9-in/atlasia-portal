const DataTable = ({ columns, rows, emptyText = "No records found." }) => (
  <div className="glass-panel overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.id || row._id || index} className="transition hover:bg-white/5">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-slate-200">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
