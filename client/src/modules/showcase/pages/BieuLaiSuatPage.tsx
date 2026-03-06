import React, { useState, useMemo, useCallback } from 'react';
import {
  BaseButton,
  BaseInput,
  BaseSelect,
  BaseDatePicker,
  BaseTable,
  BaseModal,
  BaseDrawer,
} from '../../../components/base';
import type { ColumnConfig, SortOption } from '../../../types';
import toast from 'react-hot-toast';
import { Search, Plus, FileOutput, Pencil, Trash2, Copy, Eye } from 'lucide-react';

// ============================================================
// BieuLaiSuatPage — Trang Biểu Lãi Suất (CRUD)
// ============================================================

interface BieuLaiSuat {
  id: number;
  so_hieu: number;
  ma_bieu_ls: string;
  loai_bieu_ls: string;
  ngay_hieu_luc: string;
  ngay_het_hieu_luc: string;
  trang_thai: string;
}

const INITIAL_DATA: BieuLaiSuat[] = [
  {
    id: 1,
    so_hieu: 491,
    ma_bieu_ls: '2222',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '15/02/2029',
    ngay_het_hieu_luc: '07/02/2030',
    trang_thai: 'Hoạt động',
  },
  {
    id: 2,
    so_hieu: 490,
    ma_bieu_ls: 'BIEULS_HIEP_10',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '24/02/2027',
    ngay_het_hieu_luc: '31/12/2027',
    trang_thai: 'Hoạt động',
  },
  {
    id: 3,
    so_hieu: 489,
    ma_bieu_ls: 'BLS_HUE_1',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '19/01/2027',
    ngay_het_hieu_luc: '26/01/2029',
    trang_thai: 'Hoạt động',
  },
  {
    id: 4,
    so_hieu: 483,
    ma_bieu_ls: 'ABCDFGHGDH180',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '09/01/2027',
    ngay_het_hieu_luc: '18/12/2027',
    trang_thai: 'Hoạt động',
  },
  {
    id: 5,
    so_hieu: 471,
    ma_bieu_ls: 'ABCDFGHGDH18',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 6,
    so_hieu: 470,
    ma_bieu_ls: 'ABCDFGHGDH17',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 7,
    so_hieu: 468,
    ma_bieu_ls: 'ABCDFGHGDH16',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 8,
    so_hieu: 466,
    ma_bieu_ls: 'ABCDFGHGDH15',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 9,
    so_hieu: 464,
    ma_bieu_ls: 'ABCDFGHGDH14',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 10,
    so_hieu: 453,
    ma_bieu_ls: 'ABCDFGHGDH8',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 11,
    so_hieu: 451,
    ma_bieu_ls: 'ABCDFGHGDH7',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 12,
    so_hieu: 450,
    ma_bieu_ls: 'ABCDFGHGDH6',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 13,
    so_hieu: 448,
    ma_bieu_ls: 'ABCDFGHGDH5',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 14,
    so_hieu: 445,
    ma_bieu_ls: 'ABCDFGHGDH4',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/12/2026',
    ngay_het_hieu_luc: '17/12/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 15,
    so_hieu: 440,
    ma_bieu_ls: 'ABCDFGHGDH3',
    loai_bieu_ls: 'Biểu lãi suất tiết kiệm',
    ngay_hieu_luc: '01/11/2026',
    ngay_het_hieu_luc: '30/11/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 16,
    so_hieu: 435,
    ma_bieu_ls: 'ABCDFGHGDH2',
    loai_bieu_ls: 'Biểu lãi suất tiết kiệm',
    ngay_hieu_luc: '01/10/2026',
    ngay_het_hieu_luc: '31/10/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 17,
    so_hieu: 430,
    ma_bieu_ls: 'ABCDFGHGDH1',
    loai_bieu_ls: 'Biểu lãi suất cho vay',
    ngay_hieu_luc: '01/09/2026',
    ngay_het_hieu_luc: '30/09/2026',
    trang_thai: 'Không hoạt động',
  },
  {
    id: 18,
    so_hieu: 425,
    ma_bieu_ls: 'BLS_HA_1',
    loai_bieu_ls: 'Biểu lãi suất cho vay',
    ngay_hieu_luc: '01/08/2026',
    ngay_het_hieu_luc: '31/08/2026',
    trang_thai: 'Hoạt động',
  },
  {
    id: 19,
    so_hieu: 420,
    ma_bieu_ls: 'BLS_DN_1',
    loai_bieu_ls: 'Biểu lãi suất tiết kiệm',
    ngay_hieu_luc: '01/07/2026',
    ngay_het_hieu_luc: '31/07/2026',
    trang_thai: 'Không hoạt động',
  },
  {
    id: 20,
    so_hieu: 415,
    ma_bieu_ls: 'BLS_SG_1',
    loai_bieu_ls: 'Biểu lợi suất sinh lời',
    ngay_hieu_luc: '01/06/2026',
    ngay_het_hieu_luc: '30/06/2026',
    trang_thai: 'Hoạt động',
  },
];

