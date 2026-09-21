import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Clock from '@/components/layout/Clock';
import SessionsCounter from '@/components/layout/SessionsCounter';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import OrdersView from '@/components/orders/OrdersView';
import ProductsFilter from '@/components/products/ProductsFilter';
import { ordersApi } from '@/lib/api';
import { makeOrder, makeProduct } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { ordersHydrated } from '@/store/slices/ordersSlice';
import { productsHydrated } from '@/store/slices/productsSlice';
import { activeTabsChanged, connectionChanged } from '@/store/slices/sessionSlice';
import type { AppStore } from '@/store/store';

const seed = (store: AppStore) => {
  store.dispatch(
    ordersHydrated([
      makeOrder({ id: 1, title: 'Поставка мониторов', date: '2017-04-06 10:00:00' }),
      makeOrder({ id: 2, title: 'Ноутбуки', date: '2017-06-06 10:00:00' }),
    ]),
  );
  store.dispatch(
    productsHydrated([
      makeProduct({ id: 1, order: 1, title: 'Dell U2723QE', type: 'Monitors' }),
      makeProduct({ id: 2, order: 1, title: 'Samsung G5', type: 'Monitors', status: 'repair' }),
      makeProduct({ id: 3, order: 2, title: 'ThinkPad', type: 'Laptops' }),
    ]),
  );
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Clock', () => {
  it('shows the weekday, the date and ticks every second', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    vi.setSystemTime(new Date(2017, 3, 4, 17, 20, 0));

    renderWithProviders(<Clock />);
    expect(screen.getByText('Вторник')).toBeInTheDocument();
    expect(screen.getByText('04 Апр, 2017')).toBeInTheDocument();
    expect(screen.getByText('17:20:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('17:20:02')).toBeInTheDocument();
  });
});

describe('SessionsCounter', () => {
  it('shows the number of active tabs pushed through the socket', () => {
    const { store } = renderWithProviders(<SessionsCounter />);
    expect(screen.getByRole('status')).toHaveTextContent('Нет соединения с сервером');

    act(() => {
      store.dispatch(connectionChanged(true));
      store.dispatch(activeTabsChanged(3));
    });
    expect(screen.getByRole('status')).toHaveTextContent('3 активные вкладки приложения');
  });
});

describe('OrdersView', () => {
  it('lists orders with product counts and opens the details panel on click', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<OrdersView />);
    act(() => seed(store));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Приходы / 2');
    const card = screen.getByRole('button', { name: 'Открыть приход «Поставка мониторов»' });
    expect(card).toHaveTextContent('2Продукта');
    expect(card).toHaveTextContent('06 / Апр / 2017');

    await user.click(card);
    const details = screen.getByRole('region', { name: 'Информация о приходе' });
    expect(within(details).getByText('Dell U2723QE')).toBeInTheDocument();
    expect(within(details).getByText('В ремонте')).toBeInTheDocument();
    expect(store.getState().orders.selectedId).toBe(1);

    await user.click(within(details).getByRole('button', { name: 'Закрыть' }));
    expect(store.getState().orders.selectedId).toBeNull();
  });

  it('opens the delete confirmation from the trash button', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<OrdersView />);
    act(() => seed(store));

    await user.click(screen.getAllByRole('button', { name: 'Удалить приход' })[0]!);
    expect(store.getState().ui.deleteTarget).toEqual({ kind: 'order', id: 2 });
  });
});

describe('ConfirmDeleteModal', () => {
  it('lists the products of the order and deletes it on confirm', async () => {
    const user = userEvent.setup();
    const remove = vi.spyOn(ordersApi, 'remove').mockResolvedValue({} as never);
    const { store } = renderWithProviders(<ConfirmDeleteModal target={{ kind: 'order', id: 1 }} />);
    act(() => seed(store));

    const dialog = screen.getByRole('dialog', { name: 'Вы уверены, что хотите удалить этот приход?' });
    expect(within(dialog).getByText('Dell U2723QE')).toBeInTheDocument();
    expect(within(dialog).getByText('Вместе с приходом будут удалены 2 продукта')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }));
    expect(remove).toHaveBeenCalledWith(1);
    expect(store.getState().orders.items.map((o) => o.id)).toEqual([2]);
    expect(store.getState().ui.deleteTarget).toBeNull();
  });

  it('shows the server error and stays open when deletion fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(ordersApi, 'remove').mockRejectedValue(new Error('Network Error'));
    const { store } = renderWithProviders(<ConfirmDeleteModal target={{ kind: 'order', id: 1 }} />);
    act(() => {
      seed(store);
      store.dispatch({ type: 'ui/deleteRequested', payload: { kind: 'order', id: 1 } });
    });

    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось выполнить действие: Network Error');
    expect(store.getState().orders.items).toHaveLength(2);
    expect(store.getState().ui.deleteTarget).toEqual({ kind: 'order', id: 1 });
  });

  it('closes on Escape without deleting', async () => {
    const user = userEvent.setup();
    const remove = vi.spyOn(ordersApi, 'remove');
    const { store } = renderWithProviders(<ConfirmDeleteModal target={{ kind: 'order', id: 1 }} />);
    act(() => {
      seed(store);
      store.dispatch({ type: 'ui/deleteRequested', payload: { kind: 'order', id: 1 } });
    });

    await user.keyboard('{Escape}');
    expect(store.getState().ui.deleteTarget).toBeNull();
    expect(remove).not.toHaveBeenCalled();
  });
});

describe('ProductsFilter', () => {
  it('offers translated product types and restores the saved type from localStorage', () => {
    window.localStorage.setItem('inventory:product-type', 'Laptops');
    const { store } = renderWithProviders(<ProductsFilter />, {
      products: {
        items: [makeProduct({ id: 1, type: 'Monitors' }), makeProduct({ id: 2, type: 'Laptops' })],
        typeFilter: '',
      },
    });

    const typeSelect = screen.getByRole('combobox', { name: 'Тип:' });
    expect(within(typeSelect).getByRole('option', { name: 'Мониторы' })).toBeInTheDocument();
    expect(store.getState().products.typeFilter).toBe('Laptops');
    expect(typeSelect).toHaveValue('Laptops');
  });
});
