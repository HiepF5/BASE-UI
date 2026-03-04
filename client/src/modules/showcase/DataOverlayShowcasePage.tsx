import React, { useState, useCallback } from 'react';
import {
  BaseButton,
  BaseTable,
  BaseModal,
  BaseDrawer,
  BasePopover,
  BaseDropdown,
  Flex,
  Stack,
  BaseInput,
} from '../../components/base';
import { BasePagination } from '../../components/base/BasePagination';
import type { ColumnConfig, SortOption } from '../../types';
import type { DropdownMenuEntry } from '../../components/base/BaseDropdown';
import { cn } from '../../core/utils';

// ============================================================
// DataOverlayShowcasePage – Visual reference for Week 3 components
// Table, Pagination, Modal, Drawer, Popover, Dropdown
// ============================================================

/* ── Section wrapper ──────────────────────────────────────── */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text border-b border-border pb-2">{title}</h2>
        {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-bg-elevated p-5', className)}>
      {title && <p className="text-sm font-semibold text-text mb-4">{title}</p>}
      {children}
    </div>
  );
}

/* ── Sample data ──────────────────────────────────────────── */
const SAMPLE_COLUMNS: ColumnConfig[] = [
  {
    name: 'id',
    label: 'ID',
    type: 'number',
    visible: true,
    sortable: true,
    filterable: false,
    editable: false,
    required: true,
    width: 60,
  },
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' },
    ],
  },
  {
    name: 'active',
    label: 'Active',
    type: 'boolean',
    visible: true,
    sortable: false,
    filterable: true,
    editable: true,
    required: false,
  },
  {
    name: 'createdAt',
    label: 'Created',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: false,
    editable: false,
    required: false,
  },
];

const SAMPLE_DATA = Array.from({ length: 48 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['admin', 'editor', 'viewer'][i % 3],
  active: i % 4 !== 0,
  createdAt: new Date(2025, 0, 1 + i).toISOString(),
}));

/* ── Dropdown items for demo ──────────────────────────────── */
const DROPDOWN_ITEMS: DropdownMenuEntry[] = [
  { key: 'edit', label: 'Edit', icon: <span>✏️</span> },
  { key: 'duplicate', label: 'Duplicate', icon: <span>📋</span> },
  { key: 'archive', label: 'Archive', icon: <span>📦</span>, disabled: true },
  { key: 'divider-1', type: 'divider' },
  { key: 'delete', label: 'Delete', icon: <span>🗑️</span>, danger: true },
];