const LOAI_BIEU_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Biểu lợi suất sinh lời', value: 'Biểu lợi suất sinh lời' },
  { label: 'Biểu lãi suất tiết kiệm', value: 'Biểu lãi suất tiết kiệm' },
  { label: 'Biểu lãi suất cho vay', value: 'Biểu lãi suất cho vay' },
];

const LOAI_BIEU_FORM_OPTIONS = LOAI_BIEU_OPTIONS.filter((o) => o.value !== '');

const TRANG_THAI_OPTIONS = [
  { label: 'Hoạt động', value: 'Hoạt động' },
  { label: 'Không hoạt động', value: 'Không hoạt động' },
];

const COLUMNS: ColumnConfig[] = [
  {
    name: 'so_hieu',
    label: 'Số hiệu',
    type: 'number',
    visible: true,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    width: 100,
  },
  {
    name: 'ma_bieu_ls',
    label: 'Mã biểu LS',
    type: 'text',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'loai_bieu_ls',
    label: 'Loại biểu LS',
    type: 'text',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'ngay_hieu_luc',
    label: 'Ngày hiệu lực',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
  },
  {
    name: 'ngay_het_hieu_luc',
    label: 'Ngày hết hiệu lực',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
  },
  {
    name: 'trang_thai',
    label: 'Trạng thái bản ghi',
    type: 'text',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
  },
];

