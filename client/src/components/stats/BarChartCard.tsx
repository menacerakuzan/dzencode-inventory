'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface BarDatum {
  label: string;
  value: number;
}

interface Props {
  data: BarDatum[];
  valueLabel: string;
  formatValue?: (value: number) => string;
}

const BAR_COLOR = '#5a9a24';
const INK_MUTED = '#78909c';
const GRID = '#e3e8ec';

const truncate = (text: string, max = 22) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** Single-series horizontal bar chart. Loaded lazily (recharts is heavy). */
export default function BarChartCard({ data, valueLabel, formatValue = String }: Props) {
  const height = Math.max(180, data.length * 44 + 40);

  return (
    <>
      <div style={{ width: '100%', height }} aria-hidden>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis
              type="number"
              tickFormatter={formatValue}
              tick={{ fill: INK_MUTED, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={190}
              tickFormatter={(value: string) => truncate(value)}
              tick={{ fill: '#37474f', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(90, 154, 36, 0.08)' }}
              formatter={(value) => [formatValue(Number(value)), valueLabel]}
              contentStyle={{ borderRadius: 6, border: '1px solid #dfe4e8', fontSize: 13 }}
            />
            <Bar dataKey="value" name={valueLabel} fill={BAR_COLOR} radius={[0, 4, 4, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="visually-hidden">
        <tbody>
          {data.map((datum) => (
            <tr key={datum.label}>
              <th scope="row">{datum.label}</th>
              <td>{formatValue(datum.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
