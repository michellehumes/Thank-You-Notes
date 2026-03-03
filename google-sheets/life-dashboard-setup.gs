/**
 * Michelle's Life Dashboard — Google Apps Script
 *
 * Install: Extensions > Apps Script > paste this code > Save
 * Then: Refresh the sheet and use the "Life Dashboard" menu
 *
 * APIs used (all built into Apps Script):
 * - GmailApp (inbox, job search emails)
 * - CalendarApp (events, birthdays)
 * - ContactsApp / People API (contacts)
 */

// ─── Menu Setup ─────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Life Dashboard')
    .addItem('Refresh Inbox', 'refreshInbox')
    .addItem('Scan Job Emails', 'scanJobEmails')
    .addItem('Sync Calendar (Next 30 Days)', 'syncCalendar')
    .addItem('Sync Google Contacts', 'syncContacts')
    .addSeparator()
    .addItem('Refresh All', 'refreshAll')
    .addSeparator()
    .addItem('Set Up Auto-Refresh (Daily)', 'setupDailyTrigger')
    .addItem('Remove Auto-Refresh', 'removeTriggers')
    .addToUi();
}


// ─── Refresh All ────────────────────────────────────────────────────────────

function refreshAll() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Refreshing all data... This may take 30-60 seconds.');

  refreshInbox();
  scanJobEmails();
  syncCalendar();
  syncContacts();
  updateDashboardTimestamp();

  ui.alert('All data refreshed!');
}

function updateDashboardTimestamp() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName('Dashboard');
  if (ws) {
    ws.getRange('G1').setValue(new Date().toLocaleString());
  }
}


// ─── Gmail: Inbox ───────────────────────────────────────────────────────────

function refreshInbox() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName('Inbox & Email');
  if (!ws) return;

  // Clear existing data (keep header)
  var lastRow = ws.getLastRow();
  if (lastRow > 1) {
    ws.getRange(2, 1, lastRow - 1, 9).clearContent();
  }

  // Fetch recent emails
  var threads = GmailApp.getInboxThreads(0, 100);
  var rows = [];

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var msg = thread.getMessages()[thread.getMessageCount() - 1]; // Latest message
    var labels = thread.getLabels().map(function(l) { return l.getName(); }).join(', ');

    // Auto-categorize
    var subject = msg.getSubject() || '';
    var from = msg.getFrom() || '';
    var category = categorizeEmail(subject, from);

    rows.push([
      formatDate(msg.getDate()),
      from,
      subject,
      msg.getPlainBody().substring(0, 200),  // First 200 chars
      labels,
      thread.isImportant() ? 'Yes' : '',
      thread.isUnread() ? 'No' : 'Yes',
      category,
      'https://mail.google.com/mail/u/0/#inbox/' + thread.getId()
    ]);
  }

  if (rows.length > 0) {
    ws.getRange(2, 1, rows.length, 9).setValues(rows);
  }

  Logger.log('Refreshed inbox: ' + rows.length + ' emails');
}

function categorizeEmail(subject, from) {
  var s = (subject + ' ' + from).toLowerCase();

  // Job-related
  if (/\b(job|hiring|recruit|interview|application|offer|position|resume|linkedin|career)\b/.test(s)) {
    return 'Job';
  }
  // Finance-related
  if (/\b(bank|payment|transaction|invoice|receipt|statement|venmo|paypal|zelle|amex|chase)\b/.test(s)) {
    return 'Finance';
  }
  // Shopping
  if (/\b(order|shipping|delivery|amazon|target|walmart|tracking)\b/.test(s)) {
    return 'Shopping';
  }
  return 'Personal';
}


// ─── Gmail: Job Search ──────────────────────────────────────────────────────

function scanJobEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName('Job Search');
  if (!ws) return;

  // Find existing entries to avoid duplicates
  var existingLinks = new Set();
  var lastRow = ws.getLastRow();
  if (lastRow > 1) {
    var linkCol = ws.getRange(2, 9, lastRow - 1, 1).getValues();
    linkCol.forEach(function(row) {
      if (row[0]) existingLinks.add(row[0]);
    });
  }

  // Search for job-related emails
  var queries = [
    'subject:(application OR applied OR interview OR offer OR position)',
    'from:(linkedin.com OR glassdoor.com OR indeed.com OR lever.co OR greenhouse.io)',
    'subject:(recruiter OR hiring OR job opportunity)',
    'subject:(schedule interview OR phone screen OR onsite)',
  ];

  var allThreads = new Map(); // Use thread ID to dedupe

  queries.forEach(function(query) {
    var threads = GmailApp.search(query + ' newer_than:90d', 0, 50);
    threads.forEach(function(t) {
      allThreads.set(t.getId(), t);
    });
  });

  var newRows = [];

  allThreads.forEach(function(thread, threadId) {
    var link = 'https://mail.google.com/mail/u/0/#inbox/' + threadId;
    if (existingLinks.has(link)) return; // Skip duplicates

    var msg = thread.getMessages()[0]; // First message in thread
    var subject = msg.getSubject() || '';
    var from = msg.getFrom() || '';
    var body = msg.getPlainBody().substring(0, 300);

    // Try to extract company name from sender
    var company = extractCompany(from, subject);

    // Try to detect status
    var status = detectJobStatus(subject, body);

    newRows.push([
      formatDate(msg.getDate()),
      company,
      subject,
      'Gmail',
      status,
      from,
      '',  // Salary range
      body.substring(0, 150).replace(/\n/g, ' '),
      link
    ]);
  });

  if (newRows.length > 0) {
    var startRow = Math.max(ws.getLastRow() + 1, 2);
    // Skip the format hint row if it exists
    if (startRow === 2) {
      var cellA2 = ws.getRange('E2').getValue();
      if (String(cellA2).indexOf('Applied') !== -1) {
        ws.deleteRow(2); // Remove placeholder
      }
    }
    startRow = Math.max(ws.getLastRow() + 1, 2);
    ws.getRange(startRow, 1, newRows.length, 9).setValues(newRows);
  }

  Logger.log('Job search: Found ' + newRows.length + ' new entries');
}

