export const CATEGORIAS = ['Pontos (Bancos)', 'Milhas (Aéreas)', 'Hospedagem (Hotéis)'];

export const TAGS_TRANSACOES = [
  'Transferência', 
  'Cartão de Crédito', 
  'Compra Bonificada', 
  'Voo', 
  'Clube', 
  'Bônus', 
  'Outros'
];

export const CATALOGO_PROGRAMAS = [
  { id: 'c1', name: 'Livelo', category: 'Pontos (Bancos)', renewsOnActivity: true, renewalDurationMonths: 24, defaultMarketCpm: 30.00, quarantineMonths: 12, familyPoolAvailable: false, tiers: ['Classic', 'Plus', 'Super', 'Mega', 'Top'] },
  { id: 'c2', name: 'Esfera', category: 'Pontos (Bancos)', renewsOnActivity: true, renewalDurationMonths: 24, defaultMarketCpm: 30.00, quarantineMonths: 12, familyPoolAvailable: false, tiers: ['Pro', 'Master', 'VIP', 'Premium', 'Exclusive'] },
  { id: 'c3', name: 'Smiles', category: 'Milhas (Aéreas)', renewsOnActivity: false, renewalDurationMonths: 24, defaultMarketCpm: 15.00, quarantineMonths: 12, familyPoolAvailable: true, tiers: ['Plano 1.000', 'Plano 2.000', 'Plano 5.000', 'Plano 7.000', 'Plano 10.000', 'Plano 20.000'] },
  { id: 'c4', name: 'Latam Pass', category: 'Milhas (Aéreas)', renewsOnActivity: false, renewalDurationMonths: 24, defaultMarketCpm: 25.00, quarantineMonths: 12, familyPoolAvailable: false, tiers: ['Clube Base', 'Clube Plus', 'Clube Premium'] },
  { id: 'c5', name: 'Azul Fidelidade', category: 'Milhas (Aéreas)', renewsOnActivity: false, renewalDurationMonths: 24, defaultMarketCpm: 14.00, quarantineMonths: 12, familyPoolAvailable: true, tiers: ['Clube 1.000', 'Clube 2.000', 'Clube 5.000', 'Clube 10.000', 'Clube 20.000'] },
  { id: 'c6', name: 'AAdvantage', category: 'Milhas (Aéreas)', renewsOnActivity: true, renewalDurationMonths: 24, defaultMarketCpm: 90.00, quarantineMonths: 0, familyPoolAvailable: false, tiers: [] },
  { id: 'c7', name: 'TAP Miles&Go', category: 'Milhas (Aéreas)', renewsOnActivity: false, renewalDurationMonths: 36, defaultMarketCpm: 40.00, quarantineMonths: 12, familyPoolAvailable: false, tiers: ['Club Basic', 'Club Extra', 'Club Top', 'Club Platinum'] },
  { id: 'c8', name: 'ALL Accor', category: 'Hospedagem (Hotéis)', renewsOnActivity: true, renewalDurationMonths: 12, defaultMarketCpm: 120.00, quarantineMonths: 0, familyPoolAvailable: false, tiers: ['Classic', 'Silver', 'Gold', 'Platinum', 'Diamond'] }
];

export const INITIAL_PROG_FORM = {
  owner: '',
  name: '',
  category: CATEGORIAS[0],
  marketCpm: '',
  hasClub: false,
  clubTier: '',
  lastCancellationDate: '',
  clubStartDate: '',
  clubEndDate: '',
  billingFrequency: 'Mensal',
  clubCost: '',
  clubBasePoints: '',
  clubBonusPoints: '',
  clubBonusDuration: '',
  renewsOnActivity: false,
  renewalDurationMonths: 24,
  pointsNeverExpireWithClub: false
};

export const getInitialTxForm = () => {
  const today = new Date();
  const exp = new Date(today);
  exp.setFullYear(today.getFullYear() + 2);
  return {
    owner: '',
    programId: '',
    type: 'Entrada',
    amount: '',
    investment: '',
    tag: 'Outros',
    expirationDate: exp.toISOString().split('T')[0],
    neverExpires: false,
    date: today.toISOString().split('T')[0]
  };
};