import { differenceInMonths, differenceInDays, format } from 'date-fns';

export function checkCompliance(lastDate, cadenceMonths) {
  if (!lastDate) return { status: 'never', message: 'Never completed', urgency: 'critical' };
  const last = new Date(lastDate);
  const monthsSince = differenceInMonths(new Date(), last);
  const daysUntilDue = differenceInDays(
    new Date(last.getFullYear(), last.getMonth() + cadenceMonths, last.getDate()),
    new Date()
  );
  if (daysUntilDue < 0) {
    return { status: 'overdue', message: `Overdue by ${Math.abs(daysUntilDue)} days`, urgency: 'critical', daysOverdue: Math.abs(daysUntilDue) };
  }
  if (daysUntilDue <= 30) {
    return { status: 'due-soon', message: `Due in ${daysUntilDue} days`, urgency: 'warning', daysUntil: daysUntilDue };
  }
  return { status: 'ok', message: `Next due ${format(new Date(last.getFullYear(), last.getMonth() + cadenceMonths, last.getDate()), 'MMM d, yyyy')}`, urgency: 'none', daysUntil: daysUntilDue };
}

export function generateAlerts(healthCompliance, maintenanceItems, bills) {
  const alerts = [];
  // Health alerts
  for (const [person, items] of Object.entries(healthCompliance || {})) {
    for (const item of items) {
      if (item.status === 'overdue') {
        alerts.push({ type: 'health', severity: 'critical', person, title: `${item.label} - OVERDUE`, message: `${person === 'michelle' ? 'Michelle' : 'Gray'}: ${item.label} is overdue. Last visit: ${item.lastVisit}`, action: 'Book appointment', id: item.id });
      } else if (item.status === 'due-soon') {
        alerts.push({ type: 'health', severity: 'warning', person, title: `${item.label} - Due Soon`, message: `${person === 'michelle' ? 'Michelle' : 'Gray'}: ${item.label} due in ${item.daysUntil} days`, action: 'Schedule', id: item.id });
      }
    }
  }
  // Maintenance alerts
  for (const item of maintenanceItems || []) {
    if (item.status === 'overdue') {
      alerts.push({ type: 'maintenance', severity: 'critical', title: `${item.label} - OVERDUE`, message: `${item.label} is overdue${item.vendor ? ` (Vendor: ${item.vendor})` : ''}`, action: 'Schedule service', id: item.id });
    } else if (item.status === 'due-soon') {
      alerts.push({ type: 'maintenance', severity: 'warning', title: `${item.label} - Due Soon`, message: `${item.label} due in ${item.daysUntil} days`, action: 'Schedule', id: item.id });
    }
  }
  // Bill alerts
  const today = new Date().getDate();
  for (const bill of bills || []) {
    const daysUntilDue = bill.dueDate >= today ? bill.dueDate - today : 30 - today + bill.dueDate;
    if (daysUntilDue <= 5 && !bill.autopay) {
      alerts.push({ type: 'bill', severity: 'warning', title: `${bill.name} Due`, message: `$${bill.amount} due in ${daysUntilDue} days (no autopay)`, action: 'Pay bill', id: `bill_${bill.name}` });
    }
  }
  return alerts.sort((a, b) => {
    const sev = { critical: 0, warning: 1, info: 2 };
    return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2);
  });
}
