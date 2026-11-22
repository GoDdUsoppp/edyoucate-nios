/**
 * NIOS Official Notification Scraper
 * edYOUcate - Automated Notification System
 *
 * Scrapes the official NIOS portal for the newest notification across 5 categories:
 * 1. Admissions & TMA
 * 2. Examination & Result
 * 3. Notification, Orders & Office Orders
 * 4. Transfer Order
 * 5. Study Centres & Accreditation
 *
 * Source: https://www.nios.ac.in
 * Updates: content/nios-notification.json
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  sources: [
    {
      name: 'Main Orders Page',
      url: 'https://www.nios.ac.in/notice-boardoffice-order/for-all-orders-office-orders.aspx',
      categories: [
        { name: 'Admissions & TMA', pattern: /admissions?\s*&\s*tma/i },
        { name: 'Examination & Result', pattern: /examination\s*&\s*result/i },
        { name: 'Notification, Orders & Office Orders', pattern: /all\s*notification/i },
        { name: 'Study Centres & Accreditation', pattern: /study\s*centres?\s*&\s*accreditation/i }
      ]
    },
    {
      name: 'Transfer Orders Page',
      url: 'https://www.nios.ac.in/notice-boardoffice-order/transfer-office-order.aspx',
      isTransfer: true,
      categoryName: 'Transfer Order'
    }
  ],
  outputFile: path.join(__dirname, '..', 'content', 'nios-notification.json'),
  timeoutMs: 25000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 edYOUcate-Notification-Scraper/1.0'
};

/**
 * Robust date parser supporting Indian standard formats:
 * - DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
 * - Prefixed with dt., dated, date
 * - Named months: "13th November 2026", "13 Nov 2026"
 * - Fallback: year in URL
 */
