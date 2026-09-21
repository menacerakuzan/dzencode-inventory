'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface TypeCount {
  label: string;
  value: number;
}

const BAR_COLOR = '#5a9a24';
const INK_MUTED = '#78909c';
const GRID = '#e3e8ec';

/** Number of products per type. Loaded lazily: recharts is a heavy dependency. */
export default function TypesChart({ data, valueLabel }: { data: TypeCount[]; valueLabel: string }) {
  return (
    <>
      <div className="types-chart" aria-hidden>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tick={{ fill: '#37474f', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: INK_MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(90, 154, 36, 0.08)' }}
              formatter={(value) => [value, valueLabel]}
              contentStyle={{ borderRadius: 6, border: '1px solid #dfe4e8', fontSize: 13 }}
            />
            <Bar dataKey="value" name={valueLabel} fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="visually-hidden">
        <tbody>
          {data.map((datum) => (
            <tr key={datum.label}>
              <th scope="row">{datum.label}</th>
              <td>{datum.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
