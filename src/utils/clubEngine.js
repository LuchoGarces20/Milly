const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getAutoClubTxs = (prog) => {
  if (!prog.hasClub || !prog.clubStartDate) return [];
  const txs = [];
  const [y, m, d] = prog.clubStartDate.split('-').map(Number);
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  let endDateLimit = now;
  if (prog.clubEndDate) {
    const [ey, em, ed] = prog.clubEndDate.split('-').map(Number);
    const cancelDate = new Date(ey, em - 1, ed, 23, 59, 59);
    if (cancelDate < now) {
      endDateLimit = cancelDate;
    }
  }

  let monthIndex = 0;
  while (true) {
    // Calcula o mês/ano sem mutar o objeto de data original
    const targetYear = y + Math.floor((m - 1 + monthIndex) / 12);
    const targetMonth = (m - 1 + monthIndex) % 12;

    // Limita o dia ao máximo de dias no mês (ex: 31 de Jan -> 28 de Fev)
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const actualDay = Math.min(d, daysInMonth);

    const current = new Date(targetYear, targetMonth, actualDay);
    if (current > endDateLimit) break;

    const monthCount = monthIndex + 1;
    const isBonusActive = monthCount <= Number(prog.clubBonusDuration || 0);
    const totalPoints = Number(prog.clubBasePoints || 0) + (isBonusActive ? Number(prog.clubBonusPoints || 0) : 0);

    let expDate = null;
    if (!prog.renewsOnActivity && !prog.pointsNeverExpireWithClub) {
      const exp = new Date(current);
      exp.setFullYear(exp.getFullYear() + 2);
      expDate = formatDate(exp);
    }

    if (totalPoints > 0) {
      txs.push({
        id: `auto_${prog.id}_${monthCount}`,
        programId: prog.id,
        type: 'Entrada',
        amount: totalPoints,
        investment: Number(prog.clubCost || 0),
        date: formatDate(current),
        expirationDate: expDate,
        isAuto: true,
        description: `Clube (${prog.billingFrequency || 'Mensal'}) - Mês ${monthCount}`
      });
    }

    monthIndex++;
  }

  return txs;
};