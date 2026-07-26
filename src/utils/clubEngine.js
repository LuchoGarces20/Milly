export const getAutoClubTxs = (prog) => {
  if (!prog.hasClub || !prog.clubStartDate) return [];

  const txs = [];
  const [y, m, d] = prog.clubStartDate.split('-').map(Number);
  let current = new Date(y, m - 1, d);
  
  const now = new Date();
  let endDateLimit = now;

  if (prog.clubEndDate) {
    const [ey, em, ed] = prog.clubEndDate.split('-').map(Number);
    const cancelDate = new Date(ey, em - 1, ed);
    if (cancelDate < now) {
      endDateLimit = cancelDate;
    }
  }

  let monthCount = 1;

  while (current <= endDateLimit) {
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
        description: `Clube (${prog.billingFrequency}) - Mês ${monthCount}`
      });
    }

    current.setMonth(current.getMonth() + 1);
    monthCount++;
  }

  return txs;
};