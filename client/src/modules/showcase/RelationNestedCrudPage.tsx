import React, { useState, useCallback } from 'react';
import { BaseButton, BaseInput, BaseSelect, BaseModal, BaseDrawer } from '../../components/base';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Save,
  X,
  Check,
  ShoppingCart,
  Package,
  Users,
  Tag,
  ChevronDown,
  ChevronUp,
  Undo2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../core/utils';

// ============================================================
// RelationNestedCrudPage — Screen 4: RELATION + NESTED CRUD
// Real-world Order management example demonstrating:
// ✅ ManyToOne — User dropdown
// ✅ OneToMany — OrderItems inline table
// ✅ ManyToMany — Product tags multi-select
// ✅ Inline row add / edit
// ✅ Inline validation
// ✅ Nested transaction (parent + children atomic save)
// ✅ Optimistic update
// ============================================================

// ── Types ─────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  _status?: 'new' | 'edited' | 'deleted';
  _errors?: Partial<Record<string, string>>;
}

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes: string;
  tags: number[];
  items: OrderItem[];
  total: number;
  created_at: string;
}

interface TagOption {
  id: number;
  name: string;
  color: string;
}

// ── Mock Data ─────────────────────────────────────────────────

const MOCK_USERS: User[] = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@example.com' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 34990000, category: 'Điện thoại' },
  { id: 2, name: 'MacBook Air M3', price: 27990000, category: 'Laptop' },
  { id: 3, name: 'AirPods Pro 2', price: 5990000, category: 'Phụ kiện' },
  { id: 4, name: 'iPad Air 5', price: 16990000, category: 'Tablet' },
  { id: 5, name: 'Apple Watch Ultra 2', price: 21990000, category: 'Đồng hồ' },
  { id: 6, name: 'Samsung Galaxy S24 Ultra', price: 29990000, category: 'Điện thoại' },
  { id: 7, name: 'Sony WH-1000XM5', price: 7990000, category: 'Phụ kiện' },
  { id: 8, name: 'Dell XPS 15', price: 42990000, category: 'Laptop' },
];

const MOCK_TAGS: TagOption[] = [
  { id: 1, name: 'VIP', color: 'bg-yellow-100 text-yellow-800' },
  { id: 2, name: 'Ưu tiên', color: 'bg-red-100 text-red-800' },
  { id: 3, name: 'COD', color: 'bg-blue-100 text-blue-800' },
  { id: 4, name: 'Free Ship', color: 'bg-green-100 text-green-800' },
  { id: 5, name: 'Bảo hành mở rộng', color: 'bg-purple-100 text-purple-800' },
  { id: 6, name: 'Quà tặng kèm', color: 'bg-pink-100 text-pink-800' },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'ORD-2026-001',
    user_id: 1,
    user_name: 'Nguyễn Văn A',
    status: 'delivered',
    notes: 'Giao nhanh nội thành',
    tags: [1, 4],
    items: [
      {
        id: 101,
        product_id: 1,
        product_name: 'iPhone 15 Pro Max',
        quantity: 1,
        unit_price: 34990000,
        subtotal: 34990000,
      },
      {
        id: 102,
        product_id: 3,
        product_name: 'AirPods Pro 2',
        quantity: 2,
        unit_price: 5990000,
        subtotal: 11980000,
      },
    ],
    total: 46970000,
    created_at: '2026-02-28',
  },
  {
    id: 2,
    order_number: 'ORD-2026-002',
    user_id: 2,
    user_name: 'Trần Thị B',
    status: 'processing',
    notes: '',
    tags: [3],
    items: [
      {
        id: 201,
        product_id: 2,
        product_name: 'MacBook Air M3',
        quantity: 1,
        unit_price: 27990000,
        subtotal: 27990000,
      },
    ],
    total: 27990000,
    created_at: '2026-03-01',
  },
  {
    id: 3,
    order_number: 'ORD-2026-003',
    user_id: 3,
    user_name: 'Lê Văn C',
    status: 'pending',
    notes: 'Gọi trước khi giao',
    tags: [2, 5],
    items: [
      {
        id: 301,
        product_id: 4,
        product_name: 'iPad Air 5',
        quantity: 1,
        unit_price: 16990000,
        subtotal: 16990000,
      },
      {
        id: 302,
        product_id: 7,
        product_name: 'Sony WH-1000XM5',
        quantity: 1,
        unit_price: 7990000,
        subtotal: 7990000,
      },
      {
        id: 303,
        product_id: 5,
        product_name: 'Apple Watch Ultra 2',
        quantity: 1,
        unit_price: 21990000,
        subtotal: 21990000,
      },
    ],
    total: 46970000,
    created_at: '2026-03-02',
  },
  {
    id: 4,
    order_number: 'ORD-2026-004',
    user_id: 4,
    user_name: 'Phạm Thị D',
    status: 'shipped',
    notes: '',
    tags: [4, 6],
    items: [
      {
        id: 401,
        product_id: 6,
        product_name: 'Samsung Galaxy S24 Ultra',
        quantity: 2,
        unit_price: 29990000,
        subtotal: 59980000,
      },
    ],
    total: 59980000,
    created_at: '2026-03-03',
  },
  {
    id: 5,
    order_number: 'ORD-2026-005',
    user_id: 5,
    user_name: 'Hoàng Văn E',
    status: 'cancelled',
    notes: 'Khách hủy đơn',
    tags: [],
    items: [
      {
        id: 501,
        product_id: 8,
        product_name: 'Dell XPS 15',
        quantity: 1,
        unit_price: 42990000,
        subtotal: 42990000,
      },
    ],
    total: 42990000,
    created_at: '2026-03-04',
  },
];

