import React from 'react';
import { PROGRAM_LABELS } from '../lib/reportData';

const DEFAULT = {
  balanced: [
    [0.00, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.00, 0.10, 0.20, 0.30],
    [0.10, 0.20, 0.50, 0.70, 0.90],
    [0.30, 0.50, 0.80, 1.00, 1.10],
    [0.60, 0.80, 1.00, 1.20, 1.30],
  ],
  must_do: [
    [0.00, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.00, 0.00, 0.00, 0.10],
    [0.00, 0.00, 0.20, 0.40, 0.60],
    [0.10, 0.20, 0.50, 0.80, 1.00],
    [0.40, 0.60, 0.90, 1.10, 1.30],
  ],
  premium: [
    [0.10, 0.10, 0.20, 0.30, 0.40],
    [0.20, 0.30, 0.40, 0.50, 0.60],
    [0.40, 0.50, 0.70, 0.90, 1.00],
    [0.60, 0.80, 1.00, 1.10, 1.20],
    [0.90, 1.00, 1.20, 1.30, 1.40],
  ],
};

const hasMatrix = (m) => Array.isArray(m) && m.length === 5 && m.every(r => Array.isArray(r) && r.length === 5);

function MatrixCard({ name, matrix }) {
  // Color scale: 0 (white) → 1.5 (deep indigo)
  const colorFor = (v) => {
    const t = Math.min(1, v / 1.5);
    const alpha = 0.05 + t * 0.55;
    return `rgba(79, 70, 229, ${alpha.toFixed(2)})`;
  };
  return (
    <div className="border border-slate-200 rounded-md p-4 bg-white">
      <div className="text-sm font-bold text-slate-900 mb-3">{name}</div>
      <table className="w-full text-xs tabular-nums">
        <thead>
          <tr>
            <th className="text-left p-1 text-[10px] text-slate-500 font-semibold">Condition ↓ / Criticality →</th>
            {[1, 2, 3, 4, 5].map(c => (
              <th key={c} className="text-center p-1 text-[10px] text-slate-500 font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-1 text-[10px] text-slate-500 font-semibold">{i + 1}</td>
              {row.map((v, j) => (
                <td key={j} className="p-1.5 text-center font-medium text-slate-700 border border-white" style={{ background: colorFor(v) }}>
                  {v.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function P09_Matrices({ assessment }) {
  const matrices = {
    premium: hasMatrix(assessment?.matrix_premium) ? assessment.matrix_premium : DEFAULT.premium,
    balanced: hasMatrix(assessment?.matrix_balanced) ? assessment.matrix_balanced : DEFAULT.balanced,
    must_do: hasMatrix(assessment?.matrix_must_do) ? assessment.matrix_must_do : DEFAULT.must_do,
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-lg font-semibold text-slate-800">Cost Multiplier Matrices</div>
        <div className="text-xs text-slate-500 mt-1">
          Multipliers applied to base replacement cost. Indexed by component <span className="font-semibold">Condition Grade</span> (row, 1-5) × <span className="font-semibold">Criticality</span> (column, 1-5).
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <MatrixCard name={PROGRAM_LABELS.premium} matrix={matrices.premium} />
        <MatrixCard name={PROGRAM_LABELS.balanced} matrix={matrices.balanced} />
        <MatrixCard name={PROGRAM_LABELS.must_do} matrix={matrices.must_do} />
      </div>
    </div>
  );
}