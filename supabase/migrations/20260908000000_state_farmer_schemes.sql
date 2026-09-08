-- =============================================================
-- State farmer schemes — from the state welfare schemes directory
--
-- `useSchemes()` (src/hooks/useSchemes.ts) prefers this live table over the
-- bundled catalogue in src/data/schemes.ts whenever it has rows — that is
-- what lets a scheme be corrected without a redeploy. The consequence is
-- that adding a row only to schemes.ts, as this session did first, is
-- invisible on a project where this table already has data: right now it
-- holds exactly the ten central schemes, no state ones, so this table
-- currently shows FEWER schemes than the bundled fallback would on its own.
--
-- These six rows are the same ones added to schemes.ts, sourced from
-- "India's Decentralized Welfare Architectures" (state schemes directory,
-- compiled September 2026, grounded in myScheme and official state portals).
-- That document catalogues 46 schemes across nine states; only the
-- farmer/agriculture-relevant subset is inserted here — the rest are
-- marriage grants, scholarships, disability certificates and pensions with
-- nothing to do with farming, which is what this table and page are for.
--
-- ON CONFLICT DO NOTHING: re-running this migration must not clobber a row
-- an admin has since corrected through the app.
-- =============================================================

INSERT INTO public.schemes
  (id, name, name_hi, description, description_hi, eligibility, eligibility_hi, benefits, benefits_hi, link, category, state, is_active)
VALUES
  (
    'mp-nalkoop-khanan',
    'Nalkoop Khanan Yojana',
    'नलकूप खनन योजना',
    'Tube-well and submersible pump subsidy for SC/ST farmers on unirrigated land',
    'असिंचित भूमि वाले अनुसूचित जाति/जनजाति किसानों हेतु नलकूप खनन और सबमर्सिबल पंप सब्सिडी',
    'SC and ST farmers with non-irrigated arable land in Madhya Pradesh, excluding Indore and Shajapur districts',
    'इंदौर और शाजापुर जिलों को छोड़कर मध्य प्रदेश में असिंचित कृषि भूमि वाले अनुसूचित जाति/जनजाति किसान',
    '75% subsidy up to ₹25,000 for tube-well drilling, successful or not, plus 75% up to ₹15,000 for a submersible pump',
    'नलकूप खनन (सफल हो या न हो) पर ₹25,000 तक 75% सब्सिडी, साथ ही सबमर्सिबल पंप पर ₹15,000 तक 75% सब्सिडी',
    'https://en.vikaspedia.in/viewcontent/schemesall/state-specific-schemes/welfare-schemes-of-madhya-pradesh?lgn=en',
    'irrigation',
    'Madhya Pradesh',
    true
  ),
  (
    'tn-solar-pumpset',
    'CM Solar Powered Pumpset Scheme',
    'मुख्यमंत्री सौर ऊर्जा चालित पंपसेट योजना',
    'Capital subsidy to switch irrigation pumps to off-grid solar power',
    'सिंचाई पंपों को ग्रिड की जगह सौर ऊर्जा पर लाने हेतु पूंजीगत सब्सिडी',
    'Tamil Nadu farmers installing 3HP, 5HP or 7.5HP solar pumps',
    '3, 5 या 7.5 एचपी सौर पंप लगाने वाले तमिलनाडु के किसान',
    '80% to 90% capital subsidy on solar pump installation, cutting dependence on grid power for irrigation',
    'सौर पंप स्थापना पर 80% से 90% तक पूंजीगत सब्सिडी, जिससे सिंचाई हेतु बिजली ग्रिड पर निर्भरता घटती है',
    'https://www.tnesevai.tn.gov.in',
    'irrigation',
    'Tamil Nadu',
    true
  ),
  (
    'tn-free-power-farmers',
    'Free Power for Farmers',
    'किसानों के लिए मुफ्त बिजली',
    'Free daily electricity for agricultural pumpsets used to irrigate field crops',
    'खेत की सिंचाई में प्रयुक्त कृषि पंपसेट हेतु दैनिक मुफ्त बिजली',
    'Tamil Nadu farmers with electric pumpsets up to 10HP',
    '10 एचपी तक के बिजली पंपसेट वाले तमिलनाडु के किसान',
    '9 hours of uninterrupted free electricity every day, reducing the running cost of irrigation',
    'हर दिन 9 घंटे निर्बाध मुफ्त बिजली, जिससे सिंचाई की लागत घटती है',
    'https://www.tnesevai.tn.gov.in',
    'irrigation',
    'Tamil Nadu',
    true
  ),
  (
    'tn-karnataka-research-visit',
    'Visit of Farmers to Karnataka Research Stations',
    'कर्नाटक अनुसंधान केंद्रों की किसान भ्रमण योजना',
    'Fully sponsored study tours to agricultural research stations for hands-on exposure to advanced techniques',
    'उन्नत तकनीकों का प्रत्यक्ष अनुभव देने हेतु कृषि अनुसंधान केंद्रों की पूर्ण प्रायोजित अध्ययन यात्रा',
    'Registered contract farmers residing in Tamil Nadu',
    'तमिलनाडु में रहने वाले पंजीकृत अनुबंध किसान',
    'A 3-day sponsored educational tour to advanced research stations in Karnataka to learn new farming skills',
    'नई कृषि तकनीक सीखने हेतु कर्नाटक के उन्नत अनुसंधान केंद्रों की 3-दिवसीय प्रायोजित शैक्षणिक यात्रा',
    'https://www.myscheme.gov.in/schemes/vcfrsk',
    'inputs',
    'Tamil Nadu',
    true
  ),
  (
    'rj-short-term-crop-loan',
    'Short Term Crop Loan Scheme',
    'अल्पकालीन फसल ऋण योजना',
    'Interest-free seasonal cultivation credit through cooperative agricultural banks',
    'सहकारी कृषि बैंकों के माध्यम से ब्याज-मुक्त मौसमी खेती ऋण',
    'Rajasthan farmers registered with a cooperative agricultural bank and holding a valid crop card',
    'सहकारी कृषि बैंक में पंजीकृत और वैध फसल कार्ड रखने वाले राजस्थान के किसान',
    'Interest-free crop loan, with real-time online tracking of loan status and any crop-loan waiver',
    'ब्याज-मुक्त फसल ऋण, साथ ही ऋण की स्थिति और किसी भी फसल ऋण माफी का रीयल-टाइम ऑनलाइन ट्रैकिंग',
    'https://jansoochna.rajasthan.gov.in/Services',
    'credit',
    'Rajasthan',
    true
  ),
  (
    'od-seeds-portal',
    'Odisha Seeds Portal',
    'ओडिशा बीज पोर्टल',
    'Digital portal for certified seed tracking, subsidy transfer and vendor verification',
    'प्रमाणित बीज ट्रैकिंग, सब्सिडी हस्तांतरण और विक्रेता सत्यापन हेतु डिजिटल पोर्टल',
    'Odisha farmers requiring certified seeds for cropping',
    'खेती हेतु प्रमाणित बीज चाहने वाले ओडिशा के किसान',
    'Direct seed subsidy transfer and verification of which local seed vendors are authorised',
    'सीधा बीज सब्सिडी हस्तांतरण और यह सत्यापन कि कौन-से स्थानीय बीज विक्रेता अधिकृत हैं',
    'https://odishaseedsportal.nic.in/',
    'inputs',
    'Odisha',
    true
  )
ON CONFLICT (id) DO NOTHING;