// ── Helper: convert dd/MM/yyyy <-> yyyy-MM-dd ────────────────
function toInputDate(display: string): string {
  const parts = display.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function toDisplayDate(input: string): string {
  if (!input) return '';
  const parts = input.split('-');
  if (parts.length !== 3) return input;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ── Empty form values ─────────────────────────────────────────
interface FormValues {
  ma_bieu_ls: string;
  loai_bieu_ls: string;
  ngay_hieu_luc: string;
  ngay_het_hieu_luc: string;
  trang_thai: string;
}

const EMPTY_FORM: FormValues = {
  ma_bieu_ls: '',
  loai_bieu_ls: 'Biểu lợi suất sinh lời',
  ngay_hieu_luc: '',
  ngay_het_hieu_luc: '',
  trang_thai: 'Hoạt động',
};

// ── Form Component ────────────────────────────────────────────
function BieuLaiSuatForm({
  values,
  onChange,
  errors,
  readOnly = false,
}: {
  values: FormValues;
  onChange: (v: FormValues) => void;
  errors: Partial<Record<keyof FormValues, string>>;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <BaseInput
          label="Mã biểu LS"
          name="ma_bieu_ls"
          value={values.ma_bieu_ls}
          onChange={(e) => onChange({ ...values, ma_bieu_ls: e.target.value })}
          error={errors.ma_bieu_ls}
          required
          disabled={readOnly}
        />
      </div>
      <div>
        <BaseSelect
          label="Loại biểu LS"
          name="loai_bieu_ls"
          options={LOAI_BIEU_FORM_OPTIONS}
          value={values.loai_bieu_ls}
          onChange={(e) => onChange({ ...values, loai_bieu_ls: e.target.value })}
          error={errors.loai_bieu_ls}
          required
          disabled={readOnly}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <BaseDatePicker
          label="Ngày hiệu lực"
          name="ngay_hieu_luc"
          value={values.ngay_hieu_luc}
          onChange={(e) => onChange({ ...values, ngay_hieu_luc: e.target.value })}
          error={errors.ngay_hieu_luc}
          disabled={readOnly}
        />
        <BaseDatePicker
          label="Ngày hết hiệu lực"
          name="ngay_het_hieu_luc"
          value={values.ngay_het_hieu_luc}
          onChange={(e) => onChange({ ...values, ngay_het_hieu_luc: e.target.value })}
          error={errors.ngay_het_hieu_luc}
          disabled={readOnly}
        />
      </div>
      <div>
        <BaseSelect
          label="Trạng thái"
          name="trang_thai"
          options={TRANG_THAI_OPTIONS}
          value={values.trang_thai}
          onChange={(e) => onChange({ ...values, trang_thai: e.target.value })}
          error={errors.trang_thai}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================
export function BieuLaiSuatPage() {
  // ── Data state (mutable mock) ──────────────────────────────
  const [data, setData] = useState<BieuLaiSuat[]>(INITIAL_DATA);
  const [nextId, setNextId] = useState(21);

  // ── Search state ────────────────────────────────────────────
  const [maBieuLS, setMaBieuLS] = useState('');
  const [loaiBieuLS, setLoaiBieuLS] = useState('');
  const [hieulucTu, setHieuLucTu] = useState('');
  const [hieulucDen, setHieuLucDen] = useState('');

  // ── Table state ─────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState<SortOption[]>([]);
  const [activeSearch, setActiveSearch] = useState({ maBieuLS: '', loaiBieuLS: '' });

  // ── Modal/Drawer state ──────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BieuLaiSuat | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  // ── Search handler ──────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setActiveSearch({ maBieuLS, loaiBieuLS });
    setPage(1);
  }, [maBieuLS, loaiBieuLS]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  // ── Validate form ───────────────────────────────────────────
  const validate = useCallback((v: FormValues): Partial<Record<keyof FormValues, string>> => {
    const errs: Partial<Record<keyof FormValues, string>> = {};
    if (!v.ma_bieu_ls.trim()) errs.ma_bieu_ls = 'Mã biểu LS không được để trống';
    if (!v.loai_bieu_ls) errs.loai_bieu_ls = 'Vui lòng chọn loại biểu LS';
    return errs;
  }, []);

  // ── CREATE ──────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    setCreateOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    const errs = validate(formValues);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    const newSoHieu = data.length > 0 ? Math.max(...data.map((r) => r.so_hieu)) + 1 : 1;
    const newRow: BieuLaiSuat = {
      id: nextId,
      so_hieu: newSoHieu,
      ma_bieu_ls: formValues.ma_bieu_ls,
      loai_bieu_ls: formValues.loai_bieu_ls,
      ngay_hieu_luc: toDisplayDate(formValues.ngay_hieu_luc),
      ngay_het_hieu_luc: toDisplayDate(formValues.ngay_het_hieu_luc),
      trang_thai: formValues.trang_thai,
    };
    setData((prev) => [newRow, ...prev]);
    setNextId((n) => n + 1);
    setCreateOpen(false);
    toast.success(`Thêm mới thành công: ${newRow.ma_bieu_ls}`);
  }, [formValues, data, nextId, validate]);

  // ── EDIT ────────────────────────────────────────────────────
  const openEdit = useCallback((row: BieuLaiSuat) => {
    setSelectedRow(row);
    setFormValues({
      ma_bieu_ls: row.ma_bieu_ls,
      loai_bieu_ls: row.loai_bieu_ls,
      ngay_hieu_luc: toInputDate(row.ngay_hieu_luc),
      ngay_het_hieu_luc: toInputDate(row.ngay_het_hieu_luc),
      trang_thai: row.trang_thai,
    });
    setFormErrors({});
    setEditOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedRow) return;
    const errs = validate(formValues);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setData((prev) =>
      prev.map((r) =>
        r.id === selectedRow.id
          ? {
              ...r,
              ma_bieu_ls: formValues.ma_bieu_ls,
              loai_bieu_ls: formValues.loai_bieu_ls,
              ngay_hieu_luc: toDisplayDate(formValues.ngay_hieu_luc),
              ngay_het_hieu_luc: toDisplayDate(formValues.ngay_het_hieu_luc),
              trang_thai: formValues.trang_thai,
            }
          : r,
      ),
    );
    setEditOpen(false);
    setSelectedRow(null);
    toast.success(`Cập nhật thành công: ${formValues.ma_bieu_ls}`);
  }, [formValues, selectedRow, validate]);

  // ── DELETE ──────────────────────────────────────────────────
  const openDelete = useCallback((row: BieuLaiSuat) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedRow) return;
    setData((prev) => prev.filter((r) => r.id !== selectedRow.id));
    setDeleteOpen(false);
    toast.success(`Đã xóa: ${selectedRow.ma_bieu_ls}`);
    setSelectedRow(null);
  }, [selectedRow]);

  // ── CLONE ───────────────────────────────────────────────────
  const openClone = useCallback((row: BieuLaiSuat) => {
    setFormValues({
      ma_bieu_ls: `${row.ma_bieu_ls}_COPY`,
      loai_bieu_ls: row.loai_bieu_ls,
      ngay_hieu_luc: toInputDate(row.ngay_hieu_luc),
      ngay_het_hieu_luc: toInputDate(row.ngay_het_hieu_luc),
      trang_thai: row.trang_thai,
    });
    setFormErrors({});
    setCreateOpen(true);
  }, []);

  // ── VIEW ────────────────────────────────────────────────────
  const openView = useCallback((row: BieuLaiSuat) => {
    setSelectedRow(row);
    setViewOpen(true);
  }, []);

  // ── Filtered + sorted + paginated data ──────────────────────
  const { displayData, total } = useMemo(() => {
    let items = [...data];

    if (activeSearch.maBieuLS) {
      const q = activeSearch.maBieuLS.toLowerCase();
      items = items.filter((r) => r.ma_bieu_ls.toLowerCase().includes(q));
    }
    if (activeSearch.loaiBieuLS) {
      items = items.filter((r) => r.loai_bieu_ls === activeSearch.loaiBieuLS);
    }

    if (sort.length > 0) {
      const s = sort[0];
      items.sort((a, b) => {
        const va = a[s.field as keyof BieuLaiSuat];
        const vb = b[s.field as keyof BieuLaiSuat];
        const cmp = String(va).localeCompare(String(vb));
        return s.direction === 'desc' ? -cmp : cmp;
      });
    }

    const total = items.length;
    const start = (page - 1) * limit;
    return {
      displayData: items.slice(start, start + limit) as unknown as Record<string, unknown>[],
      total,
    };
  }, [data, activeSearch, sort, page, limit]);

  // ── Row actions cell renderer ───────────────────────────────
  const cellRenderers = useMemo(
    () => ({
      _actions: (_value: unknown, row: Record<string, unknown>) => {
        const original = data.find((r) => r.id === row['id']);
        if (!original) return null;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(original);
              }}
              className="p-1 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded"
              title="Sửa"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDelete(original);
              }}
              className="p-1 text-danger hover:text-red-700 hover:bg-red-50 rounded"
              title="Xóa"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openView(original);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
              title="Xem chi tiết"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openClone(original);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
              title="Nhân bản"
            >
              <Copy size={14} />
            </button>
          </div>
        );
      },
    }),
    [data, openEdit, openDelete, openView, openClone],
  );

  const columns: ColumnConfig[] = useMemo(
    () => [
      {
        name: '_actions',
        label: '',
        type: 'text',
        visible: true,
        sortable: false,
        filterable: false,
        editable: false,
        required: false,
        width: 120,
      },
      ...COLUMNS,
    ],
    [],
  );

  return (
    <div className="space-y-4">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-center">
        <div
          className="relative bg-primary-600 text-white text-sm font-bold px-5 py-2 select-none"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)',
          }}
        >
          BIỂU LÃI SUẤT
        </div>
      </div>

      {/* ── Search Form ──────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Mã biểu LS</label>
            <BaseInput
              placeholder=""
              value={maBieuLS}
              onChange={(e) => setMaBieuLS(e.target.value)}
              onKeyDown={handleKeyDown}
              name="ma_bieu_ls"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Loại biểu LS</label>
            <BaseSelect
              options={LOAI_BIEU_OPTIONS}
              value={loaiBieuLS}
              onChange={(e) => setLoaiBieuLS(e.target.value)}
              name="loai_bieu_ls"
              placeholder="Chọn loại biểu LS"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Hiệu lực trong khoảng từ
            </label>
            <BaseDatePicker
              value={hieulucTu}
              onChange={(e) => setHieuLucTu(e.target.value)}
              name="hieu_luc_tu"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm text-text-secondary mb-1">
                Hiệu lực trong khoảng đến
              </label>
              <BaseDatePicker
                value={hieulucDen}
                onChange={(e) => setHieuLucDen(e.target.value)}
                name="hieu_luc_den"
              />
            </div>
            <BaseButton
              variant="primary"
              onClick={handleSearch}
              className="shrink-0 h-10 w-10 !p-0 flex items-center justify-center"
              title="Tìm kiếm"
            >
              <Search size={16} />
            </BaseButton>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <BaseButton variant="primary" onClick={openCreate}>
          <span className="flex items-center gap-1.5">
            <Plus size={15} />
            Thêm
          </span>
        </BaseButton>
        <BaseButton variant="outline" onClick={() => toast.success('Kết xuất dữ liệu (mock)')}>
          <span className="flex items-center gap-1.5">
            <FileOutput size={15} />
            Kết xuất
          </span>
        </BaseButton>
      </div>

      {/* ── Data Table ───────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <BaseTable
          columns={columns}
          data={displayData}
          total={total}
          page={page}
          limit={limit}
          sort={sort}
          primaryKey="id"
          showPagination
          onPageChange={setPage}
          onLimitChange={() => {}}
          onSort={setSort}
          cellRenderers={cellRenderers}
          striped
        />
      </div>

      {/* ── CREATE Modal ─────────────────────────────────────── */}
      <BaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Thêm mới Biểu Lãi Suất"
        size="lg"
        footer={
          <>
            <BaseButton variant="outline" onClick={() => setCreateOpen(false)}>
              Hủy
            </BaseButton>
            <BaseButton variant="primary" onClick={handleCreate}>
              Lưu
            </BaseButton>
          </>
        }
      >
        <BieuLaiSuatForm values={formValues} onChange={setFormValues} errors={formErrors} />
      </BaseModal>

      {/* ── EDIT Modal ───────────────────────────────────────── */}
      <BaseModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Sửa Biểu Lãi Suất — ${selectedRow?.ma_bieu_ls ?? ''}`}
        size="lg"
        footer={
          <>
            <BaseButton variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </BaseButton>
            <BaseButton variant="primary" onClick={handleEdit}>
              Cập nhật
            </BaseButton>
          </>
        }
      >
        <BieuLaiSuatForm values={formValues} onChange={setFormValues} errors={formErrors} />
      </BaseModal>

      {/* ── DELETE Confirm Modal ──────────────────────────────── */}
      <BaseModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <BaseButton variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </BaseButton>
            <BaseButton variant="danger" onClick={handleDelete}>
              Xóa
            </BaseButton>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Bạn có chắc chắn muốn xóa biểu lãi suất{' '}
          <strong className="text-text-primary">{selectedRow?.ma_bieu_ls}</strong> (Số hiệu:{' '}
          {selectedRow?.so_hieu})?
        </p>
        <p className="text-xs text-text-muted mt-2">Hành động này không thể hoàn tác.</p>
      </BaseModal>

      {/* ── VIEW Drawer ──────────────────────────────────────── */}
      <BaseDrawer
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={`Chi tiết — ${selectedRow?.ma_bieu_ls ?? ''}`}
        placement="right"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <BaseButton variant="outline" onClick={() => setViewOpen(false)}>
              Đóng
            </BaseButton>
            <BaseButton
              variant="primary"
              onClick={() => {
                if (selectedRow) {
                  setViewOpen(false);
                  openEdit(selectedRow);
                }
              }}
            >
              Chuyển sang sửa
            </BaseButton>
          </div>
        }
      >
        {selectedRow && (
          <div className="space-y-4">
            <DetailField label="Số hiệu" value={String(selectedRow.so_hieu)} />
            <DetailField label="Mã biểu LS" value={selectedRow.ma_bieu_ls} />
            <DetailField label="Loại biểu LS" value={selectedRow.loai_bieu_ls} />
            <DetailField label="Ngày hiệu lực" value={selectedRow.ngay_hieu_luc} />
            <DetailField label="Ngày hết hiệu lực" value={selectedRow.ngay_het_hieu_luc} />
            <DetailField label="Trạng thái" value={selectedRow.trang_thai} badge />
          </div>
        )}
      </BaseDrawer>
    </div>
  );
}

// ── Detail field for View drawer ──────────────────────────────
function DetailField({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-40 shrink-0 text-sm text-text-muted">{label}</span>
      {badge ? (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'Hoạt động' ? 'bg-success/10 text-success' : 'bg-neutral-100 text-text-muted'
          }`}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium text-text-primary">{value || '—'}</span>
      )}
    </div>
  );
}

BieuLaiSuatPage.displayName = 'BieuLaiSuatPage';
