/* codalClassify — copy of the classifier in src/petro_collector.js (letter type from its title) */
function codalClassify(t) {
  t = String(t || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    if (/افشای اطلاعات/.test(t)) { const m = t.match(/\((.*)\)\s*منتهی/); const x = m ? m[1] : t;
      if (/دیوان|دادنامه|شورای رقابت|ابطال مصوب|ماده ۹۱/.test(x)) return 'REGULATORY_COURT';
      if (/سرویس/.test(x)) return 'UTILITY_RATES';
      if (/گاز|خوراک|مواد اولیه|بهای تمام شده/.test(x)) return 'FEED_GAS_PRICE';
      if (/توقف|تعمیرات|قطع|محدودیت/.test(x)) return 'SHUTDOWN';
      if (/شروع مجدد|راه.?اندازی مجدد|آغاز فرآیند تولید|بهره.?برداری/.test(x)) return 'RESTART';
      if (/قرارداد|مزایده|مناقصه/.test(x)) return 'CONTRACT';
      if (/دعوی|دادگاه/.test(x)) return 'LEGAL';
      return 'MATERIAL_OTHER'; }
    const rules = [['MONTHLY', /گزارش فعالیت ماهانه/], ['PORTFOLIO_NAV', /صورت وضعیت پورتفوی/], ['FS_EXPLAIN', /توضیحات در خصوص اطلاعات و صورت/], ['INTERIM_FS', /میاندوره/], ['ANNUAL_FS', /^صورت.?های مالی/],
      ['AGM_DECISION', /تصمیمات مجمع عمومی عادی سالیانه/], ['AGM_NOTICE', /دعوت به مجمع عمومی عادی سالیانه/], ['DIV_SCHEDULE', /زمانبندی پرداخت سود/],
      ['CAPINC_PROPOSAL', /پیشنهاد هیئت مدیره.*افزایش سرمایه/], ['CAPINC_STEP', /افزایش سرمایه/], ['EGM', /مجمع عمومی فوق العاده/], ['RUMOR_CLARIFY', /شفاف سازی در خصوص شایعه/],
      ['BOARD_CEO_CHANGE', /هیئت مدیره.*مدیر عامل|مدیر عامل/], ['HALT', /تعلیق نماد|توقف نماد/]];
    for (const [k, rx] of rules) if (rx.test(t)) return k; return 'OTHER';
}
if (typeof window !== 'undefined') window.codalClassify = codalClassify;
