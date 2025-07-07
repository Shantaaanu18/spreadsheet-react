import React, { useMemo, useState } from 'react';
import { useTable, HeaderGroup, ColumnInstance, Row, Cell } from 'react-table';
import { FaSearch } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const statusColors: Record<string, string> = {
  'In-progress': 'bg-yellow-100 text-yellow-800',
  'Need to start': 'bg-blue-100 text-blue-800',
  'Submitted': 'bg-gray-200 text-gray-700',
  'Complete': 'bg-green-100 text-green-800',
  'Blocked': 'bg-red-100 text-red-800',
};
const priorityColors: Record<string, string> = {
  'High': 'bg-red-100 text-red-700',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-700',
};

const TopNav: React.FC = () => (
  <div className="flex items-center justify-between px-8 py-3 border-b bg-white">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span>Workspace</span>
      <span className="mx-1">&gt;</span>
      <span>Folder 5</span>
      <span className="mx-1">&gt;</span>
      <span className="font-semibold text-gray-800">Spreadsheet 3</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search with sheet"
          className="pl-8 pr-3 py-1 rounded border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <FaSearch className="absolute left-2 top-2 text-gray-400 text-xs" />
      </div>
      <button className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center text-lg font-bold">DF</button>
    </div>
  </div>
);

const columnsDef = [
  { label: '#', accessor: (_row: any, i: number) => i + 1, key: 'row' },
  { label: 'ABC', accessor: 'jobRequest', key: 'jobRequest' },
  { label: 'SUBMITTED', accessor: 'submitted', key: 'submitted' },
  { label: 'STATUS', accessor: 'status', key: 'status' },
  { label: 'SUBMITTER', accessor: 'submitter', key: 'submitter' },
  { label: 'ASSIGNEE', accessor: 'assignee', key: 'assignee' },
  { label: 'PRIORITY', accessor: 'priority', key: 'priority' },
  { label: 'DUE DATE', accessor: 'dueDate', key: 'dueDate' },
  { label: 'BUDGET', accessor: 'budget', key: 'budget' },
  { label: 'EST.VALUE', accessor: 'estValue', key: 'estValue' },
  { label: 'URL', accessor: 'url', key: 'url' },
];

const allColumnKeys = [
  'jobRequest', 'submitted', 'status', 'submitter', 'assignee', 'priority', 'dueDate', 'budget', 'estValue', 'url'
];
const allColumnLabels: Record<string, string> = {
  jobRequest: 'Job Request',
  submitted: 'Submitted',
  status: 'Status',
  submitter: 'Submitter',
  assignee: 'Assignee',
  priority: 'Priority',
  dueDate: 'Due Date',
  budget: 'Budget',
  estValue: 'Est.Value',
  url: 'URL',
};

