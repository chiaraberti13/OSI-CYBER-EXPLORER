import type { ReactNode } from 'react';

/**
 * A comparison table that survives a phone.
 *
 * The labs compare three or four prose columns, which needs roughly 700-1000px.
 * Forcing that width inside a horizontal scroller means a learner on a phone pans
 * sideways to read a single row, losing the header. Below the chosen breakpoint the
 * same rows are rendered as cards: one column becomes the card heading and the others
 * become labelled fields, so every value keeps the header that explains it.
 */
export interface ResponsiveColumn<Row> {
  /** Stable identifier, unique within the table. */
  id: string;
  /** Column header, also used as the field label on narrow screens. */
  header: string;
  cell: (row: Row) => ReactNode;
  /** Exactly one column should set this: it becomes the card heading. */
  heading?: boolean;
  headerClassName?: string;
  cellClassName?: string;
}

interface ResponsiveTableProps<Row> {
  columns: Array<ResponsiveColumn<Row>>;
  rows: readonly Row[];
  rowKey: (row: Row, index: number) => string;
  /** Accessible name for both the table and the card list. */
  label: string;
  /** Width below which the table becomes cards. Defaults to `lg` (1024px). */
  breakpoint?: 'md' | 'lg' | 'xl';
  /** Minimum table width once the table form is used; it scrolls if the viewport is narrower. */
  minWidth?: number;
}

const TABLE_VISIBILITY = {
  md: 'hidden md:block',
  lg: 'hidden lg:block',
  xl: 'hidden xl:block'
} as const;

const CARDS_VISIBILITY = {
  md: 'md:hidden',
  lg: 'lg:hidden',
  xl: 'xl:hidden'
} as const;

export default function ResponsiveTable<Row>({
  columns,
  rows,
  rowKey,
  label,
  breakpoint = 'lg',
  minWidth
}: ResponsiveTableProps<Row>) {
  const headingColumn = columns.find(column => column.heading) ?? columns[0];
  const fieldColumns = columns.filter(column => column !== headingColumn);

  return (
    <>
      <div className={`${TABLE_VISIBILITY[breakpoint]} overflow-x-auto`}>
        <table className="w-full border-collapse text-left text-xs" style={minWidth ? { minWidth } : undefined} aria-label={label}>
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              {columns.map(column => (
                <th key={column.id} scope="col" className={`p-3 font-semibold ${column.headerClassName ?? ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="border-b border-slate-100 align-top">
                {columns.map(column =>
                  column === headingColumn ? (
                    <th key={column.id} scope="row" className={`p-3 font-semibold text-slate-800 ${column.cellClassName ?? ''}`}>
                      {column.cell(row)}
                    </th>
                  ) : (
                    <td key={column.id} className={`p-3 leading-relaxed text-slate-600 ${column.cellClassName ?? ''}`}>
                      {column.cell(row)}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={`${CARDS_VISIBILITY[breakpoint]} space-y-3`} aria-label={label}>
        {rows.map((row, index) => (
          <li key={rowKey(row, index)} className="rounded-lg border border-slate-200 p-4">
            <p className={`text-sm font-semibold text-slate-900 ${headingColumn.cellClassName ?? ''}`}>{headingColumn.cell(row)}</p>
            <dl className="mt-3 space-y-2.5">
              {fieldColumns.map(column => (
                <div key={column.id}>
                  <dt className="eyebrow">{column.header}</dt>
                  <dd className={`mt-1 text-xs leading-relaxed text-slate-600 ${column.cellClassName ?? ''}`}>{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
