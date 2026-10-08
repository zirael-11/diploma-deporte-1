import { useTranslation } from 'react-i18next';
import ru from '../locales/ru/translation.json';

export function useShopTranslation() {
  const { t, i18n } = useTranslation();
  const productText = (product, field = 'title') => {
    if (!product) return '';
    const key = `product.${product.id}.${field}`;

    if (Object.hasOwn(ru, key) && product[field] === ru[key]) return t(key);
    if (field === 'title') {
      const demo = product.title?.match(/^(Домашняя|Гостевая|Тренировочная|Специальная коллекция) форма сборной (.+) \((\d{4})\)$/);
      if (demo) return t('Демонстрационный комплект', {
        type: t(demo[1]), country: t(demo[2]), year: demo[3],
      });
    }
    return product[field] || '';
  };
  const formatMoney = value => new Intl.NumberFormat(i18n.language, {
    style: 'currency', currency: 'RUB', maximumFractionDigits: 2,
  }).format(Number(value || 0));
  return { t, productText, formatMoney };
}

//Это пользовательский hook, который объединяет перевод интерфейса,
//перевод данных товаров и форматирование цен, чтобы не повторять эту логику на каждой странице!!
//ника не тупим (проверить дома конст и ифы!!!!)
