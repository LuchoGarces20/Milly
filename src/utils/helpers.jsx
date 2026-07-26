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

export const getAutoClubTxs = (prog) => {
  if (!prog.hasClub || !prog.clubStartDate) return [];
  
  const txs = [];
  const [y, m, d] = prog.clubStartDate.split('-').map(Number);
  let current = new Date(y, m - 1, d);
  const now = new Date();
  let monthCount = 1;

  while (current <= now) {
    const isBonusActive = monthCount <= Number(prog.clubBonusDuration || 0);
    const totalPoints = Number(prog.clubBasePoints || 0) + (isBonusActive ? Number(prog.clubBonusPoints || 0) : 0);

    let expDate = null;
    if (!prog.renewsOnActivity && !prog.pointsNeverExpireWithClub) {
       const exp = new Date(current);
       exp.setFullYear(exp.getFullYear() + 2);
       expDate = exp.toISOString().split('T')[0];
    }

    if (totalPoints > 0) {
      txs.push({
        id: `auto_${prog.id}_${monthCount}`,
        programId: prog.id,
        type: 'Entrada',
        amount: totalPoints,
        investment: Number(prog.clubCost || 0),
        date: current.toISOString().split('T')[0],
        expirationDate: expDate,
        isAuto: true,
        description: `Mensalidade Clube - Mês ${monthCount}`
      });
    }
    current.setMonth(current.getMonth() + 1);
    monthCount++;
  }
  return txs;
};