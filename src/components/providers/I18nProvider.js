"use client";

import '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export function I18nProvider({ children }) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Or a loader
  }

  return children;
}
