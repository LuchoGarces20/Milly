import { getAutoClubTxs } from './clubEngine';

export function calculateProgramStats(prog, manualTxs) {
  const autoTxs = getAutoClubTxs(prog);
  const allTxs = [...manualTxs, ...autoTxs].sort((a, b) => new Date(a.date) - new Date(b.date));

  let balance = 0;
  let currentPoolCost = 0;
  const entradas = [];
  let totalSaidas = 0;

  allTxs.forEach(t => {
    if (t.isSnapshot) {
      const diferenca = Number(t.amount) - balance;
      if (diferenca > 0) {
        balance = Number(t.amount);
        currentPoolCost += Number(t.investment || 0);
        if (t.expirationDate && !t.neverExpires) {
          entradas.push({ amount: diferenca, date: t.expirationDate });
        }
      } else if (diferenca < 0) {
        const saudaAmount = Math.abs(diferenca);
        const avgCpm = balance > 0 ? currentPoolCost / (balance / 1000) : 0;
        currentPoolCost = Math.max(0, currentPoolCost - (saudaAmount / 1000) * avgCpm);
        balance = Number(t.amount);
        totalSaidas += saudaAmount;
      }
    } else if (t.type === 'Entrada') {
      balance += Number(t.amount);
      currentPoolCost += Number(t.investment || 0);
      if (t.expirationDate && !t.neverExpires) {
        entradas.push({ amount: Number(t.amount), date: t.expirationDate });
      }
    } else {
      const saudaAmount = Number(t.amount);
      const avgCpm = balance > 0 ? currentPoolCost / (balance / 1000) : 0;
      currentPoolCost = Math.max(0, currentPoolCost - (saudaAmount / 1000) * avgCpm);
      balance = Math.max(0, balance - saudaAmount);
      totalSaidas += saudaAmount;
    }
  });

  const cpm = balance > 0 ? currentPoolCost / (balance / 1000) : 0;
  const marketCpm = Number(prog.marketCpm || 0);
  const marketValue = (balance / 1000) * marketCpm;
  const profit = marketValue - currentPoolCost;
  
  let expirationsAtivas = [];
  const isExemptByClub = prog.hasClub && prog.pointsNeverExpireWithClub && (!prog.clubEndDate || new Date(prog.clubEndDate) >= new Date());

  if (balance > 0 && !isExemptByClub) {
    if (prog.renewsOnActivity) {
      if (allTxs.length > 0) {
        const latestTx = allTxs[allTxs.length - 1];
        const expDate = new Date(latestTx.date);
        expDate.setMonth(expDate.getMonth() + Number(prog.renewalDurationMonths || 24));
        expirationsAtivas = [{ amount: balance, date: expDate.toISOString().split('T')[0], program: prog.name, owner: prog.owner, isActivityDeadline: true }];
      }
    } else {
      entradas.sort((a, b) => new Date(a.date) - new Date(b.date));
      let saidasPendentes = totalSaidas;
      entradas.forEach(lote => {
        if (saidasPendentes >= lote.amount) {
          saidasPendentes -= lote.amount;
        } else if (saidasPendentes > 0) {
          expirationsAtivas.push({ amount: lote.amount - saidasPendentes, date: lote.date, program: prog.name, owner: prog.owner, isActivityDeadline: false });
          saidasPendentes = 0;
        } else {
          expirationsAtivas.push({ amount: lote.amount, date: lote.date, program: prog.name, owner: prog.owner, isActivityDeadline: false });
        }
      });
    }
  }

  return { ...prog, balance, cpm, currentPoolCost, marketValue, profit, expirationsAtivas, allTxs, isExemptByClub };
}