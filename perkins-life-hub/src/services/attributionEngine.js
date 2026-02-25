const ACCOUNT_OWNER_MAP = {
  joint_checking: 'household',
  michelle_personal: 'michelle',
  gray_personal: 'gray',
  joint_savings: 'household',
  michelle_cc: 'michelle',
  gray_cc: 'gray',
};

const SHARED_CATEGORIES = ['housing', 'utilities', 'insurance', 'food'];

export function attributeTransaction(transaction, accountId) {
  const accountOwner = ACCOUNT_OWNER_MAP[accountId] || 'unknown';
  if (accountOwner === 'household') return { payer: 'household', split: { michelle: 0.5, gray: 0.5 } };
  if (SHARED_CATEGORIES.includes(transaction.category)) {
    return { payer: accountOwner, split: { michelle: 0.5, gray: 0.5 }, note: `Paid by ${accountOwner}, shared expense` };
  }
  return { payer: accountOwner, split: { [accountOwner]: 1.0 } };
}

export function calculatePayerSummary(transactions) {
  const summary = { michelle: { total: 0, shared: 0, personal: 0, count: 0 }, gray: { total: 0, shared: 0, personal: 0, count: 0 }, household: { total: 0, count: 0 } };
  for (const tx of transactions) {
    const attr = tx.attribution || attributeTransaction(tx, tx.accountId);
    const amount = Math.abs(tx.amount || 0);
    if (attr.payer === 'household') {
      summary.household.total += amount;
      summary.household.count++;
      summary.michelle.shared += amount * 0.5;
      summary.gray.shared += amount * 0.5;
    } else {
      const person = attr.payer;
      if (summary[person]) {
        summary[person].total += amount;
        summary[person].count++;
        if (attr.split && Object.keys(attr.split).length > 1) {
          summary[person].shared += amount;
        } else {
          summary[person].personal += amount;
        }
      }
    }
  }
  return summary;
}

export function calculateFairnessScore(summary) {
  const michelleTotal = summary.michelle.total + summary.michelle.shared;
  const grayTotal = summary.gray.total + summary.gray.shared;
  const total = michelleTotal + grayTotal;
  if (total === 0) return { score: 100, michellePercent: 50, grayPercent: 50, imbalance: 0 };
  const michellePercent = Math.round((michelleTotal / total) * 100);
  const grayPercent = 100 - michellePercent;
  const imbalance = Math.abs(michellePercent - 50);
  return { score: Math.max(0, 100 - imbalance * 2), michellePercent, grayPercent, imbalance };
}