function parseDate(text, url) {
  if (!text) return null;

  // 1. Explicit dt./dated/date prefix (e.g. "dt. 13/11/2026", "dated 27.05.2026")
  const dtPrefixRegex = /(?:dt\.?|dated|date)[:\s]*([0-3]?[0-9])[\/\.\-]([0-1]?[0-9])[\/\.\-](20\d{2})/i;
  let match = text.match(dtPrefixRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // 2. Named month text dates (e.g. "13th November 2026", "13 Nov 2026")
  const monthNames = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const textDateRegex = /([0-3]?[0-9])(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+(20\d{2})/i;
  match = text.match(textDateRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = monthNames[match[2].toLowerCase().substring(0, 3)];
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // 3. General standalone DD/MM/YYYY or DD.MM.YYYY
  const generalDateRegex = /\b([0-3]?[0-9])[\/\.\-]([0-1]?[0-9])[\/\.\-](20\d{2})\b/;
  match = text.match(generalDateRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // 4. Fallback: check year inside URL path (e.g. /yr2026/...)
  if (url) {
    const yrMatch = url.match(/\/yr(20\d{2})\//i);
    if (yrMatch) {
      return `${yrMatch[1]}-01-01`;
    }
  }

  return null;
}

/**
 * Generate a deterministic, stable identifier from the notification URL and title
 */
function generateId(url, title) {
  try {
    const parsed = new URL(url);
    const filename = path.basename(parsed.pathname, path.extname(parsed.pathname));
    if (filename && filename.length > 3 && !/^(default|index)$/i.test(filename)) {
      const cleanSlug = filename.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').substring(0, 40);
      const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 6);
      return `nios-${cleanSlug}-${hash}`;
    }
  } catch (e) {}

  const hash = crypto.createHash('sha256').update(url + (title || '')).digest('hex').substring(0, 16);
  return `nios-${hash}`;
}

/**
 * Extract clean text without img alt text, extra spaces or line breaks
 */
function cleanText($, el) {
  const clone = $(el).clone();
  clone.find('img').remove();
  clone.find('script, style').remove();
  return clone.text().replace(/\s+/g, ' ').trim();
}

/**
 * Fetch HTML with timeout and User-Agent
 */
async function fetchHtml(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    return html;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse notifications from for-all-orders-office-orders.aspx
 */
function parseOrdersPage(html) {
  const $ = cheerio.load(html);
  const items = [];

  const categories = [
    { name: 'Admissions & TMA', pattern: /admissions?\s*&\s*tma/i },
    { name: 'Examination & Result', pattern: /examination\s*&\s*result/i },
    { name: 'Notification, Orders & Office Orders', pattern: /all\s*notification/i },
    { name: 'Study Centres & Accreditation', pattern: /study\s*centres?\s*&\s*accreditation/i }
  ];

  categories.forEach(cat => {
    let targetH3 = null;

    $('h3').each((i, el) => {
      const text = $(el).text().replace(/\s+/g, ' ');
      if (cat.pattern.test(text)) {
        targetH3 = $(el);
        return false;
      }
    });

    if (!targetH3 || !targetH3.length) {
      console.warn(`[WARN] Section heading not found for: ${cat.name}`);
      return;
    }

    const ul = targetH3.nextAll('ul').first();
    if (!ul.length) return;

    ul.find('> li').each((pageIndex, li) => {
      const link = $(li).find('a').first();
      if (!link.length) return;

      const rawHref = link.attr('href');
      if (!rawHref || rawHref.trim().startsWith('#') || rawHref.trim().startsWith('javascript:')) {
        return;
      }

      let fullUrl;
      try {
        fullUrl = new URL(rawHref.trim(), 'https://www.nios.ac.in').href;
      } catch (e) {
        return;
      }

      const title = cleanText($, link);
      if (!title || title.length < 8) return;

      const date = parseDate(title, fullUrl);
      const id = generateId(fullUrl, title);

      items.push({
        id,
        title,
        category: cat.name,
        date: date || '1970-01-01',
        url: fullUrl,
        source: 'NIOS',
        pageOrder: pageIndex
      });
    });
  });

  return items;
}

/**
 * Parse notifications from transfer-office-order.aspx
 */
function parseTransferPage(html) {
  const $ = cheerio.load(html);
  const items = [];

  let targetH3 = null;
  $('h3').each((i, el) => {
    if (/year\s*202[0-9]/i.test($(el).text())) {
      targetH3 = $(el);
      return false;
    }
  });

  if (!targetH3 || !targetH3.length) {
    targetH3 = $('h3').first();
  }

  const ul = targetH3.nextAll('ul').first();
  if (!ul.length) return items;

  ul.find('> li').each((pageIndex, li) => {
    const link = $(li).find('a').first();
    if (!link.length) return;

    const rawHref = link.attr('href');
    if (!rawHref || rawHref.trim().startsWith('#') || rawHref.trim().startsWith('javascript:')) {
      return;
    }

    let fullUrl;
    try {
      fullUrl = new URL(rawHref.trim(), 'https://www.nios.ac.in').href;
    } catch (e) {
      return;
    }

    const title = cleanText($, link);
    if (!title || title.length < 8) return;

    const date = parseDate(title, fullUrl);
    const id = generateId(fullUrl, title);

    items.push({
      id,
      title,
      category: 'Transfer Order',
      date: date || '1970-01-01',
      url: fullUrl,
      source: 'NIOS',
      pageOrder: pageIndex
    });
  });

  return items;
}

/**
 * Main scraper orchestration
 */
async function scrapeNios() {
  console.log(`[INFO] Starting NIOS notification scraper at ${new Date().toISOString()}`);

  const allItems = [];

  // 1. Scrape Main Orders Page
  try {
    console.log(`[INFO] Fetching Main Orders page: ${CONFIG.sources[0].url}`);
    const ordersHtml = await fetchHtml(CONFIG.sources[0].url);
    const ordersItems = parseOrdersPage(ordersHtml);
    console.log(`[INFO] Successfully extracted ${ordersItems.length} notifications from Main Orders page.`);
    allItems.push(...ordersItems);
  } catch (err) {
    console.error(`[ERROR] Failed to fetch or parse Main Orders page:`, err.message);
  }

  // Polite pause between requests
  await new Promise(r => setTimeout(r, 1000));

  // 2. Scrape Transfer Orders Page
  try {
    console.log(`[INFO] Fetching Transfer Orders page: ${CONFIG.sources[1].url}`);
    const transferHtml = await fetchHtml(CONFIG.sources[1].url);
    const transferItems = parseTransferPage(transferHtml);
    console.log(`[INFO] Successfully extracted ${transferItems.length} notifications from Transfer Orders page.`);
    allItems.push(...transferItems);
  } catch (err) {
    console.error(`[ERROR] Failed to fetch or parse Transfer Orders page:`, err.message);
  }

  // Check for successful extraction
  if (allItems.length === 0) {
    console.warn('[WARNING] No notifications extracted from NIOS portal. Preserving existing data.');
    process.exit(0);
  }

  // 3. Deduplicate by URL
  const seenUrls = new Set();
  const uniqueItems = [];
  for (const item of allItems) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueItems.push(item);
    }
  }

  console.log(`[INFO] Extracted ${allItems.length} total items, reduced to ${uniqueItems.length} unique notifications.`);

  // 4. Sort to determine the single newest notification
  // Tie-breaking strategy:
  // 1. Publication date descending (newest YYYY-MM-DD first)
  // 2. Explicit notice number descending if present (e.g. "Notification 49/2026")
  // 3. Page order (items listed earlier on NIOS page are more recently uploaded)
  // 4. Stable ID lexicographical order as final tie-breaker
  uniqueItems.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }

    const numA = (a.title.match(/(?:notification|order|circular)[\s\-]*([0-9]+)/i) || [])[1];
    const numB = (b.title.match(/(?:notification|order|circular)[\s\-]*([0-9]+)/i) || [])[1];
    if (numA && numB && numA !== numB) {
      return parseInt(numB, 10) - parseInt(numA, 10);
    }

    if (a.pageOrder !== b.pageOrder) {
      return a.pageOrder - b.pageOrder;
    }

    return a.id.localeCompare(b.id);
  });

  const newest = uniqueItems[0];
  console.log(`\n[INFO] Newest NIOS Notification across all 5 categories:`);
  console.log(`  Title:    ${newest.title}`);
  console.log(`  Category: ${newest.category}`);
  console.log(`  Date:     ${newest.date}`);
  console.log(`  URL:      ${newest.url}`);
  console.log(`  ID:       ${newest.id}\n`);

  // 5. Read existing data to preserve firstSeen and avoid unnecessary writes
  let existingData = null;
  if (fs.existsSync(CONFIG.outputFile)) {
    try {
      existingData = JSON.parse(fs.readFileSync(CONFIG.outputFile, 'utf8'));
    } catch (e) {
      console.warn('[WARN] Existing JSON file could not be parsed. A fresh file will be created.');
    }
  }

  const nowIso = new Date().toISOString();
  let firstSeen = nowIso;

  if (existingData && existingData.notification && existingData.notification.id === newest.id) {
    firstSeen = existingData.notification.firstSeen || nowIso;
    console.log('[INFO] Notification is already up to date. Updating lastChecked timestamp.');
  } else {
    console.log('[INFO] Genuinely new notification detected! Updating current notification.');
  }

  const outputPayload = {
    lastUpdated: nowIso,
    source: 'National Institute of Open Schooling (NIOS)',
    sourceUrl: 'https://www.nios.ac.in',
    notification: {
      id: newest.id,
      title: newest.title,
      category: newest.category,
      date: newest.date,
      url: newest.url,
      source: 'NIOS',
      firstSeen: firstSeen
    },
    recentArchive: uniqueItems.slice(0, 10).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      date: item.date,
      url: item.url
    }))
  };

  // Ensure content directory exists
  const outputDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(outputPayload, null, 2), 'utf8');
  console.log(`[SUCCESS] Successfully written to ${CONFIG.outputFile}`);
}

// Run scraper
if (require.main === module) {
  scrapeNios().catch(err => {
    console.error('[FATAL] Scraper terminated with error:', err);
    process.exit(1);
  });
}

module.exports = { scrapeNios, parseDate, generateId, cleanText };
