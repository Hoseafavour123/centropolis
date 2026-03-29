export function exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                const value = (row as any)[k];
                let cell: string | number | boolean = '';

                if (value instanceof Date) {
                    cell = value.toLocaleString();
                } else if (value !== null && value !== undefined) {
                    cell = value.toString();
                }

                return `"${cell.toString().replace(/"/g, '""')}"`;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
