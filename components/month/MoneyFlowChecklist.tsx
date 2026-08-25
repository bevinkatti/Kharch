"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Pencil, X, ShieldCheck } from "lucide-react";
import type { CheckItem } from "@/types";
import { fmt, calcChecklistRemaining } from "@/lib/utils";

interface Props {
  salary: number;
  currency: string;
  items: CheckItem[];
  checks: boolean[];
  efAmount?: number;
  onItemsChange: (items: CheckItem[]) => void;
  onChecksChange: (checks: boolean[]) => void;
}

export function MoneyFlowChecklist({
  salary, currency, items, checks, efAmount, onItemsChange, onChecksChange,
}: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [addingNew,  setAddingNew]  = useState(false);
  const [newLabel,   setNewLabel]   = useState("");
  const [newAmount,  setNewAmount]  = useState<number | "">("");
  const newLabelRef = useRef<HTMLInputElement>(null);

  const remaining      = calcChecklistRemaining(salary, items, checks);
  const doneCount      = checks.filter(Boolean).length;
  const totalWithAmt   = items.filter(it => it.amount > 0).length;
  const remainingColor =
    remaining < 0   ? "var(--red)"      :
    remaining === 0 ? "var(--text-lo)"  :
                      "var(--brand)";

  // Identify Emergency Fund item index (for special badge)
  const efIdx = items.findIndex(it =>
    it.label.toLowerCase().includes("emergency fund") && it.amount > 0
  );

  function toggleCheck(i: number) {
    const next = [...checks]; next[i] = !next[i]; onChecksChange(next);
  }

  function updateItem(i: number, patch: Partial<CheckItem>) {
    if (items[i]?.source === "expense" || items[i]?.expense_id) return;
    onItemsChange(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  }

  function removeItem(i: number) {
    if (items[i]?.source === "expense" || items[i]?.expense_id) return;
    onItemsChange(items.filter((_, idx) => idx !== i));
    onChecksChange(checks.filter((_, idx) => idx !== i));
    if (editingIdx === i) setEditingIdx(null);
  }

  function startAdd() {
    setNewLabel(""); setNewAmount(""); setAddingNew(true);
    setTimeout(() => newLabelRef.current?.focus(), 50);
  }

  function commitAdd() {
    const label = newLabel.trim();
    if (!label) { setAddingNew(false); return; }
    onItemsChange([...items, {
      id: `manual:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      label,
      amount: Number(newAmount) || 0,
      source: "manual",
    }]);
    onChecksChange([...checks, false]);
    setAddingNew(false); setNewLabel(""); setNewAmount("");
  }

  function cancelAdd() {
    setAddingNew(false); setNewLabel(""); setNewAmount("");
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center justify-between border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-hi)" }}>Monthly moves</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-lo)" }}>
            {doneCount}/{items.length} done
          </p>
        </div>
        <div className="text-right">
          <p className="label-caps mb-0.5">Remaining</p>
          <motion.p
            key={remaining}
            initial={{ opacity: 0.6, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="font-mono font-semibold leading-none"
            style={{ color: remainingColor, letterSpacing: "-0.03em", fontSize: 16 }}
          >
            {fmt(remaining, currency)}
          </motion.p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "var(--overlay)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--brand)" }}
            animate={{ width: items.length ? `${(doneCount / items.length) * 100}%` : "0%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <AnimatePresence initial={false}>
          {items.map((item, i) => {
            const isEditing = editingIdx === i;
            const checked   = checks[i] ?? false;
            const isEfItem  = i === efIdx;
            const isLinked  = item.source === "expense" || !!item.expense_id;

            return (
              <motion.div
                key={item.id ?? i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isEditing ? (
                  /* Edit row */
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 border-b"
                    style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
                  >
                    <input
                      type="text"
                      value={item.label}
                      onChange={e => updateItem(i, { label: e.target.value })}
                      className="checklist-edit-label flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                      style={{ color: "var(--text-hi)", fontSize: 14 }}
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && setEditingIdx(null)}
                    />
                    <div
                      className="flex items-center gap-0.5 rounded-md flex-none"
                      style={{ background: "var(--bg-raised)", padding: "5px 8px" }}
                    >
                      <span className="text-xs" style={{ color: "var(--text-lo)" }}>{currency}</span>
                      <input
                        type="number"
                        value={item.amount || ""}
                        onChange={e => updateItem(i, { amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        inputMode="numeric"
                        className="checklist-amount-input bg-transparent text-right font-mono font-medium focus:outline-none"
                        style={{ color: "var(--text-hi)", width: 56, fontSize: 13 }}
                        onKeyDown={e => e.key === "Enter" && setEditingIdx(null)}
                      />
                    </div>
                    <button
                      onClick={() => setEditingIdx(null)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: "var(--brand)", color: "#0a0a0a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                ) : (
                  /* Display row */
                  <div
                    className="group flex items-center border-b"
                    style={{
                      borderColor: "var(--border)",
                      background: checked ? "var(--brand-dim)" : "transparent",
                      minHeight: 48,
                      paddingRight: 8,
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCheck(i)}
                      style={{ width: 44, height: 48, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      aria-label={checked ? "Uncheck" : "Check"}
                    >
                      <div
                        style={{
                          width: 18, height: 18, borderRadius: 4,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: `1.5px solid ${checked ? "var(--brand)" : "var(--border-strong)"}`,
                          background: checked ? "var(--brand)" : "transparent",
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" style={{ color: "#0a0a0a" }} />}
                      </div>
                    </button>

                    {/* Label + amount */}
                    <div className="flex-1 min-w-0 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <p
                          className="text-sm leading-snug"
                          style={{
                            color: checked ? "var(--text-lo)" : "var(--text-hi)",
                            textDecoration: checked ? "line-through" : "none",
                          }}
                        >
                          {item.label}
                        </p>
                        {/* EF badge — shows when item is EF and is checked */}
                        {isEfItem && checked && efAmount !== undefined && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-2xs font-medium flex-none"
                            style={{ background: "var(--brand-dim)", color: "var(--brand)", border: "1px solid var(--brand-border)" }}
                          >
                            <ShieldCheck className="w-2.5 h-2.5" />
                            EF updated
                          </span>
                        )}
                      </div>
                      {item.amount > 0 && (
                        <p
                          className="font-mono text-xs mt-0.5"
                          style={{ color: checked ? "var(--text-lo)" : "var(--brand)" }}
                        >
                          {checked ? "−" : ""}{fmt(item.amount, currency)}
                        </p>
                      )}
                    </div>

                    {/* Actions — only manual tasks are editable/removable here.
                        Expense-linked moves are managed from Dashboard → Expenses. */}
                    {!isLinked && (
                      <div className="flex items-center gap-0.5 flex-none ml-1">
                        <button
                          onClick={() => setEditingIdx(i)}
                          title="Edit"
                          style={{ width: 32, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-lo)", borderRadius: 6 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--overlay)"; (e.currentTarget as HTMLElement).style.color = "var(--text-md)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-lo)"; }}
                          aria-label="Edit"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(i)}
                          title="Remove"
                          style={{ width: 32, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-lo)", borderRadius: 6 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--red-dim)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-lo)"; }}
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* New item form */}
        <AnimatePresence>
          {addingNew && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2.5 border-b"
                style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
              >
                <input
                  ref={newLabelRef}
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Task name…"
                  className="checklist-edit-label flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--text-hi)", fontSize: 14 }}
                  onKeyDown={e => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") cancelAdd(); }}
                />
                <div
                  className="flex items-center gap-0.5 rounded-md flex-none"
                  style={{ background: "var(--bg-raised)", padding: "5px 8px" }}
                >
                  <span className="text-xs" style={{ color: "var(--text-lo)" }}>{currency}</span>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={e => setNewAmount(parseFloat(e.target.value) || "")}
                    placeholder="0"
                    inputMode="numeric"
                    className="checklist-amount-input bg-transparent text-right font-mono font-medium focus:outline-none"
                    style={{ color: "var(--text-hi)", width: 56, fontSize: 13 }}
                    onKeyDown={e => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") cancelAdd(); }}
                  />
                </div>
                <button
                  onClick={commitAdd}
                  style={{ width: 30, height: 30, borderRadius: 8, background: "var(--brand)", color: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <button
                  onClick={cancelAdd}
                  style={{ width: 30, height: 30, borderRadius: 8, background: "var(--overlay)", color: "var(--text-lo)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add button */}
        <button
          onClick={startAdd}
          className="w-full flex items-center gap-2 px-4 text-sm transition-colors"
          style={{ color: "var(--text-lo)", minHeight: 48 }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-raised)"; e.currentTarget.style.color = "var(--text-md)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-lo)"; }}
        >
          <Plus className="w-3.5 h-3.5" /> Add task
        </button>
      </div>

      {/* Waterfall summary */}
      {totalWithAmt > 0 && (
        <div
          className="px-4 py-3.5 border-t space-y-1.5"
          style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-lo)" }}>
            <span>Salary</span>
            <span className="font-mono">{fmt(salary, currency)}</span>
          </div>
          {items.map((item, i) => {
            if (!item.amount || !checks[i]) return null;
            return (
              <div key={i} className="flex items-center justify-between text-xs" style={{ color: "var(--text-lo)" }}>
                <span className="truncate pr-4 min-w-0">− {item.label}</span>
                <span className="font-mono flex-none">{fmt(item.amount, currency)}</span>
              </div>
            );
          })}
          <div
            className="flex items-center justify-between text-sm font-medium pt-1 border-t"
            style={{ borderColor: "var(--border)", color: remainingColor }}
          >
            <span>Remaining</span>
            <span className="font-mono font-semibold">{fmt(remaining, currency)}</span>
          </div>
          {/* Emergency Fund current total */}
          {efIdx !== -1 && checks[efIdx] && efAmount !== undefined && (
            <div
              className="flex items-center justify-between text-xs pt-1 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="flex items-center gap-1" style={{ color: "var(--brand)" }}>
                <ShieldCheck className="w-3 h-3" /> Emergency fund total
              </span>
              <span className="font-mono font-medium" style={{ color: "var(--brand)" }}>
                {fmt(efAmount, currency)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