function extractCompany(from, subject) {
  // Try to get company from email domain
  var domainMatch = from.match(/@([^.>]+)\./);
  if (domainMatch) {
    var domain = domainMatch[1];
    if (!['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud'].includes(domain.toLowerCase())) {
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }
  // Try from subject line
  var atMatch = subject.match(/at\s+([A-Z][A-Za-z\s]+)/);
  if (atMatch) return atMatch[1].trim();

  return from.replace(/<.*>/, '').trim();
}

function detectJobStatus(subject, body) {
  var text = (subject + ' ' + body).toLowerCase();
  if (/\b(congratulations|offer|we'd like to offer)\b/.test(text)) return 'Offer';
  if (/\b(interview|schedule|phone screen|meet|zoom call)\b/.test(text)) return 'Interview';
  if (/\b(unfortunately|not moving forward|decided not to|regret|other candidates)\b/.test(text)) return 'Rejected';
  if (/\b(applied|application received|thank you for applying)\b/.test(text)) return 'Applied';
  return 'Review';
}


// ─── Google Calendar ────────────────────────────────────────────────────────

function syncCalendar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName('Calendar & Birthdays');
  if (!ws) return;

  // Clear existing data (keep header)
  var lastRow = ws.getLastRow();
  if (lastRow > 1) {
    ws.getRange(2, 1, lastRow - 1, 8).clearContent();
  }

  var now = new Date();
  var future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

  var rows = [];

  // Get all calendars the user has access to
  var calendars = CalendarApp.getAllCalendars();

  for (var c = 0; c < calendars.length; c++) {
    var cal = calendars[c];
    var calName = cal.getName();
    var events = cal.getEvents(now, future);

    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var title = event.getTitle() || '';

      // Detect event type
      var type = 'Event';
      if (/birthday/i.test(title) || /birthday/i.test(calName)) {
        type = 'Birthday';
      } else if (/anniversary/i.test(title)) {
        type = 'Anniversary';
      }

      rows.push([
        formatDate(event.getStartTime()),
        title,
        formatTime(event.getStartTime()),
        formatTime(event.getEndTime()),
        event.getLocation() || '',
        type,
        calName,
        event.getDescription() ? event.getDescription().substring(0, 150) : ''
      ]);
    }
  }

  // Sort by date
  rows.sort(function(a, b) { return new Date(a[0]) - new Date(b[0]); });

  if (rows.length > 0) {
    // Remove placeholder row if exists
    var cellF2 = ws.getRange('F2').getValue();
    if (String(cellF2).indexOf('Event / Birthday') !== -1) {
      ws.deleteRow(2);
    }
    ws.getRange(2, 1, rows.length, 8).setValues(rows);
  }

  // Highlight birthdays
  for (var r = 0; r < rows.length; r++) {
    if (rows[r][5] === 'Birthday') {
      ws.getRange(r + 2, 1, 1, 8).setBackground('#FFF3E0');
    }
  }

  Logger.log('Calendar sync: ' + rows.length + ' events');
}


// ─── Google Contacts (People API) ───────────────────────────────────────────

function syncContacts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName('Contacts & Wedding');
  if (!ws) return;

  // Get existing names to avoid duplicating wedding contacts
  var existingNames = new Set();
  var lastRow = ws.getLastRow();
  if (lastRow > 1) {
    var names = ws.getRange(2, 1, lastRow - 1, 1).getValues();
    names.forEach(function(row) {
      if (row[0]) existingNames.add(row[0].toLowerCase().trim());
    });
  }

  // Use People API (Advanced Service must be enabled)
  // Go to Extensions > Apps Script > Services > add "People API"
  var newRows = [];

  try {
    var connections = People.People.Connections.list('people/me', {
      personFields: 'names,emailAddresses,phoneNumbers,addresses,birthdays',
      pageSize: 1000
    });

    if (connections.connections) {
      connections.connections.forEach(function(person) {
        var name = '';
        if (person.names && person.names.length > 0) {
          name = person.names[0].displayName || '';
        }

        // Skip if already exists from wedding data
        if (existingNames.has(name.toLowerCase().trim())) return;
        if (!name) return;

        var email = '';
        if (person.emailAddresses && person.emailAddresses.length > 0) {
          email = person.emailAddresses[0].value || '';
        }

        var phone = '';
        if (person.phoneNumbers && person.phoneNumbers.length > 0) {
          phone = person.phoneNumbers[0].value || '';
        }

        var address = '', city = '', state = '', zip = '';
        if (person.addresses && person.addresses.length > 0) {
          var addr = person.addresses[0];
          address = addr.streetAddress || '';
          city = addr.city || '';
          state = addr.region || '';
          zip = addr.postalCode || '';
        }

        var birthday = '';
        if (person.birthdays && person.birthdays.length > 0) {
          var bday = person.birthdays[0].date;
          if (bday) {
            birthday = (bday.month || '') + '/' + (bday.day || '');
            if (bday.year) birthday = bday.month + '/' + bday.day + '/' + bday.year;
          }
        }

        newRows.push([
          name,           // Name
          'Contact',      // Relation (from Google Contacts)
          address,        // Address
          city,           // City
          state,          // State
          zip,            // Zip
          phone,          // Phone
          email,          // Email
          birthday,       // Birthday
          '',             // Gift Received
          '',             // Gift Value
          '',             // Thank You Note
          '',             // Thank You Status
          '',             // Christmas Card
          '',             // Wedding Invite Sent
          'From Google Contacts'  // Notes
        ]);
      });
    }
  } catch (e) {
    Logger.log('People API error: ' + e.message);
    Logger.log('Make sure People API is enabled: Extensions > Apps Script > Services > People API');

    // Fallback: try ContactsApp (deprecated but still works)
    try {
      var contacts = ContactsApp.getContacts();
      contacts.forEach(function(contact) {
        var name = contact.getFullName() || '';
        if (existingNames.has(name.toLowerCase().trim())) return;
        if (!name) return;

        var emails = contact.getEmails();
        var phones = contact.getPhones();

        newRows.push([
          name, 'Contact', '', '', '', '',
          phones.length > 0 ? phones[0].getAddress() : '',
          emails.length > 0 ? emails[0].getAddress() : '',
          '', '', '', '', '', '', '',
          'From Google Contacts'
        ]);
      });
    } catch (e2) {
      Logger.log('ContactsApp fallback also failed: ' + e2.message);
    }
  }

  if (newRows.length > 0) {
    var startRow = ws.getLastRow() + 1;
    ws.getRange(startRow, 1, newRows.length, 16).setValues(newRows);
  }

  Logger.log('Contacts sync: Added ' + newRows.length + ' new contacts');
}


// ─── Scheduled Triggers ─────────────────────────────────────────────────────

function setupDailyTrigger() {
  // Remove existing triggers first
  removeTriggers();

  // Inbox refresh: every day at 8 AM
  ScriptApp.newTrigger('refreshInbox')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  // Job scan: every day at 9 AM
  ScriptApp.newTrigger('scanJobEmails')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  // Calendar sync: every Monday at 8 AM
  ScriptApp.newTrigger('syncCalendar')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();

  SpreadsheetApp.getUi().alert(
    'Auto-refresh set up!\n\n' +
    '• Inbox: Daily at 8 AM\n' +
    '• Job Search: Daily at 9 AM\n' +
    '• Calendar: Every Monday at 8 AM\n\n' +
    'You can also refresh manually from the Life Dashboard menu.'
  );
}

function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}


// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'M/d/yyyy');
}

function formatTime(date) {
  if (!date) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'h:mm a');
}
