export default function SortableTh({ label, sortKey, currentKey, currentDir, onSort, title }) {
  const active = sortKey === currentKey
  return (
    <th className="sortable-th" title={title} onClick={() => onSort(sortKey)} aria-sort={active ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      {label}
      <span className="sort-arrow">{active ? (currentDir === 'asc' ? ' ▲' : ' ▼') : ''}</span>
    </th>
  )
}