/* ── Main Component ───────────────────────────────────────── */
export function DataOverlayShowcasePage() {
  // ── Table state ─────────────────────────────────────────────
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(10);
  const [tableSort, setTableSort] = useState<SortOption[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const paginatedData = SAMPLE_DATA.slice((tablePage - 1) * tableLimit, tablePage * tableLimit);

  // ── Pagination standalone state ─────────────────────────────
  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, setPaginationLimit] = useState(20);

  // ── Modal state ─────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSm, setModalSm] = useState(false);
  const [modalLg, setModalLg] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  // ── Drawer state ────────────────────────────────────────────
  const [drawerRight, setDrawerRight] = useState(false);
  const [drawerLeft, setDrawerLeft] = useState(false);
  const [drawerBottom, setDrawerBottom] = useState(false);
  const [drawerLg, setDrawerLg] = useState(false);

  // ── Dropdown state ──────────────────────────────────────────
  const [lastAction, setLastAction] = useState('');

  const handleDropdownSelect = useCallback((key: string) => {
    setLastAction(`Dropdown action: ${key}`);
  }, []);

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">📊 Data & Overlay Components</h1>
        <p className="text-sm text-text-secondary mt-1">
          Week 3 – Table, Pagination, Modal, Drawer, Popover, Dropdown | All pure presentational
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════
          TABLE
         ════════════════════════════════════════════════════════ */}
      <Section
        title="Table"
        description="Headless table with sort, row selection, custom renderers, pagination (composed)"
      >
        <Card title="BaseTable – Full Featured">
          <BaseTable
            columns={SAMPLE_COLUMNS}
            data={paginatedData}
            total={SAMPLE_DATA.length}
            page={tablePage}
            limit={tableLimit}
            sort={tableSort}
            selectedRows={selectedRows}
            primaryKey="id"
            onPageChange={setTablePage}
            onLimitChange={(l) => {
              setTableLimit(l);
              setTablePage(1);
            }}
            onSort={setTableSort}
            onRowSelect={setSelectedRows}
            onEdit={(row) => alert(`Edit: ${row.name}`)}
            onDelete={(row) => alert(`Delete: ${row.name}`)}
          />
          {selectedRows.length > 0 && (
            <p className="mt-2 text-sm text-primary">Selected: {selectedRows.join(', ')}</p>
          )}
        </Card>

        <Card title="BaseTable – Compact + Striped">
          <BaseTable
            columns={SAMPLE_COLUMNS}
            data={paginatedData.slice(0, 5)}
            total={5}
            page={1}
            limit={10}
            compact
            striped
            showPagination={false}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            emptyContent={
              <div className="text-center py-4">
                <p className="text-text-muted">No records found</p>
                <BaseButton size="sm" variant="outline" className="mt-2">
                  Create new
                </BaseButton>
              </div>
            }
          />
        </Card>
      </Section>

      {/* ════════════════════════════════════════════════════════
          PAGINATION
         ════════════════════════════════════════════════════════ */}
      <Section
        title="Pagination"
        description="Standalone pagination component with page numbers, size changer, total info"
      >
        <Card title="BasePagination – Default">
          <BasePagination
            page={paginationPage}
            limit={paginationLimit}
            total={248}
            onPageChange={setPaginationPage}
            onLimitChange={(l: number) => {
              setPaginationLimit(l);
              setPaginationPage(1);
            }}
          />
        </Card>

        <Card title="BasePagination – Compact">
          <BasePagination
            page={paginationPage}
            limit={paginationLimit}
            total={248}
            compact
            onPageChange={setPaginationPage}
            onLimitChange={(l: number) => {
              setPaginationLimit(l);
              setPaginationPage(1);
            }}
          />
        </Card>

        <Card title="BasePagination – No size changer, custom sizes">
          <BasePagination
            page={paginationPage}
            limit={paginationLimit}
            total={248}
            showSizeChanger={false}
            maxPageButtons={7}
            onPageChange={setPaginationPage}
          />
        </Card>
      </Section>

      {/* ════════════════════════════════════════════════════════
          MODAL
         ════════════════════════════════════════════════════════ */}
      <Section
        title="Modal"
        description="Dialog overlay with sizes, footer actions, ESC close, backdrop close, focus trap"
      >
        <Card title="BaseModal – Sizes & Footer">
          <Flex gap={3} className="flex-wrap">
            <BaseButton variant="primary" onClick={() => setModalOpen(true)}>
              Default Modal
            </BaseButton>
            <BaseButton variant="outline" onClick={() => setModalSm(true)}>
              Small Modal
            </BaseButton>
            <BaseButton variant="outline" onClick={() => setModalLg(true)}>
              Large Modal
            </BaseButton>
            <BaseButton variant="danger" onClick={() => setConfirmModal(true)}>
              Confirm Dialog
            </BaseButton>
          </Flex>
        </Card>

        {/* Default modal */}
        <BaseModal open={modalOpen} onClose={() => setModalOpen(false)} title="Default Modal (md)">
          <Stack gap={4}>
            <p className="text-text-secondary">
              This is a default medium-sized modal. It supports ESC to close, backdrop click to
              close, and scroll overflow.
            </p>
            <BaseInput label="Sample Input" placeholder="Type something..." />
            <div className="h-60 bg-bg-tertiary rounded flex items-center justify-center text-text-muted">
              Scrollable content area
            </div>
          </Stack>
        </BaseModal>

        {/* Small modal */}
        <BaseModal open={modalSm} onClose={() => setModalSm(false)} title="Small Modal" size="sm">
          <p className="text-text-secondary text-sm">
            A compact modal for quick messages or simple forms.
          </p>
        </BaseModal>

        {/* Large modal */}
        <BaseModal open={modalLg} onClose={() => setModalLg(false)} title="Large Modal" size="lg">
          <p className="text-text-secondary">
            This large modal is perfect for complex forms, data previews, or detailed information.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <BaseInput label="First Name" placeholder="John" />
            <BaseInput label="Last Name" placeholder="Doe" />
            <BaseInput label="Email" placeholder="john@example.com" type="email" />
            <BaseInput label="Phone" placeholder="+84 xxx xxx xxx" />
          </div>
        </BaseModal>

        {/* Confirm dialog with footer */}
        <BaseModal
          open={confirmModal}
          onClose={() => setConfirmModal(false)}
          title="Confirm Delete"
          size="sm"
          footer={
            <>
              <BaseButton variant="outline" onClick={() => setConfirmModal(false)}>
                Cancel
              </BaseButton>
              <BaseButton
                variant="danger"
                onClick={() => {
                  alert('Deleted!');
                  setConfirmModal(false);
                }}
              >
                Delete
              </BaseButton>
            </>
          }
        >
          <p className="text-text-secondary">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
        </BaseModal>
      </Section>

      {/* ════════════════════════════════════════════════════════
          DRAWER
         ════════════════════════════════════════════════════════ */}
      <Section
        title="Drawer"
        description="Slide-in panel with placement (left/right/bottom), sizes, header, footer"
      >
        <Card title="BaseDrawer – Placements & Sizes">
          <Flex gap={3} className="flex-wrap">
            <BaseButton variant="primary" onClick={() => setDrawerRight(true)}>
              Right Drawer
            </BaseButton>
            <BaseButton variant="outline" onClick={() => setDrawerLeft(true)}>
              Left Drawer
            </BaseButton>
            <BaseButton variant="outline" onClick={() => setDrawerBottom(true)}>
              Bottom Drawer
            </BaseButton>
            <BaseButton variant="outline" onClick={() => setDrawerLg(true)}>
              Large Drawer (lg)
            </BaseButton>
          </Flex>
        </Card>

        {/* Right drawer */}
        <BaseDrawer
          open={drawerRight}
          onClose={() => setDrawerRight(false)}
          title="Right Drawer"
          placement="right"
          footer={
            <Flex gap={2} justify="end">
              <BaseButton variant="outline" onClick={() => setDrawerRight(false)}>
                Cancel
              </BaseButton>
              <BaseButton variant="primary" onClick={() => setDrawerRight(false)}>
                Save
              </BaseButton>
            </Flex>
          }
        >
          <Stack gap={4}>
            <p className="text-text-secondary text-sm">
              A right-side drawer for editing records, detail views, or settings panels.
            </p>
            <BaseInput label="Name" placeholder="Enter name..." />
            <BaseInput label="Email" placeholder="Enter email..." type="email" />
            <div className="h-40 bg-bg-tertiary rounded flex items-center justify-center text-text-muted">
              More content here...
            </div>
          </Stack>
        </BaseDrawer>

        {/* Left drawer */}
        <BaseDrawer
          open={drawerLeft}
          onClose={() => setDrawerLeft(false)}
          title="Left Drawer"
          placement="left"
          size="sm"
        >
          <Stack gap={3}>
            <p className="text-text-secondary text-sm">Navigation or filter panel.</p>
            {['Dashboard', 'Users', 'Orders', 'Settings'].map((item) => (
              <button
                key={item}
                className="text-left px-3 py-2 rounded hover:bg-bg-tertiary text-text text-sm"
              >
                {item}
              </button>
            ))}
          </Stack>
        </BaseDrawer>

        {/* Bottom drawer */}
        <BaseDrawer
          open={drawerBottom}
          onClose={() => setDrawerBottom(false)}
          title="Bottom Drawer"
          placement="bottom"
          size="md"
        >
          <p className="text-text-secondary text-sm">
            Bottom drawers work great for mobile-first patterns, action sheets, or batch operations.
          </p>
        </BaseDrawer>

        {/* Large drawer */}
        <BaseDrawer
          open={drawerLg}
          onClose={() => setDrawerLg(false)}
          title="Large Drawer"
          placement="right"
          size="lg"
          footer={
            <Flex gap={2} justify="end">
              <BaseButton variant="outline" onClick={() => setDrawerLg(false)}>
                Close
              </BaseButton>
            </Flex>
          }
        >
          <Stack gap={4}>
            <p className="text-text-secondary text-sm">
              A wider drawer for complex forms or detail views with more space.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <BaseInput label="First Name" placeholder="John" />
              <BaseInput label="Last Name" placeholder="Doe" />
              <BaseInput label="Email" placeholder="john@example.com" type="email" />
              <BaseInput label="Phone" placeholder="+84 xxx xxx xxx" />
            </div>
          </Stack>
        </BaseDrawer>
      </Section>

      {/* ════════════════════════════════════════════════════════
          POPOVER
         ════════════════════════════════════════════════════════ */}
      <Section
        title="Popover"
        description="Floating content anchored to a trigger, with placement and controlled/uncontrolled modes"
      >
        <Card title="BasePopover – Placements">
          <Flex gap={4} className="flex-wrap" align="center">
            <BasePopover
              placement="bottom-start"
              trigger={({ toggle }) => (
                <BaseButton variant="outline" size="sm" onClick={toggle}>
                  Bottom Start ▾
                </BaseButton>
              )}
            >
              <div className="p-4 w-56">
                <p className="text-sm font-medium text-text mb-2">Popover Content</p>
                <p className="text-xs text-text-muted">
                  This popover opens at bottom-start placement.
                </p>
              </div>
            </BasePopover>

            <BasePopover
              placement="bottom-end"
              trigger={({ toggle }) => (
                <BaseButton variant="outline" size="sm" onClick={toggle}>
                  Bottom End ▾
                </BaseButton>
              )}
            >
              <div className="p-4 w-56">
                <p className="text-sm font-medium text-text mb-2">Bottom End</p>
                <p className="text-xs text-text-muted">Aligned to the end of the trigger.</p>
              </div>
            </BasePopover>

            <BasePopover
              placement="top"
              trigger={({ toggle }) => (
                <BaseButton variant="outline" size="sm" onClick={toggle}>
                  Top ▴
                </BaseButton>
              )}
            >
              <div className="p-4 w-48">
                <p className="text-sm font-medium text-text">Top Popover</p>
                <p className="text-xs text-text-muted mt-1">Opens above the trigger.</p>
              </div>
            </BasePopover>

            <BasePopover
              placement="right"
              trigger={({ toggle }) => (
                <BaseButton variant="outline" size="sm" onClick={toggle}>
                  Right →
                </BaseButton>
              )}
            >
              <div className="p-4 w-48">
                <p className="text-sm font-medium text-text">Right Popover</p>
                <p className="text-xs text-text-muted mt-1">Opens to the right.</p>
              </div>
            </BasePopover>
          </Flex>
        </Card>

        <Card title="BasePopover – Rich Content">
          <BasePopover
            placement="bottom-start"
            width={320}
            trigger={({ toggle }) => (
              <BaseButton variant="primary" size="sm" onClick={toggle}>
                Open Rich Popover
              </BaseButton>
            )}
          >
            <div className="p-4 space-y-3">
              <p className="font-medium text-text">Quick Settings</p>
              <BaseInput label="Search" placeholder="Type to search..." size="sm" />
              <div className="flex gap-2">
                <BaseButton size="sm" variant="primary">
                  Apply
                </BaseButton>
                <BaseButton size="sm" variant="outline">
                  Reset
                </BaseButton>
              </div>
            </div>
          </BasePopover>
        </Card>
      </Section>

      {/* ════════════════════════════════════════════════════════
          DROPDOWN
         ════════════════════════════════════════════════════════ */}
      <Section
        title="Dropdown"
        description="Action menu with items, dividers, keyboard navigation, danger items"
      >
        <Card title="BaseDropdown – Action Menus">
          <Flex gap={4} className="flex-wrap" align="center">
            <BaseDropdown
              items={DROPDOWN_ITEMS}
              onSelect={handleDropdownSelect}
              trigger={({ toggle }) => (
                <BaseButton variant="outline" size="sm" onClick={toggle}>
                  Actions ▾
                </BaseButton>
              )}
            />

            <BaseDropdown
              items={DROPDOWN_ITEMS}
              onSelect={handleDropdownSelect}
              placement="bottom-end"
              trigger={({ toggle }) => (
                <BaseButton variant="primary" size="sm" onClick={toggle}>
                  More Options ▾
                </BaseButton>
              )}
            />

            <BaseDropdown
              items={[
                { key: 'profile', label: 'My Profile' },
                { key: 'settings', label: 'Settings' },
                { key: 'help', label: 'Help & Support' },
                { key: 'divider', type: 'divider' },
                { key: 'logout', label: 'Log Out', danger: true },
              ]}
              onSelect={handleDropdownSelect}
              trigger={({ toggle }) => (
                <BaseButton variant="ghost" size="sm" onClick={toggle}>
                  👤 User Menu
                </BaseButton>
              )}
            />
          </Flex>

          {lastAction && (
            <p className="mt-3 text-sm text-primary">
              Last action: <span className="font-medium">{lastAction}</span>
            </p>
          )}
        </Card>
      </Section>

      {/* ════════════════════════════════════════════════════════
          COMPOSITION EXAMPLE
         ════════════════════════════════════════════════════════ */}
      <Section
        title="Composition Example"
        description="Combining Table + Dropdown + Modal + Drawer in a real-world scenario"
      >
        <Card title="User Management (Composed)">
          <ComposedExample />
        </Card>
      </Section>
    </div>
  );
}

