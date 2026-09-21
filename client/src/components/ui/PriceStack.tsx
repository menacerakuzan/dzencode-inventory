import { cn } from '@/lib/cn';
import { formatAmount, splitPrices } from '@/lib/format';
import type { Price } from '@/types';

/** Price in several currencies: the secondary ones small on top, the default one large below. */
export default function PriceStack({ prices, className }: { prices: Price[]; className?: string }) {
  const { main, secondary } = splitPrices(prices);
  if (!main) return <span className={cn('price-stack', className)}>—</span>;

  return (
    <span className={cn('price-stack', className)}>
      {secondary.length > 0 && (
        <span className="price-stack__secondary">
          {secondary.map((price) => `${formatAmount(price.value)} ${price.symbol}`).join(' · ')}
        </span>
      )}
      <span className="price-stack__main">
        {formatAmount(main.value)} <span className="price-stack__currency">{main.symbol}</span>
      </span>
    </span>
  );
}
