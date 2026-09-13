-- =============================================================
-- Repair six scheme "apply" links that no longer resolve.
--
-- Checked on 13 Sep 2026: four of the old URLs answer 404 and two
-- (dahd.nic.in, kalia.odisha.gov.in) no longer resolve in DNS at all. A farmer who
-- taps "Apply" and lands on a government 404 page reads the scheme itself
-- as dead, so this is an accuracy defect, not a cosmetic one. The
-- replacements are the same schemes' current official pages, each
-- verified to answer 200.
--
-- mpeuparjan.nic.in is genuinely HTTP-only — its HTTPS root answers 404 —
-- so that link is written as http:// on purpose.
--
-- `useSchemes()` prefers this table over src/data/schemes.ts whenever it
-- has rows, so the bundled file is corrected alongside for the offline
-- fallback, but this row-level update is what the live site reads.
-- =============================================================

UPDATE public.schemes SET link = 'https://dahd.gov.in/schemes/programmes/ahidf'
  WHERE id = 'ahidf' AND link = 'https://ahidf.udyamimitra.in/';

UPDATE public.schemes SET link = 'https://jansoochna.rajasthan.gov.in/'
  WHERE id = 'rj-short-term-crop-loan' AND link = 'https://jansoochna.rajasthan.gov.in/Services';

UPDATE public.schemes SET link = 'http://mpeuparjan.nic.in/'
  WHERE id = 'mp-bhavantar' AND link = 'https://mpeuparjan.nic.in/';

UPDATE public.schemes SET link = 'https://pmkusum.mnre.gov.in/landing.html'
  WHERE id = 'pm-kusum' AND link = 'https://pmkusum.mnre.gov.in/';

-- Domain no longer exists; the department moved to dahd.gov.in.
UPDATE public.schemes SET link = 'https://dahd.gov.in/schemes/programmes/rashtriya_gokul_mission'
  WHERE id = 'gokul-mission' AND link = 'https://dahd.nic.in/';

-- Domain no longer exists. Pointed at the Government of India scheme portal
-- rather than kalia.co.in, which answers but is not a government domain.
UPDATE public.schemes SET link = 'https://www.myscheme.gov.in/schemes/kalia'
  WHERE id = 'od-kalia' AND link = 'https://kalia.odisha.gov.in/';
