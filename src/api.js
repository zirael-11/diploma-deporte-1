import i18n from './i18n/index.js';
export const GUEST = { name: 'Гость', role: 'guest' };

export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { throw new Error(i18n.t('Сервер вернул некорректный ответ. Проверьте запуск Docker.')); }
  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map(item => `${item.loc?.slice(1).join('.')}: ${item.msg}`).join('; ')
      : typeof detail === 'string' ? detail : i18n.t('Ошибка сервера ({{status}})', { status: response.status });
    const error = new Error(i18n.t(message, { defaultValue: message }));
    error.status = response.status;
    throw error;
  }
  return data;
}

export function imageUrl(value) { return value?.includes('/') ? value : `/images/${value || 'spainfuria2026.png'}`; }
