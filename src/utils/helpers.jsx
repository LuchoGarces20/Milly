import React from 'react';
import { CreditCard, Plane, Hotel } from 'lucide-react';

export const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
export const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);

export const formatDateBR = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const getCategoryIcon = (category) => {
  if (category.includes('Bancos')) return <CreditCard className="w-4 h-4" />;
  if (category.includes('Aéreas')) return <Plane className="w-4 h-4" />;
  return <Hotel className="w-4 h-4" />;
};