/* ── Composed example: Table with row actions ─────────────── */
function ComposedExample() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [editDrawer, setEditDrawer] = useState<Record<string, string> | null>(null);
  const [deleteModal, setDeleteModal] = useState<Record<string, string> | null>(null);

  const data = SAMPLE_DATA.slice((page - 1) * limit, page * limit);

  const columns: ColumnConfig[] = [
    {
      name: 'id',
      label: 'ID',
      type: 'number',
      visible: true,
      sortable: true,
      filterable: false,
      editable: false,
      required: true,
      width: 60,
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      visible: true,
      sortable: true,
      filterable: true,
      editable: true,
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      visible: true,
      sortable: false,
      filterable: true,
      editable: true,
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      visible: true,
      sortable: true,
      filterable: true,
      editable: true,
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
    },
    {
      name: 'active',
      label: 'Active',
      type: 'boolean',
      visible: true,
      sortable: false,
      filterable: false,
      editable: true,
      required: false,
    },
  ];

  return (
    <>
      <BaseTable
        columns={columns}
        data={data}
        total={SAMPLE_DATA.length}
        page={page}
        limit={limit}
        compact
        primaryKey="id"
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        onEdit={(row) => setEditDrawer(row)}
        onDelete={(row) => setDeleteModal(row)}
      />

      {/* Edit Drawer */}
      <BaseDrawer
        open={Boolean(editDrawer)}
        onClose={() => setEditDrawer(null)}
        title={`Edit: ${editDrawer?.name ?? ''}`}
        placement="right"
        size="md"
        footer={
          <Flex gap={2} justify="end">
            <BaseButton variant="outline" onClick={() => setEditDrawer(null)}>
              Cancel
            </BaseButton>
            <BaseButton
              variant="primary"
              onClick={() => {
                alert(`Saved ${editDrawer?.name}`);
                setEditDrawer(null);
              }}
            >
              Save Changes
            </BaseButton>
          </Flex>
        }
      >
        {editDrawer && (
          <Stack gap={4}>
            <BaseInput label="Name" defaultValue={editDrawer.name} />
            <BaseInput label="Email" defaultValue={editDrawer.email} type="email" />
          </Stack>
        )}
      </BaseDrawer>

      {/* Delete Confirm Modal */}
      <BaseModal
        open={Boolean(deleteModal)}
        onClose={() => setDeleteModal(null)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <BaseButton variant="outline" onClick={() => setDeleteModal(null)}>
              Cancel
            </BaseButton>
            <BaseButton
              variant="danger"
              onClick={() => {
                alert(`Deleted ${deleteModal?.name}`);
                setDeleteModal(null);
              }}
            >
              Delete
            </BaseButton>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This cannot be
          undone.
        </p>
      </BaseModal>
    </>
  );
}
