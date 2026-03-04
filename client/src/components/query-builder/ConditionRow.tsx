import React, { useMemo } from 'react';
import {
  getOperatorsForType,
  getDefaultOperator,
  operatorRequiresValue,
  type ConditionRowProps,
  type FilterOperator,
  type QueryField,
  type OperatorDef,
} from '../../core/query-builder';

// ============================================================
// ConditionRow - Single filter condition with metadata-driven
// operators and type-aware value inputs
// Phase 3 – Query Builder: ConditionRow + Relation field support
// ============================================================

export const ConditionRow = React.memo(function ConditionRow({
  condition,
  fields,
  onChange,
  onRemove,
  disabled,
}: ConditionRowProps) {
  // Get current field definition
  const currentField = useMemo(
    () => fields.find((f) => f.name === condition.field),
    [fields, condition.field],
  );

  // Get operators for the current field type
  const operators = useMemo(
    () => getOperatorsForType(currentField?.type ?? 'text'),
    [currentField?.type],
  );

  // When field changes → reset operator + value to smart defaults
  const handleFieldChange = (fieldName: string) => {
    const newField = fields.find((f) => f.name === fieldName);
    const newOp = getDefaultOperator(newField?.type ?? 'text');
    onChange({ ...condition, field: fieldName, operator: newOp, value: '' });
  };

  // When operator changes → reset value if type changes
  const handleOperatorChange = (op: FilterOperator) => {
    const needsReset = !operatorRequiresValue(op) || !operatorRequiresValue(condition.operator);
    onChange({ ...condition, operator: op, value: needsReset ? '' : condition.value });
  };

  // Group fields by group label (for optgroup rendering)
  const groupedFields = useMemo(() => {
    const groups = new Map<string, QueryField[]>();
    for (const f of fields) {
      const key = f.group ?? '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(f);
    }
    return groups;
  }, [fields]);

  const showValue = operatorRequiresValue(condition.operator);

  return (
    <div className="flex items-center gap-2 group">
      {/* ── Field Selector ── */}
      <select
        value={condition.field}
        onChange={(e) => handleFieldChange(e.target.value)}
        disabled={disabled}
        className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm min-w-[160px] bg-white
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
          disabled:bg-neutral-100 disabled:cursor-not-allowed"
      >
        {Array.from(groupedFields.entries()).map(([group, groupFields]) =>
          group ? (
            <optgroup key={group} label={group}>
              {groupFields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.isRelationPath ? `↳ ${f.label.split(' → ').pop()}` : f.label}
                </option>
              ))}
            </optgroup>
          ) : (
            groupFields.map((f) => (
              <option key={f.name} value={f.name}>
                {f.label}
              </option>
            ))
          ),
        )}
      </select>

      {/* ── Operator Selector ── */}
      <select
        value={condition.operator}
        onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
        disabled={disabled}
        className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm min-w-[140px] bg-white
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
          disabled:bg-neutral-100 disabled:cursor-not-allowed"
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* ── Value Input (type-aware) ── */}
      {showValue && (
        <ValueInput
          condition={condition}
          field={currentField}
          operator={operators.find((o) => o.value === condition.operator)}
          onChange={(value) => onChange({ ...condition, value })}
          disabled={disabled}
        />
      )}

      {/* ── Remove Button ── */}
      <button
        onClick={onRemove}
        disabled={disabled}
        className="text-neutral-400 hover:text-red-500 text-lg leading-none px-1
          opacity-0 group-hover:opacity-100 transition-opacity
          disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove condition"
      >
        ×
      </button>
    </div>
  );
});

// ── Value Input (renders different input types based on field type + operator) ──

interface ValueInputProps {
  condition: { value: any };
  field?: QueryField;
  operator?: OperatorDef;
  onChange: (value: any) => void;
  disabled?: boolean;
}

function ValueInput({ condition, field, operator, onChange, disabled }: ValueInputProps) {
  const valueType = operator?.valueType ?? 'text';

  // Between (number): two number inputs
  if (valueType === 'between-number') {
    const val = Array.isArray(condition.value) ? condition.value : ['', ''];
    return (
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          value={val[0] ?? ''}
          onChange={(e) => onChange([e.target.value, val[1]])}
          disabled={disabled}
          className={inputClass}
          placeholder="From"
        />
        <span className="text-xs text-neutral-400">–</span>
        <input
          type="number"
          value={val[1] ?? ''}
          onChange={(e) => onChange([val[0], e.target.value])}
          disabled={disabled}
          className={inputClass}
          placeholder="To"
        />
      </div>
    );
  }

  // Between (date): two date inputs
  if (valueType === 'between-date') {
    const val = Array.isArray(condition.value) ? condition.value : ['', ''];
    return (
      <div className="flex items-center gap-1 flex-1">
        <input
          type="date"
          value={val[0] ?? ''}
          onChange={(e) => onChange([e.target.value, val[1]])}
          disabled={disabled}
          className={inputClass}
        />
        <span className="text-xs text-neutral-400">–</span>
        <input
          type="date"
          value={val[1] ?? ''}
          onChange={(e) => onChange([val[0], e.target.value])}
          disabled={disabled}
          className={inputClass}
        />
      </div>
    );
  }

  // Date input
  if (valueType === 'date') {
    return (
      <input
        type={field?.type === 'datetime' ? 'datetime-local' : 'date'}
        value={condition.value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputClass} flex-1`}
      />
    );
  }

  // Number input
  if (valueType === 'number') {
    return (
      <input
        type="number"
        value={condition.value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputClass} flex-1`}
        placeholder="Value"
      />
    );
  }

  // Select (for select/relation fields with options)
  if (valueType === 'select' || (field?.type === 'select' && field.options)) {
    return (
      <select
        value={condition.value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputClass} flex-1`}
      >
        <option value="">Select...</option>
        {(field?.options ?? []).map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  // Multi-select (for in/notIn operators)
  if (valueType === 'multi') {
    // For select fields with options, render checkboxes
    if (field?.options && field.options.length > 0) {
      const selected = Array.isArray(condition.value) ? condition.value : [];
      return (
        <div className="flex flex-wrap gap-1 flex-1">
          {field.options.map((opt) => {
            const isActive = selected.includes(String(opt.value));
            return (
              <button
                key={String(opt.value)}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const next = isActive
                    ? selected.filter((v: string) => v !== String(opt.value))
                    : [...selected, String(opt.value)];
                  onChange(next);
                }}
                className={`px-2 py-0.5 text-xs rounded-full border transition-colors
                  ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-primary-300'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary-300'
                  } disabled:opacity-50`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    // Fallback: comma-separated text input
    const val = Array.isArray(condition.value)
      ? condition.value.join(', ')
      : (condition.value ?? '');
    return (
      <input
        type="text"
        value={val}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean),
          )
        }
        disabled={disabled}
        className={`${inputClass} flex-1`}
        placeholder="Comma-separated values"
      />
    );
  }

  // Boolean select
  if (field?.type === 'boolean') {
    return (
      <select
        value={condition.value ?? ''}
        onChange={(e) => onChange(e.target.value === 'true')}
        disabled={disabled}
        className={`${inputClass} flex-1`}
      >
        <option value="">Select...</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  // Default: text input
  return (
    <input
      type="text"
      value={condition.value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${inputClass} flex-1`}
      placeholder="Value"
    />
  );
}

ConditionRow.displayName = 'ConditionRow';

// Shared input class
const inputClass = `border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm bg-white
  focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
  disabled:bg-neutral-100 disabled:cursor-not-allowed`;
