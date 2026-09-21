import { cn } from '@/lib/cn';
import { CURRENCY_LABEL, formatAmount, splitPrices } from '@/lib/format';
import type { Price } from '@/types';

/** Price in two currencies: the secondary one small on top, the default one large below. */
export default function PriceStack({ prices, className }: { prices: Price[]; className?: string }) {
  const { main, secondary } = splitPrices(prices);
  if (!main) return <span className={cn('price-stack', className)}>—</span>;

  return (
    <span className={cn('price-stack', className)}>
      {secondary && (
        <span className="price-stack__secondary">
          {formatAmount(secondary.value)} {CURRENCY_LABEL[secondary.symbol]}
        </span>
      )}
      <span className="price-stack__main">
        {formatAmount(main.value)} <span className="price-stack__currency">{CURRENCY_LABEL[main.symbol]}</span>
      </span>
    </span>
  );
}
