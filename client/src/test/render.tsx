import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import messages from '../../messages/ru.json';
import { makeStore, type RootState } from '@/store/store';

export function renderWithProviders(ui: ReactElement, preloadedState?: Partial<RootState>) {
  const store = makeStore(preloadedState);
  const result = render(
    <Provider store={store}>
      <NextIntlClientProvider locale="ru" messages={messages} timeZone="Europe/Kyiv">
        {ui}
      </NextIntlClientProvider>
    </Provider>,
  );
  return { store, ...result };
}
