export function calculateNetWorth(accounts) {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

export function calculateSavingsRate(income, expenses) {
  if (!income || income === 0) return 0;
  return Math.round(((income - expenses) / income) * 100 * 10) / 10;
}

export function calculateEmergencyFundMonths(savingsBalance, monthlyExpenses) {
  if (!monthlyExpenses || monthlyExpenses === 0) return 0;
  return Math.round((savingsBalance / monthlyExpenses) * 10) / 10;
}

export function projectCashFlow(monthlyIncome, monthlyExpenses, months = 12) {
  const projections = [];
  let runningBalance = 0;
  for (let i = 1; i <= months; i++) {
    runningBalance += monthlyIncome - monthlyExpenses;
    projections.push({
      month: i,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      net: monthlyIncome - monthlyExpenses,
      cumulative: runningBalance,
    });
  }
  return projections;
}

export function monthlyVariance(currentExpenses, previousExpenses) {
  if (!previousExpenses || previousExpenses === 0) return { amount: 0, percent: 0 };
  const diff = currentExpenses - previousExpenses;
  return {
    amount: Math.round(diff * 100) / 100,
    percent: Math.round((diff / previousExpenses) * 100 * 10) / 10,
  };
}

export function retirementProjection({ currentAge, retireAge, currentSavings, monthlyContribution, annualReturn = 0.07 }) {
  const years = retireAge - currentAge;
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;
  let balance = currentSavings;
  const yearly = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyReturn) + monthlyContribution;
    }
    yearly.push({ age: currentAge + y, year: new Date().getFullYear() + y, balance: Math.round(balance) });
  }
  return { finalBalance: Math.round(balance), yearly };
}

export function pregnancyCostSimulator({ insuranceDeductible = 3000, estimatedOOP = 5000, monthlyBabyExpenses = 1500, lostIncomeMonths = 3, monthlyIncome = 7000 }) {
  const prenatalCosts = 2500;
  const deliveryCosts = Math.max(estimatedOOP, insuranceDeductible);
  const lostIncome = lostIncomeMonths * monthlyIncome;
  const firstYearBaby = monthlyBabyExpenses * 12;
  return {
    prenatalCosts,
    deliveryCosts,
    lostIncome,
    firstYearBaby,
    totalFirstYear: prenatalCosts + deliveryCosts + lostIncome + firstYearBaby,
    monthlyImpact: Math.round((prenatalCosts + deliveryCosts + firstYearBaby) / 12),
  };
}

export function whatIfScenario({ monthlyIncome, monthlyExpenses, change, changeAmount }) {
  let newIncome = monthlyIncome;
  let newExpenses = monthlyExpenses;
  if (change === 'income_increase') newIncome += changeAmount;
  if (change === 'income_decrease') newIncome -= changeAmount;
  if (change === 'expense_increase') newExpenses += changeAmount;
  if (change === 'expense_decrease') newExpenses -= changeAmount;
  return {
    before: { income: monthlyIncome, expenses: monthlyExpenses, net: monthlyIncome - monthlyExpenses, savingsRate: calculateSavingsRate(monthlyIncome, monthlyExpenses) },
    after: { income: newIncome, expenses: newExpenses, net: newIncome - newExpenses, savingsRate: calculateSavingsRate(newIncome, newExpenses) },
    impact: { monthlyDiff: (newIncome - newExpenses) - (monthlyIncome - monthlyExpenses), annualDiff: ((newIncome - newExpenses) - (monthlyIncome - monthlyExpenses)) * 12 },
  };
}
