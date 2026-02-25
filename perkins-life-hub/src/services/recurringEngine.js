import { addMonths, differenceInDays, isPast, format } from 'date-fns';

export function calculateNextDue(lastCompleted, cadenceMonths, fixedDate = null) {
  if (fixedDate) {
    const [month, day] = fixedDate.split('-').map(Number);
    const now = new Date();
    let next = new Date(now.getFullYear(), month - 1, day);
    if (isPast(next)) next = new Date(now.getFullYear() + 1, month - 1, day);
    return next;
  }
  if (!lastCompleted) return null;
  return addMonths(new Date(lastCompleted), cadenceMonths);
}

export function getStatus(nextDue) {
  if (!nextDue) return 'unknown';
  const daysUntil = differenceInDays(new Date(nextDue), new Date());
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 14) return 'due-soon';
  if (daysUntil <= 30) return 'upcoming';
  return 'ok';
}

export function getDaysUntil(nextDue) {
  if (!nextDue) return null;
  return differenceInDays(new Date(nextDue), new Date());
}

export function processMaintenanceItems(items, cadenceRules) {
  return Object.entries(items).map(([key, item]) => {
    const rule = cadenceRules[key];
    if (!rule) return null;
    const nextDue = calculateNextDue(item.lastCompleted, rule.cadenceMonths, rule.fixedDate);
    const status = getStatus(nextDue);
    const daysUntil = getDaysUntil(nextDue);
    return {
      id: key,
      label: rule.label,
      category: rule.category,
      lastCompleted: item.lastCompleted,
      nextDue: nextDue ? format(nextDue, 'yyyy-MM-dd') : null,
      status,
      daysUntil,
      vendor: item.vendor || null,
      cost: item.cost || 0,
    };
  }).filter(Boolean).sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999));
}

export function processHealthCompliance(compliance, cadenceRules) {
  const results = {};
  for (const [person, items] of Object.entries(compliance)) {
    results[person] = Object.entries(items).map(([type, data]) => {
      const rule = cadenceRules[type];
      if (!rule) return null;
      const nextDue = calculateNextDue(data.lastVisit, rule.cadenceMonths);
      const status = getStatus(nextDue);
      const daysUntil = getDaysUntil(nextDue);
      return {
        id: `${person}_${type}`,
        person,
        type,
        label: rule.label,
        lastVisit: data.lastVisit,
        nextDue: nextDue ? format(nextDue, 'yyyy-MM-dd') : null,
        status,
        daysUntil,
        needsBooking: status === 'overdue' || status === 'due-soon',
      };
    }).filter(Boolean).sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999));
  }
  return results;
}