const TableView: React.FC<{ data: any[]; visibleColumns: string[]; filterText: string; onRowClick: (row: any) => void }> = ({ data, visibleColumns, filterText, onRowClick }) => {
  const filtered = data.filter(row =>
    !filterText ||
    allColumnKeys.some(key =>
      String(row[key] || '').toLowerCase().includes(filterText.toLowerCase())
    )
  );
  return (
    <div className="overflow-auto border rounded shadow bg-white">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left font-semibold text-xs px-2 py-2 border-b whitespace-nowrap">#</th>
            {allColumnKeys.filter(key => visibleColumns.includes(key)).map(key => (
              <th key={key} className="text-left font-semibold text-xs px-2 py-2 border-b whitespace-nowrap">{allColumnLabels[key]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row: any, idx) => (
            <tr key={idx} onClick={() => onRowClick(row)} className="cursor-pointer hover:bg-blue-50 transition">
              <td className="text-gray-400 font-medium px-2 py-2 border-b border-r">{idx + 1}</td>
              {allColumnKeys.filter(key => visibleColumns.includes(key)).map(key => (
                <td key={key} className="px-2 py-2 border-b border-r max-w-[180px] truncate">
                  {key === 'status' ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || 'bg-gray-100 text-gray-500'}`}>{row.status}</span>
                  ) : key === 'priority' ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[row.priority] || 'bg-gray-100 text-gray-500'}`}>{row.priority}</span>
                  ) : key === 'url' ? (
                    <a
                      href={row.url && (row.url.startsWith('http://') || row.url.startsWith('https://')) ? row.url : `https://${row.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline truncate block max-w-[160px]"
                    >
                      {row.url}
                    </a>
                  ) : (
                    <span>{row[key]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SpreadsheetGrid: React.FC<{ data: any[]; visibleColumns: string[]; filterText: string; onRowClick: (row: any) => void }> = ({ data, visibleColumns, filterText, onRowClick }) => {
  const filtered = data.filter(row =>
    !filterText ||
    allColumnKeys.some(key =>
      String(row[key] || '').toLowerCase().includes(filterText.toLowerCase())
    )
  );
  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: (_row: any, i: number) => i + 1,
        Cell: ({ value }: any) => <span className="text-gray-400 font-medium">{value}</span>,
        width: 40,
      },
      ...allColumnKeys.filter(key => visibleColumns.includes(key)).map(key => {
        if (key === 'status') {
          return {
            Header: allColumnLabels[key],
            accessor: key,
            Cell: ({ value }: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[value] || 'bg-gray-100 text-gray-500'}`}>{value}</span>
            ),
          };
        }
        if (key === 'priority') {
          return {
            Header: allColumnLabels[key],
            accessor: key,
            Cell: ({ value }: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[value] || 'bg-gray-100 text-gray-500'}`}>{value}</span>
            ),
          };
        }
        if (key === 'url') {
          return {
            Header: allColumnLabels[key],
            accessor: key,
            Cell: ({ value }: any) => (
              <a
                href={value && (value.startsWith('http://') || value.startsWith('https://')) ? value : `https://${value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline truncate block max-w-[160px]"
              >
                {value}
              </a>
            ),
          };
        }
        return {
          Header: allColumnLabels[key],
          accessor: key,
        };
      }),
    ],
    [visibleColumns]
  );
  const tableInstance = useTable({ columns, data: filtered });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
  return (
    <div className="overflow-auto border rounded shadow bg-white">
      <table {...getTableProps()} className="min-w-full border-separate border-spacing-0">
        <thead className="bg-gray-100">
          {headerGroups.map((headerGroup: HeaderGroup<any>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: ColumnInstance<any>) => (
                <th
                  {...column.getHeaderProps()}
                  className="text-left font-semibold text-xs px-2 py-2 border-b whitespace-nowrap"
                  style={{ width: (column as any).width }}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row: Row<any>, i: number) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} onClick={() => onRowClick(row.original)} className="cursor-pointer hover:bg-blue-50 transition">
                {row.cells.map((cell: Cell<any>) => (
                  <td
                    {...cell.getCellProps()}
                    className="px-2 py-2 border-b border-r max-w-[180px] truncate"
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const submitterOptions = [
  'Asha Patel',
  'Irfan Khan',
  'Maria Martinez',
  'Emily Green',
  'Jessica Brown',
];
const assigneeOptions = [
  'Sophie Choudhury',
  'Nisha Pandey',
  'Rachel Lee',
  'Tom Wright',
  'Kevin Smith',
];
const statusOptions = [
  'In-progress',
  'Need to start',
  'Submitted',
  'Complete',
  'Blocked',
];

const Modal: React.FC<{ open: boolean; onClose: () => void; onCreate: (row: any) => void }> = ({ open, onClose, onCreate }) => {
  const [form, setForm] = useState({
    jobRequest: '',
    submitted: '',
    status: 'In-progress',
    submitter: submitterOptions[0],
    assignee: assigneeOptions[0],
    priority: 'Medium',
    dueDate: '',
    budget: '',
    estValue: '',
    url: '',
    description: '',
  });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6">Create New Job Request</h2>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onCreate(form);
            onClose();
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Job Request *</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Enter job request..."
              required
              value={form.jobRequest}
              onChange={e => setForm(f => ({ ...f, jobRequest: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Describe the task in detail..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Submitted</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.submitted}
                onChange={e => setForm(f => ({ ...f, submitted: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Submitter</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.submitter}
                onChange={e => setForm(f => ({ ...f, submitter: e.target.value }))}
              >
                {submitterOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.assignee}
                onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
              >
                {assigneeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Est.Value</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.estValue}
                onChange={e => setForm(f => ({ ...f, estValue: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL/Link</label>
            <input
              type="url"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="https://example.com"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImportModal: React.FC<{ open: boolean; onClose: () => void; onImport: (rows: any[]) => void }> = ({ open, onClose, onImport }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        onImport(results.data as any[]);
        onClose();
      },
    });
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Import CSV File</h2>
        <input type="file" accept=".csv" onChange={handleFile} className="mb-4" />
        <p className="text-sm text-gray-500">Upload a CSV file to import data. First row should contain headers.</p>
      </div>
    </div>
  );
};

const ShareModal: React.FC<{ open: boolean; onClose: () => void; link: string }> = ({ open, onClose, link }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Share Sheet</h2>
        <input type="text" value={link} readOnly className="w-full border rounded px-3 py-2 mb-2" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => {navigator.clipboard.writeText(link);}}>Copy Link</button>
      </div>
    </div>
  );
};

const SortModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSort: (col: string, dir: 'asc' | 'desc') => void;
}> = ({ open, onClose, onSort }) => {
  const [selected, setSelected] = useState('');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Sort</h2>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">Select column and direction</option>
          {columnsDef.filter(c => c.key !== 'row').map(col => [
            <option key={col.key + '-asc'} value={col.key + '-asc'}>{col.label} (A-Z)</option>,
            <option key={col.key + '-desc'} value={col.key + '-desc'}>{col.label} (Z-A)</option>,
          ])}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            const [col, d] = selected.split('-');
            onSort(col, d === 'asc' ? 'asc' : 'desc');
            onClose();
          }}
        >
          Sort
        </button>
      </div>
    </div>
  );
};

const HideFieldsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
}> = ({ open, onClose, visibleColumns, setVisibleColumns }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Show/Hide Columns</h2>
        <div className="space-y-2">
          {allColumnKeys.map(key => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={visibleColumns.includes(key)}
                onChange={e => {
                  if (e.target.checked) setVisibleColumns([...visibleColumns, key]);
                  else setVisibleColumns(visibleColumns.filter(col => col !== key));
                }}
              />
              {allColumnLabels[key]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const FilterModal: React.FC<{
  open: boolean;
  onClose: () => void;
  filterText: string;
  setFilterText: (t: string) => void;
}> = ({ open, onClose, filterText, setFilterText }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Filter Job Requests</h2>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Type to filter by any field..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
        <p className="text-sm text-gray-500">Filter searches in: Job Request, Submitter, Assignee, Status, Priority, Description, URL, Budget, Est.Value</p>
      </div>
    </div>
  );
};

const BottomTabs: React.FC<{
  tabs: string[];
  active: number;
  setActive: (idx: number) => void;
  onAdd: () => void;
}> = ({ tabs, active, setActive, onAdd }) => (
  <div className="w-full flex items-center gap-2 px-8 py-2 border-t bg-white fixed bottom-0 left-0 z-40">
    {tabs.map((tab, idx) => (
      <button
        key={tab + idx}
        className={`px-5 py-1 rounded-t font-medium border-b-2 transition-colors duration-150 ${
          active === idx
            ? 'bg-white border-blue-500 text-blue-600 shadow'
            : 'bg-gray-100 border-transparent text-gray-500'
        }`}
        onClick={() => setActive(idx)}
      >
        {tab}
      </button>
    ))}
    <button
      className="px-4 py-1 rounded-t text-gray-400 hover:text-blue-500"
      onClick={onAdd}
    >
      +
    </button>
  </div>
);

const initialData = [
  {
    jobRequest: 'Q3 Financial Overview',
    submitted: '30-11-2024',
    status: 'In-progress',
    submitter: 'Asha Patel',
    assignee: 'Sophie Choudhury',
    priority: 'Medium',
    dueDate: '20-11-2024',
    budget: '₹6,200,000',
    estValue: '₹5,800,000',
    url: 'www.ashapatel.com',
  },
  {
    jobRequest: 'Launch marketing campaign...',
    submitted: '28-10-2024',
    status: 'Need to start',
    submitter: 'Irfan Khan',
    assignee: 'Nisha Pandey',
    priority: 'High',
    dueDate: '30-10-2024',
    budget: '₹3,500,000',
    estValue: '₹4,200,000',
    url: 'www.irfankhan.com',
  },
  {
    jobRequest: 'Update user interface fee...',
    submitted: '26-10-2024',
    status: 'Submitted',
    submitter: 'Maria Martinez',
    assignee: 'Rachel Lee',
    priority: 'Medium',
    dueDate: '10-12-2024',
    budget: '₹4,750,000',
    estValue: '₹4,500,000',
    url: 'www.mariamartinez.com',
  },
  {
    jobRequest: 'Update news list for comp...',
    submitted: '01-01-2025',
    status: 'Complete',
    submitter: 'Emily Green',
    assignee: 'Tom Wright',
    priority: 'Low',
    dueDate: '15-01-2025',
    budget: '₹6,200,000',
    estValue: '₹6,000,000',
    url: 'www.emilygreen.com',
  },
  {
    jobRequest: 'Design new features for t...',
    submitted: '25-01-2025',
    status: 'Blocked',
    submitter: 'Jessica Brown',
    assignee: 'Kevin Smith',
    priority: 'Low',
    dueDate: '30-01-2025',
    budget: '₹2,800,000',
    estValue: '₹3,100,000',
    url: 'www.jessicabrown.com',
  },
];

const statusFilters: Record<string, (status: string) => boolean> = {
  'All Orders': () => true,
  'Pending': status => status === 'In-progress' || status === 'Need to start',
  'Reviewed': status => status === 'Submitted',
  'Arrived': status => status === 'Complete',
};

const Toolbar: React.FC<{
  onNewAction: () => void;
  onExport: () => void;
  onImport: () => void;
  onShare: () => void;
  onSort: () => void;
  onHideFields: () => void;
  onFilter: () => void;
  view: 'grid' | 'table';
  setView: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
}> = ({ onNewAction, onExport, onImport, onShare, onSort, onHideFields, onFilter, view, setView }) => {
  const buttons = [
    { label: 'Tool bar', icon: '🛠️' },
    { label: 'Hide Fields', icon: '🙈', onClick: onHideFields },
    { label: 'Sort', icon: '↕️', onClick: onSort },
    { label: 'Filter', icon: '🔍', onClick: onFilter },
    { label: view === 'grid' ? 'Grid view' : 'Table view', icon: view === 'grid' ? '🔲' : '📋', highlight: true, onClick: () => setView(view === 'grid' ? 'table' : 'grid') },
  ];
  const rightButtons = [
    { label: 'Import', icon: '⬆️', onClick: onImport },
    { label: 'Export', icon: '⬇️', onClick: onExport },
    { label: 'Share', icon: '🔗', onClick: onShare },
    { label: 'New Action', icon: '➕', highlight: true, onClick: onNewAction },
  ];
  return (
    <div className="flex items-center justify-between px-8 py-2 bg-white border-b">
      <div className="flex gap-2">
        {buttons.map(btn => (
          <button
            key={btn.label}
            className={`flex items-center gap-1 px-3 py-1 rounded border text-gray-700 text-sm font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${btn.highlight ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white'}`}
            onClick={btn.onClick ? btn.onClick : () => console.log(`${btn.label} clicked`)}
          >
            <span>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {rightButtons.map(btn => (
          <button
            key={btn.label}
            className={`flex items-center gap-1 px-3 py-1 rounded border text-gray-700 text-sm font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${btn.highlight ? 'bg-green-600 text-white border-green-600' : 'bg-white'}`}
            onClick={btn.onClick ? btn.onClick : () => console.log(`${btn.label} clicked`)}
          >
            <span>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const JobDetailsModal: React.FC<{ open: boolean; job: any; onClose: () => void }> = ({ open, job, onClose }) => {
  if (!open || !job) return null;
  const statusColor = statusColors[job.status] || 'bg-gray-100 text-gray-700';
  const priorityColor = job.priority === 'High' ? 'bg-red-100 text-red-700' : job.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700';
  const priorityLabel = job.priority ? `${job.priority} Priority` : '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2">{job.jobRequest}</h2>
        <div className="flex gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>{job.status}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColor}`}>{priorityLabel}</span>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Description</div>
          <div className="bg-gray-50 rounded px-3 py-2 text-gray-800">{job.description || <span className="italic text-gray-400">No description</span>}</div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Created by</div>
            <div className="font-semibold text-gray-800">{job.submitter}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Submitted</div>
            <div className="font-semibold text-gray-800">{job.submitted}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Assigned to</div>
            <div className="font-semibold text-gray-800">{job.assignee}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Budget</div>
            <div className="font-semibold text-gray-800">{job.budget}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Due Date</div>
            <div className="font-semibold text-gray-800">{job.dueDate}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Est.Value</div>
            <div className="font-semibold text-gray-800">{job.estValue}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500 mb-1">URL</div>
            <a href={job.url && (job.url.startsWith('http://') || job.url.startsWith('https://')) ? job.url : `https://${job.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{job.url}</a>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="mt-2 px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [hideFieldsOpen, setHideFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [data, setData] = useState(initialData);
  const [shareLink] = useState('https://sheet-app-eosin.vercel.app/share/12345');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumnKeys]);
  const [filterText, setFilterText] = useState('');
  const [tabs, setTabs] = useState(['All Orders', 'Pending', 'Reviewed', 'Arrived']);
  const [activeTab, setActiveTab] = useState(0);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);


  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'spreadsheet.xlsx');
  };

  
  const handleImport = (rows: any[]) => {
    setData(d => [...d, ...rows]);
  };

  
  const handleSort = (col: string, dir: 'asc' | 'desc') => {
    setData(d => {
      const sorted = [...d].sort((a: any, b: any) => {
        if (a[col] < b[col]) return dir === 'asc' ? -1 : 1;
        if (a[col] > b[col]) return dir === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  };

  const handleAddTab = () => {
    setTabs(t => [...t, `New Tab ${t.length + 1}`]);
    setActiveTab(tabs.length);
  };

  const filteredData = data.filter(row => {
    const tab = tabs[activeTab];
    const filterFn = statusFilters[tab] || (() => true);
    return filterFn(row.status);
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans pb-16">
      <TopNav />
      <Toolbar
        onNewAction={() => setModalOpen(true)}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
        onShare={() => setShareOpen(true)}
        onSort={() => setSortOpen(true)}
        onHideFields={() => setHideFieldsOpen(true)}
        onFilter={() => setFilterOpen(true)}
        view={view}
        setView={setView}
      />
      <div className="flex-1 p-8">
        {view === 'grid' ? (
          <SpreadsheetGrid data={filteredData} visibleColumns={visibleColumns} filterText={filterText} onRowClick={row => { setSelectedJob(row); setJobDetailsOpen(true); }} />
        ) : (
          <TableView data={filteredData} visibleColumns={visibleColumns} filterText={filterText} onRowClick={row => { setSelectedJob(row); setJobDetailsOpen(true); }} />
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={row => setData(d => [...d, row])} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} link={shareLink} />
      <SortModal open={sortOpen} onClose={() => setSortOpen(false)} onSort={handleSort} />
      <HideFieldsModal open={hideFieldsOpen} onClose={() => setHideFieldsOpen(false)} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} filterText={filterText} setFilterText={setFilterText} />
      <BottomTabs tabs={tabs} active={activeTab} setActive={setActiveTab} onAdd={handleAddTab} />
      <JobDetailsModal open={jobDetailsOpen} job={selectedJob} onClose={() => setJobDetailsOpen(false)} />
    </div>
  );
};

export default App;