const STATUS_OPTIONS = [
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đã giao vận', value: 'shipped' },
  { label: 'Đã giao hàng', value: 'delivered' },
  { label: 'Đã hủy', value: 'cancelled' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đã giao vận',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
};

// ── Helper ────────────────────────────────────────────────────

function formatVND(v: number): string {
  return v.toLocaleString('vi-VN') + 'đ';
}

let _nextItemId = 600;
function nextItemId() {
  return ++_nextItemId;
}

let _nextOrderId = 6;
function nextOrderId() {
  return _nextOrderId++;
}

// ── Inline Item Row (editable) ────────────────────────────────

interface InlineItemRowProps {
  item: OrderItem;
  products: Product[];
  disabled?: boolean;
  onUpdate: (item: OrderItem) => void;
  onDelete: (id: number) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

function InlineItemRow({
  item,
  products,
  disabled,
  onUpdate,
  onDelete,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: InlineItemRowProps) {
  const [draft, setDraft] = useState<OrderItem>(item);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Reset draft when item changes
  React.useEffect(() => {
    setDraft(item);
    setErrors({});
  }, [item]);

  const validate = useCallback((d: OrderItem): Partial<Record<string, string>> => {
    const errs: Partial<Record<string, string>> = {};
    if (!d.product_id) errs.product_id = 'Chọn sản phẩm';
    if (d.quantity < 1) errs.quantity = 'Tối thiểu 1';
    if (d.unit_price < 0) errs.unit_price = 'Giá không hợp lệ';
    return errs;
  }, []);

  const handleSave = useCallback(() => {
    const errs = validate(draft);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const subtotal = draft.quantity * draft.unit_price;
    onUpdate({ ...draft, subtotal, _status: 'edited', _errors: undefined });
  }, [draft, validate, onUpdate]);

  const handleProductChange = useCallback(
    (productId: number) => {
      const p = products.find((pr) => pr.id === productId);
      if (p) {
        setDraft((d) => ({
          ...d,
          product_id: p.id,
          product_name: p.name,
          unit_price: p.price,
          subtotal: d.quantity * p.price,
        }));
      }
    },
    [products],
  );

  if (item._status === 'deleted') {
    return (
      <tr className="bg-red-50/50 line-through text-text-muted">
        <td className="px-3 py-2 text-sm">{item.product_name}</td>
        <td className="px-3 py-2 text-sm text-right">{item.quantity}</td>
        <td className="px-3 py-2 text-sm text-right">{formatVND(item.unit_price)}</td>
        <td className="px-3 py-2 text-sm text-right">{formatVND(item.subtotal)}</td>
        <td className="px-3 py-2 text-right">
          <button
            onClick={() => onUpdate({ ...item, _status: undefined })}
            className="text-xs px-2 py-1 rounded text-primary-600 hover:bg-primary-50"
            title="Hoàn tác xóa"
          >
            <Undo2 size={14} />
          </button>
        </td>
      </tr>
    );
  }

  if (isEditing) {
    return (
      <tr className="bg-primary-50/30">
        <td className="px-2 py-1.5">
          <select
            className={cn(
              'w-full text-sm border rounded px-2 py-1.5',
              errors.product_id ? 'border-red-500' : 'border-border',
            )}
            value={draft.product_id}
            onChange={(e) => handleProductChange(Number(e.target.value))}
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatVND(p.price)})
              </option>
            ))}
          </select>
          {errors.product_id && (
            <span className="text-[10px] text-red-500 flex items-center gap-0.5 mt-0.5">
              <AlertCircle size={10} /> {errors.product_id}
            </span>
          )}
        </td>
        <td className="px-2 py-1.5">
          <input
            type="number"
            min={1}
            className={cn(
              'w-20 text-sm border rounded px-2 py-1.5 text-right',
              errors.quantity ? 'border-red-500' : 'border-border',
            )}
            value={draft.quantity}
            onChange={(e) =>
              setDraft((d) => {
                const q = Number(e.target.value) || 0;
                return { ...d, quantity: q, subtotal: q * d.unit_price };
              })
            }
          />
          {errors.quantity && (
            <span className="text-[10px] text-red-500 flex items-center gap-0.5 mt-0.5">
              <AlertCircle size={10} /> {errors.quantity}
            </span>
          )}
        </td>
        <td className="px-2 py-1.5">
          <input
            type="number"
            min={0}
            className={cn(
              'w-32 text-sm border rounded px-2 py-1.5 text-right',
              errors.unit_price ? 'border-red-500' : 'border-border',
            )}
            value={draft.unit_price}
            onChange={(e) =>
              setDraft((d) => {
                const price = Number(e.target.value) || 0;
                return { ...d, unit_price: price, subtotal: d.quantity * price };
              })
            }
          />
        </td>
        <td className="px-3 py-1.5 text-sm text-right font-medium">
          {formatVND(draft.quantity * draft.unit_price)}
        </td>
        <td className="px-2 py-1.5 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleSave}
              className="p-1 rounded text-green-600 hover:bg-green-50"
              title="Lưu"
            >
              <Check size={14} />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1 rounded text-neutral-500 hover:bg-neutral-100"
              title="Hủy"
            >
              <X size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={cn(
        'border-b border-border last:border-b-0 hover:bg-neutral-50 transition-colors',
        item._status === 'new' && 'bg-green-50/30',
        item._status === 'edited' && 'bg-yellow-50/30',
      )}
    >
      <td className="px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          {item.product_name}
          {item._status === 'new' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              Mới
            </span>
          )}
          {item._status === 'edited' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
              Sửa
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-right">{item.quantity}</td>
      <td className="px-3 py-2 text-sm text-right">{formatVND(item.unit_price)}</td>
      <td className="px-3 py-2 text-sm text-right font-medium">{formatVND(item.subtotal)}</td>
      <td className="px-3 py-2 text-right">
        {!disabled && (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onStartEdit}
              className="p-1 rounded text-primary-600 hover:bg-primary-50"
              title="Sửa"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 rounded text-red-500 hover:bg-red-50"
              title="Xóa"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ── Multi-Select Tags ─────────────────────────────────────────

function TagMultiSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: number[];
  onChange: (v: number[]) => void;
  options: TagOption[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((t) => value.includes(t.id));
  const available = options.filter((t) => !value.includes(t.id));

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-text-secondary mb-1">
        <span className="flex items-center gap-1.5">
          <Tag size={14} /> Tags (ManyToMany)
        </span>
      </label>
      <div
        className={cn(
          'border rounded-lg px-3 py-2 min-h-[40px] flex flex-wrap items-center gap-1.5 cursor-pointer',
          disabled ? 'bg-neutral-100 cursor-not-allowed' : 'border-border hover:border-primary-400',
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        {selected.length === 0 && <span className="text-sm text-text-muted">Chọn tags...</span>}
        {selected.map((tag) => (
          <span
            key={tag.id}
            className={cn(
              'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
              tag.color,
            )}
          >
            {tag.name}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((v) => v !== tag.id));
                }}
                className="hover:opacity-70"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        <ChevronDown size={14} className="ml-auto text-text-muted" />
      </div>
      {open && !disabled && available.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-lg shadow-lg py-1 max-h-40 overflow-y-auto">
          {available.map((tag) => (
            <button
              key={tag.id}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50 flex items-center gap-2"
              onClick={() => {
                onChange([...value, tag.id]);
                setOpen(false);
              }}
            >
              <span className={cn('inline-block w-2 h-2 rounded-full', tag.color.split(' ')[0])} />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── OrderItems Inline Table (OneToMany) ───────────────────────

function OrderItemsInlineTable({
  items,
  onChange,
  disabled,
}: {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  disabled?: boolean;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<OrderItem>({
    id: 0,
    product_id: 0,
    product_name: '',
    quantity: 1,
    unit_price: 0,
    subtotal: 0,
  });
  const [newErrors, setNewErrors] = useState<Partial<Record<string, string>>>({});

  const activeItems = items.filter((i) => i._status !== 'deleted');

  const handleUpdateItem = useCallback(
    (updated: OrderItem) => {
      onChange(items.map((i) => (i.id === updated.id ? updated : i)));
      setEditingId(null);
    },
    [items, onChange],
  );

  const handleDeleteItem = useCallback(
    (id: number) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      if (item._status === 'new') {
        // Remove entirely if not saved
        onChange(items.filter((i) => i.id !== id));
      } else {
        // Soft delete (optimistic) — mark for deletion
        onChange(items.map((i) => (i.id === id ? { ...i, _status: 'deleted' as const } : i)));
      }
    },
    [items, onChange],
  );

  const handleAddNew = useCallback(() => {
    const errs: Partial<Record<string, string>> = {};
    if (!newItem.product_id) errs.product_id = 'Chọn sản phẩm';
    if (newItem.quantity < 1) errs.quantity = 'Tối thiểu 1';
    if (Object.keys(errs).length > 0) {
      setNewErrors(errs);
      return;
    }
    const sub = newItem.quantity * newItem.unit_price;
    const created: OrderItem = {
      ...newItem,
      id: nextItemId(),
      subtotal: sub,
      _status: 'new',
    };
    onChange([...items, created]);
    setAddingNew(false);
    setNewItem({ id: 0, product_id: 0, product_name: '', quantity: 1, unit_price: 0, subtotal: 0 });
    setNewErrors({});
  }, [newItem, items, onChange]);

  const handleNewProductChange = useCallback((productId: number) => {
    const p = MOCK_PRODUCTS.find((pr) => pr.id === productId);
    if (p) {
      setNewItem((d) => ({
        ...d,
        product_id: p.id,
        product_name: p.name,
        unit_price: p.price,
        subtotal: d.quantity * p.price,
      }));
    }
  }, []);

  const total = activeItems.reduce(
    (sum, i) => sum + (i._status === 'edited' ? i.subtotal : i.subtotal),
    0,
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-primary-600" />
          <h4 className="text-sm font-semibold text-text-primary">Chi tiết đơn hàng (OneToMany)</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
            {activeItems.length} sản phẩm
          </span>
        </div>
        {!disabled && (
          <BaseButton
            size="sm"
            variant="primary"
            onClick={() => setAddingNew(true)}
            disabled={addingNew}
          >
            <span className="flex items-center gap-1">
              <Plus size={14} /> Thêm dòng
            </span>
          </BaseButton>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-border">
            <tr>
              <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary">
                Sản phẩm
              </th>
              <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary w-24">
                Số lượng
              </th>
              <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary w-36">
                Đơn giá
              </th>
              <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary w-36">
                Thành tiền
              </th>
              <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary w-20"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <InlineItemRow
                key={item.id}
                item={item}
                products={MOCK_PRODUCTS}
                disabled={disabled}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                isEditing={editingId === item.id}
                onStartEdit={() => setEditingId(item.id)}
                onCancelEdit={() => setEditingId(null)}
              />
            ))}

            {/* Add New Row */}
            {addingNew && (
              <tr className="bg-green-50/30">
                <td className="px-2 py-1.5">
                  <select
                    className={cn(
                      'w-full text-sm border rounded px-2 py-1.5',
                      newErrors.product_id ? 'border-red-500' : 'border-border',
                    )}
                    value={newItem.product_id}
                    onChange={(e) => handleNewProductChange(Number(e.target.value))}
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {MOCK_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatVND(p.price)})
                      </option>
                    ))}
                  </select>
                  {newErrors.product_id && (
                    <span className="text-[10px] text-red-500 flex items-center gap-0.5 mt-0.5">
                      <AlertCircle size={10} /> {newErrors.product_id}
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={1}
                    className={cn(
                      'w-20 text-sm border rounded px-2 py-1.5 text-right',
                      newErrors.quantity ? 'border-red-500' : 'border-border',
                    )}
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem((d) => {
                        const q = Number(e.target.value) || 0;
                        return { ...d, quantity: q, subtotal: q * d.unit_price };
                      })
                    }
                  />
                </td>
                <td className="px-3 py-1.5 text-sm text-right">
                  {newItem.unit_price > 0 ? formatVND(newItem.unit_price) : '—'}
                </td>
                <td className="px-3 py-1.5 text-sm text-right font-medium">
                  {newItem.unit_price > 0 ? formatVND(newItem.quantity * newItem.unit_price) : '—'}
                </td>
                <td className="px-2 py-1.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={handleAddNew}
                      className="p-1 rounded text-green-600 hover:bg-green-50"
                      title="Thêm"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setAddingNew(false);
                        setNewErrors({});
                      }}
                      className="p-1 rounded text-neutral-500 hover:bg-neutral-100"
                      title="Hủy"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {items.length === 0 && !addingNew && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-text-muted">
                  Chưa có sản phẩm nào. Nhấn &quot;Thêm dòng&quot; để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
          {activeItems.length > 0 && (
            <tfoot className="bg-neutral-50 border-t border-border">
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-2 text-sm font-semibold text-right text-text-primary"
                >
                  Tổng cộng:
                </td>
                <td className="px-3 py-2 text-sm font-bold text-right text-primary-600">
                  {formatVND(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ── Order Form (Create/Edit with nested data) ─────────────────

interface OrderFormValues {
  user_id: number;
  status: string;
  notes: string;
  tags: number[];
  items: OrderItem[];
}

interface OrderFormProps {
  mode: 'create' | 'edit';
  initialValues?: Order | null;
  onSubmit: (data: OrderFormValues) => void;
  onCancel: () => void;
  saving?: boolean;
}

function OrderForm({ mode, initialValues, onSubmit, onCancel, saving }: OrderFormProps) {
  const [userId, setUserId] = useState(initialValues?.user_id ?? 0);
  const [status, setStatus] = useState(initialValues?.status ?? 'pending');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [tags, setTags] = useState<number[]>(initialValues?.tags ?? []);
  const [items, setItems] = useState<OrderItem[]>(initialValues?.items ?? []);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = useCallback((): Partial<Record<string, string>> => {
    const errs: Partial<Record<string, string>> = {};
    if (!userId) errs.user_id = 'Vui lòng chọn khách hàng';
    if (!status) errs.status = 'Vui lòng chọn trạng thái';
    const activeItems = items.filter((i) => i._status !== 'deleted');
    if (activeItems.length === 0) errs.items = 'Đơn hàng phải có ít nhất 1 sản phẩm';
    return errs;
  }, [userId, status, items]);

  const handleSubmit = useCallback(() => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({ user_id: userId, status, notes, tags, items });
  }, [validate, onSubmit, userId, status, notes, tags, items]);

  return (
    <div className="space-y-6">
      {/* ── Parent Fields ────────────────────────────────── */}
      <div className="bg-white border border-border rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Package size={16} className="text-primary-600" />
          Thông tin đơn hàng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ManyToOne: User (Customer) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              <span className="flex items-center gap-1.5">
                <Users size={14} /> Khách hàng (ManyToOne) <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              className={cn(
                'w-full text-sm border rounded-lg px-3 py-2',
                errors.user_id ? 'border-red-500' : 'border-border',
              )}
              value={userId}
              onChange={(e) => {
                setUserId(Number(e.target.value));
                setErrors((prev) => ({ ...prev, user_id: undefined }));
              }}
            >
              <option value={0}>-- Chọn khách hàng --</option>
              {MOCK_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {errors.user_id && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.user_id}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <BaseSelect
              label="Trạng thái"
              name="status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as Order['status'])}
              error={errors.status}
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <BaseInput
            label="Ghi chú"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú đơn hàng..."
          />
        </div>

        {/* ManyToMany: Tags */}
        <TagMultiSelect value={tags} onChange={setTags} options={MOCK_TAGS} />
      </div>

      {/* ── Child Items (OneToMany) ──────────────────────── */}
      <div>
        <OrderItemsInlineTable items={items} onChange={setItems} />
        {errors.items && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.items}
          </p>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-text-muted">
          {mode === 'create'
            ? '💡 Nested Transaction: Parent + Children sẽ được lưu trong 1 request.'
            : '💡 Optimistic Update: Thay đổi hiển thị ngay, cuộn lại nếu server lỗi.'}
        </p>
        <div className="flex items-center gap-2">
          <BaseButton variant="outline" onClick={onCancel} disabled={saving}>
            Hủy
          </BaseButton>
          <BaseButton variant="primary" onClick={handleSubmit} loading={saving}>
            <span className="flex items-center gap-1.5">
              <Save size={14} />
              {mode === 'create' ? 'Tạo đơn hàng' : 'Cập nhật'}
            </span>
          </BaseButton>
        </div>
      </div>
    </div>
  );
}

// ── Order Detail Drawer ───────────────────────────────────────

function OrderDetailDrawer({
  order,
  open,
  onClose,
  onEdit,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onEdit: (o: Order) => void;
}) {
  if (!order) return null;

  return (
    <BaseDrawer
      open={open}
      onClose={onClose}
      title={`Chi tiết — ${order.order_number}`}
      placement="right"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <BaseButton variant="outline" onClick={onClose}>
            Đóng
          </BaseButton>
          <BaseButton
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(order);
            }}
          >
            Chuyển sang sửa
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Info */}
        <div className="space-y-3">
          <DetailRow label="Mã đơn" value={order.order_number} />
          <DetailRow label="Khách hàng" value={order.user_name} />
          <DetailRow
            label="Trạng thái"
            value={
              <span
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full font-medium',
                  STATUS_BADGE[order.status],
                )}
              >
                {STATUS_LABEL[order.status]}
              </span>
            }
          />
          <DetailRow label="Ghi chú" value={order.notes || '—'} />
          <DetailRow label="Ngày tạo" value={order.created_at} />
          <DetailRow
            label="Tags"
            value={
              <div className="flex flex-wrap gap-1">
                {order.tags.length === 0 && <span className="text-text-muted">—</span>}
                {order.tags.map((tid) => {
                  const tag = MOCK_TAGS.find((t) => t.id === tid);
                  return tag ? (
                    <span key={tid} className={cn('text-xs px-2 py-0.5 rounded-full', tag.color)}>
                      {tag.name}
                    </span>
                  ) : null;
                })}
              </div>
            }
          />
        </div>

        {/* Items */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <ShoppingCart size={14} /> Chi tiết sản phẩm ({order.items.length})
          </h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-border">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary">
                    Sản phẩm
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary">
                    SL
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary">
                    Đơn giá
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2">{item.product_name}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatVND(item.unit_price)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatVND(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50 border-t border-border">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-semibold">
                    Tổng cộng:
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-primary-600">
                    {formatVND(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-28 shrink-0 text-sm text-text-muted">{label}</span>
      <div className="text-sm font-medium text-text-primary">{value}</div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export function RelationNestedCrudPage() {
  const [data, setData] = useState<Order[]>(INITIAL_ORDERS);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  // ── Simulated async save (nested transaction) ──────────
  const simulateNestedSave = useCallback(async (label: string, action: () => void) => {
    setSaving(true);
    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 800));
    action();
    setSaving(false);
    toast.success(label);
  }, []);

  // ── CREATE ──────────────────────────────────────────────
  const handleCreate = useCallback(
    (formData: OrderFormValues) => {
      const user = MOCK_USERS.find((u) => u.id === formData.user_id);
      const activeItems = formData.items.filter((i) => i._status !== 'deleted');
      const total = activeItems.reduce((s, i) => s + i.subtotal, 0);
      const id = nextOrderId();
      const newOrder: Order = {
        id,
        order_number: `ORD-2026-${String(id).padStart(3, '0')}`,
        user_id: formData.user_id,
        user_name: user?.name ?? '',
        status: formData.status as Order['status'],
        notes: formData.notes,
        tags: formData.tags,
        items: activeItems.map((i) => ({ ...i, _status: undefined, _errors: undefined })),
        total,
        created_at: new Date().toISOString().split('T')[0],
      };

      simulateNestedSave(
        `Nested Create: Đơn hàng ${newOrder.order_number} + ${activeItems.length} sản phẩm đã lưu trong 1 transaction!`,
        () => {
          setData((prev) => [newOrder, ...prev]);
          setCreateOpen(false);
        },
      );
    },
    [simulateNestedSave],
  );

  // ── EDIT (Optimistic Update) ────────────────────────────
  const handleEdit = useCallback(
    (formData: OrderFormValues) => {
      if (!selectedOrder) return;
      const user = MOCK_USERS.find((u) => u.id === formData.user_id);
      const activeItems = formData.items.filter((i) => i._status !== 'deleted');
      const total = activeItems.reduce((s, i) => s + i.subtotal, 0);

      // Optimistic: apply immediately
      const updatedOrder: Order = {
        ...selectedOrder,
        user_id: formData.user_id,
        user_name: user?.name ?? '',
        status: formData.status as Order['status'],
        notes: formData.notes,
        tags: formData.tags,
        items: activeItems.map((i) => ({ ...i, _status: undefined, _errors: undefined })),
        total,
      };

      // Optimistically update UI
      const prevData = [...data];
      setData((prev) => prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)));
      setEditOpen(false);

      // Simulate server confirmation (optimistic update pattern)
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        // Simulate success (in real app, rollback prevData on error)
        toast.success(
          `Optimistic Update: Đơn hàng ${updatedOrder.order_number} cập nhật ngay lập tức! (Server xác nhận sau ${800}ms)`,
        );
        // If server fails, we'd do: setData(prevData);
        void prevData; // keep reference for potential rollback
      }, 800);
    },
    [selectedOrder, data],
  );

  // ── DELETE ──────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!selectedOrder) return;
    simulateNestedSave(`Đã xóa đơn hàng ${selectedOrder.order_number}`, () => {
      setData((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      setDeleteOpen(false);
      setSelectedOrder(null);
    });
  }, [selectedOrder, simulateNestedSave]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">🔗 Relation + Nested CRUD</h1>
        <p className="text-sm text-text-secondary mt-1">
          Quản lý đơn hàng — Demo: ManyToOne (Customer), OneToMany (Order Items), ManyToMany (Tags),
          Inline Edit, Inline Validation, Nested Transaction, Optimistic Update.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <Users size={20} />,
            label: 'ManyToOne',
            desc: 'Customer dropdown',
            color: 'text-blue-600 bg-blue-50',
          },
          {
            icon: <ShoppingCart size={20} />,
            label: 'OneToMany Inline',
            desc: 'Inline row add/edit/delete',
            color: 'text-green-600 bg-green-50',
          },
          {
            icon: <Tag size={20} />,
            label: 'ManyToMany',
            desc: 'Tags multi-select',
            color: 'text-purple-600 bg-purple-50',
          },
          {
            icon: <Save size={20} />,
            label: 'Nested Transaction',
            desc: 'Parent + children atomic',
            color: 'text-orange-600 bg-orange-50',
          },
        ].map((f) => (
          <div key={f.label} className="border border-border rounded-lg p-3 text-center bg-white">
            <div className={cn('inline-flex p-2 rounded-full mb-1', f.color)}>{f.icon}</div>
            <p className="text-xs font-semibold text-text-primary">{f.label}</p>
            <p className="text-[10px] text-text-muted">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2">
        <BaseButton variant="primary" onClick={() => setCreateOpen(true)}>
          <span className="flex items-center gap-1.5">
            <Plus size={15} /> Tạo đơn hàng
          </span>
        </BaseButton>
      </div>

      {/* Order List */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-border">
            <tr>
              <th className="w-10 px-3 py-2" />
              <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary">
                Mã đơn
              </th>
              <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary">
                Khách hàng
              </th>
              <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary">
                Trạng thái
              </th>
              <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary">Tags</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary">SP</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary">
                Tổng tiền
              </th>
              <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary">
                Ngày tạo
              </th>
              <th className="text-right px-3 py-2 text-xs font-medium text-text-secondary w-28">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="border-b border-border hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      className="p-0.5 rounded hover:bg-neutral-200"
                    >
                      {expanded === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-medium text-primary-600">{order.order_number}</td>
                  <td className="px-3 py-2">{order.user_name}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        STATUS_BADGE[order.status],
                      )}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {order.tags.map((tid) => {
                        const tag = MOCK_TAGS.find((t) => t.id === tid);
                        return tag ? (
                          <span
                            key={tid}
                            className={cn('text-[10px] px-1.5 py-0.5 rounded-full', tag.color)}
                          >
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">{order.items.length}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatVND(order.total)}</td>
                  <td className="px-3 py-2">{order.created_at}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setViewOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                        title="Xem"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditOpen(true);
                        }}
                        className="p-1 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded"
                        title="Sửa"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setDeleteOpen(true);
                        }}
                        className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Expanded Inline Items (Master-Detail) */}
                {expanded === order.id && (
                  <tr className="bg-neutral-50/50">
                    <td />
                    <td colSpan={8} className="px-3 py-3">
                      <div className="border border-border rounded-lg overflow-hidden bg-white">
                        <table className="w-full text-xs">
                          <thead className="bg-neutral-100">
                            <tr>
                              <th className="text-left px-3 py-1.5 font-medium text-text-secondary">
                                Sản phẩm
                              </th>
                              <th className="text-right px-3 py-1.5 font-medium text-text-secondary">
                                SL
                              </th>
                              <th className="text-right px-3 py-1.5 font-medium text-text-secondary">
                                Đơn giá
                              </th>
                              <th className="text-right px-3 py-1.5 font-medium text-text-secondary">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id} className="border-b border-border last:border-b-0">
                                <td className="px-3 py-1.5">{item.product_name}</td>
                                <td className="px-3 py-1.5 text-right">{item.quantity}</td>
                                <td className="px-3 py-1.5 text-right">
                                  {formatVND(item.unit_price)}
                                </td>
                                <td className="px-3 py-1.5 text-right font-medium">
                                  {formatVND(item.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Architecture Note */}
      <div className="bg-white border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Kiến trúc Relation Engine</h3>
        <pre className="text-[11px] leading-relaxed bg-neutral-50 p-4 rounded-lg overflow-x-auto">
          {`┌──────────────────────────────────────────────────────────────────┐
│  RelationNestedCrudPage (Smart Page)                             │
│  ├── OrderForm (Parent Form)                                     │
│  │   ├── ManyToOne → <select> (User dropdown)                    │
│  │   ├── ManyToMany → <TagMultiSelect> (Tags chips)              │
│  │   └── OrderItemsInlineTable (OneToMany child CRUD)            │
│  │       ├── InlineItemRow (inline edit with validation)         │
│  │       ├── Add New Row (inline add with validation)            │
│  │       └── Soft Delete + Undo (optimistic pattern)             │
│  └── OrderDetailDrawer (Master-Detail view)                      │
├──────────────────────────────────────────────────────────────────┤
│  Hooks (Production)                                              │
│  ├── useRelationCrud  → Child CRUD + FK auto-injection           │
│  ├── useNestedCrud    → Atomic parent+children save              │
│  ├── useRelationOptions → Preload dropdown options               │
│  └── useCrudEngine    → Schema + CRUD + Relation orchestration   │
├──────────────────────────────────────────────────────────────────┤
│  Patterns Demonstrated                                           │
│  ├── Inline Row Add      → Add directly in table, no modal      │
│  ├── Inline Validation   → Per-field errors in edit/add mode     │
│  ├── Nested Transaction  → Parent + children saved atomically    │
│  └── Optimistic Update   → UI updates instantly, rollback on err │
└──────────────────────────────────────────────────────────────────┘`}
        </pre>
      </div>

      {/* ── CREATE Modal ─────────────────────────────────── */}
      <BaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo đơn hàng mới (Nested Transaction)"
        size="xl"
      >
        <OrderForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          saving={saving}
        />
      </BaseModal>

      {/* ── EDIT Modal ───────────────────────────────────── */}
      <BaseModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Sửa đơn hàng — ${selectedOrder?.order_number ?? ''} (Optimistic Update)`}
        size="xl"
      >
        <OrderForm
          mode="edit"
          initialValues={selectedOrder}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          saving={saving}
        />
      </BaseModal>

      {/* ── DELETE Confirm ───────────────────────────────── */}
      <BaseModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Xác nhận xóa đơn hàng"
        size="sm"
        footer={
          <>
            <BaseButton variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </BaseButton>
            <BaseButton variant="danger" onClick={handleDelete} loading={saving}>
              Xóa
            </BaseButton>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Bạn có chắc chắn muốn xóa đơn hàng{' '}
          <strong className="text-text-primary">{selectedOrder?.order_number}</strong>? Tất cả{' '}
          {selectedOrder?.items.length ?? 0} sản phẩm liên quan sẽ bị xóa.
        </p>
        <p className="text-xs text-text-muted mt-2">Hành động này không thể hoàn tác.</p>
      </BaseModal>

      {/* ── VIEW Drawer ──────────────────────────────────── */}
      <OrderDetailDrawer
        order={selectedOrder}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        onEdit={(o) => {
          setSelectedOrder(o);
          setEditOpen(true);
        }}
      />
    </div>
  );
}

RelationNestedCrudPage.displayName = 'RelationNestedCrudPage';
