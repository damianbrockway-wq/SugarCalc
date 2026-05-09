try {
const { useState, useEffect } = React;

// ─── localStorage helpers ────────────────────────────────────────────────────
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

// ─── Feature Flags ───────────────────────────────────────────────────────────
const BETA_FEATURES = true; // Set to false to hide experimental features

// ─── Formatters ──────────────────────────────────────────────────────────────
const fmt  = (n, d = 1) => isNaN(n) || !isFinite(n) ? '—' : Number(n).toFixed(d);
const fmtH = h => { if (!isFinite(h) || h <= 0) return '—'; const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return `${hh}h ${mm}m`; };
const DAY  = { en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], fr:['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'] };
const MON  = { en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
               fr:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'] };

// ─── Translations ─────────────────────────────────────────────────────────────
const TR = {
  en: {
    // Header
    appSub:'MAPLE PRODUCTION TOOLS', season:'Season', today:'Today',
    // Tabs
    tabSap:'Sap', tabEvap:'Evap', tabRO:'R/O', tabFinish:'Finish',
    tabTapping:'Tapping', tabBoilPt:'Boil Pt', tabSeason:'Season',
    tabLog:'Log', tabEquip:'Equip', tabTasks:'Tasks',
    // Common buttons / labels
    save:'Save', cancel:'Cancel', add:'Add', export:'Export',
    csvExport:'CSV', pdfReport:'PDF Report', clear:'Clear',
    note:'Note', date:'Date', optional:'optional', trees:'Trees',
    units:'gal', noEntries:'No entries yet — tap + to add',
    // Sap tab
    sapTitle:'Sap Yield Calculator', sapGal:'Sap Volume',
    sapBrix:'Sap °Brix', sapRatio:'SAP:SYRUP RATIO',
    sapYield:'SYRUP YIELD', estYield:'EST. SYRUP YIELD',
    quickRef:'Quick Brix Reference',
    // Evap tab
    evapTitle:'Evaporator Setup', panSize:'Pan Size',
    customRate:'Custom Boil Rate (GPH) — optional',
    boilRate:'BOIL RATE', efficiency:'EFFICIENCY',
    boilTime:'Boil Time Estimate', sapToBoil:'Sap to Boil',
    boilTimeRes:'BOIL TIME', syrupYield:'SYRUP YIELD',
    fuelCost:'Fuel Cost', fuelType:'Fuel Type',
    costPerUnit:'Cost per', fuelNeeded:'FUEL NEEDED',
    estCost:'EST. COST', batchLog:'Boil Batch Log',
    addBatch:'+ Add Batch', sapIn:'Sap In', syrupOut:'Syrup Out',
    notes:'Notes', noBatches:'No batches logged yet.',
    trueCost:'True Cost Per Gallon', labour:'LABOUR',
    supplies:'SUPPLIES', total:'TOTAL', fuel:'FUEL',
    hoursThisSeason:'Hours this season', dollarsPerHr:'$/hr',
    spoutsLabel:'Spouts / Taps ($)', bottlesLabel:'Bottles / Containers ($)',
    filtersLabel:'Filters / DE ($)', otherLabel:'Other Costs ($)',
    costPerGal:'COST PER GAL OF SYRUP',
    // Retail pricing
    retailTitle:'Retail Pricing Calculator',
    retailDesc:'Set your target margin and see suggested retail prices per grade and bottle size.',
    marginLabel:'Target Profit Margin (%)',
    yourCostPerGal:'Your Cost / Gallon',
    orEnterManual:'or enter manually',
    retailPrices:'SUGGESTED RETAIL PRICES',
    bottleSize:'Bottle', costPerBottle:'Cost', retail:'Retail', profit:'Profit',
    usdaBenchmark:'USDA Benchmark (bulk)',
    // Finish tab
    finishTitle:'Finishing Temperature', waterBP:'Water Boiling Point Today (°F)',
    sharedWithBoil:'Shared with Boil Point tab', finishAt:'FINISH SYRUP AT',
    densityCheck:'Density Check', syrupBrix:'Syrup °Brix',
    syrupTemp:'Syrup Temp (°F)', tempCorrection:'Temp Correction',
    correctedBrix:'Corrected Brix', legalRange:'Legal range: 66.0° – 68.9° Brix',
    perfectDensity:'✓ Perfect Density', tooLight:'⚠ Too Light', tooDense:'⚠ Too Dense',
    filterPress:'Filter Press — DE Calculator',
    gradeTitle:'Syrup Grades & Reference',
    // Tapping tab
    tappingTitle:'Tree Tap Calculator', numTrees:'Number of Trees',
    avgDBH:'Avg Trunk Diameter (in)', dbhNote:'Measured at chest height (DBH)',
    vacSystem:'Vacuum System?', perTree:'PER TREE', totalTaps:'TOTAL TAPS',
    estSapSeason:'EST. SAP / SEASON', estSyrupYield:'EST. SYRUP YIELD',
    sizeGuide:'Minimum Size Guide', spoutBit:'Spout & Bit Size',
    spoutType:'Spout Type', drillBit:'DRILL BIT SIZE', tapDepth:'TAP DEPTH',
    drillingPractices:'Drilling Best Practices',
    treeNotes:'Tree Health Notes', noteRecorded:'note recorded', notesRecorded:'notes recorded',
    addNote:'Add Note', treeId:'Tree ID / Name', treeIdPh:'e.g. #12, Big Oak...',
    observation:'Observation / Tag', customNote:'Custom note...',
    noTreeNotes:'No tree notes yet.',
    // Tap Rotation
    tapRotTitle:'Tap Rotation Tracker',
    tapRotDesc:'Record which side of each tree was tapped each year to avoid re-drilling old wounds.',
    treeIdRot:'Tree ID', side:'Side Tapped', year:'Year',
    north:'N', south:'S', east:'E', west:'W',
    addRotEntry:'Add Entry', noRotEntries:'No rotation records yet.',
    rotDue:'Due side next year',
    // Boil pt
    boilPtTitle:'Boil Point Calculator',
    // Season tab
    ddTitle:'Degree Day Tracker', brixTitle:'Sap Brix Trend',
    ddDesc:'Tracks heat units above 40°F since tapping day.',
    brixDesc:'Log daily brix readings to track sugar content. A drop signals season end or buddy sap.',
    useGPS:'Use My Location (GPS)', changeLocation:'Change',
    startDate:'Season Start Date (tapping day)',
    totalDD:'TOTAL DD', days:'DAYS', avgDay:'AVG/DAY',
    sinceTapDay:'since tap day', inSeason:'in season', ddPerDay:'DD/day',
    dailyBreakdown:'Daily breakdown', buddyTitle:'Possible Buddy Sap',
    peakBrix:'PEAK BRIX', latestBrix:'LATEST',
    // Log tab
    logTitle:'SEASON OVERVIEW', seasonGoal:'SEASON GOAL',
    benchmark:'Benchmark', sapCollected:'Sap Collected',
    syrupMade:'Syrup Made', sapRO:'Sap Thru R/O', sapEvap:'Sap in Evaporator',
    clearSeason:'Clear all season data', seasonForecast:'Season Forecast',
    seasonComparison:'Season Comparison', noSeasonData:'No season data yet.',
    // Run alerts
    runAlertTitle:'🔔 Enable Run Alerts',
    runAlertDesc:'Get a notification when ideal sap run conditions are forecast',
    enable:'Enable',
    // SapTab
    rule86Title:'Rule of 86', rule86Sub:'Sap-to-syrup conversion',
    sapSugarContent:'Sap Sugar Content (°Brix)', sharedAllTabs:'Shared across all calculator tabs',
    perTreeLabel:'Per tree', sapSyrup:'syrup', sapSap:'sap',
    // EvapTab
    fuelFromAbove:'FUEL (from above)', saveBatch:'Save Batch',
    noBatchesLong:'No batches logged yet. Tap + to start.',
    forOf:'of sap',
    // ROTab
    roConcentration:'R/O Concentration', inputSap:'Input Sap',
    targetBrix:'Target °Brix (Concentrate)',
    concentrate:'CONCENTRATE', permeate:'PERMEATE', waterRemoved:'Water Removed',
    concFactor:'concentration', pctWater:'water removed',
    roSavings:'R/O Savings', boilTimeSaved:'BOIL TIME SAVED', fuelSaved:'FUEL SAVED',
    multiPass:'Multi-Pass Reference', startingBrix:'Starting at',
    singlePass:'Single Pass', doublePass:'Double Pass', triplePass:'Triple Pass',
    maxPractical:'Max practical: ~20° Brix',
    roGuidelinesTitle:'R/O Guidelines',
    roTip1:'Ideal operating temp: 40–50°F (4–10°C)',
    roTip2:'Typical operating pressure: 150–250 PSI',
    roTip3:'Rinse membranes with clean water after each use',
    roTip4:'Max concentrate before niter issues: ~12–15° Brix',
    roTip5:'Store membranes in food-safe preservative solution',
    // FinishTab
    altitude:'Altitude (ft)', pressure:'Barometric Pressure (inHg)',
    cityZip:'City / Zip Code', getBoilPt:'Get Boil Point',
    orUseGPS:'or Use GPS', plateSetup:'PLATE SETUP',
    numPlates:'Number of Plates', plateSize:'Plate Size',
    syrupVolOpt:'SYRUP VOLUME (OPTIONAL)',
    galsToFilter:'Gallons to Filter', deNeeded:'DE NEEDED',
    perPlate:'Per plate', perGallon:'Per gallon of syrup',
    gradeA:'USDA GRADE A — 4 CLASSES',
    legalMin:'Legal Min', legalMax:'Legal Max', weight:'Weight',
    // TappingTab
    treeCalc:'Tree Tap Calculator', gravBuckets:'Gravity / Buckets',
    lowVac:'Low Vacuum (< 15")', highVac:'High Vacuum (15"+)',
    tapLabel:'tap', tapsLabel:'taps', perTap:'per tap',
    doNotTap:'Do not tap', tooSmall:'Too small', marginal:'Marginal',
    standard:'Standard', goodProducer:'Good producer', highProducer:'High producer',
    saveNote:'Save Note',
    goodProd:'Good Producer', lowOutput:'Low Output', sapWatery:'Sap Watery',
    woundScar:'Wound / Scar', skipYear:'Skip This Year', topProd:'Top Producer',
    noId:'(no ID)',
    // BoilPt tab
    boilPtAltDesc:'Higher altitude = lower boiling point',
    useMyLoc:'Use My Location',
    // Season tab
    addBrixReading:'Add Brix Reading', brixValue:'°Brix Value',
    sapDropWarning:'A drop in brix signals season end or buddy sap.',
    // Log tab
    clearConfirm:'This will erase ALL season data. Are you sure?',
    vsLastYear:'vs last year',
    // BoilPtTab
    findBoilPt:'Find My Boiling Point', waterBoilsAt:'WATER BOILS AT',
    manualEntry:'Manual Entry', altRef:'Altitude Reference',
    proTips:'Pro Tips', finishAt2:'Finish syrup at', waterBoilsAt2:'Water boils at',
    // LogTab
    collectedSoFar:'Collected so far', progressToGoal:'Progress to goal',
    projectedYield:'Projected yield',
    // SeasonTab  
    loadingWeather:'Loading weather history…',
    // EquipTab
    addEquipItem:'Add Equipment Item', newItem:'New Item',
    noEquipYet:'No equipment tracked yet', equipDesc:'Add taps, tubing, containers, and more',
    condGood:'Good', condFair:'Fair', condPoor:'Poor',
    // TasksTab
    seasonChecklists:'Season Checklists', preSeason:'Pre-Season', postSeason:'Post-Season',
    addCustomTask:'+ Add custom task',
    // General
    finishAt:'FINISH SYRUP AT',
    // Translation audit additions
    sapToSyrup:'SAP TO SYRUP', jonesRule:'JONES RULE (87)',
    syrupYieldCard:'Syrup Yield', syrupYieldSub:'How much syrup from your sap',
    sapFieldLabel:'Sap',
    forSap:'For', ofSap:'of sap',
    ftTitle:'FREEZE / THAW', ftOr:'or',
    badgeIdeal:'Ideal Run', badgeFreezeThaw:'Freeze/Thaw',
    badgeTooWarm:'Too Warm', badgeAllFreeze:'All Freeze',
    ftWarmStretch:'\u26A0 Warm stretch',
    ftLegend:'\u2713 Ideal: hi \u2265 40\u00b0F & lo \u2264 28\u00b0F \u00b7 Freeze/Thaw: crossing 32\u00b0F',
    taskOf:'of', taskDone:'complete',
    gradeGolden:'Golden Delicate', gradeAmber:'Amber Rich',
    gradeDark:'Dark Robust', gradeVeryDark:'Very Dark Strong',
    equipNamePh:'Name (e.g. Evaporator, R/O Machine\u2026)',
    equipBrandPh:'Brand / Model', equipQtyPh:'Qty',
    equipYearPh:'Year purchased', equipQtyLabel:'Qty:',
    wxSetLoc:'SET YOUR LOCATION', wxUseGPS:'Use My Location (GPS)',
    wxOr:'\u2014 or \u2014', wxCityPh:'City or zip (e.g. 05401, Burlington VT)',
    wxChange:'Change', wxLoadingForecast:'Loading forecast\u2026',
    wxSapForecast:'SAP RUN FORECAST \u2014 SCORE 0\u201399',
    wxScoringFactors:'SCORING FACTORS',
    wxNightFreeze:'Night Freeze', wxDayThaw:'Day Thaw',
    wxDtSwing:'\u0394T Swing', wxWind:'Wind', wxPrecip:'Precip', wxSunshine:'Sunshine',
    wxIdealRange:'Ideal range', wxVeryCold:'Very cold', wxLightFreeze:'Light freeze',
    wxNoFreeze:'No freeze', wxBuddyRunRisk:'Buddy run risk',
    wxMarginalThaw:'Marginal thaw', wxNoThaw:'No thaw',
    wxExcellent:'Excellent', wxGood:'Good', wxLimited:'Limited',
    wxCalm:'Calm', wxLightWind:'Light', wxReducesFlow:'Reduces flow',
    wxClearSky:'Clear', wxLightRain:'Light rain', wxHeavyRain:'Heavy (dilutes sap)',
    wxSunny:'Sunny', wxPartlySunny:'Partly sunny', wxOvercast:'Overcast',
    wxBuddyRiskBadge:'\u26A0 Buddy Risk',
    wxNoRunDays:'No good run days this week',
    wxNoRunDaysHint:'Check back as the forecast updates daily',
    wxEmptyTitle:'Set your location to see the forecast',
    // TappingTab
    tapCalcTitle:'Tree Tap Calculator', numTrees:'Number of Trees',
    avgTrunkDiam:'Avg Trunk Diameter (in)', dbhHint:'Measure at chest height (DBH)',
    vacSystemQ:'Vacuum System?', spoutType:'Spout Type',
    drillingBP:'Drilling Best Practices', noTreeNotesYet:'No tree notes yet.',
    treeIdName:'Tree ID / Name', obsTag:'Observation / Tag',
    estSapSeason:'EST. SAP/SEASON', perTapUnit:'~10 {u}/tap',
    atRatioLbl:'at {n}:1 ratio', tapSingular:'tap', tapPlural:'taps',
    minTreeGuide:'Minimum Tree Size Guide', treesUnit:'trees',
    doNotTap:'Do not tap', tapMarginal:'Marginal', tapStandard:'Standard',
    tapGoodProd:'Good producer', tapHighProd:'High producer',
    drillTip1:'Drill at a slight upward angle (5°) for gravity drainage',
    drillTip2:'Depth: 1.5–2.5 inches into sapwood (not heartwood)',
    drillTip3:'Place taps 6+ inches from prior year holes',
    drillTip4:'Horizontal spacing: at least 4 inches apart',
    drillTip5:'Vertical spacing: at least 6 inches above/below old holes',
    drillTip6:'Best tapped when temps freeze at night, thaw during day',
    sizeSmall:'< 10\"', sizeMarginal:'10\"–11.9\"', sizeStandard:'12\"–17.9\"',
    sizeGood:'18\"–24.9\"', sizeHigh:'25\"+',
    // RecapTab
    recapSub:'Your maple operation at a glance', exportPDF:'Export PDF',
    operatorPh:'Operation / sugarmaker name (optional)',
    noDataMsgRecap:'No {year} log data yet. Add sap and syrup entries in the Log tab — this page will fill in automatically.',
    totalSapLbl:'Total Sap', syrupMadeLbl:'Syrup Made',
    collectionSing:'collection', collectionPlur:'collections',
    batchSing:'batch', batchPlur:'batches',
    actualRatioLbl:'Actual Ratio', theoryPrefix:'Theory:',
    seasonLengthLbl:'Season Length', bestRunLbl:'Best Run',
    rodLbl:"RO'd", avgBrixLbl:'Avg Brix', estimatedLbl:'estimated',
    sapCollByRun:'Sap Collections by Run',
    peakRunNote:'Each bar = one collection. Peak run highlighted in teal.',
    sapBrixTrend:'Sap Brix Trend', lowLbl:'Low', avgLbl:'Avg', highLbl:'High',
    vsLastSeason:'vs. {year} Season', sapCollectedLbl:'Sap collected',
    syrupProducedLbl:'Syrup produced', convEfficiency:'Conversion Efficiency',
    actualRatioShort:'Actual ratio', rule86Lbl:'Rule of 86', vsTheoretical:'vs. theoretical',
    highRatioNote:'Your ratio is {n}% above theoretical — check for foam loss, evaporator leaks, or thin drawoff.',
    roSavingsVsBoil:'RO Savings vs. Straight-Boil',
    adjustInputs:'Adjust inputs', hideInputs:'Hide inputs',
    evapRateInput:'Evap rate (gal/hr)', woodBurnInput:'Wood burn (lbs/hr)',
    roBrixInput:'RO output (°Brix)', preheaterLbl:'Preheater',
    boilTimeLbl:'BOIL TIME', woodUsedLbl:'WOOD USED',
    straightBoilLbl:'Straight-boil', withROLbl:'With RO', withROPreLbl:'With RO + preheater',
    roConcentratedNote:'{ro} gal through RO → {conc} gal concentrated',
    noRODataNote:'No RO data in log',
    savedBoilingLbl:'saved boiling', woodSavedLbl:'wood saved', cordsSavedLbl:'cords saved',
    logRONote:'Log your R\/O sap entries to see actual savings vs. straight-boil.',
    byCollPoint:'By Collection Point', runsLbl:'runs', ratioLbl:'ratio',
    sapShort:'sap', syrupShort:'syrup', untaggedLbl:'Untagged / shared',
    wxCollPoints:'Suggested Collection Points',
    qualExcellent:'Excellent', qualGood:'Good', qualFair:'Fair', qualPoor:'Poor', qualNoFlow:'No Flow',
    scoreLeg80:'80+ Excellent', scoreLeg62:'62+ Good', scoreLeg44:'44+ Fair', scoreLegNo:'No Flow',
      },
  fr: {
    // Header
    appSub:'OUTILS DE PRODUCTION ACÉRICOLE', season:'Saison', today:'Aujourd\'hui',
    // Tabs
    tabSap:'Sève', tabEvap:'Évap', tabRO:'O/I', tabFinish:'Finition',
    tabTapping:'Entaillage', tabBoilPt:'Pt Éb.', tabSeason:'Saison',
    tabLog:'Journal', tabEquip:'Équip.', tabTasks:'Tâches',
    // Common
    save:'Enregistrer', cancel:'Annuler', add:'Ajouter', export:'Exporter',
    csvExport:'CSV', pdfReport:'Rapport PDF', clear:'Effacer',
    note:'Note', date:'Date', optional:'optionnel', trees:'Arbres',
    units:'gal', noEntries:'Aucune entrée — appuyez sur + pour ajouter',
    // Sap tab
    sapTitle:'Calculateur de rendement', sapGal:'Volume de sève',
    sapBrix:'°Brix de la sève', sapRatio:'RATIO SÈVE:SIROP',
    sapYield:'RENDEMENT EN SIROP', estYield:'RENDEMENT EST.',
    quickRef:'Référence Brix rapide',
    // Evap tab
    evapTitle:'Configuration de l\'évaporateur', panSize:'Taille de la bassine',
    customRate:'Taux d\'ébullition personnalisé (GPH) — optionnel',
    boilRate:'TAUX D\'ÉBULL.', efficiency:'EFFICACITÉ',
    boilTime:'Estimation du temps d\'ébullition', sapToBoil:'Sève à bouillir',
    boilTimeRes:'TEMPS D\'ÉBULL.', syrupYield:'RENDEMENT',
    fuelCost:'Coût du combustible', fuelType:'Type de combustible',
    costPerUnit:'Coût par', fuelNeeded:'COMBUSTIBLE REQUIS',
    estCost:'COÛT EST.', batchLog:'Journal des bouillées',
    addBatch:'+ Ajouter une bouillée', sapIn:'Sève entrée', syrupOut:'Sirop produit',
    notes:'Notes', noBatches:'Aucune bouillée enregistrée.',
    trueCost:'Coût réel par gallon', labour:'MAIN-D\'ŒUVRE',
    supplies:'FOURNITURES', total:'TOTAL', fuel:'COMBUSTIBLE',
    hoursThisSeason:'Heures cette saison', dollarsPerHr:'$/h',
    spoutsLabel:'Chalumeaux / entailles ($)', bottlesLabel:'Bouteilles / contenants ($)',
    filtersLabel:'Filtres / DE ($)', otherLabel:'Autres coûts ($)',
    costPerGal:'COÛT PAR GAL DE SIROP',
    // Retail pricing
    retailTitle:'Calculateur de prix de détail',
    retailDesc:'Fixez votre marge cible et consultez les prix de détail suggérés par grade et format.',
    marginLabel:'Marge bénéficiaire cible (%)',
    yourCostPerGal:'Votre coût / gallon',
    orEnterManual:'ou entrez manuellement',
    retailPrices:'PRIX DE DÉTAIL SUGGÉRÉS',
    bottleSize:'Format', costPerBottle:'Coût', retail:'Détail', profit:'Profit',
    usdaBenchmark:'Prix de référence (en vrac)',
    // Finish tab
    finishTitle:'Température de finition', waterBP:'Point d\'ébullition de l\'eau (°F)',
    sharedWithBoil:'Partagé avec l\'onglet Pt Éb.', finishAt:'FINIR LE SIROP À',
    densityCheck:'Vérification de la densité', syrupBrix:'°Brix du sirop',
    syrupTemp:'Temp. du sirop (°F)', tempCorrection:'Correction de température',
    correctedBrix:'Brix corrigé', legalRange:'Plage légale : 66,0° – 68,9° Brix',
    perfectDensity:'✓ Densité parfaite', tooLight:'⚠ Trop léger', tooDense:'⚠ Trop dense',
    filterPress:'Presse-filtre — Calculateur DE',
    gradeTitle:'Grades et référence',
    // Tapping tab
    tappingTitle:'Calculateur d\'entaillage', numTrees:'Nombre d\'arbres',
    avgDBH:'Diamètre moyen du tronc (po)', dbhNote:'Mesuré à hauteur de poitrine (DHP)',
    vacSystem:'Système sous vide ?', perTree:'PAR ARBRE', totalTaps:'ENTAILLES TOTALES',
    estSapSeason:'SÈVE EST./SAISON', estSyrupYield:'RENDEMENT EST.',
    sizeGuide:'Guide de taille minimale', spoutBit:'Chalumeau et mèche',
    spoutType:'Type de chalumeau', drillBit:'TAILLE DE MÈCHE', tapDepth:'PROFONDEUR',
    drillingPractices:'Bonnes pratiques de forage',
    treeNotes:'Notes sur la santé des arbres',
    noteRecorded:'note enregistrée', notesRecorded:'notes enregistrées',
    addNote:'Ajouter une note', treeId:'ID / nom de l\'arbre', treeIdPh:'ex. #12, Grand érable...',
    observation:'Observation / étiquette', customNote:'Note personnalisée...',
    noTreeNotes:'Aucune note d\'arbre encore.',
    // Tap Rotation
    tapRotTitle:'Registre de rotation des entailles',
    tapRotDesc:'Notez de quel côté de chaque arbre vous avez entaillé chaque année pour éviter de repercer d\'anciennes blessures.',
    treeIdRot:'ID de l\'arbre', side:'Côté entaillé', year:'Année',
    north:'N', south:'S', east:'E', west:'O',
    addRotEntry:'Ajouter', noRotEntries:'Aucun enregistrement de rotation.',
    rotDue:'Côté suggéré l\'an prochain',
    // Boil pt
    boilPtTitle:'Calculateur du point d\'ébullition',
    // Season tab
    ddTitle:'Suivi des degrés-jours', brixTitle:'Tendance du °Brix de la sève',
    ddDesc:'Suit les unités de chaleur au-dessus de 40°F depuis le jour de l\'entaillage.',
    brixDesc:'Enregistrez les lectures quotidiennes de Brix. Une baisse signale la fin de saison ou la sève de dégel.',
    useGPS:'Utiliser ma position (GPS)', changeLocation:'Modifier',
    startDate:'Date de début de saison (jour d\'entaillage)',
    totalDD:'DJ TOTAL', days:'JOURS', avgDay:'MOY/JOUR',
    sinceTapDay:'depuis le jour d\'entaillage', inSeason:'en saison', ddPerDay:'DJ/jour',
    dailyBreakdown:'Détail quotidien', buddyTitle:'Possible sève de dégel',
    peakBrix:'BRIX MAX', latestBrix:'DERNIER',
    // Log tab
    logTitle:'APERÇU DE LA SAISON', seasonGoal:'OBJECTIF DE SAISON',
    benchmark:'Référence', sapCollected:'Sève récoltée',
    syrupMade:'Sirop produit', sapRO:'Sève par O/I', sapEvap:'Sève à l\'évaporateur',
    clearSeason:'Effacer toutes les données de la saison',
    seasonForecast:'Prévision de saison', seasonComparison:'Comparaison des saisons',
    noSeasonData:'Aucune donnée de saison.',
    // Run alerts
    runAlertTitle:'🔔 Activer les alertes de coulée',
    runAlertDesc:'Recevez une notification quand des conditions idéales de coulée sont prévues',
    enable:'Activer',
    // SapTab
    rule86Title:'Règle de 86', rule86Sub:'Conversion sève-sirop',
    sapSugarContent:'Teneur en sucre (°Brix)', sharedAllTabs:'Partagé entre tous les onglets',
    perTreeLabel:'Par arbre', sapSyrup:'sirop', sapSap:'sève',
    // EvapTab
    fuelFromAbove:'COMBUSTIBLE (ci-dessus)', saveBatch:'Enregistrer',
    noBatchesLong:'Aucune bouillée. Appuyez sur + pour commencer.',
    forOf:'de sève',
    // ROTab
    roConcentration:'Concentration O/I', inputSap:'Sève entrante',
    targetBrix:'°Brix cible (concentré)',
    concentrate:'CONCENTRÉ', permeate:'PERMÉAT', waterRemoved:'Eau retirée',
    concFactor:'concentration', pctWater:'eau retirée',
    roSavings:'Économies O/I', boilTimeSaved:'TEMPS D\'ÉBULL. ÉCONOMISÉ', fuelSaved:'COMBUSTIBLE ÉCONOMISÉ',
    multiPass:'Référence multipassage', startingBrix:'Départ à',
    singlePass:'Passage simple', doublePass:'Double passage', triplePass:'Triple passage',
    maxPractical:'Max pratique : ~20° Brix',
    roGuidelinesTitle:'Directives O/I',
    roTip1:'Temp. de fonctionnement idéale : 4–10°C (40–50°F)',
    roTip2:'Pression de fonctionnement typique : 150–250 PSI',
    roTip3:'Rincer les membranes à l\'eau propre après chaque utilisation',
    roTip4:'Concentré max avant problèmes de niter : ~12–15° Brix',
    roTip5:'Conserver les membranes dans une solution de préservation alimentaire',
    // FinishTab
    altitude:'Altitude (pi)', pressure:'Pression atm. (po Hg)',
    cityZip:'Ville / Code postal', getBoilPt:'Obtenir point d\'ébullition',
    orUseGPS:'ou utiliser GPS', plateSetup:'CONFIG. PLAQUES',
    numPlates:'Nombre de plaques', plateSize:'Taille de plaque',
    syrupVolOpt:'VOLUME DE SIROP (OPTIONNEL)',
    galsToFilter:'Gallons à filtrer', deNeeded:'DE REQUIS',
    perPlate:'Par plaque', perGallon:'Par gallon de sirop',
    gradeA:'GRADE A USDA — 4 CLASSES',
    legalMin:'Min légal', legalMax:'Max légal', weight:'Poids',
    // TappingTab
    treeCalc:'Calculateur d\'entaillage', gravBuckets:'Gravité / Chaudières',
    lowVac:'Vide faible (< 15")', highVac:'Vide élevé (15"+)',
    tapLabel:'entaille', tapsLabel:'entailles', perTap:'par entaille',
    doNotTap:'Ne pas entailler', tooSmall:'Trop petit', marginal:'Marginal',
    standard:'Standard', goodProducer:'Bon producteur', highProducer:'Gros producteur',
    saveNote:'Enregistrer la note',
    goodProd:'Bon producteur', lowOutput:'Faible rendement', sapWatery:'Sève aqueuse',
    woundScar:'Blessure / Cicatrice', skipYear:'Sauter cette année', topProd:'Meilleur producteur',
    noId:'(sans ID)',
    // BoilPt tab
    boilPtAltDesc:'Altitude élevée = point d\'ébullition plus bas',
    useMyLoc:'Ma position',
    // Season tab
    addBrixReading:'Ajouter lecture Brix', brixValue:'Valeur °Brix',
    sapDropWarning:'Une baisse de brix signale la fin de saison ou sève de dégel.',
    // Log tab
    clearConfirm:'Cela effacera TOUTES les données de la saison. Êtes-vous sûr?',
    vsLastYear:'vs l\'an dernier',
    // BoilPtTab
    findBoilPt:'Trouver mon point d\'ébullition', waterBoilsAt:'L\'EAU BOUT À',
    manualEntry:'Saisie manuelle', altRef:'Référence d\'altitude',
    proTips:'Conseils pro', finishAt2:'Finir le sirop à', waterBoilsAt2:'L\'eau bout à',
    // LogTab
    collectedSoFar:'Récolté jusqu\'ici', progressToGoal:'Progression vers l\'objectif',
    projectedYield:'Rendement projeté',
    // SeasonTab  
    loadingWeather:'Chargement de l\'historique météo…',
    // EquipTab
    addEquipItem:'Ajouter un équipement', newItem:'Nouvel article',
    noEquipYet:'Aucun équipement suivi', equipDesc:'Ajoutez des chalumeaux, tuyaux, contenants, etc.',
    condGood:'Bon', condFair:'Passable', condPoor:'Mauvais',
    // TasksTab
    seasonChecklists:'Listes de contrôle', preSeason:'Pré-saison', postSeason:'Post-saison',
    addCustomTask:'+ Ajouter une tâche',
    // General
    finishAt:'FINIR LE SIROP À',
    // Translation audit additions
    sapToSyrup:'SÈVE EN SIROP', jonesRule:'RÈGLE DE JONES (87)',
    syrupYieldCard:'Rendement en sirop', syrupYieldSub:'Rendement à partir de votre sève',
    sapFieldLabel:'Sève',
    forSap:'Pour', ofSap:'de sève',
    ftTitle:'GEL / DÉGEL', ftOr:'ou',
    badgeIdeal:'Coulée idéale', badgeFreezeThaw:'Gel/Dégel',
    badgeTooWarm:'Trop chaud', badgeAllFreeze:'Gel total',
    ftWarmStretch:'\u26A0 Période chaude',
    ftLegend:'\u2713 Idéal : max \u2265 40\u00b0F et min \u2264 28\u00b0F \u00b7 Gel/Dégel : croise 32\u00b0F',
    taskOf:'sur', taskDone:'complété',
    gradeGolden:'Doré délicat', gradeAmber:'Ambré riche',
    gradeDark:'Foncé robuste', gradeVeryDark:'Très foncé fort',
    equipNamePh:'Nom (p. ex. Évaporateur, machine O/I\u2026)',
    equipBrandPh:'Marque / Modèle', equipQtyPh:'Qté',
    equipYearPh:'Année d\'achat', equipQtyLabel:'Qté :',
    wxSetLoc:'DÉFINIR MON EMPLACEMENT', wxUseGPS:'Utiliser ma position (GPS)',
    wxOr:'\u2014 ou \u2014', wxCityPh:'Ville ou code postal (p. ex. 05401)',
    wxChange:'Modifier', wxLoadingForecast:'Chargement des prévisions\u2026',
    wxSapForecast:'PRÉVISION DE COULÉE \u2014 SCORE 0\u201399',
    wxScoringFactors:'FACTEURS',
    wxNightFreeze:'Gel nocturne', wxDayThaw:'Dégel diurne',
    wxDtSwing:'Amplitude \u0394T', wxWind:'Vent', wxPrecip:'Précip.', wxSunshine:'Ensoleillement',
    wxIdealRange:'Plage idéale', wxVeryCold:'Très froid', wxLightFreeze:'Gel léger',
    wxNoFreeze:'Pas de gel', wxBuddyRunRisk:'Risque sève dégel',
    wxMarginalThaw:'Dégel marginal', wxNoThaw:'Pas de dégel',
    wxExcellent:'Excellent', wxGood:'Bon', wxLimited:'Limité',
    wxCalm:'Calme', wxLightWind:'Léger', wxReducesFlow:'Réduit la coulée',
    wxClearSky:'Dégagé', wxLightRain:'Pluie légère', wxHeavyRain:'Forte (dilue la sève)',
    wxSunny:'Ensoleillé', wxPartlySunny:'Partiellement ensoleillé', wxOvercast:'Nuageux',
    wxBuddyRiskBadge:'\u26A0 Risque sève',
    wxNoRunDays:'Pas de bonne coulée cette semaine',
    wxNoRunDaysHint:'Revenez vérifier — les prévisions se mettent à jour chaque jour',
    wxEmptyTitle:'Définissez votre emplacement pour voir les prévisions',
    // TappingTab
    tapCalcTitle:'Calculateur d\'entaillage', numTrees:'Nombre d\'arbres',
    avgTrunkDiam:'Diamètre moyen du tronc (po)', dbhHint:'Mesurer à hauteur de poitrine (DHP)',
    vacSystemQ:'Système de vide ?', spoutType:'Type de chalumeau',
    drillingBP:'Meilleures pratiques de perçage', noTreeNotesYet:'Aucune note d\'arbre pour l\'instant.',
    treeIdName:'ID / Nom de l\'arbre', obsTag:'Observation / Étiquette',
    estSapSeason:'SÈV. EST./SAISON', perTapUnit:'~10 {u}/entaille',
    atRatioLbl:'à ratio {n}:1', tapSingular:'entaille', tapPlural:'entailles',
    minTreeGuide:'Guide de taille minimale des arbres', treesUnit:'arbres',
    doNotTap:'Ne pas entailler', tapMarginal:'Marginal', tapStandard:'Standard',
    tapGoodProd:'Bon producteur', tapHighProd:'Grand producteur',
    drillTip1:'Percer à un léger angle vers le haut (5°) pour le drainage par gravité',
    drillTip2:'Profondeur : 3,8–6,4 cm dans l\'aubier (pas le duramen)',
    drillTip3:'Placer les entailles à 15+ cm des trous de l\'année précédente',
    drillTip4:'Espacement horizontal : au moins 10 cm',
    drillTip5:'Espacement vertical : au moins 15 cm au-dessus/en dessous des anciens trous',
    drillTip6:'Mieux entailler quand les températures gèlent la nuit et dégèlent le jour',
    sizeSmall:'< 25 cm', sizeMarginal:'25–30 cm', sizeStandard:'30–45 cm',
    sizeGood:'45–63 cm', sizeHigh:'63+ cm',
    // RecapTab
    recapSub:'Votre opération acéricole en un coup d\'œil', exportPDF:'Exporter PDF',
    operatorPh:'Nom de l\'opération / acériculteur (optionnel)',
    noDataMsgRecap:'Aucune donnée pour la saison {year}. Ajoutez des entrées de sève et de sirop dans l\'onglet Journal.',
    totalSapLbl:'Sève totale', syrupMadeLbl:'Sirop produit',
    collectionSing:'collecte', collectionPlur:'collectes',
    batchSing:'bouillée', batchPlur:'bouillées',
    actualRatioLbl:'Ratio réel', theoryPrefix:'Théorie :',
    seasonLengthLbl:'Durée saison', bestRunLbl:'Meilleure coulée',
    rodLbl:'Osmosé', avgBrixLbl:'°Brix moy.', estimatedLbl:'estimé',
    sapCollByRun:'Collectes de sève par coulée',
    peakRunNote:'Chaque barre = une collecte. Pic de coulée en turquoise.',
    sapBrixTrend:'Tendance °Brix de la sève', lowLbl:'Min', avgLbl:'Moy.', highLbl:'Max',
    vsLastSeason:'vs. saison {year}', sapCollectedLbl:'Sève collectée',
    syrupProducedLbl:'Sirop produit', convEfficiency:'Efficacité de conversion',
    actualRatioShort:'Ratio réel', rule86Lbl:'Règle de 86', vsTheoretical:'vs. théorique',
    highRatioNote:'Votre ratio est {n}% au-dessus du théorique — vérifiez les pertes par mousse, fuites d\'évaporateur ou tirage trop léger.',
    roSavingsVsBoil:'Économies O/I vs. bouillée directe',
    adjustInputs:'Ajuster les entrées', hideInputs:'Masquer les entrées',
    evapRateInput:'Taux d\'évap. (gal/h)', woodBurnInput:'Consommation bois (lbs/h)',
    roBrixInput:'Sortie O/I (°Brix)', preheaterLbl:'Préchauffeur',
    boilTimeLbl:'TEMPS D\'ÉBULLITION', woodUsedLbl:'BOIS UTILISÉ',
    straightBoilLbl:'Bouillée directe', withROLbl:'Avec O/I', withROPreLbl:'Avec O/I + préchauffeur',
    roConcentratedNote:'{ro} gal par O/I → {conc} gal concentré',
    noRODataNote:'Aucune donnée O/I dans le journal',
    savedBoilingLbl:'économisé à l\'ébullition', woodSavedLbl:'bois économisé', cordsSavedLbl:'cordes économisées',
    logRONote:'Enregistrez vos entrées O/I pour voir les économies réelles vs. bouillée directe.',
    byCollPoint:'Par point de collecte', runsLbl:'coulées', ratioLbl:'ratio',
    sapShort:'sève', syrupShort:'sirop', untaggedLbl:'Non étiqueté / partagé',
    wxCollPoints:'Points de collecte suggérés',
    qualExcellent:'Excellent', qualGood:'Bon', qualFair:'Passable', qualPoor:'Faible', qualNoFlow:'Pas de coulée',
    scoreLeg80:'80+ Excellent', scoreLeg62:'62+ Bon', scoreLeg44:'44+ Passable', scoreLegNo:'Pas de coulée',
      }
};
const t = (lang, key) => TR[lang]?.[key] ?? TR.en[key] ?? key;

// ─── SVG Icon Library ────────────────────────────────────────────────────────
function Svg({ size = 20, color = 'currentColor', sw = 2, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const I = {
  // Navigation
  droplet:     (p) => <Svg {...p}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></Svg>,
  flame:       (p) => <Svg {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Svg>,
  filter:      (p) => <Svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Svg>,
  thermometer: (p) => <Svg {...p}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></Svg>,
  leaf:        (p) => <Svg {...p}><path d="M2 22c1.25-1 2.27-1.97 3.9-2.44a5.56 5.56 0 0 1 3.8 0c1.05.36 1.95.85 2.9 1.44"/><path d="M3.34 15A10 10 0 0 1 19.5 8.3C21.24 9.48 22 11.17 22 12.5c0 1.33-1 3.13-2 3.5H5.34"/><path d="M21.5 8c-2.5 7-11.5 11-16 11"/></Svg>,
  mapPin:      (p) => <Svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>,
  package:     (p) => <Svg {...p}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></Svg>,
  wrench:      (p) => <Svg {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Svg>,
  clipboard:   (p) => <Svg {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></Svg>,
  mapleLeaf:   ({size=20,color='currentColor'}) => (
    <svg width={size} height={size} viewBox="0 0 500 500">
      <path fill={color} stroke="none" fillRule="evenodd" d="M 250.0,0.0 L 247.8,2.2 L 245.7,6.5 L 241.4,15.1 L 232.8,32.3 L 207.0,84.9 L 202.7,89.2 L 197.3,89.2 L 193.0,87.1 L 184.4,82.8 L 154.3,67.7 L 154.3,71.0 L 155.4,72.0 L 156.5,77.4 L 156.5,82.8 L 158.6,88.2 L 159.7,100.0 L 161.8,105.4 L 162.9,110.8 L 166.1,129.0 L 170.4,158.1 L 176.9,187.1 L 178.0,193.5 L 178.0,200.0 L 175.8,202.2 L 173.7,202.2 L 168.3,196.8 L 152.2,178.5 L 139.2,162.4 L 125.3,146.2 L 116.7,137.6 L 116.7,140.9 L 113.4,147.3 L 107.0,167.7 L 105.9,169.9 L 104.8,172.0 L 101.6,175.3 L 94.1,175.3 L 81.2,172.0 L 65.1,166.7 L 48.9,163.4 L 37.1,160.2 L 32.8,158.1 L 29.6,158.1 L 30.6,163.4 L 31.7,167.7 L 36.0,182.8 L 44.6,212.9 L 51.1,231.2 L 53.2,238.7 L 53.2,247.3 L 52.2,249.5 L 51.1,250.5 L 48.9,251.6 L 44.6,253.8 L 19.9,265.6 L 21.0,267.7 L 26.3,272.0 L 39.2,282.8 L 68.3,305.4 L 80.1,316.1 L 85.5,319.4 L 113.4,341.9 L 118.8,347.3 L 125.3,351.6 L 129.6,355.9 L 131.7,359.1 L 132.8,361.3 L 132.8,368.8 L 128.5,377.4 L 126.3,386.0 L 119.9,400.0 L 116.7,409.7 L 122.0,409.7 L 128.5,408.6 L 134.9,407.5 L 159.7,402.2 L 166.1,402.2 L 190.9,397.8 L 209.1,393.5 L 215.6,393.5 L 222.0,391.4 L 227.4,391.4 L 228.5,390.3 L 232.8,390.3 L 234.9,391.4 L 236.0,392.5 L 237.1,394.6 L 237.1,396.8 L 236.0,415.1 L 233.9,434.4 L 233.9,455.9 L 231.7,474.2 L 230.6,493.5 L 230.6,498.9 L 268.3,498.9 L 268.3,490.3 L 267.2,472.0 L 265.1,453.8 L 264.0,433.3 L 262.9,414.0 L 264.0,391.4 L 266.1,390.3 L 270.4,390.3 L 271.5,391.4 L 289.8,393.5 L 308.1,397.8 L 339.2,402.2 L 364.0,407.5 L 370.4,407.5 L 376.9,409.7 L 382.3,409.7 L 381.2,407.5 L 380.1,402.2 L 373.7,388.2 L 367.2,371.0 L 366.1,367.7 L 366.1,362.4 L 367.2,360.2 L 368.3,358.1 L 379.0,347.3 L 390.9,337.6 L 396.2,333.3 L 401.6,330.1 L 407.0,324.7 L 412.4,321.5 L 418.8,315.1 L 436.0,301.1 L 446.8,293.5 L 464.0,279.6 L 469.4,274.2 L 474.7,269.9 L 475.8,269.9 L 479.0,265.6 L 476.9,264.5 L 472.6,262.4 L 450.0,251.6 L 445.7,247.3 L 445.7,239.8 L 446.8,235.5 L 453.2,217.2 L 454.3,209.7 L 462.9,183.9 L 465.1,172.0 L 468.3,164.5 L 468.3,161.3 L 469.4,160.2 L 469.4,158.1 L 467.2,158.1 L 466.1,159.1 L 462.9,159.1 L 458.6,161.3 L 454.3,161.3 L 450.0,162.4 L 438.2,166.7 L 422.0,169.9 L 410.2,174.2 L 405.9,175.3 L 397.3,175.3 L 394.1,172.0 L 393.0,169.9 L 391.9,167.7 L 389.8,161.3 L 387.6,152.7 L 385.5,149.5 L 384.4,144.1 L 383.3,140.9 L 382.3,138.7 L 376.9,143.0 L 369.4,151.6 L 339.2,187.1 L 330.6,196.8 L 325.3,202.2 L 322.0,201.1 L 321.0,198.9 L 321.0,194.6 L 322.0,193.5 L 322.0,188.2 L 325.3,176.3 L 327.4,159.1 L 333.9,130.1 L 334.9,118.3 L 339.2,101.1 L 339.2,94.6 L 342.5,82.8 L 342.5,77.4 L 343.5,72.0 L 344.6,71.0 L 344.6,67.7 L 341.4,68.8 L 337.1,71.0 L 328.5,75.3 L 301.6,89.2 L 296.2,89.2 L 291.9,84.9 L 289.8,80.6 L 285.5,72.0 Z M 239.2,151.6 L 259.7,151.6 L 266.1,152.7 L 268.3,153.8 L 271.5,157.0 L 271.5,177.4 L 268.3,179.6 L 267.2,183.9 L 268.3,184.9 L 268.3,187.1 L 283.3,186.0 L 285.5,187.1 L 288.7,189.2 L 291.9,192.5 L 294.1,195.7 L 295.2,197.8 L 296.2,202.2 L 296.2,208.6 L 295.2,211.8 L 294.1,214.0 L 293.0,216.1 L 285.5,223.7 L 283.3,224.7 L 280.1,224.7 L 278.0,225.8 L 276.9,228.0 L 276.9,231.2 L 280.1,234.4 L 283.3,235.5 L 287.6,238.7 L 301.6,252.7 L 304.8,258.1 L 309.1,266.7 L 310.2,269.9 L 311.3,273.1 L 312.4,278.5 L 313.4,284.9 L 313.4,298.9 L 312.4,307.5 L 311.3,315.1 L 309.1,326.9 L 308.1,332.3 L 305.9,341.9 L 302.7,355.9 L 300.5,363.4 L 298.4,367.7 L 296.2,369.9 L 294.1,371.0 L 204.8,371.0 L 202.7,368.8 L 201.6,368.8 L 200.5,367.7 L 199.5,365.6 L 198.4,362.4 L 196.2,354.8 L 193.0,340.9 L 190.9,331.2 L 189.8,325.8 L 188.7,320.4 L 187.6,312.9 L 186.6,305.4 L 185.5,295.7 L 185.5,287.1 L 186.6,279.6 L 187.6,274.2 L 190.9,264.5 L 194.1,258.1 L 196.2,254.8 L 198.4,251.6 L 211.3,238.7 L 222.0,232.3 L 223.1,229.0 L 222.0,226.9 L 219.9,222.6 L 219.9,220.4 L 221.0,217.2 L 227.4,205.4 L 229.6,197.8 L 230.6,193.5 L 230.6,187.1 L 231.7,186.0 L 230.6,179.6 L 227.4,177.4 L 227.4,158.1 L 228.5,155.9 L 230.6,153.8 L 232.8,152.7 Z"/>
    </svg>
  ),
  // Cards & UI
  calculator:  (p) => <Svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="14" y2="14"/></Svg>,
  clock:       (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>,
  dollar:      (p) => <Svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Svg>,
  trendUp:     (p) => <Svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Svg>,
  percent:     (p) => <Svg {...p}><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></Svg>,
  scale:       (p) => <Svg {...p}><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 8l9-5 9 5"/><polyline points="3 8 7 21"/><polyline points="21 8 17 21"/></Svg>,
  tree:        (p) => <Svg {...p}><circle cx="12" cy="8" r="6"/><path d="M8 12 Q6 15 5 17"/><path d="M16 12 Q18 15 19 17"/><line x1="12" y1="14" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></Svg>,
  ruler:       (p) => <Svg {...p}><path d="M21.3 8.7l-9-9a1 1 0 0 0-1.4 0l-9 9a1 1 0 0 0 0 1.4l9 9a1 1 0 0 0 1.4 0l9-9a1 1 0 0 0 0-1.4z"/><line x1="7.5" y1="10.5" x2="9" y2="12"/><line x1="10.5" y1="7.5" x2="12" y2="9"/><line x1="13.5" y1="13.5" x2="15" y2="15"/></Svg>,
  circle:      (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></Svg>,
  mountain:    (p) => <Svg {...p}><polygon points="3 20 21 20 12 4"/><polyline points="3 20 8 12 12 16 16 10 21 20"/></Svg>,
  search:      (p) => <Svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Svg>,
  snowflake:   (p) => <Svg {...p}><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></Svg>,
  sun:         (p) => <Svg {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></Svg>,
  zap:         (p) => <Svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>,
  barChart:    (p) => <Svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></Svg>,
  refresh:     (p) => <Svg {...p}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.18"/></Svg>,
  network:     (p) => <Svg {...p}><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></Svg>,
  tank:        (p) => <Svg {...p}><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12"/><path d="M20 6v12"/><ellipse cx="12" cy="18" rx="8" ry="3"/><path d="M4 12a8 3 0 0 0 16 0"/><line x1="10" y1="18" x2="10" y2="21"/><line x1="14" y1="18" x2="14" y2="21"/></Svg>,
  trash:       (p) => <Svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Svg>,
  x:           (p) => <Svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>,
  chevUp:      (p) => <Svg {...p}><polyline points="18 15 12 9 6 15"/></Svg>,
  chevDown:    (p) => <Svg {...p}><polyline points="6 9 12 15 18 9"/></Svg>,
  edit:        (p) => <Svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>,
  download:    (p) => <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Svg>,
  layers:      (p) => <Svg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Svg>,
  check:       (p) => <Svg {...p}><polyline points="20 6 9 17 4 12"/></Svg>,
  info:        (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Svg>,
  home:        (p) => <Svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Svg>,
  // pump house: small centre circle + 8 spoke rays (matches map pin)
  settings:    (p) => <Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></Svg>,
  // junction: outer ring + inner dot + 4 arms (matches map pin)
  crosshair:   (p) => <Svg {...p}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="4" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="20"/><line x1="4" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="20" y2="12"/></Svg>,
  // season wizard / new setup
  compass:     (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Svg>,
};

// ─── Formulas ─────────────────────────────────────────────────────────────────
const rule86   = b => b > 0 ? 86 / b : 0;
const jones87  = b => b > 0 ? 87 / b : 0;
const syrupY   = (sap, b) => b > 0 ? sap / rule86(b) : 0;
const boilTime = (sap, b, r) => r > 0 && b > 0 ? (sap - syrupY(sap, b)) / r : 0;
const finTemp  = bp => bp + 7.1;
const denCorr  = t => (t - 68) * 0.03166;
const brixToBe = bx => bx * 0.6879;
const beToBrix = be => be / 0.6879;
const altToBP  = ft => 212 - ft * 0.0018;
const presToBP = p => 212 + (p - 29.92) * 1.8;
const roConc   = (sap, sb, tb) => tb > 0 && sb > 0 ? sap * (sb / tb) : 0;

const PAN_SIZES = [
  { label: '2×4 ft (~12 GPH)', area: 8,  rate: 12 },
  { label: '2×6 ft (~18 GPH)', area: 12, rate: 18 },
  { label: '2×8 ft (~24 GPH)', area: 16, rate: 24 },
  { label: '3×8 ft (~36 GPH)', area: 24, rate: 36 },
  { label: '3×10 ft (~45 GPH)',area: 30, rate: 45 },
  { label: '4×12 ft (~72 GPH)',area: 48, rate: 72 },
  { label: 'Custom size…',     area: 0,  rate: 0  },
];
const CUSTOM_PAN_IDX = PAN_SIZES.length - 1;
const FUELS = [
  { label: 'Firewood (cord)', labelFr: 'Bois de chauffage (corde)', unit: 'cord', unitFr: 'corde', spu: 200 },
  { label: 'Oil (gallon)',    labelFr: 'Huile (gallon)',             unit: 'gal',  unitFr: 'gal',   spu: 10  },
  { label: 'Propane (gallon)',labelFr: 'Propane (gallon)',           unit: 'gal',  unitFr: 'gal',   spu: 7   },
];
const fuelLabel = (f, lang) => lang === 'fr' ? (f.labelFr || f.label) : f.label;
const SPOUTS = [
  { label: '5/16" (Health Spout)', bit: '5/16"', depth: '1.5–2 in', note: 'Best for tree health & vacuum' },
  { label: '7/16" (Standard)',     bit: '7/16"', depth: '1.5–2 in', note: 'Traditional size' },
  { label: '19/64" (Drops)',       bit: '19/64"',depth: '1.5–2 in', note: 'For drop lines' },
];
// DE per plate scaled from Smoky Lake baseline (3.25 cups per 7" window plate)
// Area-proportional: 10" = 3.25×(10²/7²)≈6.6, 12" = 3.25×(12²/7²)≈9.5
const PLATE_CUPS = { '7" plates': 3.25, '10" plates': 6.6, '12" plates': 9.5 };
const ALT_REF = [
  { alt:'0 ft',     bp:212.0, fin:219.1 },
  { alt:'500 ft',   bp:211.1, fin:218.2 },
  { alt:'1,000 ft', bp:210.2, fin:217.3 },
  { alt:'1,500 ft', bp:209.3, fin:216.4 },
  { alt:'2,000 ft', bp:208.4, fin:215.5 },
  { alt:'2,500 ft', bp:207.5, fin:214.6 },
  { alt:'3,000 ft', bp:206.6, fin:213.7 },
];
const PRE_TASKS = [
  'Inspect and flush all tubing lines',
  'Check mainline for leaks or damage',
  'Install/replace taps and spouts',
  'Clean and sanitize evaporator pans',
  'Test vacuum system and pump',
  'Inspect R/O membranes and fittings',
  'Clean and sanitize sap storage tanks',
  'Stock up on filter media and supplies',
  'Check fuel levels (wood, oil, propane)',
  'Calibrate thermometers and hydrometers',
];
const POST_TASKS = [
  'Pull all taps and clean spouts',
  'Blow out and dry all tubing lines',
  'Clean and flush evaporator pans thoroughly',
  'Clean and store R/O system with preservative',
  'Drain and sanitize all sap storage tanks',
  'Inventory taps and fittings needing replacement',
  'Note any tubing repairs needed for next year',
  'Clean and store filter press / filter supplies',
  'Record final season totals and notes',
  'Cover and protect evaporator for off-season',
];

function tapsPer(dbh) {
  // Tap count is based on tree size only — vacuum increases yield per tap, not tap count
  if (dbh < 10) return 0;
  if (dbh < 18) return 1;
  if (dbh < 25) return 2;
  return 3;
}

// ─── Shared UI pieces ─────────────────────────────────────────────────────────
function NumInput({ value, onChange, min, max, step = 0.1, placeholder }) {
  const [display, setDisplay] = React.useState(value === 0 ? '' : String(value));
  React.useEffect(() => {
    if (document.activeElement && document.activeElement.dataset.nuминput === 'true') return;
    setDisplay(value === 0 ? '' : String(value));
  }, [value]);
  return (
    <input
      type="number"
      data-numinput="true"
      value={display}
      placeholder={placeholder || (value === 0 ? '0' : '')}
      min={min} max={max} step={step}
      onChange={e => {
        setDisplay(e.target.value);
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) onChange(n);
      }}
      onFocus={e => { if (parseFloat(e.target.value) === 0) { setDisplay(''); } }}
      onBlur={e => {
        const n = parseFloat(e.target.value);
        if (isNaN(n) || e.target.value === '') { onChange(0); setDisplay(''); }
        else { onChange(n); setDisplay(String(n)); }
      }}
    />
  );
}
function CardIcon({ bg, icon }) {
  const Ic = I[icon];
  return <div className="card-icon" style={{ background: bg }}>{Ic ? <Ic size={18} color="#fff" /> : null}</div>;
}
function TipItem({ children }) {
  return <div className="tip-item"><div className="tip-dot" /><span>{children}</span></div>;
}
function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span style={{ color:'#5a6a7a', fontSize:14 }}>{label}</span>
      <span style={{ fontWeight:500, fontSize:14 }}>{value}</span>
    </div>
  );
}

// ─── First Season Wizard ─────────────────────────────────────────────────────
function FirstSeasonWizard({ onClose, onComplete }) {
  const STEPS = 5;
  const [step, setStep] = React.useState(0);
  const [treeCount, setTreeCount] = React.useState('');
  const [trunkSize, setTrunkSize] = React.useState('medium');
  const [systemType, setSystemType] = React.useState('gravity');
  const [collectionType, setCollectionType] = React.useState('mainline');
  const [hasEvap, setHasEvap] = React.useState(null);
  const [panSize, setPanSize] = React.useState('2x4');
  const [wizFuelType, setWizFuelType] = React.useState('Firewood (cord)');
  const [fuelCostVal, setFuelCostVal] = React.useState('');
  const [syrupPrice, setSyrupPrice] = React.useState('');

  const trees = parseInt(treeCount) || 0;
  const tapsPerTree = trunkSize === 'large' ? 2 : 1;
  const recTaps = trees * tapsPerTree;
  const yieldLow  = systemType === 'vacuum' ? 0.22 : collectionType === 'mainline' ? 0.18 : 0.14;
  const yieldHigh = systemType === 'vacuum' ? 0.35 : collectionType === 'mainline' ? 0.28 : 0.22;
  const yieldMid  = (yieldLow + yieldHigh) / 2;
  const syrupLow  = Math.round(recTaps * yieldLow  * 10) / 10;
  const syrupMid  = Math.round(recTaps * yieldMid  * 10) / 10;
  const syrupHigh = Math.round(recTaps * yieldHigh * 10) / 10;
  const sapMid    = Math.round(syrupMid * 43);
  const evapRates = { '2x3':4,'2x4':6,'2x6':10,'2x8':14,'3x8':18,'3x10':25,'4x12':35 };
  const evapGph   = evapRates[panSize] || 6;
  const sessions  = hasEvap ? Math.ceil(Math.max(1, sapMid) / (evapGph * 4)) : null;
  const firewood  = wizFuelType.includes('Firewood') ? Math.max(0.1, syrupMid / 30).toFixed(1) : null;
  const price     = parseFloat(syrupPrice) || 40;

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const finish = () => {
    const data = { trees, tapsPerTree, recTaps, systemType, collectionType, hasEvap, panSize,
      fuelType: wizFuelType, fuelCost: parseFloat(fuelCostVal) || 300, syrupPrice: price };
    ls.set('sg_wizard_data', data);
    ls.set('sg_onboarded', true);
    onComplete(data);
  };

  const stepTitles = ['Your Trees', 'Your System', 'Your Evaporator', 'Costs & Goals', 'Your Season Plan'];
  const stepIcons  = ['🌳', '🔧', '🔥', '💰', '📋'];
  const canNext    = [trees > 0, true, hasEvap !== null, true, true][step];

  const Opt = ({ val, cur, set, accent='#2dd4a7', icon, label, sub, wide }) => (
    <button onClick={()=>set(val)}
      style={{padding: wide ? '12px 14px' : '12px 8px', borderRadius:12,
        border:`2px solid ${cur===val ? accent : '#1e2d3d'}`,
        background: cur===val ? `rgba(${accent==='#2dd4a7'?'45,212,167':accent==='#58a6ff'?'88,166,255':accent==='#a78bfa'?'167,139,250':accent==='#3fb950'?'63,185,80':accent==='#f59e0b'?'245,158,11':'45,212,167'},0.09)` : '#0a1420',
        cursor:'pointer', transition:'all 0.15s', textAlign: wide ? 'left' : 'center',
        display: wide ? 'flex' : 'block', alignItems: wide ? 'center' : undefined, gap: wide ? 10 : 0,
        width:'100%', minWidth:0, boxSizing:'border-box'}}>
      {wide
        ? <><span style={{fontSize:20}}>{icon}</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:cur===val?accent:'#c9d1d9'}}>{label}</div>
              <div style={{fontSize:10,color:'#5a6a7a'}}>{sub}</div>
            </div></>
        : <><div style={{fontSize:20,marginBottom:4}}>{icon}</div>
            <div style={{fontSize:11,fontWeight:700,color:cur===val?accent:'#c9d1d9'}}>{label}</div>
            {sub && <div style={{fontSize:10,color:'#5a6a7a',marginTop:2,lineHeight:1.3}}>{sub}</div>}</>
      }
    </button>
  );

  const steps = [
    // 0 — Trees
    <div key="s0">
      <p style={{fontSize:13,color:'#8a9ab5',marginBottom:18,lineHeight:1.6}}>
        Let's start with your trees. This helps SweetRun calculate your real production potential.
      </p>
      <div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:8}}>
          How many maple trees do you tap?
        </label>
        <input type="number" value={treeCount} onChange={e=>setTreeCount(e.target.value)}
          placeholder="e.g. 150" min="1"
          style={{width:'100%',background:'#0a1420',border:'1.5px solid #1e2d3d',borderRadius:10,
            padding:'11px 14px',color:'#e2eaf4',fontSize:16,boxSizing:'border-box',outline:'none'}}/>
      </div>
      <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:10}}>
        Average trunk diameter at chest height
      </label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,minWidth:0}}>
        <Opt val="small"  cur={trunkSize} set={setTrunkSize} accent="#2dd4a7" icon="🌱" label='Under 10"' sub="1 tap/tree"/>
        <Opt val="medium" cur={trunkSize} set={setTrunkSize} accent="#2dd4a7" icon="🌳" label='10–18"'    sub="1–2 taps"/>
        <Opt val="large"  cur={trunkSize} set={setTrunkSize} accent="#2dd4a7" icon="🌲" label='Over 18"'  sub="2–3 taps"/>
      </div>
    </div>,

    // 1 — System
    <div key="s1">
      <p style={{fontSize:13,color:'#8a9ab5',marginBottom:18,lineHeight:1.6}}>
        Your system type is the biggest lever on how much sap you collect per tap.
      </p>
      <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:10}}>Tap system</label>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}}>
        <Opt val="gravity" cur={systemType} set={setSystemType} accent="#58a6ff" icon="🌊" label="Gravity" sub={"Natural flow\n0.14–0.28 gal/tap"}/>
        <Opt val="vacuum"  cur={systemType} set={setSystemType} accent="#58a6ff" icon="💨" label="Vacuum"  sub={"Pump-assisted\n0.22–0.35 gal/tap"}/>
      </div>
      <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:10}}>Collection method</label>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <Opt val="buckets"  cur={collectionType} set={setCollectionType} accent="#a78bfa" icon="🪣" label="Buckets"  sub="Classic, manual"/>
        <Opt val="mainline" cur={collectionType} set={setCollectionType} accent="#a78bfa" icon="🔗" label="Mainline" sub="Flows to tank"/>
      </div>
    </div>,

    // 2 — Evaporator
    <div key="s2">
      <p style={{fontSize:13,color:'#8a9ab5',marginBottom:18,lineHeight:1.6}}>
        Your evaporator size determines how many sessions your season will take.
      </p>
      <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:10}}>Do you have an evaporator?</label>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}}>
        <Opt val={true}  cur={hasEvap} set={setHasEvap} accent="#3fb950" icon="✅" label="Yes, I do"  sub="Ready to boil"/>
        <Opt val={false} cur={hasEvap} set={setHasEvap} accent="#3fb950" icon="📋" label="Not yet"    sub="Planning ahead"/>
      </div>
      {hasEvap && <>
        <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:10}}>Pan size</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(56px,1fr))',gap:6,marginBottom:18}}>
          {['2x3','2x4','2x6','2x8','3x8','3x10','4x12'].map(sz=>(
            <button key={sz} onClick={()=>setPanSize(sz)}
              style={{padding:'9px 4px',borderRadius:10,border:`2px solid ${panSize===sz?'#f59e0b':'#1e2d3d'}`,
                background:panSize===sz?'rgba(245,158,11,0.08)':'#0a1420',cursor:'pointer',transition:'all 0.15s',textAlign:'center'}}>
              <div style={{fontSize:11,fontWeight:700,color:panSize===sz?'#f59e0b':'#c9d1d9'}}>{sz}</div>
              <div style={{fontSize:9,color:'#5a6a7a',marginTop:2}}>{evapRates[sz]}gph</div>
            </button>
          ))}
        </div>
      </>}
      <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:10}}>Fuel type</label>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[['Firewood (cord)','🪵','Wood-fired'],['Oil (gal)','🛢️','Oil burner'],
          ['Propane (gal)','🔥','Propane'],['Natural Gas (ccf)','⛽','Gas line']].map(([v,icon,desc])=>(
          <Opt key={v} val={v} cur={wizFuelType} set={setWizFuelType} accent="#f59e0b" icon={icon} label={v.split(' ')[0]} sub={desc} wide/>
        ))}
      </div>
    </div>,

    // 3 — Costs
    <div key="s3">
      <p style={{fontSize:13,color:'#8a9ab5',marginBottom:18,lineHeight:1.6}}>
        Two numbers that unlock the full financial picture of your operation.
      </p>
      <div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:8}}>
          Fuel cost this season ({wizFuelType})
        </label>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#5a6a7a',fontSize:16,flexShrink:0}}>$</span>
          <input type="number" value={fuelCostVal} onChange={e=>setFuelCostVal(e.target.value)}
            placeholder={wizFuelType.includes('Firewood')?'300':'120'} min="0"
            style={{flex:1,background:'#0a1420',border:'1.5px solid #1e2d3d',borderRadius:10,
              padding:'11px 14px',color:'#e2eaf4',fontSize:15,outline:'none'}}/>
        </div>
        <div style={{fontSize:11,color:'#3d5068',marginTop:4}}>Skip if unknown — update anytime in SweetRun.</div>
      </div>
      <div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:8}}>
          Syrup selling price (per gallon)
        </label>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#5a6a7a',fontSize:16,flexShrink:0}}>$</span>
          <input type="number" value={syrupPrice} onChange={e=>setSyrupPrice(e.target.value)}
            placeholder="40" min="0"
            style={{flex:1,background:'#0a1420',border:'1.5px solid #1e2d3d',borderRadius:10,
              padding:'11px 14px',color:'#e2eaf4',fontSize:15,outline:'none'}}/>
        </div>
        <div style={{fontSize:11,color:'#3d5068',marginTop:4}}>Retail bulk maple typically sells $35–$70/gal.</div>
      </div>
      {trees > 0 && (
        <div style={{background:'rgba(63,185,80,0.06)',border:'1px solid rgba(63,185,80,0.2)',borderRadius:12,padding:'14px 16px'}}>
          <div style={{fontSize:10,fontWeight:700,color:'#3fb950',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Revenue Snapshot</div>
          <div style={{fontSize:13,color:'#c9d1d9',lineHeight:1.9}}>
            <div>Bad year: <span style={{color:'#f59e0b',fontWeight:700}}>{syrupLow.toFixed(1)} gal → ${(syrupLow * price).toFixed(0)}</span></div>
            <div>Average: <span style={{color:'#2dd4a7',fontWeight:700}}>{syrupMid.toFixed(1)} gal → ${(syrupMid * price).toFixed(0)}</span></div>
            <div>Great year: <span style={{color:'#3fb950',fontWeight:700}}>{syrupHigh.toFixed(1)} gal → ${(syrupHigh * price).toFixed(0)}</span></div>
          </div>
        </div>
      )}
    </div>,

    // 4 — Season Plan
    <div key="s4">
      {trees > 0 ? <>
        <div style={{background:'linear-gradient(135deg,#071a0e,#0a2010)',border:'1px solid #1a4a25',borderRadius:14,padding:'16px 18px',marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:'#3fb950',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>
            🍁 Your {new Date().getFullYear()} Season Plan
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {[
              [recTaps,        'Recommended taps',   '#2dd4a7'],
              [syrupLow.toFixed(0)+'–'+syrupHigh.toFixed(0), 'Expected gal syrup','#a78bfa'],
              [sapMid.toLocaleString(), 'Estimated gal sap',  '#58a6ff'],
              ['$'+(syrupMid*price).toFixed(0), 'Avg season revenue','#f59e0b'],
            ].map(([val,lbl,clr],i)=>(
              <div key={i} style={{textAlign:'center',background:'rgba(0,0,0,0.25)',borderRadius:10,padding:'12px 8px'}}>
                <div style={{fontSize:24,fontWeight:800,color:clr,lineHeight:1}}>{val}</div>
                <div style={{fontSize:10,color:'#5a6a7a',marginTop:4}}>{lbl}</div>
              </div>
            ))}
          </div>
          {hasEvap && sessions && (
            <div style={{paddingTop:12,borderTop:'1px solid #1a4a25',display:'flex',gap:20,justifyContent:'center'}}>
              <div style={{textAlign:'center'}}>
                <span style={{fontSize:18,fontWeight:700,color:'#f59e0b'}}>{sessions}</span>
                <span style={{fontSize:11,color:'#5a6a7a',display:'block'}}>evap sessions</span>
              </div>
              {firewood && (
                <div style={{textAlign:'center'}}>
                  <span style={{fontSize:18,fontWeight:700,color:'#e8865a'}}>{firewood}</span>
                  <span style={{fontSize:11,color:'#5a6a7a',display:'block'}}>cords wood</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{background:'#0a1420',border:'1px solid #1e2d3d',borderRadius:12,padding:'14px 16px'}}>
          <div style={{fontSize:10,fontWeight:700,color:'#58a6ff',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>📅 Season Checklist</div>
          {[
            ['Feb · Prep',       'Inspect all equipment, drill bits, spouts, lines. Order supplies now — stock runs out.',  '#2dd4a7'],
            ['Late Feb · Watch', 'Monitor 10-day forecast. Look for 40°F+ days with sub-freezing nights.',                  '#58a6ff'],
            ['First Run',        "Tap when the forecast shows the pattern. Don't wait — early sap is your best.",           '#3fb950'],
            ['During Season',    'Collect sap within 24–48 hrs. Refrigerate if not boiling same day. Log every run.',       '#f59e0b'],
            ['Late Season',      'Watch for buddy sap (cloudy, off-taste). Pull taps when buds swell.',                     '#a78bfa'],
            ['After Season',     "Clean lines, store equipment dry, log final numbers in SweetRun's Recap tab.",            '#e8865a'],
          ].map(([title,desc,clr],i,arr)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:i<arr.length-1?10:0,paddingBottom:i<arr.length-1?10:0,borderBottom:i<arr.length-1?'1px solid #131e2c':'none'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:clr,marginTop:5,flexShrink:0}}/>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#c9d1d9',marginBottom:2}}>{title}</div>
                <div style={{fontSize:11,color:'#5a6a7a',lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </> : (
        <div style={{textAlign:'center',padding:'40px 20px',color:'#5a6a7a'}}>
          <div style={{fontSize:48,marginBottom:12}}>🌳</div>
          <div style={{fontSize:14,color:'#c9d1d9',marginBottom:6}}>Go back and enter your tree count</div>
          <div style={{fontSize:12}}>to generate your personalized season plan.</div>
        </div>
      )}
    </div>,
  ];

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:9000,
      display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div style={{background:'#07090f',border:'1px solid #1e2d3d',borderRadius:'24px 24px 0 0',
        padding:'24px 20px 32px',width:'100%',maxWidth:540,maxHeight:'92vh',overflowY:'auto',overflowX:'hidden',
        boxSizing:'border-box',animation:'fadeIn 0.3s ease both'}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:'#2dd4a7',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>
              {stepIcons[step]} Step {step+1} of {STEPS}
            </div>
            <div style={{fontSize:20,fontWeight:800,color:'#e2eaf4'}}>{stepTitles[step]}</div>
          </div>
          <button onClick={onClose}
            style={{background:'none',border:'none',color:'#3d5068',padding:4,cursor:'pointer',display:'flex'}}>
            <I.x size={20} color="#3d5068"/>
          </button>
        </div>
        {/* Progress */}
        <div style={{height:3,background:'#131e2c',borderRadius:3,marginBottom:22,overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:3,background:'linear-gradient(90deg,#2dd4a7,#58a6ff)',
            width:`${((step+1)/STEPS)*100}%`,transition:'width 0.35s ease'}}/>
        </div>
        {/* Content */}
        <div style={{minHeight:260}}>{steps[step]}</div>
        {/* Nav */}
        <div style={{display:'flex',gap:10,marginTop:22}}>
          {step > 0 && (
            <button onClick={goBack}
              style={{flex:1,padding:'13px',borderRadius:12,border:'1px solid #1e2d3d',
                background:'transparent',color:'#8a9ab5',fontSize:14,fontWeight:600,cursor:'pointer'}}>
              ← Back
            </button>
          )}
          {step < STEPS-1 ? (
            <button onClick={goNext} disabled={!canNext}
              style={{flex:2,padding:'13px',borderRadius:12,border:'none',
                background:canNext?'linear-gradient(135deg,#2dd4a7,#1fbf94)':'#131e2c',
                color:canNext?'#07090f':'#3d5068',fontSize:14,fontWeight:700,
                cursor:canNext?'pointer':'not-allowed',transition:'all 0.15s'}}>
              Continue →
            </button>
          ) : (
            <button onClick={finish}
              style={{flex:2,padding:'13px',borderRadius:12,border:'none',
                background:'linear-gradient(135deg,#3fb950,#2ea043)',color:'#fff',
                fontSize:14,fontWeight:700,cursor:'pointer'}}>
              🍁 Start My Season
            </button>
          )}
        </div>
        {step === 0 && (
          <div style={{textAlign:'center',marginTop:12}}>
            <button onClick={onClose}
              style={{background:'none',border:'none',color:'#3d5068',fontSize:12,cursor:'pointer'}}>
              Skip — I'll set up later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Freeze/Thaw Widget ───────────────────────────────────────────────────────
function FreezeThawWidget({ lang='en' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zip, setZip] = useState('');

  const fetchW = async (lat, lon) => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`);
      setWeather(await r.json());
    } catch { setError('Could not load forecast. Check connection.'); }
    setLoading(false);
  };
  const useGPS = () => {
    if (location.protocol === 'file:') {
      setError('GPS requires the app to be hosted online (HTTPS). Use the zip/city search below, or open this file through a local server or Netlify.');
      return;
    }
    if (!navigator.geolocation) { setError('GPS not supported by this browser.'); return; }
    setLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      p => fetchW(p.coords.latitude, p.coords.longitude),
      e => {
        setLoading(false);
        if (e.code === 1) setError('Location permission denied — allow location access in your browser and try again.');
        else if (e.code === 2) setError('Location unavailable. Try entering a zip code instead.');
        else setError('Location request timed out. Try entering a zip code instead.');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };
  const searchZip = async () => {
    if (!zip.trim()) return;
    setLoading(true); setError('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}&count=1&language=en&format=json`);
      const d = await r.json();
      if (d.results?.length) fetchW(d.results[0].latitude, d.results[0].longitude);
      else { setError('Location not found.'); setLoading(false); }
    } catch { setError('Search failed.'); setLoading(false); }
  };

  return (
    <div className="card">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:12, fontWeight:600, letterSpacing:'0.08em', color:'#5a6a7a', marginBottom:12 }}>
        <I.snowflake size={14} color="#58a6ff" /> {t(lang,'ftTitle')} <I.sun size={14} color="#e0a44a" />
      </div>
      <button className="btn-secondary" style={{ marginBottom:10 }} onClick={useGPS}>
        <I.mapPin size={16} color="#8b949e" /> {t(lang,'useGPS')}
      </button>
      <div style={{ textAlign:'center', color:'#3d5068', fontSize:12, marginBottom:8 }}>{t(lang,'ftOr')}</div>
      <div style={{ display:'flex', gap:8 }}>
        <input type="text" placeholder={t(lang,'wxCityPh')} value={zip}
          onChange={e => setZip(e.target.value)} onKeyDown={e => e.key==='Enter' && searchZip()} style={{ flex:1 }} />
        <button onClick={searchZip} style={{ background:'#2dd4a7', border:'none', borderRadius:8, width:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <I.search size={18} color="#0d1117" />
        </button>
      </div>
      {loading && <div style={{ textAlign:'center', color:'#5a6a7a', marginTop:12, fontSize:14 }}>Loading…</div>}
      {error   && <div style={{ color:'#f85149', fontSize:13, marginTop:8 }}>{error}</div>}
      {weather && (
        <div style={{ marginTop:14 }}>
          {(() => {
            const days = weather.daily.time.map((date, i) => {
              const hi = Math.round(weather.daily.temperature_2m_max[i]);
              const lo = Math.round(weather.daily.temperature_2m_min[i]);
              const ideal     = hi >= 40 && lo <= 28;
              const freezeThaw= !ideal && hi >= 32 && lo < 32;
              const tooWarm   = hi > 50 && lo > 32;
              const allFreeze = hi < 32;
              return { date, hi, lo, ideal, freezeThaw, tooWarm, allFreeze };
            });
            const idealCount   = days.filter(d=>d.ideal).length;
            const tooWarmCount = days.filter(d=>d.tooWarm).length;
            return (
              <>
                <div style={{ background: idealCount>0?'#081e0e':'#1a0d04', borderRadius:10, padding:'10px 14px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center', border:`1px solid ${idealCount>0?'#1a4a25':'#4a2000'}` }}>
                  <div>
                    <div style={{ fontWeight:700, color: idealCount>0?'#3fb950':'#f0883e', fontSize:15 }}>
                      {idealCount>0 ? (lang==='fr' ? idealCount + (idealCount!==1?' jours de coulée':' jour de coulée') + ' à venir' : idealCount + ' run day' + (idealCount!==1?'s':'') + ' ahead') : '—'}
                    </div>
                    <div style={{ fontSize:12, color:'#5a6a7a', marginTop:2 }}>
                      {tooWarmCount >= 4 ? t(lang,'ftWarmStretch') : 'hi \u2265 40\u00b0F \u00b7 lo \u2264 28\u00b0F'}
                    </div>
                  </div>
                  <div style={{ fontSize:24 }}>{idealCount>0 ? '🍁' : tooWarmCount>=4?'⚠️':'❄️'}</div>
                </div>
                {days.map(({ date, hi, lo, ideal, freezeThaw, tooWarm, allFreeze }) => {
                  const d = new Date(date + 'T12:00:00');
                  const i = days.findIndex(x=>x.date===date);
                  let badge = null;
                  if (ideal)      badge = <span style={{ background:'rgba(63,185,80,0.15)', color:'#3fb950', fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:12, border:'1px solid rgba(63,185,80,0.25)' }}>\u2713 {t(lang,'badgeIdeal')}</span>;
                  else if (freezeThaw) badge = <span className="good-badge">{t(lang,'badgeFreezeThaw')}</span>;
                  else if (tooWarm)    badge = <span style={{ background:'rgba(240,136,62,0.13)', color:'#f0883e', fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:12, border:'1px solid rgba(240,136,62,0.22)' }}>{t(lang,'badgeTooWarm')}</span>;
                  else if (allFreeze)  badge = <span className="freeze-badge">{t(lang,'badgeAllFreeze')}</span>;
                  return (
                    <div key={date} className="weather-day" style={{ borderLeft: ideal?'3px solid #3fb950':tooWarm?'3px solid #f0883e':'3px solid transparent' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{i===0?t(lang,'today'):DAY[lang][d.getDay()]}</div>
                        <div style={{ color:'#5a6a7a', fontSize:12 }}>{MON[lang][d.getMonth()]} {d.getDate()}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ color:'#f0883e', fontWeight:600 }}>{hi}°</span>
                        <span style={{ color:'#5a6a7a', fontSize:13 }}>/</span>
                        <span style={{ color:'#58a6ff', fontWeight:600 }}>{lo}°</span>
                        {badge}
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontSize:12, color:'#3d5068', marginTop:8, textAlign:'center' }}>
                  {t(lang,'ftLegend')}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── SAP TAB ──────────────────────────────────────────────────────────────────
function SapTab({ sapBrix, setSapBrix, trees, units, lang='en' }) {
  const [sapGal, setSapGal] = useState(500);
  const u    = units === 'L' ? 'L' : 'gal';
  const conv = v => units === 'L' ? (v*3.78541).toFixed(1) : v.toFixed(1);
  const ratio = rule86(sapBrix), jones = jones87(sapBrix);
  const sy = syrupY(sapGal, sapBrix);
  const qr = [1.5, 2.0, 2.5, 3.0].map(b => ({ b, r: Math.round(rule86(b)) }));

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <CardIcon bg="#2d2010" icon="calculator" />
          <div><div>{t(lang,'rule86Title')}</div><div style={{ fontSize:12, color:'#5a6a7a', fontWeight:400 }}>{t(lang,'rule86Sub')}</div></div>
        </div>
        <div className="field-label">{t(lang,'sapSugarContent')}</div>
        <NumInput value={sapBrix} onChange={setSapBrix} min={0.5} max={10} step={0.1} />
        <div style={{ fontSize:12, color:'#e0a44a', marginTop:5, marginBottom:10 }}>{t(lang,'sharedAllTabs')}</div>
        <div className="result-box orange">
          <div className="two-col">
            <div>
              <div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'sapToSyrup')}</div>
              <div className="result-value" style={{ color:'#e0a44a' }}>{fmt(ratio,1)}:1</div>
            </div>
            <div>
              <div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'jonesRule')}</div>
              <div className="result-value" style={{ color:'#e0a44a' }}>{fmt(jones,1)}:1</div>
            </div>
          </div>
          <div style={{ marginTop:8, fontSize:13, color:'#5a6a7a' }}>{fmt(ratio,1)} {u} sap = 1 {u} syrup</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#1a2a2d" icon="droplet" />
          <div><div>{t(lang,'syrupYieldCard')}</div><div style={{ fontSize:12, color:'#5a6a7a', fontWeight:400 }}>{t(lang,'syrupYieldSub')}</div></div>
        </div>
        <div className="two-col" style={{ marginBottom:12 }}>
          <div><div className="field-label">{t(lang,'sapFieldLabel')} ({u})</div><NumInput value={sapGal} onChange={setSapGal} min={1} max={100000} step={1} /></div>
          <div><div className="field-label">{t(lang,'sapBrix')}</div><input type="number" value={sapBrix} onChange={e=>setSapBrix(parseFloat(e.target.value)||0)} onFocus={e=>e.target.select()} min={0.5} max={10} step={0.1} /></div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, padding:'10px 0' }}>
          <div style={{ textAlign:'center' }}>
            <div className="result-value" style={{ color:'#e0a44a', fontSize:32 }}>{conv(sapGal)}</div>
            <div style={{ color:'#5a6a7a', fontSize:13 }}>{u} {t(lang,'sapSap')}</div>
          </div>
          <div style={{ color:'#2dd4a7', fontSize:22 }}>→</div>
          <div style={{ textAlign:'center' }}>
            <div className="result-value" style={{ color:'#2dd4a7', fontSize:32 }}>{conv(sy)}</div>
            <div style={{ color:'#5a6a7a', fontSize:13 }}>{u} {t(lang,'sapSyrup')}</div>
          </div>
        </div>
        {trees > 0 && (
          <div style={{ background:'#0f1720', borderRadius:8, padding:'8px 14px', display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <span style={{ color:'#2dd4a7', fontSize:14 }}>{t(lang,'perTreeLabel')} ({trees} {t(lang,'trees')})</span>
            <span style={{ fontWeight:700, color:'#2dd4a7' }}>{fmt(sy/trees,3)} {u}/tree</span>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:12 }}>
          <CardIcon bg="#1c2128" icon="layers" />
          {t(lang,'quickRef')}
        </div>
        <div className="two-col">
          {qr.map(q => (
            <div key={q.b} style={{ background: Math.abs(q.b-sapBrix)<0.01 ? '#1e1005':'#0f1720', border:`1px solid ${Math.abs(q.b-sapBrix)<0.01 ? 'rgba(224,164,74,0.5)':'#1a2840'}`, borderRadius:10, padding:12 }}>
              <div style={{ fontWeight:700, color:'#e0a44a' }}>{q.b}° Brix</div>
              <div style={{ color:'#5a6a7a', fontSize:13 }}>{q.r}:1 ratio</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BATCH LABEL HELPERS ──────────────────────────────────────────────────────
const BATCH_GRADES = {
  golden: { name:'Golden Delicate',  color:'#f5c842' },
  amber:  { name:'Amber Rich',       color:'#e0a44a' },
  dark:   { name:'Dark Robust',      color:'#c47a28' },
  vdark:  { name:'Very Dark Strong', color:'#8b4513' },
};

function _buildBatchURL(b, batchNum, season, trees) {
  const p = new URLSearchParams();
  if (batchNum)   p.set('b',   batchNum);
  if (b.date)     p.set('d',   b.date);
  if (b.grade)    p.set('g',   b.grade);
  if (b.sapIn)    p.set('sap', b.sapIn);
  if (b.syrupOut) p.set('syr', b.syrupOut);
  if (b.loc)      p.set('loc', b.loc);
  if (trees)      p.set('taps', trees);
  if (season)     p.set('s',   season);
  if (b.notes)    p.set('n',   b.notes);
  return `https://sweetrun.app/batch.html?${p.toString()}`;
}

async function _downloadBatchLabel(b, batchNum, season, trees, units) {
  const u   = units === 'L' ? 'L' : 'gal';
  const g   = BATCH_GRADES[b.grade] || BATCH_GRADES.amber;
  const url = _buildBatchURL(b, batchNum, season, trees);
  const W = 400, H = 580;
  const cvs = document.createElement('canvas');
  cvs.width = W * 2; cvs.height = H * 2;
  const c = cvs.getContext('2d');
  c.scale(2, 2);

  // BG
  c.fillStyle = '#07090f'; c.fillRect(0, 0, W, H);

  // Header
  const hg = c.createLinearGradient(0, 0, W, 72);
  hg.addColorStop(0, '#1a3d2b'); hg.addColorStop(1, '#0f2318');
  c.fillStyle = hg; c.fillRect(0, 0, W, 72);
  c.fillStyle = '#fff';
  c.font = 'bold 22px Arial, sans-serif'; c.fillText('🍁 SweetRun', 20, 42);
  c.fillStyle = 'rgba(255,255,255,0.45)';
  c.font = '700 9px Arial, sans-serif'; c.fillText('MAPLE PROVENANCE', 20, 58);
  c.fillStyle = '#2dd4a7'; c.font = 'bold 12px Arial, sans-serif';
  c.textAlign = 'right';
  c.fillText(`Batch #${batchNum}${season ? ' · '+season : ''}`, W-16, 38);
  c.textAlign = 'left';

  // Grade band
  const [gr,gg,gb] = [parseInt(g.color.slice(1,3),16), parseInt(g.color.slice(3,5),16), parseInt(g.color.slice(5,7),16)];
  c.fillStyle = `rgba(${gr},${gg},${gb},0.12)`; c.fillRect(0, 72, W, 52);
  c.fillStyle = g.color;
  c.beginPath(); c.arc(36, 98, 16, 0, Math.PI*2); c.fill();
  c.fillStyle = '#5a6a7a'; c.font = '700 8px Arial, sans-serif'; c.fillText('USDA GRADE A', 64, 90);
  c.fillStyle = g.color; c.font = 'bold 17px Arial, sans-serif'; c.fillText(g.name, 64, 112);

  // Stats
  const stats = [
    b.sapIn    ? { label:'SAP IN',    val:`${parseFloat(b.sapIn).toLocaleString()} ${u}` }  : null,
    b.syrupOut ? { label:'SYRUP OUT', val:`${parseFloat(b.syrupOut).toFixed(1)} ${u}` }    : null,
    (b.sapIn && b.syrupOut) ? { label:'RATIO', val:`${(b.sapIn/b.syrupOut).toFixed(1)}:1` } : null,
    trees      ? { label:'TREES',     val:`${parseInt(trees).toLocaleString()}` }           : null,
  ].filter(Boolean);
  c.fillStyle = '#131e2c'; c.fillRect(0, 124, W, 1);
  const cw = W / Math.max(stats.length, 1);
  stats.forEach((s, i) => {
    const x = i*cw + 14;
    if (i > 0) { c.fillStyle = '#131e2c'; c.fillRect(i*cw, 125, 1, 54); }
    c.fillStyle = '#3d5068'; c.font = '700 8px Arial, sans-serif'; c.fillText(s.label, x, 144);
    c.fillStyle = '#e6edf3'; c.font = 'bold 17px Arial, sans-serif'; c.fillText(s.val, x, 166);
  });
  c.fillStyle = '#131e2c'; c.fillRect(0, 179, W, 1);

  // Details
  let dy = 202;
  const details = [
    b.date ? `📅 ${new Date(b.date+'T12:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}` : null,
    b.loc  ? `📍 ${b.loc}` : null,
    b.notes ? `📝 ${b.notes}` : null,
  ].filter(Boolean);
  c.fillStyle = '#8a9ab5'; c.font = '13px Arial, sans-serif';
  details.forEach(d => { c.fillText(d, 20, dy); dy += 24; });

  // QR
  const qrSize = 160, qrX = (W - qrSize) / 2, qrY = H - 210;
  const qrImg = new Image(); qrImg.crossOrigin = 'anonymous';
  await new Promise((res, rej) => {
    qrImg.onload = res; qrImg.onerror = rej;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}&color=1a3d2b&bgcolor=ffffff&margin=4`;
  });
  c.fillStyle = '#fff';
  if (c.roundRect) { c.beginPath(); c.roundRect(qrX-8, qrY-8, qrSize+16, qrSize+16, 8); c.fill(); }
  else { c.fillRect(qrX-8, qrY-8, qrSize+16, qrSize+16); }
  c.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  c.fillStyle = '#3d5068'; c.font = '10px Arial, sans-serif'; c.textAlign = 'center';
  c.fillText('Scan to verify batch provenance', W/2, qrY + qrSize + 18);
  c.fillStyle = '#2dd4a7'; c.font = 'bold 10px Arial, sans-serif';
  c.fillText('sweetrun.app', W/2, qrY + qrSize + 33);

  // Footer
  c.fillStyle = '#0a1018'; c.fillRect(0, H-40, W, 40);
  c.fillStyle = '#2a3a4a'; c.font = '9px Arial, sans-serif';
  c.fillText('Data encoded in QR — never stored in the cloud', W/2, H-14);
  c.textAlign = 'left';

  const a = document.createElement('a');
  a.href = cvs.toDataURL('image/png');
  a.download = `sweetrun-batch-${batchNum}.png`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── EVAP TAB ─────────────────────────────────────────────────────────────────
function EvapTab({ sapBrix, setSapBrix, units, setEvapRate, fuelType, setFuelType, fuelCost, setFuelCost, season, trees, lang='en' }) {
  const [panIdx,    setPanIdx]   = useState(() => ls.get('sg_panIdx', 0));
  const [customR,   setCustomR]  = useState('');
  const [panW,      setPanW]     = useState(() => ls.get('sg_panW', ''));
  const [panH,      setPanH]     = useState(() => ls.get('sg_panH', ''));
  const [sapGal,    setSapGal]   = useState(500);
  const [batches,   setBatches]  = useState(() => ls.get('sg_batches', []));
  const [showForm,  setShowForm] = useState(false);
  const [bf, setBf] = useState({ date: new Date().toISOString().split('T')[0], sapIn:'', syrupOut:'', grade:'amber', loc:'', notes:'' });
  const [locLoading, setLocLoading] = useState(false);
  const [laborHrs,  setLaborHrs]  = useState(() => ls.get('sg_laborhrs', 0));
  const [laborRate, setLaborRate] = useState(() => ls.get('sg_laborrate', 15));
  const [spoutCost, setSpoutCost] = useState(() => ls.get('sg_spoutcost', 0));
  const [bottleCost,setBottleCost]= useState(() => ls.get('sg_bottlecost', 0));
  const [filterCost,setFilterCost]= useState(() => ls.get('sg_filtercost', 0));
  const [otherCost, setOtherCost] = useState(() => ls.get('sg_othercost', 0));
  const [retailMargin,      setRetailMargin]      = useState(() => ls.get('sg_retailmargin', 40));
  const [retailCostOverride,setRetailCostOverride] = useState('');
  useEffect(()=>{ ls.set('sg_panIdx', panIdx); },[panIdx]);
  useEffect(()=>{ ls.set('sg_panW',   panW);   },[panW]);
  useEffect(()=>{ ls.set('sg_panH',   panH);   },[panH]);
  useEffect(()=>{ ls.set('sg_retailmargin', retailMargin); },[retailMargin]);
  useEffect(()=>{ ls.set('sg_laborhrs',  laborHrs);  },[laborHrs]);
  useEffect(()=>{ ls.set('sg_laborrate', laborRate); },[laborRate]);
  useEffect(()=>{ ls.set('sg_spoutcost', spoutCost); },[spoutCost]);
  useEffect(()=>{ ls.set('sg_bottlecost',bottleCost);},[bottleCost]);
  useEffect(()=>{ ls.set('sg_filtercost',filterCost);},[filterCost]);
  useEffect(()=>{ ls.set('sg_othercost', otherCost); },[otherCost]);

  const pan        = PAN_SIZES[panIdx];
  const isCustomPan = panIdx === CUSTOM_PAN_IDX;
  const customArea  = isCustomPan ? (parseFloat(panW)||0) * (parseFloat(panH)||0) : 0;
  const customCalcR = isCustomPan ? Math.round(customArea * 1.5) : 0;
  const rate = customR > 0 ? parseFloat(customR) : (isCustomPan ? customCalcR : pan.rate);
  const area = isCustomPan ? customArea : pan.area;
  const eff  = area > 0 ? (rate / area).toFixed(2) : '—';
  const sy   = syrupY(sapGal, sapBrix);
  const bh   = boilTime(sapGal, sapBrix, rate);
  const u    = units === 'L' ? 'L' : 'gal';
  const conv = v => units === 'L' ? (v*3.78541).toFixed(1) : v.toFixed(1);
  const fuel = FUELS.find(f=>f.label===fuelType) || FUELS[0];
  const uNeeded = sapGal / fuel.spu;
  const cost    = uNeeded * fuelCost;

  useEffect(() => { setEvapRate(rate); }, [rate]);
  useEffect(() => { ls.set('sg_batches', batches); }, [batches]);

  const gpsLoc = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const d = await r.json();
          const a = d.address || {};
          const city  = a.city || a.town || a.village || a.hamlet || a.county || '';
          const region = a.state || a.province || a.region || '';
          const loc = [city, region].filter(Boolean).join(', ');
          if (loc) setBf(p => ({ ...p, loc }));
        } catch(e) {}
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const addBatch = () => {
    if (!bf.syrupOut && !bf.sapIn) return;
    setBatches(p => [...p, { ...bf, id:Date.now() }]);
    setBf({ date:new Date().toISOString().split('T')[0], sapIn:'', syrupOut:'', grade:'amber', loc:'', notes:'' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <CardIcon bg="#2b1a0d" icon="flame" />
          {t(lang,'evapTitle')}
        </div>
        <div className="field-label">{t(lang,'panSize')}</div>
        <select value={panIdx} onChange={e=>{setPanIdx(+e.target.value);setCustomR('');}} style={{ marginBottom:12 }}>
          {PAN_SIZES.map((p,i)=><option key={i} value={i}>{p.label}</option>)}
        </select>
        {isCustomPan && (
          <div className="two-col" style={{ marginBottom:12 }}>
            <div>
              <div className="field-label">Width (ft)</div>
              <NumInput value={panW} onChange={setPanW} min={1} max={20} step={0.5} placeholder="e.g. 2" />
            </div>
            <div>
              <div className="field-label">Length (ft)</div>
              <NumInput value={panH} onChange={setPanH} min={1} max={30} step={0.5} placeholder="e.g. 6" />
            </div>
          </div>
        )}
        {isCustomPan && customArea > 0 && (
          <div style={{ fontSize:12, color:'#e0a44a', marginBottom:10 }}>
            {customArea} ft² → estimated <strong>{customCalcR} GPH</strong> at 1.5 gal/ft²/hr
          </div>
        )}
        <div className="field-label">{t(lang,'customRate')}</div>
        <NumInput value={customR} onChange={setCustomR} min={1} max={500} step={1} placeholder={isCustomPan && customCalcR > 0 ? `Leave blank for ~${customCalcR} GPH` : lang==='fr'?`Laisser vide — ~${pan.rate} GPH`:`Leave blank for ~${pan.rate} GPH`} />
        <div className="result-box orange" style={{ marginTop:12 }}>
          <div className="two-col">
            <div><div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'boilRate')}</div><div className="result-value" style={{ color:'#e0a44a' }}>{rate} GPH</div></div>
            <div><div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'efficiency')}</div><div className="result-value" style={{ color:'#e0a44a' }}>{eff} gal/ft²/hr</div></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#2b1a0d" icon="clock" />
          {t(lang,'boilTime')}
        </div>
        <div className="two-col" style={{ marginBottom:12 }}>
          <div><div className="field-label">{t(lang,'sapToBoil')} ({u})</div><NumInput value={sapGal} onChange={setSapGal} min={1} max={100000} step={1} /></div>
          <div><div className="field-label">{t(lang,'sapBrix')}</div><input type="number" value={sapBrix} onChange={e=>setSapBrix(parseFloat(e.target.value)||0)} onFocus={e=>e.target.select()} min={0.5} max={10} step={0.1} /></div>
        </div>
        <div className="result-box orange">
          <div className="two-col">
            <div><div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'boilTimeRes')}</div><div className="result-value" style={{ color:'#e0a44a' }}>{fmtH(bh)}</div></div>
            <div><div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'syrupYield')}</div><div className="result-value" style={{ color:'#e0a44a' }}>{conv(sy)} {u}</div></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#0d2b15" icon="dollar" />
          {t(lang,'fuelCost')}
          </div>
        <div className="field-label">{t(lang,'fuelType')}</div>
        <select value={fuelType} onChange={e=>setFuelType(e.target.value)} style={{ marginBottom:12 }}>
          {FUELS.map(f=><option key={f.label} value={f.label}>{fuelLabel(f,lang)}</option>)}
        </select>
        <div className="field-label">{t(lang,'costPerUnit')} {fuel.unit} ($)</div>
        <NumInput value={fuelCost} onChange={setFuelCost} min={1} max={10000} step={1} />
        <div className="result-box green" style={{ marginTop:12 }}>
          <div className="two-col">
            <div><div className="result-label" style={{ color:'#3fb950' }}>{t(lang,'fuelNeeded')}</div><div className="result-value" style={{ color:'#3fb950' }}>{fmt(uNeeded,2)} {fuel.unit}s</div></div>
            <div><div className="result-label" style={{ color:'#3fb950' }}>{t(lang,'estCost')}</div><div className="result-value" style={{ color:'#3fb950' }}>${fmt(cost,2)}</div></div>
          </div>
          <div style={{ fontSize:13, color:'#5a6a7a', marginTop:6 }}>{t(lang,'forSap')} {conv(sapGal)} {u} {t(lang,'ofSap')}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#0a2b15" icon="dollar" />
          {t(lang,'trueCost')}
        </div>
        <div className="section-header">{t(lang,'fuelFromAbove')}</div>
        <InfoRow label={fuelLabel(fuel,lang)} value={`$${fmt(cost,2)}`} />
        <div className="section-header" style={{ marginTop:10 }}>{t(lang,'labour')}</div>
        <div className="two-col" style={{ marginBottom:10 }}>
          <div><div className="field-label">{t(lang,'hoursThisSeason')}</div><NumInput value={laborHrs} onChange={setLaborHrs} min={0} max={10000} step={0.5} /></div>
          <div><div className="field-label">{t(lang,'dollarsPerHr')}</div><NumInput value={laborRate} onChange={setLaborRate} min={0} max={500} step={1} /></div>
        </div>
        <div className="section-header">{t(lang,'supplies')}</div>
        <div className="two-col" style={{ marginBottom:10 }}>
          <div><div className="field-label">{t(lang,'spoutsLabel')}</div><NumInput value={spoutCost} onChange={setSpoutCost} min={0} step={1} /></div>
          <div><div className="field-label">{t(lang,'bottlesLabel')}</div><NumInput value={bottleCost} onChange={setBottleCost} min={0} step={1} /></div>
        </div>
        <div className="two-col" style={{ marginBottom:12 }}>
          <div><div className="field-label">{t(lang,'filtersLabel')}</div><NumInput value={filterCost} onChange={setFilterCost} min={0} step={1} /></div>
          <div><div className="field-label">{t(lang,'otherLabel')}</div><NumInput value={otherCost} onChange={setOtherCost} min={0} step={1} /></div>
        </div>
        {(() => {
          const laborTotal   = laborHrs * laborRate;
          const suppliesTotal= parseFloat(spoutCost||0) + parseFloat(bottleCost||0) + parseFloat(filterCost||0) + parseFloat(otherCost||0);
          const totalCost    = cost + laborTotal + suppliesTotal;
          const syrupYield   = syrupY(sapGal, sapBrix);
          const cpg          = syrupYield > 0 ? totalCost / syrupYield : 0;
          const u2 = units === 'L' ? 'L' : 'gal';
          return (
            <div className="result-box green">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                {[
                  { l:t(lang,'fuel'),     v:`$${fmt(cost,0)}` },
                  { l:t(lang,'labour'),   v:`$${fmt(laborTotal,0)}` },
                  { l:t(lang,'supplies'), v:`$${fmt(suppliesTotal,0)}` },
                  { l:t(lang,'total'),    v:`$${fmt(totalCost,0)}` },
                ].map(r=>(
                  <div key={r.l} style={{ textAlign:'center', background:'#081e0e', borderRadius:8, padding:'8px 4px' }}>
                    <div style={{ fontSize:10, color:'#5a6a7a', fontWeight:600 }}>{r.l}</div>
                    <div style={{ fontWeight:700, color:'#3fb950', fontSize:16 }}>{r.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign:'center', borderTop:'1px solid #1a4a25', paddingTop:10 }}>
                <div style={{ fontSize:11, color:'#3fb950', fontWeight:600, letterSpacing:'0.08em', marginBottom:3 }}>{t(lang,'costPerGal').replace('GAL',u2.toUpperCase())}</div>
                <div style={{ fontSize:34, fontWeight:800, color:'#3fb950' }}>${fmt(cpg,2)}</div>
                <div style={{ color:'#5a6a7a', fontSize:12, marginTop:2 }}>{t(lang,'forSap')} {fmt(syrupYield,1)} {u2} {t(lang,'sapSyrup')} — {fmt(sapGal,0)} {u2} {t(lang,'sapSap')}</div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:8 }}>
          <CardIcon bg="#0d1a2b" icon="dollar" />
          {t(lang,'retailTitle')}
        </div>
        <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:12 }}>{t(lang,'retailDesc')}</div>
        <div className="two-col" style={{ marginBottom:12 }}>
          <div>
            <div className="field-label">{t(lang,'marginLabel')}</div>
            <NumInput value={retailMargin} onChange={setRetailMargin} min={0} max={95} step={1} />
          </div>
          <div>
            <div className="field-label">{t(lang,'yourCostPerGal')} <span style={{ color:'#3d5068', fontSize:11 }}>({t(lang,'orEnterManual')})</span></div>
            <NumInput value={retailCostOverride} onChange={setRetailCostOverride} min={0} step={0.5} placeholder="auto" />
          </div>
        </div>
        {(() => {
          const laborTotal    = laborHrs * laborRate;
          const suppliesTotal = parseFloat(spoutCost||0)+parseFloat(bottleCost||0)+parseFloat(filterCost||0)+parseFloat(otherCost||0);
          const totalCost     = cost + laborTotal + suppliesTotal;
          const syrupYield    = syrupY(sapGal, sapBrix);
          const autoCpg       = syrupYield > 0 ? totalCost / syrupYield : 0;
          const cpg           = parseFloat(retailCostOverride) > 0 ? parseFloat(retailCostOverride) : autoCpg;
          const margin        = Math.min(Math.max(parseFloat(retailMargin)||40, 0), 95) / 100;
          // Bottle sizes in gallons
          const BOTTLE_SIZES  = [
            { label:'250 mL', gal:0.0660 },
            { label:'500 mL', gal:0.1321 },
            { label:'1 L',    gal:0.2642 },
            { label:'1 qt',   gal:0.25   },
            { label:'1 gal',  gal:1.0    },
          ];
          // USDA bulk benchmark price by grade (approx 2024, $/gal)
          const USDA_GRADES = [
            { grade:t(lang,'gradeGolden'), price:45 },
            { grade:t(lang,'gradeAmber'),  price:38 },
            { grade:t(lang,'gradeDark'),   price:34 },
            { grade:t(lang,'gradeVeryDark'), price:30 },
          ];
          return (
            <>
              <div className="result-box blue" style={{ padding:'10px 14px', marginBottom:14 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:4, marginBottom:6 }}>
                  <div style={{ color:'#5a6a7a', fontSize:11, fontWeight:600 }}>{t(lang,'bottleSize')}</div>
                  <div style={{ color:'#5a6a7a', fontSize:11, fontWeight:600, textAlign:'center' }}>{t(lang,'costPerBottle')}</div>
                  <div style={{ color:'#5a6a7a', fontSize:11, fontWeight:600, textAlign:'center' }}>{t(lang,'retail')}</div>
                  <div style={{ color:'#5a6a7a', fontSize:11, fontWeight:600, textAlign:'center' }}>{t(lang,'profit')}</div>
                </div>
                {BOTTLE_SIZES.map(bs=>{
                  const bottleCpg  = cpg * bs.gal;
                  const retailP    = margin < 1 ? bottleCpg / (1 - margin) : 0;
                  const profitP    = retailP - bottleCpg;
                  return (
                    <div key={bs.label} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:4, padding:'7px 0', borderTop:'1px solid #1e2d3d' }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{bs.label}</div>
                      <div style={{ textAlign:'center', color:'#8b949e', fontSize:13 }}>${fmt(bottleCpg,2)}</div>
                      <div style={{ textAlign:'center', color:'#58a6ff', fontWeight:700, fontSize:14 }}>${fmt(retailP,2)}</div>
                      <div style={{ textAlign:'center', color:'#3fb950', fontSize:13 }}>${fmt(profitP,2)}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:'#0f1720', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:'#5a6a7a', fontWeight:600, letterSpacing:'0.08em', marginBottom:8 }}>{t(lang,'usdaBenchmark')}</div>
                {USDA_GRADES.map(g=>(
                  <div key={g.grade} style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid #1e2d3d', padding:'6px 0', fontSize:13 }}>
                    <span style={{ color:'#8b949e' }}>{g.grade}</span>
                    <span style={{ color:'#e0a44a', fontWeight:600 }}>${g.price}/gal</span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#2b1a0d" icon="clipboard" />
          {t(lang,'batchLog')}
          <button onClick={()=>setShowForm(s=>!s)} style={{ marginLeft:'auto', background:'#e0a44a', color:'#0d1117', border:'none', borderRadius:8, padding:'7px 14px', fontWeight:600, fontSize:13 }}>{t(lang,'addBatch')}</button>
        </div>
        {showForm && (
          <div style={{ background:'#0f1720', borderRadius:10, padding:14, marginBottom:12 }}>
            <div className="two-col" style={{ marginBottom:8 }}>
              <div><div className="field-label">{t(lang,'date')}</div><input type="date" value={bf.date} onChange={e=>setBf(p=>({...p,date:e.target.value}))} /></div>
              <div><div className="field-label">Grade</div>
                <select value={bf.grade} onChange={e=>setBf(p=>({...p,grade:e.target.value}))} style={{ background:'#0f1720', color:'#c9d1d9', border:'1px solid #2a3a4a', borderRadius:8, padding:'6px 10px', fontSize:14 }}>
                  {Object.entries(BATCH_GRADES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div className="two-col" style={{ marginBottom:8 }}>
              <div><div className="field-label">{t(lang,'sapIn')} ({u})</div><NumInput value={bf.sapIn} onChange={v=>setBf(p=>({...p,sapIn:v}))} min={0} step={1} /></div>
              <div><div className="field-label">{t(lang,'syrupOut')} ({u})</div><NumInput value={bf.syrupOut} onChange={v=>setBf(p=>({...p,syrupOut:v}))} min={0} step={0.1} /></div>
            </div>
            <div className="two-col" style={{ marginBottom:8 }}>
              <div><div className="field-label">Location</div>
                <div style={{ display:'flex', gap:6 }}>
                  <input type="text" value={bf.loc} onChange={e=>setBf(p=>({...p,loc:e.target.value}))} placeholder="e.g. Craftsbury, VT" style={{ flex:1 }} />
                  <button onClick={gpsLoc} disabled={locLoading} title="Use my location" style={{ background:'rgba(45,212,167,0.1)', border:'1px solid rgba(45,212,167,0.25)', borderRadius:8, padding:'0 10px', fontSize:16, cursor:'pointer', color: locLoading ? '#3d5068' : '#2dd4a7', flexShrink:0 }}>
                    {locLoading ? '⏳' : '📍'}
                  </button>
                </div>
              </div>
              <div><div className="field-label">{t(lang,'notes')}</div><input type="text" value={bf.notes} onChange={e=>setBf(p=>({...p,notes:e.target.value}))} placeholder={t(lang,'optional')} /></div>
            </div>
            <div className="two-col">
              <button className="btn-secondary" onClick={()=>setShowForm(false)}>{t(lang,'cancel')}</button>
              <button className="btn-primary" onClick={addBatch}>{t(lang,'saveBatch')}</button>
            </div>
          </div>
        )}
        {batches.length===0 && !showForm && (
          <div style={{ textAlign:'center', color:'#3d5068', padding:'16px 0', fontSize:14 }}>{t(lang,'noBatchesLong')}</div>
        )}
        {batches.length>0 && (
          <div style={{ fontSize:11, color:'#3d5068', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <span>🏷️</span>
            <span>Tap <strong style={{color:'#2dd4a7'}}>Label</strong> on any batch to download a printable provenance label with a QR code.</span>
          </div>
        )}
        {batches.map((b,i) => {
          const bg = BATCH_GRADES[b.grade] || BATCH_GRADES.amber;
          return (
            <div key={b.id} className="log-entry" style={{ gap:8 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:bg.color, flexShrink:0, marginTop:3 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{b.date}{b.loc ? <span style={{ fontWeight:400, color:'#5a6a7a', fontSize:12 }}> · {b.loc}</span> : ''}</div>
                <div style={{ color:'#5a6a7a', fontSize:12 }}>{bg.name} · Sap: {b.sapIn} {u} → Syrup: {b.syrupOut} {u}{b.notes?` • ${b.notes}`:''}</div>
              </div>
              <button
                onClick={()=>_downloadBatchLabel(b, i+1, season, trees, units)}
                title="Download provenance label PNG"
                style={{ background:'rgba(45,212,167,0.1)', border:'1px solid rgba(45,212,167,0.25)', borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:700, color:'#2dd4a7', cursor:'pointer', flexShrink:0, letterSpacing:'0.03em', lineHeight:1.3, textAlign:'center' }}>
                🏷️<br/>Label
              </button>
              <button className="delete-btn" onClick={()=>setBatches(p=>p.filter((_,j)=>j!==i))}><I.trash size={15} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── R/O TAB ──────────────────────────────────────────────────────────────────
function ROTab({ sapBrix, setSapBrix, evapRate, fuelType, fuelCost, units, lang='en' }) {
  const [inSap,   setInSap]   = useState(500);
  const [tgtBrix, setTgtBrix] = useState(8);
  const u    = units === 'L' ? 'L' : 'gal';
  const conv = v => units === 'L' ? (v*3.78541).toFixed(1) : v.toFixed(1);
  const conc    = roConc(inSap, sapBrix, tgtBrix);
  const perm    = inSap - conc;
  const factor  = tgtBrix / sapBrix;
  const pctRem  = (perm / inSap) * 100;
  const fuel    = FUELS.find(f=>f.label===fuelType)||FUELS[0];
  const boilNoRO  = boilTime(inSap, sapBrix, evapRate);
  const boilWithRO= boilTime(conc,  tgtBrix, evapRate);
  const saved   = boilNoRO - boilWithRO;
  const fSaved  = (saved * evapRate) / fuel.spu;
  const mSaved  = fSaved * fuelCost;

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <CardIcon bg="#0d1a2b" icon="filter" />
          {t(lang,'roConcentration')}
        </div>
        <div className="two-col" style={{ marginBottom:10 }}>
          <div><div className="field-label">{t(lang,'inputSap')} ({u})</div><NumInput value={inSap} onChange={setInSap} min={1} max={100000} step={1} /></div>
          <div><div className="field-label">{t(lang,'sapBrix')}</div><input type="number" value={sapBrix} onChange={e=>setSapBrix(parseFloat(e.target.value)||0)} onFocus={e=>e.target.select()} min={0.5} max={10} step={0.1} /></div>
        </div>
        <div className="field-label">{t(lang,'targetBrix')}</div>
        <NumInput value={tgtBrix} onChange={setTgtBrix} min={1} max={20} step={0.5} />
        <div className="result-box blue" style={{ marginTop:12 }}>
          <div className="two-col" style={{ marginBottom:8 }}>
            <div><div className="result-label" style={{ color:'#58a6ff' }}>{t(lang,'concentrate')}</div><div className="result-value" style={{ color:'#58a6ff' }}>{conv(conc)} {u}</div><div className="result-sub">{fmt(tgtBrix,1)}° Brix</div></div>
            <div><div className="result-label" style={{ color:'#58a6ff' }}>{t(lang,'permeate')}</div><div className="result-value" style={{ color:'#58a6ff' }}>{conv(perm)} {u}</div><div className="result-sub">{t(lang,'waterRemoved')}</div></div>
          </div>
          <div style={{ borderTop:'1px solid #30363d', paddingTop:8, fontSize:14 }}>
            <strong>{fmt(factor,1)}x</strong> {lang==='fr'?'concentration':'concentration'} • <strong>{fmt(pctRem,1)}%</strong> {t(lang,'waterRemoved').toLowerCase()}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#0d2b15" icon="trendUp" />
          {t(lang,'roSavings')}
        </div>
        <div className="two-col">
          <div className="result-box green"><div className="result-label" style={{ color:'#3fb950' }}>{t(lang,'boilTimeSaved')}</div><div className="result-value" style={{ color:'#3fb950' }}>{fmt(saved,1)} hrs</div><div className="result-sub">@ {evapRate} gal/hr {lang==='fr'?"taux d'évap.":'evap rate'}</div></div>
          <div className="result-box green"><div className="result-label" style={{ color:'#3fb950' }}>{t(lang,'fuelSaved')}</div><div className="result-value" style={{ color:'#3fb950' }}>${fmt(mSaved,0)}</div><div className="result-sub">@ ${fuelCost}/{fuel.unit}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#1a0d2b" icon="percent" />
          {t(lang,'multiPass')}
        </div>
        <div style={{ color:'#5a6a7a', fontSize:14, marginBottom:10 }}>{t(lang,'startingBrix')} {sapBrix}° Brix:</div>
        {[{labelKey:'singlePass',brix:sapBrix*2},{labelKey:'doublePass',brix:sapBrix*4},{labelKey:'triplePass',brix:sapBrix*8}].map(p=>(
          <div key={p.labelKey} style={{ display:'flex', justifyContent:'space-between', background:'#100a1e', borderRadius:8, padding:'12px 16px', marginBottom:6 }}>
            <span style={{ color:'#c990ff', fontWeight:500 }}>{t(lang,p.labelKey)}</span>
            <span style={{ fontWeight:700 }}>{fmt(p.brix,1)}° Brix</span>
          </div>
        ))}
        <div style={{ color:'#3d5068', fontSize:12, marginTop:8 }}>{t(lang,'maxPractical')}</div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#1c2128" icon="filter" />
          {t(lang,'roGuidelinesTitle')}
        </div>
        {['roTip1','roTip2','roTip3','roTip4','roTip5'].map((key,i)=><TipItem key={i}>{t(lang,key)}</TipItem>)}
      </div>
    </div>
  );
}

// ─── FINISH TAB ───────────────────────────────────────────────────────────────
function FinishTab({ waterBP, setWaterBP, lang='en' }) {
  const [syBrix,  setSyBrix]  = useState(66);
  const [syTemp,  setSyTemp]  = useState(211);
  const [baumeIn, setBaumeIn] = useState(36);
  const [plates,  setPlates]  = useState(9);
  const [psKey,   setPsKey]   = useState('7" plates');
  const [gal2f,   setGal2f]   = useState(10);
  const [szn,     setSzn]     = useState('early'); // 'early' | 'late'
  const [deMode,  setDeMode]  = useState('precoat'); // 'precoat' | 'straight'

  const finT  = finTemp(waterBP);
  const corr  = denCorr(syTemp);
  const corrB = syBrix + corr;
  const inR   = corrB >= 66 && corrB <= 68.9;
  const tooLt = corrB < 66;
  const sColor= inR ? '#3fb950' : '#f0883e';
  const sText = inR ? t(lang,'perfectDensity') : tooLt ? t(lang,'tooLight') : t(lang,'tooDense');
  const cpP          = PLATE_CUPS[psKey] || 3.25;
  const cupsPerPlate = plates * cpP;
  // Auto-recommend method by batch size
  const recMode = gal2f > 25 ? 'precoat' : 'straight';
  // Per-gallon rates:
  //   Precoat cross-check:  early 0.2 cups/gal, late 0.5 cups/gal
  //   Straight mix:         early 0.5 cups/gal, late 0.75 cups/gal
  const galRate = szn === 'late'
    ? (deMode === 'straight' ? 0.75 : 0.5)
    : (deMode === 'straight' ? 0.5  : 0.2);
  const cupsPerGal = gal2f > 0 ? gal2f * galRate : 0;
  const cups = deMode === 'straight'
    ? (gal2f > 0 ? cupsPerGal : 0)
    : (gal2f > 0 ? Math.max(cupsPerPlate, cupsPerGal) : cupsPerPlate);
  // Filter-grade DE bulk density ≈ 10-12 lbs/ft³ = ~0.1 lbs/cup (Dicalite, Celite grades)
  const lbs   = cups * 0.1;
  const oz    = lbs * 16;

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <CardIcon bg="#2b1a0d" icon="thermometer" />
          {t(lang,'finishTitle')}
        </div>
        <div className="field-label">{t(lang,'waterBP')}</div>
        <NumInput value={waterBP} onChange={setWaterBP} min={200} max={215} step={0.1} />
        <div style={{ fontSize:12, color:'#5a6a7a', marginTop:5, marginBottom:10 }}>{t(lang,'sharedWithBoil')}</div>
        <div className="result-box orange">
          <div className="result-label" style={{ color:'#e0a44a', textAlign:'center' }}>{t(lang,'finishAt')}</div>
          <div className="result-value" style={{ color:'#e0a44a', textAlign:'center', fontSize:36 }}>{fmt(finT,1)}°F</div>
          <div style={{ color:'#5a6a7a', textAlign:'center', marginTop:4 }}>= {fmt((finT-32)*5/9,1)}°C</div>
          <div style={{ color:'#5a6a7a', textAlign:'center', fontSize:13 }}>{lang==='fr'?"7,1°F au-dessus du point d'ébullition de l'eau":'7.1°F above water boiling point'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#2b1a0d" icon="scale" />
          {t(lang,'densityCheck')}
        </div>
        <div className="two-col" style={{ marginBottom:12 }}>
          <div><div className="field-label">{t(lang,'syrupBrix')}</div><NumInput value={syBrix} onChange={setSyBrix} min={60} max={75} step={0.1} /></div>
          <div><div className="field-label">{t(lang,'syrupTemp')}</div><NumInput value={syTemp} onChange={setSyTemp} min={60} max={220} step={1} /></div>
        </div>
        <div className="result-box orange" style={{ marginBottom:10 }}>
          <div style={{ fontWeight:600, color:'#e0a44a', fontSize:14 }}>{t(lang,'tempCorrection')}: At {syTemp}°F, {corr>=0?'add':'subtract'} {fmt(Math.abs(corr),2)}° to reading</div>
          <div style={{ color:'#5a6a7a', marginTop:4 }}>{t(lang,'correctedBrix')}: <strong style={{ color:'#e6edf3' }}>{fmt(corrB,1)}°</strong></div>
        </div>
        <div style={{ background: inR?'#0d2b15':'#2b1a0d', borderRadius:10, padding:'14px 16px', textAlign:'center', border:`1px solid ${inR?'#1a4a25':'#4a3020'}` }}>
          <div style={{ fontWeight:700, fontSize:18, color:sColor }}>{sText}</div>
          <div style={{ color:'#5a6a7a', fontSize:13, marginTop:4 }}>{t(lang,'legalRange')}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#0d1a2b" icon="droplet" />
          Brix ↔ Baumé
        </div>
        <div className="two-col">
          <div style={{ background:'#0d1a2b', borderRadius:10, padding:14, border:'1px solid #1a304a' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#58a6ff', letterSpacing:'0.08em', marginBottom:6 }}>FROM BRIX</div>
            <div style={{ fontSize:26, fontWeight:700 }}>{fmt(syBrix,1)}°</div>
            <div style={{ color:'#58a6ff', fontWeight:600, marginTop:4 }}>= {fmt(brixToBe(syBrix),1)}° Bé</div>
          </div>
          <div style={{ background:'#1a0d2b', borderRadius:10, padding:14, border:'1px solid #2f1a4a' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#c990ff', letterSpacing:'0.08em', marginBottom:6 }}>ENTER BAUMÉ</div>
            <NumInput value={baumeIn} onChange={setBaumeIn} min={30} max={50} step={0.1} />
            <div style={{ color:'#c990ff', fontSize:13, marginTop:6 }}>= {fmt(beToBrix(baumeIn),1)}° Brix</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <CardIcon bg="#1c2128" icon="layers" />
          <div>
            <div>{t(lang,'filterPress')}</div>
            <div style={{ fontSize:12, color:'#5a6a7a', fontWeight:400 }}>Step-by-step DE Calculator</div>
          </div>
        </div>

        {/* ── STEP 1: Gallons ── */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:22, height:22, borderRadius:'50%', background:'#2dd4a7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#061a14', flexShrink:0 }}>1</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#e6edf3' }}>How many gallons are you filtering right now?</div>
        </div>
        <NumInput value={gal2f} onChange={setGal2f} min={0} max={1000} step={1} />
        <div style={{ fontSize:12, color:'#3d5068', marginTop:4, marginBottom:14 }}>Enter the gallons sitting in your finishing pan ready to press</div>

        {/* ── Auto recommendation banner ── */}
        {gal2f > 0 && (() => {
          const isSmall = gal2f <= 10;
          const isMed   = gal2f > 10 && gal2f <= 25;
          const isLarge = gal2f > 25;
          const rColor  = isLarge ? '#58a6ff' : '#2dd4a7';
          const rBg     = isLarge ? 'rgba(88,166,255,0.08)' : 'rgba(45,212,167,0.08)';
          const rBorder = isLarge ? 'rgba(88,166,255,0.22)' : 'rgba(45,212,167,0.22)';
          const rIcon   = isLarge ? '🔵' : '🟢';
          const rTitle  = isSmall ? 'Small batch — use Straight Mix (no precharge needed)'
                        : isMed   ? 'Medium batch — Straight Mix works great; Precharge optional'
                        :           'Large batch — Precharge recommended for best results';
          const rDesc   = isSmall ? 'Under 10 gallons: skip the precharge step entirely. Just stir DE into your hot syrup and press. Saves time and works perfectly at this volume.'
                        : isMed   ? '10–25 gallons: straight mix still works well and is simpler. Switch to Precharge if you want a cleaner first pour or you\'re running multiple batches.'
                        :           'Over 25 gallons: precharging the plates first pays off. You\'ll get better efficiency, consistent flow, and cleaner syrup from the very first drop.';
          return (
            <div style={{ background:rBg, border:`1px solid ${rBorder}`, borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
              <div style={{ fontWeight:700, color:rColor, fontSize:13, marginBottom:4 }}>{rIcon} {rTitle}</div>
              <div style={{ fontSize:12, color:'#8b949e', lineHeight:1.5 }}>{rDesc}</div>
            </div>
          );
        })()}

        {/* ── STEP 2: Method ── */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ width:22, height:22, borderRadius:'50%', background:'#2dd4a7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#061a14', flexShrink:0 }}>2</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#e6edf3' }}>Choose your method</div>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[
            { id:'straight', label:'Straight Mix',    sub:'Stir DE into the syrup and press. Easiest — no precharge.',       color:'#2dd4a7', bg:'rgba(45,212,167,0.08)'  },
            { id:'precoat',  label:'Precharge First', sub:'Coat the plates with DE-water first, then run your syrup through.', color:'#58a6ff', bg:'rgba(88,166,255,0.08)' },
          ].map(m => {
            const isRec = m.id === recMode;
            const isSel = m.id === deMode;
            return (
              <button key={m.id} onClick={() => setDeMode(m.id)} style={{
                flex:1, padding:'10px 10px 8px', borderRadius:12,
                border:`1px solid ${isSel ? m.color : '#1e2d3d'}`,
                background: isSel ? m.bg : 'transparent',
                cursor:'pointer', textAlign:'left', transition:'all 0.15s', position:'relative'
              }}>
                {isRec && <div style={{ position:'absolute', top:6, right:8, fontSize:9, fontWeight:800, color:m.color, letterSpacing:'0.06em', opacity:0.8 }}>★ RECOMMENDED</div>}
                <div style={{ fontSize:13, fontWeight:700, color: isSel ? m.color : '#8b949e', marginBottom:3, paddingRight:isRec?52:0 }}>{m.label}</div>
                <div style={{ fontSize:11, color:'#3d5068', lineHeight:1.4 }}>{m.sub}</div>
              </button>
            );
          })}
        </div>

        {/* ── STEP 3: Syrup color ── */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ width:22, height:22, borderRadius:'50%', background:'#2dd4a7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#061a14', flexShrink:0 }}>3</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#e6edf3' }}>What does your syrup look like?</div>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[
            { id:'early', label:'Light / Amber',   sub:'Golden or Amber Rich — earlier in the season', color:'#f5c842', bg:'rgba(245,200,66,0.08)',  border:'rgba(245,200,66,0.22)' },
            { id:'late',  label:'Dark / Very Dark', sub:'Dark Robust or Very Dark — later in the season', color:'#c47a28', bg:'rgba(196,122,40,0.08)',  border:'rgba(196,122,40,0.22)' },
          ].map(s => (
            <button key={s.id} onClick={() => setSzn(s.id)} style={{
              flex:1, padding:'10px 10px', borderRadius:12,
              border:`1px solid ${szn===s.id ? s.border : '#1e2d3d'}`,
              background: szn===s.id ? s.bg : 'transparent',
              cursor:'pointer', textAlign:'left', transition:'all 0.15s'
            }}>
              <div style={{ fontSize:13, fontWeight:700, color: szn===s.id ? s.color : '#8b949e', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:11, color:'#3d5068', lineHeight:1.4 }}>{s.sub}</div>
            </button>
          ))}
        </div>

        {/* ── STEP 4: Press setup (precharge only) ── */}
        {deMode === 'precoat' && (<>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'#2dd4a7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#061a14', flexShrink:0 }}>4</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#e6edf3' }}>Your press setup</div>
          </div>
          <div className="two-col" style={{ marginBottom:16 }}>
            <div><div className="field-label">Number of plates</div><NumInput value={plates} onChange={setPlates} min={1} max={50} step={1} /></div>
            <div><div className="field-label">Plate size</div><select value={psKey} onChange={e=>setPsKey(e.target.value)} style={{ width:'100%', padding:'9px 10px', borderRadius:10, background:'#0d1520', border:'1px solid #1e2d3d', color:'#e6edf3', fontSize:14 }}>{Object.keys(PLATE_CUPS).map(k=><option key={k}>{k}</option>)}</select></div>
          </div>
        </>)}

        {/* ── BIG RESULT ── */}
        {gal2f > 0 ? (
          <div style={{ background:'linear-gradient(135deg,#081f17 0%,#061512 100%)', border:'1px solid rgba(45,212,167,0.3)', borderRadius:16, padding:'20px 16px', textAlign:'center', marginBottom:16 }}>
            <div style={{ fontSize:11, letterSpacing:'0.12em', color:'#2dd4a7', fontWeight:700, marginBottom:6 }}>YOU NEED</div>
            <div style={{ fontSize:52, fontWeight:800, color:'#2dd4a7', lineHeight:1, marginBottom:4 }}>{fmt(cups,1)}</div>
            <div style={{ fontSize:16, color:'#2dd4a7', opacity:0.7, marginBottom:12 }}>cups of DE</div>
            <div style={{ display:'flex', gap:0, justifyContent:'center' }}>
              <div style={{ padding:'8px 20px', borderRight:'1px solid #131e2c' }}>
                <div style={{ fontSize:10, color:'#3d5068', letterSpacing:'0.08em', marginBottom:2 }}>TABLESPOONS</div>
                <div style={{ fontWeight:700, color:'#8b949e', fontSize:16 }}>{Math.round(cups*16)}</div>
              </div>
              <div style={{ padding:'8px 20px', borderRight:'1px solid #131e2c' }}>
                <div style={{ fontSize:10, color:'#3d5068', letterSpacing:'0.08em', marginBottom:2 }}>OUNCES</div>
                <div style={{ fontWeight:700, color:'#8b949e', fontSize:16 }}>{fmt(oz,1)}</div>
              </div>
              <div style={{ padding:'8px 20px' }}>
                <div style={{ fontSize:10, color:'#3d5068', letterSpacing:'0.08em', marginBottom:2 }}>POUNDS</div>
                <div style={{ fontWeight:700, color:'#8b949e', fontSize:16 }}>{fmt(lbs,2)}</div>
              </div>
            </div>
            {szn === 'late' && (
              <div style={{ marginTop:10, fontSize:12, color:'#e0a44a', background:'rgba(224,164,74,0.1)', borderRadius:8, padding:'5px 12px', display:'inline-block' }}>
                ⚠ Late-season rate applied — dark syrup needs more DE
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:'#0d1520', borderRadius:16, padding:'20px 16px', textAlign:'center', marginBottom:16, border:'1px solid #1e2d3d' }}>
            <div style={{ fontSize:14, color:'#3d5068' }}>Enter your gallons above to get your DE amount</div>
          </div>
        )}

        {/* ── HOW TO DO IT ── */}
        <div className="section-header" style={{ marginBottom:10 }}>
          {deMode === 'straight' ? 'HOW TO DO IT — STRAIGHT MIX' : 'HOW TO DO IT — PRECHARGE METHOD'}
        </div>
        {deMode === 'straight' && (
          <div style={{ background:'rgba(88,166,255,0.08)', border:'1px solid rgba(88,166,255,0.22)', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#58a6ff', marginBottom:4 }}>👀 Heads up before you start</div>
            <div style={{ fontSize:12, color:'#8b949e', lineHeight:1.6 }}>
              The first syrup out of the press <strong style={{ color:'#e6edf3' }}>will be cloudy</strong> — this is completely normal. The DE is still building up a cake on the plates. Have a small pot or cup ready at the spout and keep running it back into your pot until the syrup comes out clear. On a small batch like yours this might take {gal2f <= 5 ? 'just a cup or two' : 'a quart or so'} — don't collect anything until it's running clear.
            </div>
          </div>
        )}
        {(deMode === 'straight' ? [
          { step:`Heat your syrup to 185–190°F`, detail:'It needs to be hot so the DE mixes in and doesn\'t clump. Don\'t skip this — cold syrup won\'t filter well.' },
          { step:`Measure out ${fmt(cups,1)} cups of food-grade DE`, detail:'Use filter-press grade DE only (like Dicalite or Celite). Pool filter DE is not food safe — don\'t use it.' },
          { step:'Stir the DE into the hot syrup until fully dissolved', detail:'Whisk or stir thoroughly for a minute or two. You want it evenly suspended, no white clumps sitting on the bottom.' },
          { step:'Load the press slowly and start filtering', detail:'The first bit that comes out will be cloudy — that\'s normal. The DE is still building up a cake on the plates.' },
          { step:'Catch the cloudy first pour and return it to the pot', detail:'Keep a small cup or pot at the spout. Once the syrup runs clear and golden, switch over to your collection vessel.' },
          { step:'Watch your pressure gauge', detail:'Pressure will climb slowly as the cake builds — that\'s normal. Stop if it hits 40 PSI. That means the plates are full and it\'s time to clean and repack.' },
        ] : [
          { step:'Fill the press with 1–2 gallons of hot water (150–170°F)', detail:'This is what carries the DE onto the plates. Don\'t use syrup — hot water only. The water gets drained out before you run syrup.' },
          { step:`Add ${fmt(cups,1)} cups of DE to the hot water and stir`, detail:`This is your full precharge amount for the ${plates}-plate press${szn==='late'?' at the late-season rate':''}. Stir it into the hot water until fully mixed — no dry clumps.` },
          { step:'Circulate the DE-water mix through the press', detail:'Run it through and back into your bucket several times until the water coming out runs clear. The plates are now coated.' },
          { step:'Drain the water from the press', detail:'Open the drain valve and let the precharge water out. Your plates now have a thin DE cake on them — don\'t disturb them.' },
          { step:'Heat your syrup to 185–190°F and start filtering', detail:'Syrup should come out clear right from the start since the plates are already coated. Collect from the first drop.' },
          { step:'Watch your pressure gauge', detail:'Stop at 40 PSI — plates are full. Rinse the press and repeat the precharge if you have more syrup to run.' },
        ]).map((item,i) => (
          <div key={i} style={{ display:'flex', gap:12, marginBottom:12, alignItems:'flex-start' }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:'#131e2c', border:'1px solid #1e2d3d', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#5a6a7a', flexShrink:0, marginTop:1 }}>{i+1}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#e6edf3', marginBottom:3 }}>{item.step}</div>
              <div style={{ fontSize:12, color:'#5a6a7a', lineHeight:1.5 }}>{item.detail}</div>
            </div>
          </div>
        ))}

        {/* ── TROUBLESHOOTING ── */}
        <div className="section-header" style={{ marginBottom:10, marginTop:6 }}>IF SOMETHING GOES WRONG</div>
        {[
          { prob:'Syrup is still cloudy after a few cups', fix:'The DE cake hasn\'t formed yet — keep returning the cloudy syrup to the pot. If it stays cloudy for more than a quart, add another ¼ cup of DE to the pot and stir.' },
          { prob:'Pressure gauge climbing too fast', fix:'The plates are loading up quickly — this is common with dark or late-season syrup. Stop at 40 PSI, rinse the press, and add 25–50% more DE to your next batch.' },
          { prob:'Nothing is coming out / flow stopped', fix:'Check that your valves are open. If pressure is at or above 40 PSI, your plates are full — stop, disassemble, rinse, and reload.' },
          { prob:'Syrup tastes or smells like DE', fix:'You\'ve used way too much. This is rare with filter-press grade DE. Reduce by half next time. Make sure you\'re using food-grade filter DE, not pool filter DE.' },
        ].map((item,i) => (
          <div key={i} style={{ background:'#0d1520', borderRadius:10, padding:'10px 14px', marginBottom:8, border:'1px solid #1a2840' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#f0883e', marginBottom:3 }}>⚡ {item.prob}</div>
            <div style={{ fontSize:12, color:'#5a6a7a', lineHeight:1.5 }}>{item.fix}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:12 }}><CardIcon bg="#2d1f0a" icon="scale" />{t(lang,'gradeTitle')}</div>
        <div className="section-header" style={{ marginBottom:8 }}>{t(lang,'gradeA')}</div>
        {[
          { l:t(lang,'gradeGolden'), light:'>75%',   brix:'66.0\u201366.5\u00b0', color:'#f5c842', bg:'#1c1600', border:'#4a3d00', note:lang==='fr'?'Saveur très douce — début de saison':'Very mild flavour \u2014 early season' },
          { l:t(lang,'gradeAmber'),  light:'25\u201375%', brix:'66.5\u201367.5\u00b0', color:'#e0a44a', bg:'#2d1f0a', border:'#4a3020', note:lang==='fr'?'Saveur classique d\'érable':'Classic maple flavour' },
          { l:t(lang,'gradeDark'),   light:'<25%',   brix:'67.0\u201368.9\u00b0', color:'#c47a28', bg:'#2b1505', border:'#6b3010', note:lang==='fr'?'Corsé — fin de saison':'Strong \u2014 late season' },
          { l:t(lang,'gradeVeryDark'), light:'<10%', brix:'67.0\u201368.9\u00b0', color:'#8b4513', bg:'#1a0a04', border:'#5a2800', note:lang==='fr'?'Intense — très fin de saison':'Intense \u2014 very late season' },
        ].map(g=>(
          <div key={g.l} style={{ background:g.bg, borderRadius:10, padding:'11px 14px', border:`1px solid ${g.border}`, marginBottom:7 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:700, color:g.color, fontSize:15 }}>{g.l}</div>
              <div style={{ background:g.color+'22', borderRadius:8, padding:'2px 9px', fontSize:11, fontWeight:700, color:g.color }}>{g.brix} Brix</div>
            </div>
            <div style={{ color:'#5a6a7a', fontSize:12, marginTop:4 }}>Light transmittance {g.light} · {g.note}</div>
          </div>
        ))}
        <div className="divider" />
        <div className="two-col">
          {[{l:t(lang,'legalMin'),v:'66.0° Brix'},{l:t(lang,'legalMax'),v:'68.9° Brix'}].map(r=>(
            <div key={r.l} style={{ background:'#2d1f0a', borderRadius:10, padding:'12px 14px', border:'1px solid #4a3020' }}>
              <div style={{ fontWeight:700, color:'#e0a44a', marginBottom:4 }}>{r.l}</div>
              <div style={{ color:'#5a6a7a', fontSize:14 }}>{r.v}</div>
            </div>
          ))}
        </div>
        <InfoRow label={t(lang,'weight')} value="~11.65 lbs/gallon at 66° Brix" />
      </div>

      {/* ── Canning ── */}
      <div className="card">
        <div className="card-title"><CardIcon bg="#2b1a0d" icon="package" />Canning &amp; Bottling</div>

        <div className="result-box orange" style={{ marginBottom:14 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:12, color:'#e0a44a', fontWeight:700, letterSpacing:'0.08em', marginBottom:4 }}>CAN BETWEEN</div>
            <div style={{ fontSize:38, fontWeight:800, color:'#e0a44a', lineHeight:1 }}>180 – 190°F</div>
            <div style={{ fontSize:12, color:'#5a6a7a', marginTop:6 }}>82 – 88°C</div>
          </div>
        </div>

        <div style={{ background:'#0f1720', borderRadius:10, padding:'12px 14px', marginBottom:10, border:'1px solid #1a2840' }}>
          <div style={{ fontWeight:600, color:'#c9d1d9', fontSize:14, marginBottom:8 }}>Why this range matters</div>
          <div style={{ fontSize:13, color:'#8b949e', lineHeight:1.7 }}>
            <span style={{ color:'#3fb950', fontWeight:600 }}>Above 180°F</span> — hot enough to sterilize the container and create a vacuum seal as the syrup cools.<br/>
            <span style={{ color:'#f0883e', fontWeight:600 }}>Below 190°F</span> — avoids driving off moisture that would push syrup above legal density, and prevents forming new niter (calcium malate crystals) that re-form above ~190°F even in already-filtered syrup.
          </div>
        </div>

        {[
          { title:'Check density first', body:'Always verify syrup is 66.0–68.9° Brix before canning. Density that was correct hot may read differently once cooled — use the Density Check above with a temperature correction.' },
          { title:'Heat slowly, stir gently', body:'Bring syrup back to temperature on low-medium heat. Stir occasionally but avoid vigorous boiling — you don\'t want to concentrate it further or create new niter.' },
          { title:'Fill hot, cap immediately', body:'Fill containers to within ¼" of the top. Cap immediately and tip upside down for 1–2 minutes to sterilize the lid seal. Return upright and let cool undisturbed.' },
          { title:'Glass vs. plastic', body:'Glass is ideal — holds temperature longer, shows off color, and has no flavor transfer. Food-grade plastic (HDPE) jugs are fine for short-term storage. Avoid thin plastic that distorts when filled hot.' },
          { title:'Shelf life', body:'Properly canned syrup keeps 1–4 years unopened at room temperature. Once opened, refrigerate and use within 1 year. If mold appears, bring to 180°F+, re-filter if needed, and re-can.' },
        ].map((item, i) => (
          <TipItem key={i}><span style={{ color:'#c9d1d9', fontWeight:600 }}>{item.title} — </span>{item.body}</TipItem>
        ))}

        <div style={{ background:'#081622', borderRadius:8, padding:'10px 12px', marginTop:8, fontSize:12, color:'#5a6a7a', lineHeight:1.7 }}>
          <span style={{ color:'#8b949e', fontWeight:600 }}>Container yield guide: </span>
          250 mL ≈ 0.066 gal · 500 mL ≈ 0.132 gal · 1 L ≈ 0.264 gal · 1 qt ≈ 0.25 gal · ½ gal ≈ 0.5 gal · 1 gal jug = 1 gal
        </div>
      </div>

      {/* ── CANDY MAKING ── */}
      <div className="card">
        <div className="card-title">
          <CardIcon bg="#2b1a0d" icon="star" />
          <div>
            <div>Maple Candy Temperatures</div>
            <div style={{ fontSize:12, color:'#5a6a7a', fontWeight:400 }}>Adjusted for your altitude · based on {fmt(waterBP,1)}°F boiling point</div>
          </div>
        </div>

        {/* Target temp grid */}
        {[
          { name:'Maple Cream / Butter',  offset:22, color:'#f4a44a', desc:'Cook to temp, cool to ~70°F, stir until thick and creamy. Spreadable.' },
          { name:'Maple Taffy',           offset:28, color:'#e0a44a', desc:'Pour onto packed snow or ice. Pull and stretch while warm.' },
          { name:'Molded Candy',          offset:34, color:'#2dd4a7', desc:'Cook to temp, cool to ~160°F, stir until it begins to granulate, pour into molds quickly.' },
          { name:'Maple Sugar (granulated)', offset:45, color:'#c990ff', desc:'Cook to temp, stir vigorously while cooling until fully dry and granulated.' },
        ].map(c => (
          <div key={c.name} style={{ background:'#0d1521', borderRadius:10, padding:'12px 14px', marginBottom:10, border:`1px solid rgba(255,255,255,0.06)` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#e6edf3' }}>{c.name}</div>
              <div style={{ fontWeight:900, fontSize:22, color:c.color }}>{fmt(waterBP + c.offset, 1)}°F</div>
            </div>
            <div style={{ fontSize:11, color:'#3d5068', marginBottom:3 }}>
              BP + {c.offset}°F &nbsp;·&nbsp; {fmt((waterBP + c.offset - 32)*5/9, 1)}°C
            </div>
            <div style={{ fontSize:12, color:'#5a6a7a', lineHeight:1.5 }}>{c.desc}</div>
          </div>
        ))}

        {/* Molded candy process tip */}
        <div style={{ background:'rgba(45,212,167,0.06)', border:'1px solid rgba(45,212,167,0.18)', borderRadius:10, padding:'12px 14px', marginTop:4 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#2dd4a7', marginBottom:6 }}>🍬 Molded Candy Step-by-Step</div>
          {[
            { s:'Heat syrup', d:`Bring to ${fmt(waterBP + 34, 1)}°F (BP + 34°F). Use a heavy pot — syrup foams up significantly.` },
            { s:'Stop the boil', d:'Remove from heat immediately when temp is reached. Do not stir yet.' },
            { s:'Cool undisturbed', d:'Let cool to ~160°F without stirring. Stirring too early causes grainy texture.' },
            { s:'Stir to granulate', d:'Stir vigorously with a wooden spoon or stand mixer. It will lighten in color and thicken rapidly.' },
            { s:'Pour into molds quickly', d:'Once it starts to set, pour immediately. It hardens fast — have molds ready before you start stirring.' },
            { s:'Cool & release', d:'Let sit 5–10 min until firm. Pop out of molds and enjoy. Store in a cool, dry place.' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
              <div style={{ flexShrink:0, width:20, height:20, borderRadius:'50%', background:'rgba(45,212,167,0.15)', border:'1px solid rgba(45,212,167,0.3)', color:'#2dd4a7', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>{i+1}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}><strong style={{ color:'#c9d1d9' }}>{item.s} — </strong>{item.d}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize:11, color:'#3d5068', marginTop:10, lineHeight:1.7 }}>
          <span style={{ color:'#5a6a7a', fontWeight:600 }}>All temps above auto-adjust for your altitude.</span> Update your water boiling point at the top of this tab if you move to a different elevation.
        </div>
      </div>

    </div>
  );
}

// ─── TAPPING TAB ──────────────────────────────────────────────────────────────
function TappingTab({ sapBrix, trees, setTrees, units, lang='en' }) {
  const [dbh,      setDbh]      = useState(() => ls.get('sg_dbh', 14));
  const [vacuum,   setVacuum]   = useState(() => ls.get('sg_vacuum', 'Gravity / Buckets'));
  const [spoutIdx, setSpoutIdx] = useState(() => ls.get('sg_spoutidx', 0));
  const [treeNotes, setTreeNotes] = useState(() => ls.get('sg_treenotes', []));
  const [tnForm, setTnForm] = useState({ tree:'', obs:'', date: new Date().toLocaleDateString() });
  const [showTN, setShowTN] = useState(false);
  const [rotEntries, setRotEntries] = useState(() => ls.get('sg_rotation', []));
  const [rotForm, setRotForm] = useState({ tree:'', side:'N', year:new Date().getFullYear() });
  const [showRot, setShowRot] = useState(false);
  useEffect(() => { ls.set('sg_dbh',      dbh);      }, [dbh]);
  useEffect(() => { ls.set('sg_vacuum',   vacuum);   }, [vacuum]);
  useEffect(() => { ls.set('sg_spoutidx', spoutIdx); }, [spoutIdx]);
  useEffect(() => { ls.set('sg_treenotes', treeNotes); }, [treeNotes]);
  useEffect(() => { ls.set('sg_rotation', rotEntries); }, [rotEntries]);
  const addRotEntry = () => {
    if (!rotForm.tree) return;
    setRotEntries(p => [...p, { ...rotForm, id: Date.now() }]);
    setRotForm({ tree:'', side:'N', year:new Date().getFullYear() });
  };
  const addNote = () => {
    if (!tnForm.tree && !tnForm.obs) return;
    setTreeNotes(p => [...p, { ...tnForm, id: Date.now() }]);
    setTnForm({ tree:'', obs:'', date: new Date().toLocaleDateString() });
    setShowTN(false);
  };
  const HEALTH_TAGS = (l) => [t(l,'goodProd'),t(l,'lowOutput'),t(l,'sapWatery'),t(l,'woundScar'),t(l,'skipYear'),t(l,'topProd')];
  const u    = units === 'L' ? 'L' : 'gal';
  const conv = v => units === 'L' ? (v*3.78541).toFixed(1) : v.toFixed(1);
  const tpt  = tapsPer(dbh);
  const tot  = tpt * trees;
  const sap  = tot * 10;
  const sy   = syrupY(sap, sapBrix);
  const sp   = SPOUTS[spoutIdx];
  const sizeGuide = (l) => [
    { s:t(l,'sizeSmall'),    taps:t(l,'doNotTap'),  n:t(l,'tapMarginal').replace('Marginal', lang==='fr'?'Trop petit':'Too small') },
    { s:t(l,'sizeMarginal'), taps:`1 ${t(l,'tapSingular')}`, n:t(l,'tapMarginal') },
    { s:t(l,'sizeStandard'), taps:`1 ${t(l,'tapSingular')}`, n:t(l,'tapStandard') },
    { s:t(l,'sizeGood'),     taps:`2 ${t(l,'tapPlural')}`,   n:t(l,'tapGoodProd') },
    { s:t(l,'sizeHigh'),     taps:`3 ${t(l,'tapPlural')}`,   n:t(l,'tapHighProd') },
  ];
  const drillTips = (l) => ['drillTip1','drillTip2','drillTip3','drillTip4','drillTip5','drillTip6'].map(k=>t(l,k));

  return (
    <div>
      <div className="card">
        <div className="card-title"><CardIcon bg="#0d2b15" icon="tree" />{t(lang,'tapCalcTitle')}</div>
        <div className="two-col" style={{ marginBottom:10 }}>
          <div><div className="field-label">{t(lang,'numTrees')}</div><NumInput value={trees} onChange={setTrees} min={1} max={10000} step={1} /></div>
          <div>
            <div className="field-label">{t(lang,'avgTrunkDiam')}</div>
            <NumInput value={dbh} onChange={setDbh} min={6} max={60} step={1} />
            <div style={{ fontSize:11, color:'#3d5068', marginTop:3 }}>{t(lang,'dbhHint')}</div>
          </div>
        </div>
        <div className="field-label">{t(lang,'vacSystemQ')}</div>
        <select value={vacuum} onChange={e=>setVacuum(e.target.value)} style={{ marginBottom:12 }}>
          {[{k:'gravBuckets'},{k:'lowVac'},{k:'highVac'}].map(v=><option key={v.k} value={t('en',v.k)}>{t(lang,v.k)}</option>)}
        </select>
        <div className="result-box green" style={{ marginBottom:10 }}>
          <div className="two-col">
            <div><div className="result-label" style={{ color:'#3fb950' }}>{t(lang,'perTree')}</div><div className="result-value" style={{ color:'#3fb950', fontSize:36 }}>{tpt}</div><div style={{ color:'#3fb950', fontSize:13 }}>{tpt===1?`1 ${t(lang,'tapSingular')}`:`${tpt} ${t(lang,'tapPlural')}`}</div></div>
            <div><div className="result-label" style={{ color:'#3fb950' }}>{t(lang,'totalTaps')}</div><div className="result-value" style={{ color:'#3fb950', fontSize:36 }}>{tot}</div><div style={{ color:'#3fb950', fontSize:13 }}>{trees} {t(lang,'treesUnit')}</div></div>
          </div>
        </div>
        <div className="result-box orange">
          <div className="two-col">
            <div><div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'estSapSeason')}</div><div className="result-value" style={{ color:'#e0a44a' }}>{conv(sap)} {u}</div><div style={{ color:'#5a6a7a', fontSize:13 }}>{t(lang,'perTapUnit').replace('{u}',u)}</div></div>
            <div><div className="result-label" style={{ color:'#e0a44a' }}>{t(lang,'estSyrupYield')}</div><div className="result-value" style={{ color:'#e0a44a' }}>{conv(sy)} {u}</div><div style={{ color:'#5a6a7a', fontSize:13 }}>{t(lang,'atRatioLbl').replace('{n}',fmt(rule86(sapBrix),0))}</div></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:10 }}><CardIcon bg="#1c2128" icon="ruler" />{t(lang,'minTreeGuide')}</div>
        {sizeGuide(lang).map(r=>(
          <div key={r.s} className="info-row">
            <div><span style={{ fontWeight:600 }}>{r.s}</span> <span style={{ color:'#3d5068', fontSize:13 }}>• {r.n}</span></div>
            <span style={{ color:'#2dd4a7', fontWeight:600 }}>{r.taps}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title"><CardIcon bg="#0d1a2b" icon="circle" />{t(lang,'spoutBit')}</div>
        <div className="field-label">{t(lang,'spoutType')}</div>
        <select value={spoutIdx} onChange={e=>setSpoutIdx(+e.target.value)} style={{ marginBottom:12 }}>
          {SPOUTS.map((s,i)=><option key={i} value={i}>{s.label}</option>)}
        </select>
        <div className="result-box blue">
          <div className="two-col" style={{ marginBottom:8 }}>
            <div><div className="result-label" style={{ color:'#58a6ff' }}>{t(lang,'drillBit')}</div><div className="result-value" style={{ color:'#58a6ff' }}>{sp.bit}</div></div>
            <div><div className="result-label" style={{ color:'#58a6ff' }}>{t(lang,'tapDepth')}</div><div className="result-value" style={{ color:'#58a6ff', fontSize:22 }}>{sp.depth}</div></div>
          </div>
          <div style={{ background:'#081622', borderRadius:8, padding:'8px 12px', fontSize:14, color:'#5a6a7a', display:'flex', alignItems:'center', gap:8 }}>
            <I.info size={14} color="#58a6ff" /> {sp.note}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:12 }}><CardIcon bg="#0d2b15" icon="tree" />{t(lang,'drillingBP')}</div>
        {drillTips(lang).map((tip,i)=><TipItem key={i}>{tip}</TipItem>)}
      </div>

      <div className="card">
        <div className="collapsible-header" onClick={()=>setShowTN(s=>!s)}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <CardIcon bg="#0d2b15" icon="clipboard" />
            <div>
              <div style={{ fontWeight:600 }}>{t(lang,'treeNotes')}</div>
              <div style={{ fontSize:12, color:'#5a6a7a' }}>{treeNotes.length} {treeNotes.length!==1?t(lang,'notesRecorded'):t(lang,'noteRecorded')}</div>
            </div>
          </div>
          {showTN ? <I.chevUp size={16} color="#8b949e" /> : <I.chevDown size={16} color="#8b949e" />}
        </div>
        {showTN && (
          <div style={{ marginTop:12 }}>
            <div style={{ background:'#0f1720', borderRadius:10, padding:14, marginBottom:12 }}>
              <div className="two-col" style={{ marginBottom:8 }}>
                <div><div className="field-label">{t(lang,'treeIdName')}</div><input type="text" value={tnForm.tree} onChange={e=>setTnForm(p=>({...p,tree:e.target.value}))} placeholder={t(lang,'treeIdPh')} /></div>
                <div><div className="field-label">Date</div><input type="text" value={tnForm.date} onChange={e=>setTnForm(p=>({...p,date:e.target.value}))} /></div>
              </div>
              <div style={{ marginBottom:8 }}>
                <div className="field-label">{t(lang,'obsTag')}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                  {HEALTH_TAGS(lang).map(tag=>(
                    <button key={t} onClick={()=>setTnForm(p=>({...p,obs:p.obs?p.obs+', '+tag:tag}))}
                      style={{ background:'#131e2c', border:'1px solid #1e2d3d', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#8b949e', cursor:'pointer' }}>
                      {tag}
                    </button>
                  ))}
                </div>
                <input type="text" value={tnForm.obs} onChange={e=>setTnForm(p=>({...p,obs:e.target.value}))} placeholder={t(lang,'customNote')} />
              </div>
              <div className="two-col">
                <button className="btn-secondary" onClick={()=>setShowTN(false)}>{t(lang,'cancel')}</button>
                <button className="btn-primary" onClick={addNote}>{t(lang,'saveNote')}</button>
              </div>
            </div>
            <button className="btn-secondary" style={{ marginBottom:12 }} onClick={()=>setShowTN(true)}>
              <I.edit size={16} color="#8b949e" /> {t(lang,'addNote')}
            </button>
            {treeNotes.length===0 && <div style={{ textAlign:'center', color:'#3d5068', fontSize:13, padding:'6px 0' }}>{t(lang,'noTreeNotesYet')}</div>}
            {treeNotes.slice().reverse().map((n,i)=>(
              <div key={n.id} style={{ background:'#0f1720', borderRadius:10, padding:'11px 14px', marginBottom:7, border:'1px solid #1a2840', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:'#3fb950' }}>{n.tree||t(lang,'noId')} <span style={{ color:'#3d5068', fontSize:12, fontWeight:400 }}>{n.date}</span></div>
                  <div style={{ color:'#b0bec8', fontSize:13, marginTop:3 }}>{n.obs}</div>
                </div>
                <button className="delete-btn" onClick={()=>setTreeNotes(p=>p.filter(t=>t.id!==n.id))}><I.x size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="collapsible-header" onClick={()=>setShowRot(s=>!s)}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <CardIcon bg="#1a0d2b" icon="refresh" />
            <div>
              <div style={{ fontWeight:600 }}>{t(lang,'tapRotTitle')}</div>
              <div style={{ fontSize:12, color:'#5a6a7a' }}>{t(lang,'tapRotDesc')}</div>
            </div>
          </div>
          {showRot ? <I.chevUp size={16} color="#8b949e" /> : <I.chevDown size={16} color="#8b949e" />}
        </div>
        {showRot && (
          <div style={{ marginTop:14 }}>
            <div style={{ background:'#0f1720', borderRadius:10, padding:14, marginBottom:12 }}>
              <div className="two-col" style={{ marginBottom:8 }}>
                <div>
                  <div className="field-label">{t(lang,'treeIdRot')}</div>
                  <input type="text" value={rotForm.tree} onChange={e=>setRotForm(p=>({...p,tree:e.target.value}))} placeholder={t(lang,'treeIdPh')} />
                </div>
                <div>
                  <div className="field-label">{t(lang,'year')}</div>
                  <input type="number" value={rotForm.year} onChange={e=>setRotForm(p=>({...p,year:e.target.value}))} min="2000" max="2100" />
                </div>
              </div>
              <div style={{ marginBottom:8 }}>
                <div className="field-label">{t(lang,'side')}</div>
                <div style={{ display:'flex', gap:8 }}>
                  {['N','S','E','W'].map(s=>(
                    <button key={s} onClick={()=>setRotForm(p=>({...p,side:s}))}
                      style={{ flex:1, background:rotForm.side===s?'linear-gradient(135deg,#a855f7,#9333ea)':'#131e2c', border:`1px solid ${rotForm.side===s?'#a855f7':'#1e2d3d'}`, borderRadius:8, padding:'8px 4px', fontSize:14, fontWeight:700, color:rotForm.side===s?'#fff':'#8b949e', cursor:'pointer' }}>
                      {t(lang,s==='N'?'north':s==='S'?'south':s==='E'?'east':'west')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="two-col">
                <button className="btn-secondary" onClick={()=>setShowRot(false)}>{t(lang,'cancel')}</button>
                <button className="btn-primary" onClick={addRotEntry}>{t(lang,'addRotEntry')}</button>
              </div>
            </div>
            {rotEntries.length===0 && <div style={{ textAlign:'center', color:'#3d5068', fontSize:13, padding:'6px 0' }}>{t(lang,'noRotEntries')}</div>}
            {rotEntries.slice().reverse().map(e=>{
              const OPPOSITE = {N:'S',S:'N',E:'W',W:'E'};
              const opp = OPPOSITE[e.side];
              return (
                <div key={e.id} style={{ background:'#0f1720', borderRadius:10, padding:'11px 14px', marginBottom:7, border:'1px solid #1a2840', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:'#a855f7' }}>
                      {e.tree||'(no ID)'} <span style={{ color:'#3d5068', fontSize:12, fontWeight:400 }}>{e.year}</span>
                    </div>
                    <div style={{ color:'#b0bec8', fontSize:13, marginTop:2 }}>
                      {t(lang,'side')}: <strong>{t(lang,e.side==='N'?'north':e.side==='S'?'south':e.side==='E'?'east':'west')}</strong>
                      <span style={{ color:'#a855f7', marginLeft:10 }}>→ {t(lang,'rotDue')}: {t(lang,opp==='N'?'north':opp==='S'?'south':opp==='E'?'east':'west')}</span>
                    </div>
                  </div>
                  <button className="delete-btn" onClick={()=>setRotEntries(p=>p.filter(r=>r.id!==e.id))}><I.x size={14} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOIL PT TAB ──────────────────────────────────────────────────────────────
function BoilPtTab({ waterBP, setWaterBP, lang='en' }) {
  const [altIn,  setAltIn]  = useState('');
  const [presIn, setPresIn] = useState('');
  const [loc,    setLoc]    = useState('');
  const [zip,    setZip]    = useState('');
  const [loading,setLoading]= useState(false);
  const [err,    setErr]    = useState('');

  const bp   = altIn!=='' ? altToBP(parseFloat(altIn)||0) : presIn!=='' ? presToBP(parseFloat(presIn)||29.92) : waterBP;
  const finT = finTemp(bp);

  const useGPS = () => {
    if (location.protocol === 'file:') {
      setErr('GPS requires HTTPS. Host this app online or enter a zip code / altitude manually.');
      return;
    }
    if (!navigator.geolocation) { setErr('GPS not supported by this browser.'); return; }
    setLoading(true); setErr('');
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&hourly=temperature_2m&forecast_days=1`);
        const d = await r.json();
        const ft = Math.round((d.elevation||0)*3.28084);
        setAltIn(ft); setPresIn('');
        setWaterBP(parseFloat(altToBP(ft).toFixed(1)));
        setLoc(`${pos.coords.latitude.toFixed(2)}°N, ${Math.abs(pos.coords.longitude).toFixed(2)}°W`);
      } catch { setErr('Could not fetch elevation. Try entering altitude manually.'); }
      setLoading(false);
    }, e => {
      setLoading(false);
      if (e.code === 1) setErr('Location permission denied — allow location access and try again.');
      else if (e.code === 2) setErr('Location unavailable. Enter altitude manually.');
      else setErr('Location timed out. Enter altitude manually.');
    }, { timeout: 10000, maximumAge: 300000 });
  };
  const searchZip = async () => {
    if (!zip.trim()) return;
    setLoading(true); setErr('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}&count=1&language=en&format=json`);
      const d = await r.json();
      if (d.results?.length) {
        const ft = Math.round((d.results[0].elevation||0)*3.28084);
        setAltIn(ft); setPresIn('');
        setWaterBP(parseFloat(altToBP(ft).toFixed(1)));
        setLoc(d.results[0].name);
      } else setErr('Location not found.');
    } catch { setErr('Search failed.'); }
    setLoading(false);
  };
  const handleAlt = v => { setAltIn(v); setPresIn(''); if (v>=0) setWaterBP(parseFloat(altToBP(parseFloat(v)||0).toFixed(1))); };
  const handlePres= v => { setPresIn(v); setAltIn(''); if (v>0) setWaterBP(parseFloat(presToBP(parseFloat(v)||29.92).toFixed(1))); };

  return (
    <div>
      <div className="card">
        <div className="card-title"><CardIcon bg="#0d1a2b" icon="mapPin" />{t(lang,'findBoilPt')}</div>
        <button className="btn-primary" style={{ marginBottom:10 }} onClick={useGPS}>
          <I.mapPin size={16} color="#0d1117" /> {t(lang,'useMyLoc')}
        </button>
        {loc && <div style={{ color:'#2dd4a7', fontSize:13, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}><I.mapPin size={14} color="#2dd4a7" />{loc}</div>}
        <div style={{ display:'flex', gap:8 }}>
          <input type="text" placeholder={t(lang,'cityZip')} value={zip} onChange={e=>setZip(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchZip()} style={{ flex:1 }} />
          <button onClick={searchZip} style={{ background:'#e0a44a', border:'none', borderRadius:8, width:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <I.search size={18} color="#0d1117" />
          </button>
        </div>
        {err     && <div style={{ color:'#f85149', fontSize:13, marginTop:8 }}>{err}</div>}
        {loading && <div style={{ color:'#5a6a7a', fontSize:13, marginTop:8 }}>Loading…</div>}
        <div style={{ background:'linear-gradient(135deg,#c87d1e,#a05e10)', borderRadius:14, padding:'22px 16px', textAlign:'center', marginTop:14, boxShadow:'0 6px 24px rgba(180,100,20,0.28)' }}>
          <div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.1em', color:'rgba(255,255,255,.8)' }}>{t(lang,'waterBoilsAt')}</div>
          <div style={{ fontSize:44, fontWeight:700, color:'#fff', margin:'4px 0' }}>{fmt(waterBP,1)}°F</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,.75)' }}>= {fmt((waterBP-32)*5/9,1)}°C</div>
          <div style={{ height:1, background:'rgba(255,255,255,.3)', margin:'12px 0' }} />
          <div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.1em', color:'rgba(255,255,255,.8)' }}>{t(lang,'finishAt')}</div>
          <div style={{ fontSize:32, fontWeight:700, color:'#fff' }}>{fmt(finT,1)}°F</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><CardIcon bg="#2d1a0d" icon="mountain" />{t(lang,'manualEntry')}</div>
        <div className="field-label">{t(lang,'altitude')}</div>
        <NumInput value={altIn} onChange={handleAlt} min={0} max={15000} step={100} placeholder="e.g., 1500" />
        <div style={{ textAlign:'center', color:'#3d5068', fontSize:13, margin:'10px 0' }}>{lang==='fr' ? '— ou —' : '— or —'}</div>
        <div className="field-label">{t(lang,'pressure')}</div>
        <NumInput value={presIn} onChange={handlePres} min={26} max={32} step={0.01} placeholder="e.g., 29.92" />
        {(altIn!==''||presIn!=='') && (
          <div className="result-box orange" style={{ marginTop:12, textAlign:'center' }}>
            <div style={{ fontWeight:700, fontSize:22, color:'#e0a44a' }}>{t(lang,'waterBoilsAt2')} {fmt(bp,1)}°F</div>
            <div style={{ color:'#5a6a7a', fontSize:13 }}>{t(lang,'finishAt2')} {fmt(finTemp(bp),1)}°F</div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontWeight:700, fontSize:16, color:'#e0a44a', marginBottom:12 }}>{t(lang,'altRef')}</div>
        {ALT_REF.map(r=>(
          <div key={r.alt} className="info-row" style={{ marginBottom:4 }}>
            <span style={{ fontWeight:500 }}>{r.alt}</span>
            <span style={{ color:'#5a6a7a', fontSize:14 }}><strong style={{ color:'#e6edf3' }}>{r.bp}°F</strong> → {t(lang,'finishAt2')} {r.fin}°F</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontWeight:700, fontSize:16, color:'#e0a44a', marginBottom:12 }}>{t(lang,'proTips')}</div>
        {['Check boiling point daily — weather pressure changes affect it','Keep a pot of water boiling to monitor actual BP','High pressure = higher BP, Low pressure = lower BP','Syrup thermometer is more reliable than Brix for draw-off'].map((t,i)=><TipItem key={i}>{t}</TipItem>)}
      </div>
    </div>
  );
}


// ─── SAP MONITOR IMPORT ───────────────────────────────────────────────────────
function SapImportModal({ season, onClose, onImport }) {
  const [csvText, setCsvText]   = React.useState('');
  const [preview, setPreview]   = React.useState(null);
  const [error, setError]       = React.useState('');
  const [source, setSource]     = React.useState('sugarcalc_pdf');

  const SOURCES = [
    { id:'sugarcalc_pdf', label:'SugarCalc PDF', hint:'Drop in any SugarCalc Season Report PDF — SweetRun reads it automatically' },
    { id:'sapspy',        label:'SapSpy CSV',     hint:'Exports via Settings → Data Export → CSV' },
    { id:'saptrac',       label:'SapTrac CSV',    hint:'File → Export → Sap Log CSV' },
    { id:'generic',       label:'Generic CSV',    hint:'date, sap_gallons, syrup_gallons columns' },
    { id:'manual',        label:'Paste Raw Data', hint:'Comma-separated: date, sap, syrup' },
  ];

  // ── PDF.js loader + SugarCalc PDF parser ─────────────────────────────────
  const loadPdfJs = () => new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      // Disable worker for iOS/WKWebView compatibility
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      resolve();
    };
    s.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(s);
  });

  const parseSugarCalcPDF = async (file) => {
    setError(''); setPreview(null);
    try {
      await loadPdfJs();
      // Use FileReader for iOS Safari compatibility (arrayBuffer() unreliable on iOS)
      const buf = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload  = e => resolve(e.target.result);
        fr.onerror = () => reject(new Error('Could not read file'));
        fr.readAsArrayBuffer(file);
      });
      const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      let fullText = '';
      for (let p = 1; p <= pdf.numPages; p++) {
        const page  = await pdf.getPage(p);
        const items = (await page.getTextContent()).items;
        fullText   += items.map(i => i.str).join(' ') + ' ';
      }
      const CAT_MAP = {
        'Sap Collected':     'sap',
        'Syrup Made':        'syrup',
        'Sap Thru R/O':      'ro',
        'Sap in Evaporator': 'evap',
      };
      const re = /(\d{1,2}\/\d{1,2}\/\d{4})\s+(Sap Collected|Syrup Made|Sap Thru R\/O|Sap in Evaporator)\s+([\d.]+)/g;
      const rows = [];
      let m;
      while ((m = re.exec(fullText)) !== null) {
        const val = parseFloat(m[3]);
        if (val > 0) rows.push({ date: m[1], cat: CAT_MAP[m[2]], val });
      }
      if (rows.length === 0) {
        setError('No log entries found. Make sure this is a SugarCalc Season Report PDF.');
        return;
      }
      const years = rows.map(r => parseInt(r.date.split('/')[2])).filter(Boolean);
      const detectedYear = years.length ? Math.max(...years) : new Date().getFullYear();
      const totals = { sap:0, syrup:0, ro:0, evap:0 };
      rows.forEach(r => { totals[r.cat] = (totals[r.cat]||0) + r.val; });
      setPreview({ rows, totalSap:totals.sap, totalSyrup:totals.syrup,
        totalRO:totals.ro, totalEvap:totals.evap, detectedYear, isPDF:true });
    } catch(e) {
      setError('Could not read PDF: ' + e.message);
    }
  };

  const parseCSV = (text, src) => {
    setError('');
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) { setError('Need at least a header row and one data row.'); return; }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]/g,''));

    // Auto-detect column indices based on source
    const sapIdx   = headers.findIndex(h => h.includes('sap') && (h.includes('gal') || h.includes('col') || h.includes('vol') || h === 'sap'));
    const syrupIdx = headers.findIndex(h => h.includes('syrup') || h.includes('prod') || h.includes('made'));
    const dateIdx  = headers.findIndex(h => h.includes('date') || h.includes('day') || h.includes('time'));
    const roIdx    = headers.findIndex(h => h.includes('ro') || h.includes('r/o') || h.includes('reverse'));

    if (sapIdx === -1 && syrupIdx === -1) {
      setError('Could not detect sap or syrup columns. Check that your CSV has columns named "sap", "syrup", or similar.');
      return;
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/['"]/g,''));
      const sap   = sapIdx   >= 0 && sapIdx   < cols.length ? parseFloat(cols[sapIdx])   || 0 : 0;
      const syrup = syrupIdx >= 0 && syrupIdx < cols.length ? parseFloat(cols[syrupIdx]) || 0 : 0;
      const ro    = roIdx    >= 0 && roIdx    < cols.length ? parseFloat(cols[roIdx])    || 0 : 0;
      const date  = dateIdx  >= 0 && dateIdx  < cols.length ? cols[dateIdx] : `Day ${i}`;
      if (sap > 0 || syrup > 0 || ro > 0) rows.push({ date, sap, syrup, ro });
    }

    if (rows.length === 0) { setError('No valid data rows found. Check your CSV format.'); return; }

    setPreview({ rows, sapIdx, syrupIdx, dateIdx, roIdx,
      totalSap: rows.reduce((s,r)=>s+r.sap,0),
      totalSyrup: rows.reduce((s,r)=>s+r.syrup,0),
      totalRO: rows.reduce((s,r)=>s+r.ro,0),
    });
  };

  const doImport = () => {
    if (!preview) return;
    const targetSeason = preview.isPDF ? (preview.detectedYear || season) : season;
    const existing = ls.get('sg_logs2', {});
    const slog = existing[targetSeason] || { sapCollected:[], syrupMade:[], sapRO:[], sapEvap:[] };

    let newSap=[], newSyrup=[], newRO=[], newEvap=[];
    if (preview.isPDF) {
      const label = 'SugarCalc PDF';
      preview.rows.forEach(r => {
        const entry = { val: r.val, note: `Imported (${label})`, date: r.date };
        if      (r.cat === 'sap')   newSap.push(entry);
        else if (r.cat === 'syrup') newSyrup.push(entry);
        else if (r.cat === 'ro')    newRO.push(entry);
        else if (r.cat === 'evap')  newEvap.push(entry);
      });
    } else {
      newSap   = preview.rows.filter(r=>r.sap>0).map(r=>({ val:r.sap,   note:`Imported (${source})`, date:r.date }));
      newSyrup = preview.rows.filter(r=>r.syrup>0).map(r=>({ val:r.syrup,note:`Imported (${source})`, date:r.date }));
      newRO    = preview.rows.filter(r=>r.ro>0).map(r=>({ val:r.ro,     note:`Imported (${source})`, date:r.date }));
    }

    const updated = {
      ...existing,
      [targetSeason]: {
        ...slog,
        sapCollected: [...(slog.sapCollected||[]), ...newSap],
        syrupMade:    [...(slog.syrupMade||[]),    ...newSyrup],
        sapRO:        [...(slog.sapRO||[]),         ...newRO],
        sapEvap:      [...(slog.sapEvap||[]),        ...newEvap],
      }
    };
    ls.set('sg_logs2', updated);
    onImport(updated);
    onClose();
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.name.toLowerCase().endsWith('.pdf') || source === 'sugarcalc_pdf') {
      parseSugarCalcPDF(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setCsvText(ev.target.result);
      parseCSV(ev.target.result, source);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:999,display:'flex',
      alignItems:'flex-end',justifyContent:'center'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#13171e',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:600,
        maxHeight:'90vh',overflowY:'auto',padding:24,boxShadow:'0 -8px 32px rgba(0,0,0,0.5)'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#fff'}}>📡 Import Season Data</div>
            <div style={{fontSize:12,color:'#5a6a7a',marginTop:2}}>SugarCalc PDF · SapSpy · SapTrac · CSV</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#5a6a7a',
            fontSize:22,cursor:'pointer',padding:'4px 8px'}}>✕</button>
        </div>

        {/* Source selector */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:'#8b949e',marginBottom:8}}>DATA SOURCE</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {SOURCES.map(s=>(
              <button key={s.id} onClick={()=>setSource(s.id)}
                style={{padding:'6px 14px',borderRadius:20,fontSize:13,fontWeight:500,cursor:'pointer',
                  border:'1.5px solid',
                  borderColor: source===s.id ? '#58a6ff' : '#21262d',
                  background: source===s.id ? '#0d1117' : '#161b22',
                  color: source===s.id ? '#58a6ff' : '#8b949e'}}>
                {s.label}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:'#3d5068',marginTop:6}}>
            {SOURCES.find(s=>s.id===source)?.hint}
          </div>
        </div>

        {/* File upload — iOS-safe: label wraps input directly, no JS click() needed */}
        <label htmlFor="csv-file-input" style={{border:'2px dashed #21262d',borderRadius:12,
          padding:20,textAlign:'center',marginBottom:16,cursor:'pointer',display:'block'}}>
          <input id="csv-file-input" type="file"
            accept=".csv,.txt,.pdf,application/pdf,text/csv,text/plain"
            onChange={handleFile}
            style={{display:'none'}} />
          <div style={{fontSize:28,marginBottom:8}}>📂</div>
          <div style={{fontSize:14,fontWeight:600,color:'#e6edf3'}}>
            {source === 'sugarcalc_pdf' ? 'Tap to select PDF' : 'Tap to select CSV file'}
          </div>
          <div style={{fontSize:12,color:'#5a6a7a',marginTop:4}}>
            {source === 'sugarcalc_pdf' ? 'SugarCalc Season Report PDF' : 'or paste data below'}
          </div>
        </label>

        {/* Paste area */}
        <textarea
          value={csvText}
          onChange={e=>{setCsvText(e.target.value); if(e.target.value.trim()) parseCSV(e.target.value,source);}}
          placeholder={"date,sap_gallons,syrup_gallons\n2024-03-15,450,4.2\n2024-03-16,380,3.5\n..."}
          rows={5}
          style={{width:'100%',boxSizing:'border-box',padding:'10px 12px',background:'#0d1117',
            border:'1.5px solid #21262d',borderRadius:10,color:'#e6edf3',fontSize:12,
            fontFamily:'monospace',resize:'vertical',outline:'none',marginBottom:12}}
        />

        {/* Error */}
        {error && (
          <div style={{background:'#2d1010',border:'1px solid #f85149',borderRadius:8,
            padding:'10px 14px',fontSize:13,color:'#f85149',marginBottom:12}}>
            ⚠️ {error}
          </div>
        )}

        {/* Preview */}
        {preview && !error && (
          <div style={{background:'#0d1117',border:'1px solid #21262d',borderRadius:12,
            padding:16,marginBottom:16}}>
            {preview.isPDF && (
              <div style={{background:'rgba(63,185,80,0.08)',border:'1px solid rgba(63,185,80,0.25)',
                borderRadius:8,padding:'8px 12px',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14}}>📄</span>
                <div style={{fontSize:12,color:'#3fb950',fontWeight:600}}>
                  SugarCalc PDF · {preview.rows.length} entries · Season {preview.detectedYear}
                </div>
              </div>
            )}
            <div style={{fontSize:13,fontWeight:700,color:'#3fb950',marginBottom:12}}>
              ✅ Ready to import — {preview.rows.length} rows detected
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:12}}>
              {[
                {label:'Sap',   val:preview.totalSap   > 0 ? preview.totalSap.toFixed(0)+' gal'   : '—', color:'#58a6ff'},
                {label:'Syrup', val:preview.totalSyrup > 0 ? preview.totalSyrup.toFixed(1)+' gal' : '—', color:'#3fb950'},
                {label:'RO',    val:preview.totalRO    > 0 ? preview.totalRO.toFixed(0)+' gal'    : '—', color:'#a78bfa'},
                {label:'Evap',  val:(preview.totalEvap||0) > 0 ? (preview.totalEvap||0).toFixed(0)+' gal' : '—', color:'#f59e0b'},
              ].map(x=>(
                <div key={x.label} style={{textAlign:'center',background:'#161b22',borderRadius:8,padding:'10px 6px'}}>
                  <div style={{fontSize:16,fontWeight:700,color:x.color}}>{x.val}</div>
                  <div style={{fontSize:10,color:'#5a6a7a',marginTop:2}}>{x.label}</div>
                </div>
              ))}
            </div>
            <div style={{maxHeight:160,overflowY:'auto',borderRadius:8,border:'1px solid #21262d'}}>
              {(preview.isPDF ? preview.rows.slice(0,8) : preview.rows.slice(0,5)).map((r,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',
                  padding:'7px 12px',borderBottom:'1px solid #161b22',fontSize:12,color:'#8b949e'}}>
                  <span>{r.date}</span>
                  {preview.isPDF
                    ? <span style={{color: r.cat==='sap'?'#58a6ff':r.cat==='syrup'?'#3fb950':r.cat==='ro'?'#a78bfa':'#f59e0b'}}>
                        {r.val} gal {r.cat==='sap'?'sap':r.cat==='syrup'?'syrup':r.cat==='ro'?'RO':'evap'}
                      </span>
                    : <>
                        {r.sap>0   && <span style={{color:'#58a6ff'}}>{r.sap} gal sap</span>}
                        {r.syrup>0 && <span style={{color:'#3fb950'}}>{r.syrup} gal syrup</span>}
                        {r.ro>0    && <span style={{color:'#a78bfa'}}>{r.ro} gal RO</span>}
                      </>
                  }
                </div>
              ))}
              {preview.rows.length > (preview.isPDF ? 8 : 5) && (
                <div style={{padding:'6px 12px',fontSize:11,color:'#3d5068',textAlign:'center'}}>
                  + {preview.rows.length - (preview.isPDF ? 8 : 5)} more entries…
                </div>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose}
            style={{flex:1,padding:'13px',borderRadius:12,border:'1.5px solid #21262d',
              background:'#161b22',color:'#8b949e',fontSize:15,cursor:'pointer',fontWeight:500}}>
            Cancel
          </button>
          <button onClick={doImport} disabled={!preview || !!error}
            style={{flex:2,padding:'13px',borderRadius:12,border:'none',
              background: preview && !error ? '#238636' : '#1c2128',
              color: preview && !error ? '#fff' : '#484f58',
              fontSize:15,cursor: preview && !error ? 'pointer' : 'default',fontWeight:700}}>
            {preview && !error ? `Import ${preview.rows.length} entries into ${preview.isPDF && preview.detectedYear ? preview.detectedYear : season}` : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOG TAB ──────────────────────────────────────────────────────────────────
function LogTab({ season, setSeason, trees, setTrees, units, sapBrix, lang='en' }) {
  const u    = units === 'L' ? 'L' : 'gal';
  const conv = v => units === 'L' ? +(v*3.78541).toFixed(1) : +v.toFixed(1);
  const [logs, setLogs] = useState(()=>ls.get('sg_logs2',{}));
  const [showF, setShowF] = useState(false);
  const [showC, setShowC] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [autoCopy, setAutoCopy] = useState(()=>ls.get('sg_autocopy',{ro:false,evap:false}));
  const [bfTarget, setBfTarget] = useState({ro:false,evap:false});
  const setAutoCopyField = (field, val) => {
    const next = {...autoCopy, [field]:val};
    setAutoCopy(next); ls.set('sg_autocopy', next);
  };

  // ── Collection Points ────────────────────────────────────────────────────
  const PT_COLORS = ['#ff7b54','#a78bfa','#f472b6','#34d399','#fbbf24','#60a5fa'];
  const [cpoints,      setCpoints]      = useState(() => ls.get('sg_cpoints', []));
  const [activePoint,  setActivePoint]  = useState(null); // null = All/shared
  const [newPtName,    setNewPtName]    = useState('');
  const [showCPSetup,  setShowCPSetup]  = useState(false);

  const addCpoint = () => {
    const name = newPtName.trim();
    if (!name) return;
    const id = 'pt_' + Date.now();
    const color = PT_COLORS[cpoints.length % PT_COLORS.length];
    const next = [...cpoints, { id, name, color }];
    setCpoints(next); ls.set('sg_cpoints', next);
    setNewPtName('');
  };
  const removeCpoint = id => {
    const next = cpoints.filter(p => p.id !== id);
    setCpoints(next); ls.set('sg_cpoints', next);
    if (activePoint === id) setActivePoint(null);
  };
  const empty = { sapCollected:[], syrupMade:[], sapRO:[], sapEvap:[] };
  const slog  = logs[season] || empty;

  const updLog = (k, entries) => {
    const up = { ...logs, [season]:{ ...slog, [k]:entries } };
    setLogs(up); ls.set('sg_logs2', up);
  };
  const tot  = k => (slog[k]||[]).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
  const sapT = tot('sapCollected'), syT = tot('syrupMade'), roT = tot('sapRO'), evT = tot('sapEvap');
  const goal = trees*0.25, pct = goal>0 ? Math.min(100,(syT/goal)*100) : 0;
  const seasons = Object.keys(logs).map(Number).sort((a,b)=>b-a);

  const exportCSV = () => {
    const rows=[['Type','Date','Value (gal)','Note']];
    ['sapCollected','syrupMade','sapRO','sapEvap'].forEach(k=>{
      const label={sapCollected:t(lang,'sapCollected'),syrupMade:t(lang,'syrupMade'),sapRO:t(lang,'sapRO'),sapEvap:t(lang,'sapEvap')}[k];
      (slog[k]||[]).forEach(e=>rows.push([label,e.date,e.val,e.note||'']));
    });
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download=`sugarcalc-${season}.csv`; a.click();
  };

  const GRADES = ['—','Golden Delicate','Amber Rich','Dark Robust','Very Dark Strong'];
  const GRADE_LABELS = {'—':'—','Golden Delicate':t(lang,'gradeGolden'),'Amber Rich':t(lang,'gradeAmber'),'Dark Robust':t(lang,'gradeDark'),'Very Dark Strong':t(lang,'gradeVeryDark')};
  const GRADE_COLORS = { 'Golden Delicate':'#f5c842','Amber Rich':'#e0a44a','Dark Robust':'#c47a28','Very Dark Strong':'#8b4513' };

  function LogSection({ label, logKey, color, icon, showGrade=false, showBrix=false, onAdd=null }) {
    const entries        = slog[logKey] || [];
    // Filter displayed entries by active collection point (null = show all)
    const displayEntries = activePoint
      ? entries.filter(e => e.point === activePoint)
      : entries;
    const tot2    = displayEntries.reduce((s,e)=>s+(parseFloat(e.val)||0),0);
    const [val,   setVal]   = useState('');
    const [note,  setNote]  = useState('');
    const [grade, setGrade] = useState('—');
    const [brix,  setBrix]  = useState('');
    const [editDateId, setEditDateId] = useState(null);
    const Ic2 = I[icon];
    const toISO = ds => {
      const d = new Date(ds);
      if (isNaN(d)) return '';
      const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    };
    const add = () => {
      if (!val) return;
      const entry = {
        id:    Date.now(),
        date:  new Date().toLocaleDateString(),
        val:   parseFloat(val),
        note,
        grade: showGrade ? grade : undefined,
        brix:  showBrix && brix ? parseFloat(brix) : undefined,
        point: activePoint || undefined, // tag with active collection point
      };
      updLog(logKey, [...entries, entry]);
      if (onAdd) onAdd(parseFloat(val), entry.date, note);
      setVal(''); setNote(''); setGrade('—'); setBrix('');
    };
    // ID-based date edit (safe when entries are filtered)
    const updateDate = (id, isoVal) => {
      if (!isoVal) return;
      const [y,m,d] = isoVal.split('-').map(Number);
      const newDate = new Date(y, m-1, d).toLocaleDateString();
      updLog(logKey, entries.map(x => x.id===id ? {...x, date:newDate} : x));
      setEditDateId(null);
    };
    return (
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="card-icon" style={{ background:color+'33', width:36, height:36 }}>{Ic2?<Ic2 size={18} color={color}/>:null}</div>
            <div>
              <span style={{ fontWeight:600, fontSize:16 }}>{label}</span>
              {activePoint && (() => { const pt=cpoints.find(p=>p.id===activePoint); return pt ? <span style={{ fontSize:11, color:pt.color, fontWeight:700, marginLeft:6 }}>· {pt.name}</span> : null; })()}
            </div>
          </div>
          <span className="badge" style={{ background:color, color:'#fff' }}>{fmt(tot2,1)} {u}</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1 }}><NumInput value={val} onChange={setVal} min={0} step={0.1} placeholder={`${t(lang,'units')}…`} /></div>
          <div style={{ flex:2 }}><input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder={t(lang,'note')} onKeyDown={e=>e.key==='Enter'&&add()} /></div>
          <button onClick={add} className="btn-icon" style={{ background:color }}><I.check size={18} color="#fff" /></button>
        </div>
        {showBrix && (
          <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ flex:1 }}>
              <div className="field-label">{t(lang,'sapBrix')} <span style={{ color:'#3d5068', fontWeight:400 }}>({t(lang,'optional')})</span></div>
              <input type="number" value={brix} onChange={e=>setBrix(e.target.value)}
                min={0} max={10} step={0.1} placeholder="e.g. 2.1"
                style={{ width:'100%', boxSizing:'border-box' }} />
            </div>
          </div>
        )}
        {showGrade && (
          <div style={{ marginTop:8 }}>
            <div className="field-label">{t(lang,'syrupBrix')} {t(lang,'optional')}</div>
            <select value={grade} onChange={e=>setGrade(e.target.value)}>
              {GRADES.map(g=><option key={g} value={g}>{GRADE_LABELS[g]||g}</option>)}
            </select>
          </div>
        )}
        {displayEntries.length===0 && (
          <div style={{ textAlign:'center', color:'#3d5068', fontSize:13, padding:'10px 0' }}>
            {activePoint ? `No entries for this collection point yet.` : t(lang,'noEntries')}
          </div>
        )}
        {displayEntries.map((e)=>(
          <div key={e.id} className="log-entry">
            <div style={{ flex:1 }}>
              <span style={{ fontWeight:600 }}>{fmt(e.val,1)} {u}</span>
              {e.brix != null && <span style={{ fontSize:11, fontWeight:600, color:'#2dd4a7', background:'#2dd4a722', borderRadius:6, padding:'1px 7px', marginLeft:6 }}>{e.brix.toFixed(1)}°Bx</span>}
              {e.grade && e.grade !== '—' && <span style={{ fontSize:11, fontWeight:700, color: GRADE_COLORS[e.grade]||'#e0a44a', background:(GRADE_COLORS[e.grade]||'#e0a44a')+'22', borderRadius:6, padding:'1px 7px', marginLeft:6 }}>{GRADE_LABELS[e.grade]||e.grade}</span>}
              {/* Collection point badge — only show in All view to avoid redundancy */}
              {!activePoint && e.point && (() => { const pt=cpoints.find(p=>p.id===e.point); return pt ? <span style={{ fontSize:10, fontWeight:700, color:pt.color, background:pt.color+'22', borderRadius:5, padding:'1px 6px', marginLeft:5 }}>{pt.name}</span> : null; })()}
              {e.note && <span style={{ color:'#5a6a7a', fontSize:13 }}> · {e.note}</span>}
              {editDateId === e.id ? (
                <input type="date" autoFocus
                  defaultValue={toISO(e.date)}
                  onChange={ev => updateDate(e.id, ev.target.value)}
                  onBlur={() => setEditDateId(null)}
                  style={{ background:'#081622', border:'1px solid #58a6ff', borderRadius:6, padding:'1px 6px', color:'#c9d1d9', fontSize:12, marginLeft:8, outline:'none', colorScheme:'dark' }}
                />
              ) : (
                <span onClick={()=>setEditDateId(e.id)}
                  title="Click to edit date"
                  style={{ color:'#3d5068', fontSize:12, marginLeft:8, cursor:'pointer', borderBottom:'1px dotted #3d5068' }}>
                  {e.date}
                </span>
              )}
            </div>
            <button className="delete-btn" onClick={()=>updLog(logKey, entries.filter(x=>x.id!==e.id))}><I.x size={15} /></button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>

      {/* ── SapSpy / CSV Import Banner ── */}
      <div style={{ background:'linear-gradient(135deg,#071a0e,#0d2b15)', border:'1px solid #2d6a4f', borderRadius:14, padding:'16px 18px', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#3fb950', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Import Your Data</div>
          <div style={{ fontSize:14, fontWeight:600, color:'#c9d1d9', marginBottom:3 }}>SapSpy · SapTrac · Any CSV</div>
          <div style={{ fontSize:12, color:'#5a6a7a', lineHeight:1.5 }}>Already tracking in SugarCalc, SapSpy, or SapTrac? Import a PDF or CSV and SweetRun does the rest.</div>
        </div>
        <button onClick={()=>setShowImport(true)}
          style={{ background:'#3fb950', border:'none', borderRadius:10, padding:'11px 18px', fontWeight:700, fontSize:13, color:'#07090f', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
          Import CSV
        </button>
      </div>
      {showImport && <SapImportModal season={season} onClose={()=>setShowImport(false)} onImport={updated=>{setLogs(updated);}} />}

      {/* ── Sap Freshness Tracker ── */}
      <SapFreshnessTracker />

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:'#2dd4a7', fontWeight:600, letterSpacing:'0.1em', marginBottom:4 }}>{t(lang,'logTitle')}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:28, fontWeight:700 }}>{season}</span>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                <button onClick={()=>setSeason(s=>s+1)} style={{ background:'none', border:'none', color:'#5a6a7a', lineHeight:1, padding:'2px 6px' }}><I.chevUp size={14} color="#8b949e" /></button>
                <button onClick={()=>setSeason(s=>s-1)} style={{ background:'none', border:'none', color:'#5a6a7a', lineHeight:1, padding:'2px 6px' }}><I.chevDown size={14} color="#8b949e" /></button>
              </div>
            </div>
          </div>
          <div style={{ background:'#0f1720', borderRadius:10, padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
            <I.tree size={18} color="#3fb950" />
            <span style={{ fontSize:20, fontWeight:700 }}>{trees}</span>
            <button onClick={()=>{const n=parseInt(prompt('Number of trees:',trees));if(n>0)setTrees(n);}} style={{ background:'none', border:'none', color:'#5a6a7a', display:'flex', padding:2 }}><I.edit size={14} color="#8b949e" /></button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[{l:'SAP',c:'#2dd4a7',v:sapT},{l:'SYRUP',c:'#e0a44a',v:syT},{l:'R/O',c:'#58a6ff',v:roT},{l:'EVAPORATOR',c:'#f0883e',v:evT}].map(s=>(
            <div key={s.l} style={{ background:'linear-gradient(160deg,#121c28,#0d1520)', border:'1px solid #1a2840', borderRadius:10, padding:'10px 6px', textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:s.c }}>{fmt(s.v,1)}</div>
              <div style={{ fontSize:10, color:'#5a6a7a', fontWeight:600 }}>{s.l}</div>
              <div style={{ fontSize:10, color:'#3d5068' }}>{u}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontWeight:600, fontSize:14 }}>{t(lang,'seasonGoal')}</span>
          <span style={{ color:'#5a6a7a', fontSize:14 }}>{fmt(syT,1)} / {fmt(goal,1)} {u}</span>
        </div>
        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width:`${pct}%`, background:'#2dd4a7' }} /></div>
        <div style={{ fontSize:12, color:'#5a6a7a', marginTop:6 }}>{t(lang,'benchmark')}: 0.25 {u}/tree × {trees} trees = {fmt(goal,1)} {u} target</div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <button onClick={exportCSV} style={{ flex:1, background:'transparent', border:'1px solid #e0a44a', color:'#e0a44a', borderRadius:10, padding:'12px 16px', fontWeight:600, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}><I.download size={16} color="#e0a44a" /> CSV</button>
        <button onClick={()=>exportSeasonPDF({ season, trees, units, logs, brixLog: ls.get('sg_brixlog',[]), sapBrix })}
          style={{ flex:1, background:'transparent', border:'1px solid #58a6ff', color:'#58a6ff', borderRadius:10, padding:'12px 16px', fontWeight:600, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <I.clipboard size={16} color="#58a6ff" /> PDF Report
        </button>
      </div>

      {/* ── Collection Points setup ── */}
      <div className="card" style={{ marginBottom:8 }}>
        <div className="collapsible-header" onClick={()=>setShowCPSetup(s=>!s)}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <CardIcon bg="#1a1030" icon="circle" />
            <span style={{ fontWeight:600 }}>Collection Points</span>
            {cpoints.length > 0 && <span style={{ fontSize:12, color:'#5a6a7a' }}>{cpoints.length} defined</span>}
          </div>
          {showCPSetup ? <I.chevUp size={16} color="#8b949e" /> : <I.chevDown size={16} color="#8b949e" />}
        </div>
        {showCPSetup && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:10, lineHeight:1.5 }}>
              Track sap from separate pumphouses or gathering tanks. Select a collection point before logging to tag that entry — or leave it on <strong style={{ color:'#8a9ab0' }}>All</strong> for shared/unassigned entries.
            </div>
            {cpoints.map(pt => (
              <div key={pt.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid #131e2c' }}>
                <div style={{ width:11, height:11, borderRadius:'50%', background:pt.color, flexShrink:0 }} />
                <span style={{ flex:1, fontWeight:600, fontSize:14, color:'#e2eaf4' }}>{pt.name}</span>
                <button onClick={()=>removeCpoint(pt.id)} style={{ background:'none', border:'none', color:'#3d5068', cursor:'pointer', fontSize:12, textDecoration:'underline' }}>Remove</button>
              </div>
            ))}
            {cpoints.length < 6 && (
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <input type="text" value={newPtName} onChange={e=>setNewPtName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addCpoint()}
                  placeholder="e.g. Pumphouse 1, North Woods…"
                  style={{ flex:1 }} />
                <button onClick={addCpoint} style={{ background:'#2dd4a7', border:'none', borderRadius:8, padding:'0 16px', fontWeight:700, fontSize:14, color:'#07090f', cursor:'pointer' }}>Add</button>
              </div>
            )}
            {cpoints.length === 6 && <div style={{ fontSize:12, color:'#3d5068', marginTop:8 }}>Maximum 6 collection points.</div>}
          </div>
        )}
      </div>

      {/* Auto-copy settings */}
      <div className="card" style={{ marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <I.zap size={15} color="#8b949e" />
          <span style={{ fontWeight:600, fontSize:14 }}>Auto-copy Sap Collected</span>
          <span style={{ fontSize:12, color:'#3d5068' }}>(off by default)</span>
        </div>
        <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:10 }}>When you log sap collected, automatically add the same amount to:</div>
        <div style={{ display:'flex', gap:16 }}>
          <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14 }}>
            <input type="checkbox" checked={autoCopy.ro} onChange={e=>setAutoCopyField('ro',e.target.checked)}
              style={{ accentColor:'#58a6ff', width:16, height:16 }} />
            <span style={{ color:'#58a6ff', fontWeight:600 }}>R/O</span>
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14 }}>
            <input type="checkbox" checked={autoCopy.evap} onChange={e=>setAutoCopyField('evap',e.target.checked)}
              style={{ accentColor:'#f0883e', width:16, height:16 }} />
            <span style={{ color:'#f0883e', fontWeight:600 }}>Evaporator</span>
          </label>
        </div>
      </div>

      {/* ── FILL FROM SEASON TOTAL ── */}
      {sapT > 0 && (
        <div className="card" style={{ marginBottom:8, background:'rgba(88,166,255,0.04)', border:'1px solid rgba(88,166,255,0.18)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <I.download size={15} color="#58a6ff" />
            <span style={{ fontWeight:700, fontSize:14, color:'#e6edf3' }}>Fill R/O &amp; Evaporator from Season Total</span>
          </div>
          <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:12, lineHeight:1.5 }}>
            You have <strong style={{ color:'#2dd4a7' }}>{fmt(sapT,1)} gal</strong> of sap logged this season.
            If all of it went through R/O and/or the evaporator, use this to add that total as a single entry — no need to re-enter run by run.
          </div>
          <div style={{ display:'flex', gap:16, marginBottom:14 }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <input type="checkbox" checked={bfTarget.ro} onChange={e=>setBfTarget(p=>({...p,ro:e.target.checked}))}
                style={{ accentColor:'#58a6ff', width:17, height:17 }} />
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#58a6ff' }}>R/O</div>
                {roT > 0 && <div style={{ fontSize:11, color:'#f0883e', marginTop:1 }}>{fmt(roT,1)} gal already logged — will add to it</div>}
              </div>
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <input type="checkbox" checked={bfTarget.evap} onChange={e=>setBfTarget(p=>({...p,evap:e.target.checked}))}
                style={{ accentColor:'#f0883e', width:17, height:17 }} />
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#f0883e' }}>Evaporator</div>
                {evT > 0 && <div style={{ fontSize:11, color:'#f0883e', marginTop:1 }}>{fmt(evT,1)} gal already logged — will add to it</div>}
              </div>
            </label>
          </div>
          <button
            disabled={!bfTarget.ro && !bfTarget.evap}
            onClick={() => {
              const targets = [bfTarget.ro && 'R/O', bfTarget.evap && 'Evaporator'].filter(Boolean).join(' and ');
              const warn = [bfTarget.ro && roT > 0 && `R/O already has ${fmt(roT,1)} gal`, bfTarget.evap && evT > 0 && `Evaporator already has ${fmt(evT,1)} gal`].filter(Boolean);
              const warnStr = warn.length > 0 ? `\n\nHeads up: ${warn.join(', ')} — this adds on top of that, it does not replace it.` : '';
              if (!window.confirm(`Add ${fmt(sapT,1)} gal to ${targets}?${warnStr}`)) return;
              const today = new Date().toISOString().split('T')[0];
              setLogs(prev => {
                const prevSlog = prev[season] || empty;
                const updates  = { ...prevSlog };
                if (bfTarget.ro)   updates.sapRO   = [...(prevSlog.sapRO  ||[]), { id:Date.now(),   date:today, val:sapT, note:'← season total (all sap)' }];
                if (bfTarget.evap) updates.sapEvap = [...(prevSlog.sapEvap||[]), { id:Date.now()+1, date:today, val:sapT, note:'← season total (all sap)' }];
                const up = { ...prev, [season]: updates };
                ls.set('sg_logs2', up);
                return up;
              });
              setBfTarget({ro:false,evap:false});
            }}
            style={{ width:'100%', padding:'12px', borderRadius:10, border:'none',
              background: (bfTarget.ro||bfTarget.evap) ? 'linear-gradient(135deg,#1a3a5c,#0f2a45)' : '#0d1520',
              color: (bfTarget.ro||bfTarget.evap) ? '#58a6ff' : '#3d5068',
              fontSize:14, fontWeight:700, cursor:(bfTarget.ro||bfTarget.evap)?'pointer':'not-allowed',
              transition:'all 0.15s' }}>
            ↓ Add {fmt(sapT,1)} gal to {[bfTarget.ro&&'R/O',bfTarget.evap&&'Evaporator'].filter(Boolean).join(' + ') || 'selected fields'}
          </button>
        </div>
      )}

      {/* ── Collection Point filter pills (only shown when points are defined) ── */}
      {cpoints.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12, padding:'2px 0' }}>
          <button onClick={()=>setActivePoint(null)}
            style={{ background: activePoint===null ? '#2dd4a7' : '#0f1720', border:`1px solid ${activePoint===null ? '#2dd4a7' : '#1e2d3d'}`, borderRadius:20, padding:'5px 14px', color: activePoint===null ? '#07090f' : '#5a6a7a', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
            All
          </button>
          {cpoints.map(pt => (
            <button key={pt.id} onClick={()=>setActivePoint(pt.id)}
              style={{ background: activePoint===pt.id ? pt.color+'30' : '#0f1720', border:`1px solid ${activePoint===pt.id ? pt.color : '#1e2d3d'}`, borderRadius:20, padding:'5px 14px', color: activePoint===pt.id ? pt.color : '#5a6a7a', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:pt.color, display:'inline-block' }} />
              {pt.name}
            </button>
          ))}
        </div>
      )}

      <LogSection label={t(lang,'sapCollected')} logKey="sapCollected" color="#2dd4a7" icon="package" showBrix={true}
        onAdd={(amount, date, note) => {
          if (!autoCopy.ro && !autoCopy.evap) return;
          // Use functional updater so both RO + Evap are written atomically
          // (avoids stale-closure overwrite when both boxes are checked)
          setLogs(prevLogs => {
            const prevSlog = prevLogs[season] || empty;
            const updates  = { ...prevSlog };
            if (autoCopy.ro)   updates.sapRO   = [...(prevSlog.sapRO  ||[]), { id:Date.now(),   date, val:amount, note:'← auto from sap collected' }];
            if (autoCopy.evap) updates.sapEvap = [...(prevSlog.sapEvap||[]), { id:Date.now()+1, date, val:amount, note:'← auto from sap collected' }];
            const up = { ...prevLogs, [season]: updates };
            ls.set('sg_logs2', up);
            return up;
          });
        }}
      />
      <LogSection label={t(lang,'syrupMade')}    logKey="syrupMade"    color="#e0a44a" icon="droplet" showGrade={true} />
      <LogSection label={t(lang,'sapRO')}        logKey="sapRO"        color="#58a6ff" icon="filter"  />
      <LogSection label={t(lang,'sapEvap')}      logKey="sapEvap"      color="#f0883e" icon="flame"   />

      <div style={{ textAlign:'center', marginBottom:14 }}>
        <button onClick={()=>{if(!window.confirm('Clear all data for '+season+'?'))return;const up={...logs};delete up[season];setLogs(up);ls.set('sg_logs2',up);}} style={{ background:'none', border:'none', color:'#3d5068', fontSize:14, textDecoration:'underline', cursor:'pointer' }}>
          {t(lang,'clearSeason')}
        </button>
      </div>

      <div className="card">
        <div className="collapsible-header" onClick={()=>setShowF(s=>!s)}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}><CardIcon bg="#2d2010" icon="zap" /><span style={{ fontWeight:600 }}>{t(lang,'seasonForecast')}</span></div>
          {showF ? <I.chevUp size={16} color="#8b949e" /> : <I.chevDown size={16} color="#8b949e" />}
        </div>
        {showF && (
          <div style={{ marginTop:12 }}>
            {sapT===0 ? <div style={{ textAlign:'center', color:'#3d5068', fontSize:14, padding:'10px 0' }}>No sap logged yet. Start collecting to see a forecast.</div> : (
              <div>
                <InfoRow label={t(lang,'collectedSoFar')}            value={`${fmt(sapT,1)} ${u}`} />
                <InfoRow label={`${t(lang,'projectedYield')} (at ${fmt(rule86(sapBrix),0)}:1)`} value={`${fmt(syrupY(sapT,sapBrix),1)} ${u}`} />
                <InfoRow label={t(lang,'progressToGoal')}            value={`${fmt(pct,0)}%`} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="collapsible-header" onClick={()=>setShowC(s=>!s)}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}><CardIcon bg="#1c2128" icon="barChart" /><span style={{ fontWeight:600 }}>{t(lang,'seasonComparison')}</span></div>
          {showC ? <I.chevUp size={16} color="#8b949e" /> : <I.chevDown size={16} color="#8b949e" />}
        </div>
        {showC && (
          <div style={{ marginTop:12 }}>
            {seasons.length===0 ? <div style={{ textAlign:'center', color:'#3d5068', fontSize:14 }}>{t(lang,'noSeasonData')}</div> : (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, fontSize:12, fontWeight:600, color:'#5a6a7a', marginBottom:6, padding:'0 4px' }}>
                  <span>Season</span><span style={{ textAlign:'right' }}>Sap</span><span style={{ textAlign:'right' }}>Syrup</span>
                </div>
                {seasons.map(yr=>{
                  const sl=logs[yr]||empty;
                  const s2=(sl.sapCollected||[]).reduce((a,e)=>a+(parseFloat(e.val)||0),0);
                  const sy2=(sl.syrupMade||[]).reduce((a,e)=>a+(parseFloat(e.val)||0),0);
                  return (
                    <div key={yr} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, padding:'8px 4px', borderBottom:'1px solid #21262d', fontSize:14 }}>
                      <span style={{ fontWeight:yr===season?700:400, color:yr===season?'#2dd4a7':'#e6edf3' }}>{yr}</span>
                      <span style={{ textAlign:'right' }}>{fmt(s2,1)}</span>
                      <span style={{ textAlign:'right', color:'#e0a44a' }}>{fmt(sy2,1)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EQUIP TAB ────────────────────────────────────────────────────────────────
function EquipTab({ lang='en' }) {
  const [items, setItems] = useState(()=>ls.get('sg_equip2',[]));
  const [show,  setShow]  = useState(false);
  const [form,  setForm]  = useState({ name:'', brand:'', qty:1, year:'', condition:'Good', notes:'' });
  useEffect(()=>{ ls.set('sg_equip2',items); },[items]);
  const addItem = () => {
    if (!form.name.trim()) return;
    setItems(p=>[...p,{...form,id:Date.now()}]);
    setForm({name:'',brand:'',qty:1,year:'',condition:'Good',notes:''});
    setShow(false);
  };
  const cColor = { Good:'#3fb950', Fair:'#e0a44a', Poor:'#f85149' };

  // ── Transfer Time Calculator state ───────────────────────────────────────
  const [showTransfer, setShowTransfer] = useState(false);
  const [pumpGPM,  setPumpGPM]  = useState(() => ls.get('sg_pump_gpm',    28));
  const [tankGal,  setTankGal]  = useState(() => ls.get('sg_pump_tank',  300));
  const [lineLen,  setLineLen]  = useState(() => ls.get('sg_pump_line',    0));
  const [liftFt,   setLiftFt]   = useState(() => ls.get('sg_pump_lift',    0));
  const [setupMin, setSetupMin] = useState(() => ls.get('sg_pump_setup',   4));
  const saveP = (key, setter) => v => { setter(v); ls.set(key, v); };

  // Physics model: calibrated to match 800 ft + 12 ft lift → 18 min for 300 gal at 28 GPM
  const flowFactor    = Math.max(0.30, 1 - (lineLen / 1000) * 0.25 - (liftFt / 50) * 0.30);
  const effectiveGPM  = pumpGPM * flowFactor;
  const baseFillMin   = tankGal / Math.max(pumpGPM, 0.1);
  const realFillMin   = tankGal / Math.max(effectiveGPM, 0.1);
  const baseTotal     = baseFillMin + setupMin;
  const realisticTotal= realFillMin + setupMin;
  const extraMin      = realisticTotal - baseTotal;

  // Season haul estimate from log data
  const curSeason = ls.get('sg_season', new Date().getFullYear());
  const sapT      = ((ls.get('sg_logs2',{})[curSeason]||{}).sapCollected||[])
                      .reduce((s,e)=>s+(parseFloat(e.val)||0),0);
  const numHauls  = sapT > 0 ? Math.ceil(sapT / (tankGal * 0.90)) : null; // haul at 90% full
  const totalHaulHrs = numHauls ? (numHauls * realisticTotal / 60) : null;

  return (
    <div>
      {/* ── Transfer Time Calculator ── */}
      <div className="card" style={{ marginBottom:14 }}>
        <div className="collapsible-header" onClick={()=>setShowTransfer(s=>!s)}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <CardIcon bg="#0d1a2b" icon="clock" />
            <span style={{ fontWeight:600 }}>Transfer Time Calculator</span>
          </div>
          {showTransfer ? <I.chevUp size={16} color="#8b949e" /> : <I.chevDown size={16} color="#8b949e" />}
        </div>
        {showTransfer && (
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:12, lineHeight:1.5 }}>
              Enter your pump and line specs to get a realistic haul time estimate.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>Pump flow (GPM)</div>
                <input type="number" value={pumpGPM} min={1} max={500} step={1}
                  onChange={e => saveP('sg_pump_gpm', setPumpGPM)(parseFloat(e.target.value)||28)}
                  style={{ width:'100%', boxSizing:'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>Tank size (gal)</div>
                <input type="number" value={tankGal} min={10} max={10000} step={50}
                  onChange={e => saveP('sg_pump_tank', setTankGal)(parseFloat(e.target.value)||300)}
                  style={{ width:'100%', boxSizing:'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>Line length (ft)</div>
                <input type="number" value={lineLen} min={0} max={5000} step={50}
                  onChange={e => saveP('sg_pump_line', setLineLen)(parseFloat(e.target.value)||0)}
                  style={{ width:'100%', boxSizing:'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>Vertical lift (ft)</div>
                <input type="number" value={liftFt} min={0} max={200} step={1}
                  onChange={e => saveP('sg_pump_lift', setLiftFt)(parseFloat(e.target.value)||0)}
                  style={{ width:'100%', boxSizing:'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>Setup time (min)</div>
                <input type="number" value={setupMin} min={0} max={30} step={1}
                  onChange={e => saveP('sg_pump_setup', setSetupMin)(parseFloat(e.target.value)||4)}
                  style={{ width:'100%', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
                <div style={{ fontSize:12, color:'#3d5068', lineHeight:1.4 }}>
                  {effectiveGPM < pumpGPM
                    ? `Line + lift reduces flow to ~${effectiveGPM.toFixed(0)} GPM`
                    : 'No friction/lift penalty'}
                </div>
              </div>
            </div>

            {/* Results */}
            <div style={{ background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#3d5068', marginBottom:2 }}>Theoretical</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#8a9ab0' }}>{baseTotal.toFixed(0)} <span style={{ fontSize:13, fontWeight:400 }}>min</span></div>
                  <div style={{ fontSize:11, color:'#3d5068' }}>{baseFillMin.toFixed(0)} fill + {setupMin} setup</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#2dd4a7', marginBottom:2, fontWeight:600 }}>Realistic</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#2dd4a7' }}>{realisticTotal.toFixed(0)} <span style={{ fontSize:13, fontWeight:400 }}>min</span></div>
                  <div style={{ fontSize:11, color:'#3d5068' }}>{realFillMin.toFixed(0)} fill + {setupMin} setup{extraMin > 0.5 ? ` (+${extraMin.toFixed(0)} friction)` : ''}</div>
                </div>
              </div>

              {numHauls && (
                <div style={{ borderTop:'1px solid #1e2d3d', paddingTop:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, color:'#8a9ab0' }}>Hauls this season ({curSeason})</span>
                    <span style={{ fontWeight:700, fontSize:14, color:'#e2eaf4' }}>{numHauls} hauls</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, color:'#8a9ab0' }}>Total haul time</span>
                    <span style={{ fontWeight:700, fontSize:14, color:'#e2eaf4' }}>{totalHaulHrs.toFixed(1)} hrs</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:13, color:'#8a9ab0' }}>Avg gal/haul</span>
                    <span style={{ fontWeight:700, fontSize:14, color:'#e2eaf4' }}>{(sapT / numHauls).toFixed(0)} gal</span>
                  </div>
                  <div style={{ fontSize:11, color:'#3d5068', marginTop:8, lineHeight:1.5 }}>
                    Based on {sapT.toFixed(0)} gal logged · hauling at 90% tank capacity ({(tankGal * 0.9).toFixed(0)} gal)
                  </div>
                </div>
              )}
              {!numHauls && (
                <div style={{ fontSize:12, color:'#3d5068', textAlign:'center', paddingTop:6 }}>
                  Log sap in the Log tab to see seasonal haul estimates.
                </div>
              )}
            </div>

            {/* Smart scheduling tip */}
            {numHauls && totalHaulHrs && (
              <div style={{ background:'rgba(45,212,167,0.06)', border:'1px solid rgba(45,212,167,0.2)', borderRadius:10, padding:'10px 12px', marginTop:10 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#2dd4a7', marginBottom:4 }}>Smart Scheduling Tip</div>
                <div style={{ fontSize:12, color:'#5a6a7a', lineHeight:1.5 }}>
                  Hauling at 90% full ({(tankGal * 0.9).toFixed(0)} gal) instead of daily keeps your runs fewer and longer. Coordinate hauls with forecast sap-run days to minimize idle trips.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={()=>setShow(s=>!s)} style={{ background:'transparent', border:'1px solid #2dd4a7', color:'#2dd4a7', borderRadius:10, padding:'13px 20px', fontSize:15, fontWeight:600, width:'100%', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        <I.wrench size={16} color="#2dd4a7" /> {t(lang,'addEquipItem')}
      </button>
      {show && (
        <div className="card">
          <div style={{ fontWeight:600, fontSize:16, marginBottom:14 }}>{t(lang,'newItem')}</div>
          <div style={{ marginBottom:8 }}><input type="text" placeholder={t(lang,'equipNamePh')} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
          <div className="two-col" style={{ marginBottom:8 }}>
            <input type="text" placeholder={t(lang,'equipBrandPh')} value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))} />
            <NumInput value={form.qty} onChange={v=>setForm(p=>({...p,qty:v}))} min={1} max={9999} step={1} placeholder={t(lang,'equipQtyPh')} />
          </div>
          <div className="two-col" style={{ marginBottom:8 }}>
            <input type="text" placeholder={t(lang,'equipYearPh')} value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))} />
            <select value={form.condition} onChange={e=>setForm(p=>({...p,condition:e.target.value}))}><option value="Good">{t(lang,'condGood')}</option><option value="Fair">{t(lang,'condFair')}</option><option value="Poor">{t(lang,'condPoor')}</option></select>
          </div>
          <input type="text" placeholder={t(lang,'notes')} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{ marginBottom:12 }} />
          <div className="two-col">
            <button className="btn-secondary" onClick={()=>setShow(false)}>{t(lang,'cancel')}</button>
            <button className="btn-primary" onClick={addItem}>{t(lang,'add')}</button>
          </div>
        </div>
      )}
      {items.length===0 && !show && (
        <div className="card" style={{ textAlign:'center', padding:'40px 20px' }}>
          <I.wrench size={40} color="#30363d" />
          <div style={{ fontWeight:600, fontSize:16, marginBottom:6, marginTop:12 }}>{t(lang,'noEquipYet')}</div>
          <div style={{ color:'#3d5068', fontSize:14 }}>{t(lang,'equipDesc')}</div>
        </div>
      )}
      {items.map((item,i)=>(
        <div key={item.id} className="equip-item">
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:16, marginBottom:4 }}>{item.name}</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:4 }}>
              {item.brand && <span style={{ color:'#5a6a7a', fontSize:13 }}>{item.brand}</span>}
              {item.year  && <span style={{ color:'#5a6a7a', fontSize:13 }}>· {item.year}</span>}
              {item.qty>1 && <span style={{ color:'#5a6a7a', fontSize:13 }}>· {t(lang,'equipQtyLabel')} {item.qty}</span>}
              <span style={{ fontSize:12, fontWeight:600, color:cColor[item.condition]||'#8b949e' }}>● {item.condition==='Good'?t(lang,'condGood'):item.condition==='Fair'?t(lang,'condFair'):t(lang,'condPoor')}</span>
            </div>
            {item.notes && <div style={{ color:'#3d5068', fontSize:13 }}>{item.notes}</div>}
          </div>
          <button className="delete-btn" onClick={()=>setItems(p=>p.filter((_,j)=>j!==i))}><I.trash size={15} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── TASKS TAB ────────────────────────────────────────────────────────────────
function TasksTab({ season, lang='en' }) {
  const [phase,  setPhase]  = useState('pre');
  const [checks, setChecks] = useState(()=>ls.get('sg_checks2',{}));
  const [custom, setCustom] = useState(()=>ls.get('sg_custom2',{pre:[],post:[]}));
  const [newT,   setNewT]   = useState('');
  useEffect(()=>{ ls.set('sg_checks2',checks); },[checks]);
  useEffect(()=>{ ls.set('sg_custom2',custom);  },[custom]);

  const key    = `${season}-${phase}`;
  const base   = phase==='pre' ? PRE_TASKS : POST_TASKS;
  const cust   = custom[phase]||[];
  const all    = [...base,...cust];
  const chk    = checks[key]||{};
  const done   = all.filter((_,i)=>chk[i]).length;
  const pct    = all.length>0 ? Math.round((done/all.length)*100) : 0;
  const toggle = i => setChecks(p=>({...p,[key]:{...chk,[i]:!chk[i]}}));
  const reset  = () => { const up={...checks}; delete up[key]; setChecks(up); };
  const addT   = () => { if(!newT.trim())return; setCustom(p=>({...p,[phase]:[...(p[phase]||[]),newT.trim()]})); setNewT(''); };
  const remT   = idx => { setCustom(p=>({...p,[phase]:(p[phase]||[]).filter((_,i)=>i!==idx)})); };

  return (
    <div>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <I.clipboard size={22} color="#e6edf3" />
            <span style={{ fontWeight:700, fontSize:18 }}>{t(lang,'seasonChecklists')}</span>
            <span className="badge">{season}</span>
          </div>
          <button onClick={reset} title="Reset" style={{ background:'none', border:'none', color:'#5a6a7a', display:'flex', padding:4 }}><I.refresh size={18} color="#8b949e" /></button>
        </div>
        <div className="two-col" style={{ marginBottom:12, gap:6 }}>
          <button onClick={()=>setPhase('pre')}  style={{ background:phase==='pre'?'linear-gradient(135deg,#2dd4a7,#1fbf94)':'#0f1720', color:phase==='pre'?'#07090f':'#5a6a7a', border:`1px solid ${phase==='pre'?'transparent':'#1e2d3d'}`, borderRadius:11, padding:11, fontWeight:700, fontSize:14, boxShadow:phase==='pre'?'0 3px 14px rgba(45,212,167,0.28)':'none', transition:'all 0.18s' }}>{t(lang,'preSeason')}</button>
          <button onClick={()=>setPhase('post')} style={{ background:phase==='post'?'linear-gradient(135deg,#e0a44a,#c88a2a)':'#0f1720', color:phase==='post'?'#07090f':'#5a6a7a', border:`1px solid ${phase==='post'?'transparent':'#1e2d3d'}`, borderRadius:11, padding:11, fontWeight:700, fontSize:14, boxShadow:phase==='post'?'0 3px 14px rgba(224,164,74,0.28)':'none', transition:'all 0.18s' }}>{t(lang,'postSeason')}</button>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:14, color:'#5a6a7a' }}>
          <span>{done} {t(lang,'taskOf')} {all.length} {t(lang,'taskDone')}</span><span>{pct}%</span>
        </div>
        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width:`${pct}%`, background:phase==='pre'?'#2dd4a7':'#e0a44a' }} /></div>
      </div>

      <div className="card" style={{ padding:0 }}>
        {all.map((task,i)=>{
          const isC = i>=base.length;
          return (
            <div key={i} className="checklist-item" onClick={()=>toggle(i)}>
              <div className={`checkbox${chk[i]?' checked':''}`}>{chk[i]&&<I.check size={13} color="#0d1117" />}</div>
              <span style={{ flex:1, fontSize:15, color:chk[i]?'#6e7681':'#e6edf3', textDecoration:chk[i]?'line-through':'none', lineHeight:1.4 }}>{task}</span>
              {isC && <button onClick={e=>{e.stopPropagation();remT(i-base.length);}} className="delete-btn"><I.x size={15} /></button>}
            </div>
          );
        })}
        <div style={{ padding:'12px 16px', display:'flex', gap:8, alignItems:'center' }}>
          <input type="text" placeholder={t(lang,'addCustomTask')} value={newT} onChange={e=>setNewT(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addT()} style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid #30363d', borderRadius:0, padding:'6px 0', color:'#e6edf3' }} />
          {newT && <button onClick={addT} style={{ background:'#2dd4a7', border:'none', borderRadius:8, padding:'6px 14px', fontWeight:600, color:'#0d1117', fontSize:14 }}>Add</button>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── SEASON TAB (Degree Days + Brix Trend) ────────────────────────────────────
function SeasonTab({ season, lang='en' }) {
  const [lat,      setLat]      = useState(() => ls.get('sg_ddlat', null));
  const [lon,      setLon]      = useState(() => ls.get('sg_ddlon', null));
  const [locName,  setLocName]  = useState(() => ls.get('sg_ddloc', ''));
  const [zip,      setZip]      = useState('');
  const [ddStart,  setDdStart]  = useState(() => ls.get('sg_ddstart', ''));
  const [ddData,   setDdData]   = useState(null);
  const [ddLoad,   setDdLoad]   = useState(false);
  const [ddErr,    setDdErr]    = useState('');
  const [brixLog,  setBrixLog]  = useState(() => ls.get('sg_brixlog', []));
  const [brixIn,   setBrixIn]   = useState('');
  const [noteIn,   setNoteIn]   = useState('');
  const [showDays, setShowDays] = useState(false);

  useEffect(() => { ls.set('sg_ddlat',   lat);     }, [lat]);
  useEffect(() => { ls.set('sg_ddlon',   lon);     }, [lon]);
  useEffect(() => { ls.set('sg_ddloc',   locName); }, [locName]);
  useEffect(() => { ls.set('sg_ddstart', ddStart); }, [ddStart]);
  useEffect(() => { ls.set('sg_brixlog', brixLog); }, [brixLog]);

  const fetchDD = async (la, lo, start) => {
    if (!start || !la) return;
    setDdLoad(true); setDdErr('');
    const today = new Date().toISOString().split('T')[0];
    const end   = start > today ? start : today;
    try {
      const r = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${la}&longitude=${lo}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`);
      const d = await r.json();
      if (d.error) throw new Error(d.reason);
      setDdData(d);
    } catch(e) { setDdErr('Could not load weather history. ' + (e.message||'')); }
    setDdLoad(false);
  };

  const useGPS = () => {
    if (location.protocol === 'file:') { setDdErr('GPS requires HTTPS hosting. Enter a zip code instead.'); return; }
    if (!navigator.geolocation) { setDdErr('GPS not supported.'); return; }
    setDdLoad(true); setDdErr('');
    navigator.geolocation.getCurrentPosition(p => {
      const la = p.coords.latitude, lo = p.coords.longitude;
      setLat(la); setLon(lo); setLocName(`${la.toFixed(2)}, ${lo.toFixed(2)}`);
      if (ddStart) fetchDD(la, lo, ddStart);
      else setDdLoad(false);
    }, () => { setDdErr('Location denied.'); setDdLoad(false); });
  };

  const searchZip = async () => {
    if (!zip.trim()) return;
    setDdLoad(true); setDdErr('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}&count=1&language=en&format=json`);
      const d = await r.json();
      if (d.results?.length) {
        const { latitude: la, longitude: lo, name, admin1 } = d.results[0];
        setLat(la); setLon(lo); setLocName(`${name}${admin1 ? ', '+admin1 : ''}`);
        if (ddStart) fetchDD(la, lo, ddStart);
        else setDdLoad(false);
      } else { setDdErr('Location not found.'); setDdLoad(false); }
    } catch { setDdErr('Search failed.'); setDdLoad(false); }
  };

  const refresh = () => { if (lat && ddStart) fetchDD(lat, lon, ddStart); };

  // Calculate degree days (base 40°F)
  let cumDD = 0, dailyDD = [];
  if (ddData?.daily) {
    ddData.daily.time.forEach((date, i) => {
      const hi = ddData.daily.temperature_2m_max[i] ?? 0;
      const lo = ddData.daily.temperature_2m_min[i] ?? 0;
      const dd = Math.max(0, ((hi + lo) / 2) - 40);
      cumDD += dd;
      dailyDD.push({ date, hi: Math.round(hi), lo: Math.round(lo), dd: +dd.toFixed(1), cum: +cumDD.toFixed(1) });
    });
  }

  // Brix sparkline
  const addBrix = () => {
    if (!brixIn) return;
    setBrixLog(p => [...p, { id:Date.now(), date:new Date().toLocaleDateString(), brix:parseFloat(brixIn), note:noteIn }]);
    setBrixIn(''); setNoteIn('');
  };
  const bVals = brixLog.map(e => e.brix);
  const bMin  = bVals.length ? Math.min(...bVals) : 0;
  const bMax  = bVals.length ? Math.max(...bVals) : 4;
  const bRange = bMax - bMin || 1;
  const SW = 320, SH = 80;

  // Buddy sap warning: last reading is lower than peak by >30%
  const peak    = Math.max(...(bVals.length ? bVals : [0]));
  const lastB   = bVals[bVals.length - 1] || 0;
  const buddyWarn = bVals.length >= 3 && lastB < peak * 0.7;

  return (
    <div>
      {/* ── Degree Days ── */}
      <div className="card">
        <div className="card-title"><CardIcon bg="#0d2b15" icon="sun" />{t(lang,'ddTitle')}</div>
        <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:12, lineHeight:1.5 }}>{t(lang,'ddDesc')}
        </div>

        {/* Location */}
        {!lat ? (
          <>
            <button className="btn-secondary" style={{ marginBottom:10 }} onClick={useGPS}>
              <I.mapPin size={16} color="#8b949e" /> {t(lang,'useGPS')}
            </button>
            <div style={{ textAlign:'center', color:'#3d5068', fontSize:12, marginBottom:8 }}>{t(lang,'ftOr')}</div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <input type="text" placeholder={t(lang,'cityZip')} value={zip} onChange={e=>setZip(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchZip()} style={{ flex:1 }} />
              <button onClick={searchZip} style={{ background:'#2dd4a7', border:'none', borderRadius:8, width:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><I.search size={18} color="#0d1117" /></button>
            </div>
          </>
        ) : (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><I.mapPin size={14} color="#2dd4a7" /><span style={{ fontSize:13, color:'#b0bec8' }}>{locName}</span></div>
            <button onClick={()=>{setLat(null);setLon(null);setLocName('');setDdData(null);}} style={{ background:'none', border:'none', color:'#3d5068', fontSize:12, cursor:'pointer', textDecoration:'underline' }}>{t(lang,'changeLocation')}</button>
          </div>
        )}

        {/* Season start date */}
        <div className="field-label">{t(lang,'startDate')}</div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input type="date" value={ddStart} onChange={e=>setDdStart(e.target.value)} style={{ flex:1 }} />
          <button onClick={refresh} style={{ background:'#2dd4a7', border:'none', borderRadius:8, width:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><I.search size={18} color="#0d1117" /></button>
        </div>

        {ddLoad && <div style={{ textAlign:'center', color:'#5a6a7a', fontSize:14 }}>{t(lang,'loadingWeather')}</div>}
        {ddErr  && <div style={{ color:'#f85149', fontSize:13 }}>{ddErr}</div>}

        {dailyDD.length > 0 && (
          <>
            {/* Summary */}
            <div className="result-box green">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'#5a6a7a', fontWeight:600 }}>{t(lang,'totalDD')}</div>
                  <div style={{ fontSize:32, fontWeight:800, color:'#3fb950' }}>{Math.round(cumDD)}</div>
                  <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'sinceTapDay')}</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'#5a6a7a', fontWeight:600 }}>{t(lang,'days')}</div>
                  <div style={{ fontSize:32, fontWeight:800, color:'#3fb950' }}>{dailyDD.length}</div>
                  <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'inSeason')}</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'#5a6a7a', fontWeight:600 }}>{t(lang,'avgDay')}</div>
                  <div style={{ fontSize:32, fontWeight:800, color:'#3fb950' }}>{(cumDD/dailyDD.length).toFixed(1)}</div>
                  <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'ddPerDay')}</div>
                </div>
              </div>
            </div>

            {/* DD context */}
            <div style={{ marginTop:10 }}>
              {[
                { threshold:0,   label:'Season opening',    note:'First sap runs possible' },
                { threshold:50,  label:'Early season',      note:'Runs improving' },
                { threshold:150, label:'Peak season',       note:'Best run conditions' },
                { threshold:300, label:'Late season',       note:'Brix dropping, watch for buddy' },
                { threshold:500, label:'Season end likely', note:'Trees budding soon' },
              ].map((m, i, arr) => {
                const next = arr[i+1];
                const active = cumDD >= m.threshold && (!next || cumDD < next.threshold);
                return (
                  <div key={m.threshold} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:8, marginBottom:4, background: active?'#081e0e':'transparent', border: active?'1px solid #1a4a25':'1px solid transparent' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: cumDD >= m.threshold ? '#3fb950' : '#253040', flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <span style={{ fontWeight: active?700:400, color: active?'#3fb950':'#5a6a7a', fontSize:14 }}>{m.label}</span>
                      {active && <span style={{ color:'#5a6a7a', fontSize:12 }}> · {m.note}</span>}
                    </div>
                    <span style={{ fontSize:12, color:'#3d5068' }}>{m.threshold} DD</span>
                  </div>
                );
              })}
            </div>

            {/* Daily breakdown (collapsible) */}
            <div style={{ marginTop:10 }}>
              <div className="collapsible-header" onClick={()=>setShowDays(s=>!s)} style={{ padding:'4px 0' }}>
                <span style={{ fontSize:13, color:'#5a6a7a' }}>{t(lang,'dailyBreakdown')} ({dailyDD.length})</span>
                {showDays ? <I.chevUp size={14} color="#5a6a7a" /> : <I.chevDown size={14} color="#5a6a7a" />}
              </div>
              {showDays && (
                <div style={{ marginTop:8, maxHeight:220, overflowY:'auto' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr 1fr', gap:4, fontSize:11, fontWeight:600, color:'#5a6a7a', padding:'4px 6px', marginBottom:2 }}>
                    <span>Date</span><span style={{ textAlign:'right' }}>Hi</span><span style={{ textAlign:'right' }}>Lo</span><span style={{ textAlign:'right' }}>DD</span><span style={{ textAlign:'right' }}>Total</span>
                  </div>
                  {dailyDD.slice().reverse().map(d => (
                    <div key={d.date} style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr 1fr', gap:4, fontSize:12, padding:'5px 6px', borderBottom:'1px solid #131e2c' }}>
                      <span style={{ color:'#8b949e' }}>{d.date.slice(5)}</span>
                      <span style={{ textAlign:'right', color:'#f0883e' }}>{d.hi}°</span>
                      <span style={{ textAlign:'right', color:'#58a6ff' }}>{d.lo}°</span>
                      <span style={{ textAlign:'right', color: d.dd>0?'#3fb950':'#3d5068' }}>{d.dd}</span>
                      <span style={{ textAlign:'right', fontWeight:600 }}>{d.cum}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Brix Trend ── */}
      <div className="card">
        <div className="card-title"><CardIcon bg="#2b1a0d" icon="droplet" />{t(lang,'brixTitle')}</div>
        <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:12 }}>{t(lang,'brixDesc')}
        </div>

        {buddyWarn && (
          <div style={{ background:'#2b1505', border:'1px solid #8b3a10', borderRadius:10, padding:'10px 14px', marginBottom:12, display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700, color:'#f0883e' }}>{t(lang,'buddyTitle')}</div>
              <div style={{ fontSize:12, color:'#5a6a7a' }}>Brix dropped to {lastB}° — down from peak of {peak}°. Check clarity and taste.</div>
            </div>
          </div>
        )}

        {/* Sparkline */}
        {brixLog.length >= 2 && (
          <div style={{ marginBottom:14, overflowX:'auto' }}>
            <svg width={Math.max(SW, brixLog.length * 32)} height={SH + 24} style={{ display:'block' }}>
              {/* Grid lines */}
              {[bMin, (bMin+bMax)/2, bMax].map((v,i) => {
                const y = SH - ((v - bMin) / bRange) * (SH - 10) - 2;
                return <g key={i}>
                  <line x1="0" y1={y} x2={Math.max(SW, brixLog.length*32)} y2={y} stroke="#1a2840" strokeWidth="1" strokeDasharray="4,4"/>
                  <text x="2" y={y-2} fontSize="9" fill="#3d5068">{v.toFixed(1)}°</text>
                </g>;
              })}
              {/* Line */}
              <polyline
                fill="none" stroke="#e0a44a" strokeWidth="2.5" strokeLinejoin="round"
                points={brixLog.map((e,i) => {
                  const x = (i / Math.max(brixLog.length-1,1)) * (Math.max(SW, brixLog.length*32) - 20) + 10;
                  const y = SH - ((e.brix - bMin) / bRange) * (SH - 10) - 2;
                  return `${x},${y}`;
                }).join(' ')}
              />
              {/* Dots */}
              {brixLog.map((e,i) => {
                const x = (i / Math.max(brixLog.length-1,1)) * (Math.max(SW, brixLog.length*32) - 20) + 10;
                const y = SH - ((e.brix - bMin) / bRange) * (SH - 10) - 2;
                return <circle key={e.id} cx={x} cy={y} r="4" fill="#e0a44a" stroke="#07090f" strokeWidth="1.5"/>;
              })}
              {/* X axis labels */}
              {brixLog.map((e,i) => {
                if (brixLog.length > 8 && i % Math.ceil(brixLog.length/6) !== 0 && i !== brixLog.length-1) return null;
                const x = (i / Math.max(brixLog.length-1,1)) * (Math.max(SW, brixLog.length*32) - 20) + 10;
                return <text key={'l'+e.id} x={x} y={SH+16} fontSize="9" fill="#5a6a7a" textAnchor="middle">{e.date.split('/').slice(0,2).join('/')}</text>;
              })}
            </svg>
          </div>
        )}

        {/* Add reading */}
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <div style={{ width:100 }}><NumInput value={brixIn} onChange={setBrixIn} min={0.1} max={10} step={0.1} placeholder="°Brix" /></div>
          <input type="text" value={noteIn} onChange={e=>setNoteIn(e.target.value)} placeholder={t(lang,'note') + ' (' + t(lang,'optional') + ')'} style={{ flex:1 }} onKeyDown={e=>e.key==='Enter'&&addBrix()} />
          <button onClick={addBrix} className="btn-icon" style={{ background:'#e0a44a' }}><I.check size={18} color="#07090f" /></button>
        </div>

        {brixLog.length === 0 && <div style={{ textAlign:'center', color:'#3d5068', fontSize:13, padding:'8px 0' }}>No readings yet — log your first brix reading above.</div>}

        {/* Reading list */}
        {brixLog.slice().reverse().map((e,i) => (
          <div key={e.id} className="log-entry">
            <div>
              <span style={{ fontWeight:700, color:'#e0a44a', fontSize:16 }}>{e.brix}°</span>
              {e.note && <span style={{ color:'#5a6a7a', fontSize:13 }}> · {e.note}</span>}
              <span style={{ color:'#3d5068', fontSize:12, marginLeft:8 }}>{e.date}</span>
            </div>
            <button className="delete-btn" onClick={()=>setBrixLog(p=>p.filter(x=>x.id!==e.id))}><I.x size={14}/></button>
          </div>
        ))}

        {brixLog.length >= 2 && (
          <div style={{ marginTop:8 }} className="result-box orange">
            <div className="two-col">
              <div><div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'peakBrix')}</div><div style={{ fontWeight:700, color:'#e0a44a', fontSize:20 }}>{peak.toFixed(1)}°</div></div>
              <div><div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'latestBrix')}</div><div style={{ fontWeight:700, color: buddyWarn?'#f0883e':'#e0a44a', fontSize:20 }}>{lastB.toFixed(1)}°</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PDF SEASON REPORT ─────────────────────────────────────────────────────────
function exportSeasonPDF({ season, trees, units, logs, brixLog, sapBrix }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const u = units === 'L' ? 'L' : 'gal';
  const conv = v => units === 'L' ? (v*3.78541).toFixed(1) : v.toFixed(1);
  const slog = logs[season] || {};
  const tot  = k => ((slog[k]||[]).reduce((s,e)=>s+(parseFloat(e.val)||0),0));
  const sapT = tot('sapCollected'), syT = tot('syrupMade');
  const ratio = syT > 0 ? (sapT/syT).toFixed(1) : '—';
  const goal  = trees * 0.25;

  // Grade breakdown from syrup entries
  const gradeTotals = {};
  (slog.syrupMade||[]).forEach(e => {
    if (e.grade && e.grade !== '—') gradeTotals[e.grade] = (gradeTotals[e.grade]||0) + (parseFloat(e.val)||0);
  });

  const W = 210, M = 18;
  let y = M;

  // ── Header ──────────────────────────────────────────────────
  doc.setFillColor(19, 46, 38);
  doc.roundedRect(M, y, W - M*2, 28, 4, 4, 'F');
  doc.setTextColor(45, 212, 167);
  doc.setFont('helvetica','bold'); doc.setFontSize(20);
  doc.text('SweetRun', M+8, y+11);
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.setTextColor(180,210,200);
  doc.text('MAPLE PRODUCTION SEASON REPORT', M+8, y+19);
  doc.setTextColor(255,255,255);
  doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text(String(season), W - M - 8, y+16, { align:'right' });
  y += 36;

  // ── Season Summary ───────────────────────────────────────────
  doc.setTextColor(30,30,30);
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text('Season Summary', M, y); y += 6;
  doc.setDrawColor(200,200,200); doc.line(M, y, W-M, y); y += 6;

  const summaryRows = [
    ['Trees Tapped',    `${trees} trees`],
    ['Sap Collected',   `${conv(sapT)} ${u}`],
    ['Syrup Produced',  `${conv(syT)} ${u}`],
    ['Sap:Syrup Ratio', `${ratio}:1`],
    ['Season Target',   `${conv(goal)} ${u}  (${syT>0?Math.round((syT/goal)*100):'0'}% of goal)`],
    ['Sap °Brix',       `${sapBrix}° avg`],
  ];

  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  summaryRows.forEach(([label, value]) => {
    doc.setTextColor(100,100,100); doc.text(label, M, y);
    doc.setTextColor(20,20,20); doc.setFont('helvetica','bold');
    doc.text(value, W/2, y); doc.setFont('helvetica','normal');
    y += 7;
  });
  y += 4;

  // ── Grade Breakdown ─────────────────────────────────────────
  if (Object.keys(gradeTotals).length > 0) {
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.setTextColor(30,30,30);
    doc.text('Syrup Grade Breakdown', M, y); y += 6;
    doc.setDrawColor(200,200,200); doc.line(M, y, W-M, y); y += 6;
    doc.setFont('helvetica','normal'); doc.setFontSize(10);
    Object.entries(gradeTotals).forEach(([grade, vol]) => {
      const pct = syT > 0 ? ((vol/syT)*100).toFixed(0) : 0;
      doc.setTextColor(100,100,100); doc.text(grade, M, y);
      doc.setTextColor(20,20,20); doc.setFont('helvetica','bold');
      doc.text(`${conv(vol)} ${u}  (${pct}%)`, W/2, y);
      doc.setFont('helvetica','normal'); y += 7;
    });
    y += 4;
  }

  // ── Brix Trend ──────────────────────────────────────────────
  if (brixLog.length > 0) {
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.setTextColor(30,30,30);
    doc.text('Sap Brix Readings', M, y); y += 6;
    doc.setDrawColor(200,200,200); doc.line(M, y, W-M, y); y += 6;
    doc.setFont('helvetica','normal'); doc.setFontSize(10);
    const peak = Math.max(...brixLog.map(e=>e.brix));
    const last = brixLog[brixLog.length-1].brix;
    doc.setTextColor(100,100,100); doc.text('Peak Brix', M, y);
    doc.setTextColor(20,20,20); doc.setFont('helvetica','bold'); doc.text(`${peak.toFixed(1)}°`, W/2, y);
    doc.setFont('helvetica','normal'); y += 7;
    doc.setTextColor(100,100,100); doc.text('Final Brix', M, y);
    doc.setTextColor(20,20,20); doc.setFont('helvetica','bold'); doc.text(`${last.toFixed(1)}°`, W/2, y);
    doc.setFont('helvetica','normal'); y += 7;
    doc.setTextColor(100,100,100); doc.text('Readings logged', M, y);
    doc.setTextColor(20,20,20); doc.setFont('helvetica','bold'); doc.text(`${brixLog.length}`, W/2, y);
    doc.setFont('helvetica','normal'); y += 10;
  }

  // ── Batch Log ───────────────────────────────────────────────
  const batches = (slog.syrupMade||[]);
  if (batches.length > 0) {
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.setTextColor(30,30,30);
    doc.text('Syrup Batch Log', M, y); y += 6;
    doc.setDrawColor(200,200,200); doc.line(M, y, W-M, y); y += 6;
    doc.setFont('helvetica','normal'); doc.setFontSize(9);
    doc.setTextColor(120,120,120);
    doc.text('Date', M, y); doc.text(`${u.toUpperCase()}`, M+40, y);
    doc.text('Grade', M+70, y); doc.text('Note', M+110, y);
    y += 5; doc.setTextColor(30,30,30);
    batches.forEach(b => {
      if (y > 270) { doc.addPage(); y = M; }
      doc.text(b.date||'', M, y);
      doc.text(fmt(b.val,1), M+40, y);
      doc.text(b.grade&&b.grade!=='—'?b.grade:'', M+70, y);
      doc.text((b.note||'').slice(0,30), M+110, y);
      y += 6;
    });
    y += 4;
  }

  // ── Footer ──────────────────────────────────────────────────
  doc.setFontSize(8); doc.setTextColor(160,160,160);
  doc.text(`Generated by SweetRun · ${new Date().toLocaleDateString()}`, M, 287);
  doc.text(`sugarcalc.netlify.app`, W-M, 287, { align:'right' });

  doc.save(`SweetRun-Season-${season}.pdf`);
}


// ─── LINES TAB / SUGARBUSH MAP ────────────────────────────────────────────────
let _lMap = null;
let _lMarkers = {};
let _lRouteLines = [];
let _lSpotMarkers = [];
let _lPropertyLayers = [];
let _lSeasonLayer = null;
let _lSliderEl = null;
let _lGpsMarker = null;
let _lGpsCircle = null;

function haversineFt(lat1, lon1, lat2, lon2) {
  const R = 20925524;
  const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

// Batch elevation fetch — tries Open-Topo-Data (fast, 1 req for all pts) then EPQS fallback
async function _fetchElevBatch(latlons) {
  if (!latlons.length) return [];
  const locs = latlons.map(p => p.lat.toFixed(6) + ',' + p.lon.toFixed(6)).join('|');
  // Primary: Open-Topo-Data NED10m (US, 10m resolution) — returns metres, convert to ft
  const datasets = ['ned10m', 'srtm30m'];
  for (const ds of datasets) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 9000);
      const r = await fetch('https://api.opentopodata.org/v1/' + ds + '?locations=' + locs, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!r.ok) continue;
      const d = await r.json();
      if (d.status === 'OK' && d.results && d.results.length === latlons.length) {
        const elevs = d.results.map(x => x.elevation != null ? +(x.elevation * 3.28084).toFixed(1) : null);
        if (elevs.some(e => e != null)) return elevs;
      }
    } catch {}
  }
  // Fallback: USGS EPQS one-at-a-time (US only, slower but familiar)
  return Promise.all(latlons.map(async p => {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(
        'https://epqs.nationalmap.gov/v1/json?x=' + p.lon + '&y=' + p.lat + '&units=Feet&wkid=4326&includeDate=false',
        { signal: ctrl.signal }
      );
      clearTimeout(tid);
      const d = await r.json();
      const v = parseFloat(d.value);
      return isNaN(v) ? null : v;
    } catch { return null; }
  }));
}

async function _fetchElev(lat, lon) {
  const result = await _fetchElevBatch([{ lat, lon }]);
  return result[0] ?? null;
}

// Sample path elevation — all points fetched in ONE batch request (10-20x faster)
async function _samplePathElev(lat1, lon1, lat2, lon2, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const frac = i / n;
    pts.push({ lat: lat1 + (lat2 - lat1) * frac, lon: lon1 + (lon2 - lon1) * frac });
  }
  const elevs = await _fetchElevBatch(pts);
  return pts.map((p, i) => ({ ...p, elev: elevs[i] }));
}

function _analyzeSegGrades(pts) {
  const segs = []; let minGrade = Infinity, totalDist = 0;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i-1].elev == null || pts[i].elev == null) continue;
    const dist = haversineFt(pts[i-1].lat, pts[i-1].lon, pts[i].lat, pts[i].lon);
    const drop = pts[i-1].elev - pts[i].elev;
    const grade = dist > 0 ? (drop/dist)*100 : 0;
    segs.push({ from: pts[i-1], to: pts[i], dist, drop, grade });
    if (grade < minGrade) minGrade = grade;
    totalDist += dist;
  }
  const totalDrop = (pts[0]?.elev != null && pts[pts.length-1]?.elev != null)
    ? pts[0].elev - pts[pts.length-1].elev : 0;
  const overallGrade = totalDist > 0 ? (totalDrop/totalDist)*100 : 0;
  return { segs, minGrade: minGrade === Infinity ? 0 : minGrade, overallGrade, totalDist, totalDrop };
}

// Draw route lines — one polyline per segment, colored by grade
// results is an array of line objects from analyzeRoutes
function _drawRouteLines(results) {
  _clearRouteLines();
  if (!_lMap || !window.L) return;
  results.forEach(r => {
    r.segments.forEach(seg => {
      const color = _gradeColor(seg.grade);
      const line = window.L.polyline(
        [[seg.from.lat, seg.from.lon], [seg.to.lat, seg.to.lon]],
        { color, weight: seg.isToTank ? 5 : 3, opacity: 0.92,
          dashArray: seg.grade < 1.0 ? '8,5' : null }
      ).addTo(_lMap);
      const fromName = seg.from.label || 'Pin';
      const toName   = seg.to.label   || 'Pin';
      line.bindPopup(
        `<b>${fromName} → ${toName}</b><br/>` +
        `Grade: <b>${seg.grade.toFixed(2)}%</b><br/>` +
        `Drop: ${Math.abs(seg.drop).toFixed(1)} ft &nbsp;·&nbsp; Dist: ${seg.dist.toFixed(0)} ft`
      );
      _lRouteLines.push(line);
    });
  });
}

function _gradeColor(g) {
  return g < 0 ? '#f85149' : g < 0.5 ? '#f85149' : g < 1.0 ? '#f0883e' : g <= 6.0 ? '#3fb950' : '#f0883e';
}

function _clearRouteLines() {
  _lRouteLines.forEach(l => { try { l.remove(); } catch {} });
  _lRouteLines = [];
}
function _clearSpotMarkers() {
  _lSpotMarkers.forEach(m => { try { m.remove(); } catch {} });
  _lSpotMarkers = [];
}

// Legacy stub — new code calls _drawRouteLines directly
function _drawRoutePaths(results) { _drawRouteLines(results); }

// ─── SUGARBUSH MAP MARKER SYSTEM ──────────────────────────────────────────────
const _SB_SVGS = {
  tree:       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2C9 5 6 6 4 8c2 0 3 1 3 3-2-1-4 0-4 2h4c0 2-1 3-2 4h5v3h4v-3h5c-1-1-2-2-2-4h4c0-2-2-3-4-2 0-2 1-3 3-3-2-2-5-3-8-6z"/></svg>',
  tank:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12M20 6v12"/><ellipse cx="12" cy="18" rx="8" ry="3"/><path d="M4 12a8 3 0 0 0 16 0" opacity=".4"/></svg>',
  sugarhouse: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  pump:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
  junction:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="4" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="20"/><line x1="4" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="20" y2="12"/></svg>',
  marker:     '<svg width="12" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="5" y1="4" x2="5" y2="22"/><path d="M5 4h12l-3 4 3 4H5"/></svg>',
};
const _ML_COLORS = { A:'#3b82f6', B:'#8b5cf6', C:'#ec4899', D:'#f97316' };
const _SPECIES_COLORS = { sugar_maple:'#f97316', red_maple:'#ef4444', silver_maple:'#94a3b8', black_maple:'#44403c', other:'#6b7280' };
const _SPECIES_LABELS = { sugar_maple:'Sugar Maple', red_maple:'Red Maple', silver_maple:'Silver Maple', black_maple:'Black Maple', other:'Other' };
const _HEALTH_COLORS = { excellent:'#22c55e', good:'#84cc16', fair:'#eab308', poor:'#f97316', dead:'#ef4444' };
const _HEALTH_LABELS = { excellent:'Excellent', good:'Good', fair:'Fair', poor:'Poor', dead:'Dead' };
const _PIN_TYPE_CFG = [
  { id:'tree',       label:'Tap Tree',    emoji:'🍁', bg:'#2ea043', radius:'50%',  size:30 },
  { id:'tank',       label:'Tank',        emoji:'💧', bg:'#1f6feb', radius:'6px',  size:34 },
  { id:'sugarhouse', label:'Sugarhouse',  emoji:'🏚', bg:'#f59e0b', radius:'6px',  size:30 },
  { id:'pump',       label:'Pump House',  emoji:'⚙️', bg:'#f97316', radius:'50%', size:28 },
  { id:'junction',   label:'Junction',    emoji:'◉',  bg:'#8b5cf6', radius:'50%', size:28 },
  { id:'marker',     label:'Waypoint',    emoji:'📍', bg:'#ef4444', radius:'50%', size:26 },
];

function _sbMakeIcon(pin) {
  const cfg = _PIN_TYPE_CFG.find(t => t.id === pin.type) || _PIN_TYPE_CFG[0];
  const font = "font-family:Inter,-apple-system,sans-serif";

  if (pin.type === 'tree') {
    // ── Horizontal chip label: species dot · code · taps · mainline dot ──
    const sColor  = _SPECIES_COLORS[pin.species || 'sugar_maple'] || '#f97316';
    const hColor  = _HEALTH_COLORS[pin.health   || 'good']        || '#84cc16';
    const mlColor = pin.mainline ? (_ML_COLORS[pin.mainline] || null) : null;
    const taps    = parseInt(pin.taps) || 0;
    // Shorten: "Tree 1" → "T1", keep max 4 chars
    const code = pin.label.replace(/^(Tap\s+)?Tree\s*/i,'T').replace(/\s+/g,'').slice(0,5);
    const mlDot  = mlColor ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${mlColor};flex-shrink:0"></span>` : '';
    const tapPart= taps > 0 ? `<span style="color:#34d399;font-size:8.5px;font-weight:700;${font}">${taps}t</span>` : '';
    return window.L.divIcon({
      className: '',
      html: `<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(8,14,24,0.93);border:1.5px solid ${hColor};border-radius:20px;padding:3px 8px 3px 6px;box-shadow:0 2px 10px rgba(0,0,0,0.7);white-space:nowrap">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${sColor};flex-shrink:0"></span>
        <span style="font-size:10px;font-weight:800;color:#f0f0f0;letter-spacing:-.01em;${font}">${code}</span>
        ${tapPart}${mlDot}
      </div>`,
      iconSize:   [1,1],
      iconAnchor: [0,0],
      popupAnchor:[36,-8],
    });
  }

  if (pin.type === 'tank') {
    // ── Flat badge: bold label on blue ──
    const short = pin.label.slice(0,12);
    return window.L.divIcon({
      className: '',
      html: `<div style="display:inline-flex;align-items:center;gap:5px;background:#1d4ed8;border-radius:7px;padding:4px 10px 4px 8px;box-shadow:0 3px 14px rgba(29,78,216,0.55),0 1px 3px rgba(0,0,0,0.4);border-bottom:2px solid rgba(255,255,255,0.12)">
        ${_SB_SVGS.tank}
        <span style="font-size:9.5px;font-weight:800;color:#fff;${font};white-space:nowrap">${short}</span>
      </div>`,
      iconSize:   [1,1],
      iconAnchor: [0,0],
      popupAnchor:[40,-8],
    });
  }

  // ── All other types: teardrop pin with SVG icon inside ──
  const color = cfg.bg;
  const svg   = _SB_SVGS[pin.type] || _SB_SVGS.marker;
  // Teardrop: circle r=11 centered at (15,13), tail to (15,38)
  return window.L.divIcon({
    className: '',
    html: `<div style="position:relative;width:30px;height:40px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.6))">
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 39 C15 39,4 26,4 15 A11 11 0 1 1 26 15 C26 26,15 39,15 39 Z" fill="${color}"/>
        <path d="M9 10 A9 9 0 0 1 21 10" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <div style="position:absolute;top:4px;left:50%;transform:translateX(-50%)">${svg}</div>
    </div>`,
    iconSize:   [30,40],
    iconAnchor: [15,40],
    popupAnchor:[0,-42],
  });
}

function _sbRenderMarker(pin) {
  if (!_lMap || !window.L) return;
  const marker = window.L.marker([pin.lat, pin.lon], { icon: _sbMakeIcon(pin) }).addTo(_lMap);
  marker.on('click', () => { if (window._sgMapPinClick) window._sgMapPinClick(pin.id); });
  _lMarkers[pin.id] = marker;
}

function _sbUpdateMarker(pin) {
  if (_lMarkers[pin.id]) _lMarkers[pin.id].setIcon(_sbMakeIcon(pin));
}

// Shim for old code paths that called _renderMarker
function _renderMarker(pin) { _sbRenderMarker(pin); }

function _dropPin(lat, lon, type, pinsRef, setPins, extra = {}) {
  const id = Date.now();
  const count = pinsRef.current.filter(p => p.type === type).length + 1;
  const typeLabels = { tree:'Tree', tank:'Tank', sugarhouse:'Sugarhouse', pump:'Pump', junction:'Junction', marker:'Waypoint' };
  const label = (typeLabels[type] || type) + ' ' + count;
  const pin = {
    id, lat, lon, type, label, elev: null, notes: '',
    ...(type === 'tree' ? {
      species: 'sugar_maple', dbh: 12, health: 'good', taps: 1,
      mainline: null, tagged: 'T' + String(count).padStart(3, '0'), yearAdded: new Date().getFullYear()
    } : {}),
    ...extra,
  };
  const updated = [...pinsRef.current, pin];
  setPins(updated); ls.set('sg_lines_pins', updated);
  _sbRenderMarker(pin);
  _fetchElev(lat, lon).then(elev => {
    const withElev = ls.get('sg_lines_pins', []).map(p => p.id === id ? { ...p, elev } : p);
    ls.set('sg_lines_pins', withElev); setPins(withElev);
  });
}

// ── SEASONAL IMAGERY ──
function _sbApplySeasonLayer(map, mode) {
  if (_lSeasonLayer) { try { map.removeLayer(_lSeasonLayer); } catch {} _lSeasonLayer = null; }
  if (_lSliderEl) { try { _lSliderEl.remove(); } catch {} _lSliderEl = null; }
  if (mode === 'naip') {
    _lSeasonLayer = window.L.tileLayer('https://gis.apfo.usda.gov/arcgis/rest/services/NAIP/USDA_CONUS_PRIME/ImageServer/tile/{z}/{y}/{x}', { attribution:'USDA NAIP', maxZoom:19 });
    _lSeasonLayer.addTo(map);
  } else if (mode === 'clarity') {
    _lSeasonLayer = window.L.tileLayer('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution:'Esri Clarity', maxZoom:19 });
    _lSeasonLayer.addTo(map);
  } else if (mode === 'compare') {
    _lSeasonLayer = window.L.tileLayer('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution:'Esri Clarity', maxZoom:19 });
    _lSeasonLayer.addTo(map);
    const container = map.getContainer();
    const slider = document.createElement('div');
    slider.style.cssText = 'position:absolute;top:0;left:50%;height:100%;z-index:800;cursor:ew-resize;user-select:none;pointer-events:all';
    slider.innerHTML = '<div style="position:absolute;top:0;left:-1.5px;width:3px;height:100%;background:rgba(255,255,255,0.85)"></div><div style="position:absolute;top:50%;left:-32px;transform:translateY(-50%);background:rgba(0,0,0,0.65);color:#fff;border-radius:16px;padding:5px 8px;font-size:11px;font-weight:700;white-space:nowrap;border:1px solid rgba(255,255,255,0.25);pointer-events:none">☀‖❄</div>';
    container.appendChild(slider);
    _lSliderEl = slider;
    let dragging = false;
    const onMove = (clientX) => {
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      slider.style.left = x + 'px';
      const pane = map.getPane('tilePane');
      if (pane) { const layers = pane.querySelectorAll('.leaflet-layer'); if (layers.length >= 2) layers[layers.length - 1].style.clipPath = `inset(0 0 0 ${x}px)`; }
    };
    slider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
    slider.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
    document.addEventListener('mousemove', e => { if (dragging) onMove(e.clientX); });
    document.addEventListener('touchmove', e => { if (dragging) onMove(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('touchend', () => { dragging = false; });
  }
}

// ── PROPERTY LINE IMPORT ──
function _sbParseKML(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const features = [];
  doc.querySelectorAll('Placemark').forEach(pm => {
    const name = pm.querySelector('name')?.textContent || 'Property';
    const polyTxt = pm.querySelector('Polygon coordinates')?.textContent || pm.querySelector('outerBoundaryIs coordinates')?.textContent;
    const lineTxt = pm.querySelector('LineString coordinates')?.textContent;
    const parsePts = t => (t || '').trim().split(/\s+/).filter(Boolean).map(c => { const [lng,lat] = c.split(',').map(Number); return [lng,lat]; }).filter(c => !isNaN(c[0]));
    if (polyTxt) { const c = parsePts(polyTxt); if (c.length > 2) features.push({ type:'Feature', properties:{name}, geometry:{ type:'Polygon', coordinates:[c] } }); }
    else if (lineTxt) { const c = parsePts(lineTxt); if (c.length > 1) features.push({ type:'Feature', properties:{name}, geometry:{ type:'LineString', coordinates:c } }); }
  });
  return { type:'FeatureCollection', features };
}

function _sbParseGPX(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const features = [];
  doc.querySelectorAll('trk,rte').forEach(el => {
    const name = el.querySelector('name')?.textContent || 'Track';
    const pts = [];
    el.querySelectorAll('trkpt,rtept').forEach(pt => pts.push([parseFloat(pt.getAttribute('lon')), parseFloat(pt.getAttribute('lat'))]));
    if (pts.length > 1) { pts.push(pts[0]); features.push({ type:'Feature', properties:{name}, geometry:{ type:'Polygon', coordinates:[pts] } }); }
  });
  return { type:'FeatureCollection', features };
}

function _sbImportPropertyFile(file) {
  if (!_lMap || !window.L) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const ext = file.name.split('.').pop().toLowerCase();
    let gj = null;
    try {
      if (ext === 'geojson' || ext === 'json') gj = JSON.parse(text);
      else if (ext === 'kml') gj = _sbParseKML(text);
      else if (ext === 'gpx') gj = _sbParseGPX(text);
      if (!gj) return;
      _lPropertyLayers.forEach(l => { try { _lMap.removeLayer(l); } catch {} });
      _lPropertyLayers = [];
      const palette = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#ef4444'];
      let ci = 0;
      const feats = gj.type === 'FeatureCollection' ? gj.features : [gj];
      feats.forEach(f => {
        if (!f.geometry) return;
        const geom = f.geometry;
        let coords = [];
        if (geom.type === 'Polygon') coords = geom.coordinates[0].map(c => [c[1], c[0]]);
        else if (geom.type === 'LineString') coords = geom.coordinates.map(c => [c[1], c[0]]);
        if (coords.length < 2) return;
        const color = palette[ci++ % palette.length];
        const layer = window.L[coords.length > 2 ? 'polygon' : 'polyline'](coords, { color, weight:2.5, opacity:.85, fillColor:color, fillOpacity:.07, dashArray:'8,4' }).addTo(_lMap);
        _lPropertyLayers.push(layer);
        const ctr = layer.getBounds().getCenter();
        const name = f.properties?.name || f.properties?.NAME || 'Property';
        const lbl = window.L.marker(ctr, { icon: window.L.divIcon({ className:'', html:`<div style="font-size:10px;font-weight:700;color:${color};text-shadow:0 0 4px rgba(0,0,0,.9);pointer-events:none">${name}</div>`, iconSize:[0,0], iconAnchor:[0,0] }), interactive:false }).addTo(_lMap);
        _lPropertyLayers.push(lbl);
      });
    } catch(err) { console.warn('Property import error:', err); }
  };
  reader.readAsText(file);
}

// ── OFFLINE TILE CACHE ──────────────────────────────────────────────────────
// Convert lat/lng to Slippy Map tile x,y at a given zoom level.
function _sbTileXY(lat, lng, z) {
  const n = 1 << z;
  const x = Math.floor((lng + 180) / 360 * n);
  const latR = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2 * n);
  return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) };
}

// Pre-fetch every satellite + label tile visible at current zoom ±1 so the
// service worker caches them and the map works offline next time.
async function _sbCacheTiles(map, onProgress) {
  if (!map) return { error: 'Map not ready.' };
  const bounds = map.getBounds();
  const z      = Math.round(map.getZoom());
  const minZ   = Math.max(12, z - 1);
  const maxZ   = Math.min(18, z + 1);

  const urls = [];
  for (let zoom = minZ; zoom <= maxZ; zoom++) {
    const nw = _sbTileXY(bounds.getNorth(), bounds.getWest(), zoom);
    const se = _sbTileXY(bounds.getSouth(), bounds.getEast(), zoom);
    for (let tx = nw.x; tx <= se.x; tx++) {
      for (let ty = nw.y; ty <= se.y; ty++) {
        // Esri uses z/y/x tile order
        urls.push(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${tx}`);
        urls.push(`https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${zoom}/${ty}/${tx}`);
      }
    }
  }

  const MAX = 600;
  if (urls.length > MAX) {
    return { error: `Area too large (${Math.round(urls.length / 2)} tiles). Zoom in closer and try again.` };
  }

  let done = 0, errors = 0;
  for (const url of urls) {
    try { await fetch(url); } catch { errors++; }
    done++;
    onProgress(Math.round(done / urls.length * 100), done, urls.length);
  }
  return { count: Math.round(urls.length / 2), errors };
}

function LinesTab({ lang='en' }) {
  const [leafletReady, setLeafletReady] = React.useState(!!window.L);
  const [pins, setPins]           = React.useState(() => ls.get('sg_lines_pins', []));
  const [mode, setMode]           = React.useState('tree');
  const [mapType, setMapType]     = React.useState('satellite');
  const [seasonMode, setSeasonMode] = React.useState('off');
  const [analyzing, setAnalyzing]       = React.useState(false);
  const [gpsLoading, setGpsLoading]     = React.useState(false);
  const [gpsTracking, setGpsTracking]   = React.useState(false);
  const [caching, setCaching]           = React.useState(false);
  const [cacheMsg, setCacheMsg]         = React.useState('');
  const [cachePct, setCachePct]         = React.useState(0);
  const [findingSpots, setFindingSpots] = React.useState(false);
  const [routeResults, setRouteResults] = React.useState([]);
  const [tankSpots, setTankSpots]       = React.useState([]);
  const [routeMsg, setRouteMsg]         = React.useState('');
  const [routeProgress, setRouteProgress] = React.useState('');
  const [editingId, setEditingId]       = React.useState(null);
  const [editLabel, setEditLabel]       = React.useState('');
  const [showCoordPanel, setShowCoordPanel] = React.useState(false);
  const [coordLat, setCoordLat]         = React.useState('');
  const [coordLon, setCoordLon]         = React.useState('');
  // Sugarbush-specific state
  const [mainTab, setMainTab]       = React.useState('map');   // map | trees | mainlines | property
  const [selectedPinId, setSelectedPinId] = React.useState(null);
  const [showPinPanel, setShowPinPanel]   = React.useState(false);
  const [mainlines] = React.useState([
    {id:'A', label:'Mainline A', color:'#3b82f6'},
    {id:'B', label:'Mainline B', color:'#8b5cf6'},
    {id:'C', label:'Mainline C', color:'#ec4899'},
    {id:'D', label:'Mainline D', color:'#f97316'},
  ]);
  // Materials estimator
  const [vacSystem, setVacSystem] = React.useState(() => ls.get('sg_vacsystem', false));
  const [mainSize,  setMainSize]  = React.useState(() => ls.get('sg_mainsize', '3/4"'));
  const [showMatPrices, setShowMatPrices] = React.useState(false);
  const [matPrices, setMatPrices] = React.useState(() => ls.get('sg_matprices', {
    lateral: 0.07, mainline: 0.65, drop: 0.18, spile: 0.85, tee: 0.65, mainTee: 1.10,
  }));
  const updateMatPrice = (k, v) => {
    const next = { ...matPrices, [k]: parseFloat(v) || 0 };
    setMatPrices(next); ls.set('sg_matprices', next);
  };
  React.useEffect(() => { ls.set('sg_vacsystem', vacSystem); }, [vacSystem]);
  React.useEffect(() => { ls.set('sg_mainsize',  mainSize);  }, [mainSize]);
  const mapRef = React.useRef(null);
  const modeRef = React.useRef(mode); modeRef.current = mode;
  const pinsRef = React.useRef(pins); pinsRef.current = pins;
  const gpsWatchRef = React.useRef(null);

  // Load Leaflet CSS + JS on demand
  React.useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletReady(true);
    document.body.appendChild(script);
  }, []);

  // Init map once Leaflet ready
  React.useEffect(() => {
    if (!leafletReady || !mapRef.current || _lMap) return;
    _lMap = window.L.map(mapRef.current, { zoomControl:true });
    _lMap._sat = window.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution:'Imagery © Esri', maxZoom:20 }
    );
    _lMap._labels = window.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { attribution:'', maxZoom:20, opacity:0.85 }
    );
    _lMap._street = window.L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution:'© OpenStreetMap', maxZoom:19 }
    );
    _lMap._sat.addTo(_lMap); _lMap._labels.addTo(_lMap);
    const saved = ls.get('sg_lines_pins', []);
    if (saved.length > 0) {
      _lMap.setView([saved[0].lat, saved[0].lon], 17);
      saved.forEach(p => _sbRenderMarker(p));
    } else {
      _lMap.setView([45.5, -72.0], 14);
      navigator.geolocation?.getCurrentPosition(
        pos => _lMap.setView([pos.coords.latitude, pos.coords.longitude], 16), () => {}
      );
    }
    // Wire up pin-click callback to show detail panel
    window._sgMapPinClick = (pinId) => { setSelectedPinId(pinId); setShowPinPanel(true); };
  }, [leafletReady]);

  // Toggle satellite/street base layer
  React.useEffect(() => {
    if (!_lMap) return;
    if (mapType === 'satellite') {
      if (!_lMap.hasLayer(_lMap._sat)) _lMap._sat.addTo(_lMap);
      if (!_lMap.hasLayer(_lMap._labels)) _lMap._labels.addTo(_lMap);
      if (_lMap.hasLayer(_lMap._street)) _lMap.removeLayer(_lMap._street);
    } else {
      if (_lMap.hasLayer(_lMap._sat)) _lMap.removeLayer(_lMap._sat);
      if (_lMap.hasLayer(_lMap._labels)) _lMap.removeLayer(_lMap._labels);
      if (!_lMap.hasLayer(_lMap._street)) _lMap._street.addTo(_lMap);
    }
  }, [mapType]);

  // Seasonal imagery overlay
  React.useEffect(() => {
    if (!_lMap) return;
    _sbApplySeasonLayer(_lMap, seasonMode);
  }, [seasonMode, leafletReady]);

  // Map click → drop pin
  React.useEffect(() => {
    if (!_lMap) return;
    const h = e => _dropPin(e.latlng.lat, e.latlng.lng, modeRef.current, pinsRef, setPins);
    _lMap.on('click', h);
    return () => _lMap.off('click', h);
  }, [leafletReady]);

  // GPS — drop pin at current location
  const markGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLoading(false);
        const acc = pos.coords.accuracy != null ? Math.round(pos.coords.accuracy) : null;
        _dropPin(pos.coords.latitude, pos.coords.longitude, modeRef.current, pinsRef, setPins, { accuracy: acc });
        _lMap?.setView([pos.coords.latitude, pos.coords.longitude], 18);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy:true, timeout:12000 }
    );
  };

  // GPS — live tracking (continuous follow with blue dot)
  const startTracking = () => {
    if (!navigator.geolocation || !_lMap || !window.L) return;
    setGpsTracking(true);
    const onPos = pos => {
      const { latitude:lat, longitude:lng, accuracy:acc } = pos.coords;
      if (!_lGpsMarker) {
        const myIcon = window.L.divIcon({ className:'', html:'<div style="width:16px;height:16px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(66,133,244,0.25)"></div>', iconSize:[16,16], iconAnchor:[8,8] });
        _lGpsMarker = window.L.marker([lat, lng], { icon:myIcon, zIndexOffset:1000 }).addTo(_lMap);
        _lGpsCircle = window.L.circle([lat, lng], { radius:acc, color:'#4285F4', fillColor:'#4285F4', fillOpacity:.1, weight:1 }).addTo(_lMap);
        _lMap.setView([lat, lng], Math.max(_lMap.getZoom(), 17));
      } else {
        _lGpsMarker.setLatLng([lat, lng]);
        _lGpsCircle.setLatLng([lat, lng]).setRadius(acc);
        _lMap.panTo([lat, lng]);
      }
    };
    gpsWatchRef.current = navigator.geolocation.watchPosition(onPos, () => {}, { enableHighAccuracy:true, timeout:30000, maximumAge:5000 });
  };

  const stopTracking = () => {
    if (gpsWatchRef.current != null) { navigator.geolocation.clearWatch(gpsWatchRef.current); gpsWatchRef.current = null; }
    if (_lGpsMarker) { try { _lMap?.removeLayer(_lGpsMarker); } catch {} _lGpsMarker = null; }
    if (_lGpsCircle) { try { _lMap?.removeLayer(_lGpsCircle); } catch {} _lGpsCircle = null; }
    setGpsTracking(false);
  };

  // Save current map view tiles to offline cache
  const saveOffline = async () => {
    if (!_lMap || caching) return;
    setCaching(true);
    setCacheMsg('Saving map tiles…');
    setCachePct(0);
    const result = await _sbCacheTiles(_lMap, (pct, done, total) => {
      setCachePct(pct);
      setCacheMsg(`Saving… ${done} / ${total} tiles`);
    });
    setCaching(false);
    if (result.error) {
      setCacheMsg('⚠️ ' + result.error);
      setTimeout(() => setCacheMsg(''), 5000);
    } else {
      setCacheMsg(`✓ ${result.count} tiles saved — map works offline now`);
      setTimeout(() => setCacheMsg(''), 5000);
    }
  };

  // Place pin by typed coordinates
  const addByCoords = () => {
    const lat = parseFloat(coordLat);
    const lon = parseFloat(coordLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setRouteMsg('❌ Invalid coordinates. Use decimal degrees (e.g. 45.1234, -72.5678)');
      return;
    }
    _dropPin(lat, lon, mode, pinsRef, setPins);
    _lMap?.setView([lat, lon], 18);
    setCoordLat(''); setCoordLon('');
    setShowCoordPanel(false);
    setRouteMsg('');
  };

  // Zoom map to a pin
  const zoomToPin = (pin) => {
    if (!_lMap) return;
    _lMap.setView([pin.lat, pin.lon], 18);
    if (_lMarkers[pin.id]) _lMarkers[pin.id].openPopup();
  };

  // Rename a pin
  const renamePin = (id, newLabel) => {
    if (!newLabel.trim()) { setEditingId(null); setEditLabel(''); return; }
    const updated = pinsRef.current.map(p => p.id === id ? {...p, label:newLabel.trim()} : p);
    setPins(updated); ls.set('sg_lines_pins', updated);
    const pin = updated.find(p => p.id === id);
    if (pin && _lMarkers[id]) _lMarkers[id].setPopupContent(
      `<b>${pin.label}</b><br/>${pin.lat.toFixed(5)}, ${pin.lon.toFixed(5)}<br/>Elevation: ${pin.elev!=null?pin.elev.toFixed(1)+' ft':'fetching…'}`
    );
    setEditingId(null); setEditLabel('');
  };

  // Clear spot markers
  const clearSpots = () => { _clearSpotMarkers(); setTankSpots([]); setRouteMsg(''); };

  // Clear route lines
  const clearRoutes = () => { _clearRouteLines(); setRouteResults([]); setRouteProgress(''); };

  // Convert a suggested spot to a real tank pin
  const placeSpotAsTank = (spot) => {
    _dropPin(spot.lat, spot.lon, 'tank', pinsRef, setPins);
    _lMap?.setView([spot.lat, spot.lon], 17);
    _clearSpotMarkers();
    setTankSpots([]);
  };

  // Helper: ensure all pins in a list have elevations, fetching any that are missing.
  // Returns the updated pin list (also saves to state + localStorage).
  const ensureElevations = async (pinList, progressLabel) => {
    const missing = pinList.filter(p => p.elev == null);
    if (!missing.length) return pinList;
    setRouteProgress(`Fetching elevation for ${missing.length} ${progressLabel}…`);
    const elevs = await _fetchElevBatch(missing);
    let current = [...pinsRef.current];
    missing.forEach((pin, i) => {
      if (elevs[i] != null) {
        current = current.map(p => p.id === pin.id ? { ...p, elev: elevs[i] } : p);
        if (_lMarkers[pin.id]) _lMarkers[pin.id].setPopupContent(
          `<b>${pin.label}</b><br/>${pin.lat.toFixed(5)}, ${pin.lon.toFixed(5)}<br/>Elevation: ${elevs[i].toFixed(1)} ft`
        );
      }
    });
    ls.set('sg_lines_pins', current);
    setPins(current);
    pinsRef.current = current;
    return current;
  };

  // Analyze routes — uses existing pin elevations (instant, always works) then
  // optionally refines with a single terrain-profile batch call per pair.
  const analyzeRoutes = async () => {
    // ── NEW LINE-BASED ANALYSIS ──────────────────────────────────────────────
    // Philosophy: sap lines are not individual tree→tank connections.
    // They're a series of trees connected in sequence (highest → lowest)
    // running down to a collection tank.  We build one "line" per tank,
    // assign each tree to its best-fit tank, sort trees by elevation,
    // then compute grade between every consecutive node in the line.
    // ────────────────────────────────────────────────────────────────────────
    const allTrees = pinsRef.current.filter(p => p.type==='tree');
    const allTanks = pinsRef.current.filter(p => p.type==='tank');
    if (!allTrees.length) { setRouteMsg('❌ Place at least 1 tree pin on the map first.'); return; }
    if (!allTanks.length) { setRouteMsg('❌ Place at least 1 tank pin on the map first.'); return; }

    setRouteMsg(''); setRouteProgress(''); setAnalyzing(true); setRouteResults([]); _clearRouteLines();

    // 1. Ensure elevations for all pins
    try {
      await ensureElevations(allTrees, 'tree pin(s)');
      await ensureElevations(allTanks, 'tank pin(s)');
    } catch(e) {
      setRouteMsg('❌ Could not fetch elevations — check connection and try again.');
      setAnalyzing(false); setRouteProgress(''); return;
    }
    const trees = pinsRef.current.filter(p => p.type==='tree' && p.elev!=null);
    const tanks = pinsRef.current.filter(p => p.type==='tank' && p.elev!=null);
    if (!trees.length) { setRouteMsg('❌ Elevation unavailable for trees.'); setAnalyzing(false); setRouteProgress(''); return; }
    if (!tanks.length) { setRouteMsg('❌ Elevation unavailable for tanks.'); setAnalyzing(false); setRouteProgress(''); return; }

    // 2. Assign each tree to the tank it flows to best (highest grade to that tank)
    const byTank = {};
    tanks.forEach(tank => { byTank[tank.id] = { tank, trees: [] }; });
    trees.forEach(tree => {
      let bestTank = null, bestGrade = -Infinity;
      tanks.forEach(tank => {
        const dist  = haversineFt(tree.lat, tree.lon, tank.lat, tank.lon);
        const grade = dist > 0 ? ((tree.elev - tank.elev) / dist) * 100 : -999;
        if (grade > bestGrade) { bestGrade = grade; bestTank = tank; }
      });
      if (bestTank) byTank[bestTank.id].trees.push(tree);
    });

    const results = [];
    for (const { tank, trees: lineTrees } of Object.values(byTank)) {
      if (!lineTrees.length) continue;
      setRouteProgress(`Building line → ${tank.label}…`);

      // 3. Sort trees highest→lowest (natural line flow order)
      const sorted = [...lineTrees].sort((a, b) => (b.elev||0) - (a.elev||0));

      // 4. Build node list: [tree1, tree2, ..., treeN, tank]
      //    Compute grade between every consecutive pair
      const lineNodes = [...sorted, tank];
      const segments  = [];
      let totalDist = 0, totalDrop = 0;

      for (let i = 0; i < lineNodes.length - 1; i++) {
        const from = lineNodes[i];
        const to   = lineNodes[i + 1];
        const dist = haversineFt(from.lat, from.lon, to.lat, to.lon);
        const drop = (from.elev||0) - (to.elev||0);
        const grade = dist > 0 ? (drop / dist) * 100 : 0;
        segments.push({ from, to, dist, drop, grade, isToTank: i === lineNodes.length - 2 });
        totalDist += dist;
        totalDrop += drop;
      }

      const grades      = segments.map(s => s.grade);
      const minGrade    = Math.min(...grades);
      const maxGrade    = Math.max(...grades);
      const overallGrade = totalDist > 0 ? (totalDrop / totalDist) * 100 : 0;
      const badSegs     = segments.filter(s => s.grade < 1.0);
      const goodFlow    = minGrade >= 1.0;

      results.push({ tank, trees: sorted, lineNodes, segments,
        minGrade, maxGrade, overallGrade, totalDist, totalDrop, badSegs, goodFlow });
    }

    setRouteResults(results);
    _drawRouteLines(results);
    setRouteProgress('');
    if (!results.length) setRouteMsg('⚠ No routes — verify pins have elevations loaded.');
    setAnalyzing(false);
  };

  // Suggest collection tank spots — scored by gravity-flow potential
  const findTankSpots = async () => {
    const allTrees = pinsRef.current.filter(p => p.type==='tree');
    if (allTrees.length < 2) { setRouteMsg('❌ Place at least 2 trees on the map first.'); return; }
    setFindingSpots(true); setRouteMsg('Loading…');
    try { await ensureElevations(allTrees, 'tree pin(s)'); } catch {}
    const trees = pinsRef.current.filter(p => p.type==='tree' && p.elev!=null);
    if (trees.length < 2) { setRouteMsg('❌ Need elevations for at least 2 trees — check connection.'); setFindingSpots(false); return; }
    setRouteMsg('Sampling terrain grid for tank spots…');
    _clearSpotMarkers(); setTankSpots([]);
    const cLat = trees.reduce((s,p)=>s+p.lat,0)/trees.length;
    const cLon = trees.reduce((s,p)=>s+p.lon,0)/trees.length;
    const avgTreeElev = trees.reduce((s,p)=>s+p.elev,0)/trees.length;
    const offsets = [-0.003,-0.002,-0.001,0,0.001,0.002,0.003];
    const gridPts = [];
    for (const dLat of offsets) for (const dLon of offsets) gridPts.push({ lat:cLat+dLat, lon:cLon+dLon });
    let elevs;
    try {
      setRouteMsg('Fetching elevation grid (49 points)…');
      elevs = await _fetchElevBatch(gridPts);
    } catch { setRouteMsg('❌ Elevation fetch failed. Check connection.'); setFindingSpots(false); return; }
    const candidates = gridPts
      .map((pt, i) => ({ ...pt, elev: elevs[i] }))
      .filter(c => c.elev != null && c.elev < avgTreeElev - 5);
    if (!candidates.length) {
      setRouteMsg('⚠ No lower spots found — terrain may be too flat. Consider vacuum assist.');
      setFindingSpots(false); return;
    }
    const scored = candidates.map(c => {
      let score = 0;
      trees.forEach(t => {
        const distFt = haversineFt(t.lat, t.lon, c.lat, c.lon);
        const grade = distFt > 0 ? ((t.elev - c.elev) / distFt) * 100 : 0;
        if (grade >= 2.0) score += 3;
        else if (grade >= 1.0) score += 2;
        else if (grade >= 0.5) score += 1;
      });
      return { ...c, score, treesAbove: trees.filter(t => ((t.elev-c.elev)/Math.max(haversineFt(t.lat,t.lon,c.lat,c.lon),1))*100 >= 1.0).length };
    });
    const spots = scored.sort((a,b) => b.score-a.score || a.elev-b.elev).slice(0,3);
    setTankSpots(spots);
    setRouteMsg('');
    spots.forEach((s,i) => {
      if (!_lMap || !window.L) return;
      const tankSVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12M20 6v12"/><ellipse cx="12" cy="18" rx="8" ry="3"/><path d="M4 12a8 3 0 0 0 16 0" opacity=".4"/></svg>';
      const rankLabel = ['#1','#2','#3'][i] || '';
      const m = window.L.marker([s.lat,s.lon], { icon: window.L.divIcon({
        className:'',
        html: '<div style="position:relative;width:30px;height:40px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.6))">'
          + '<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">'
          + '<path d="M15 39 C15 39,4 26,4 15 A11 11 0 1 1 26 15 C26 26,15 39,15 39 Z" fill="#d97706"/>'
          + '<path d="M9 10 A9 9 0 0 1 21 10" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" stroke-linecap="round"/>'
          + '</svg>'
          + '<div style="position:absolute;top:4px;left:50%;transform:translateX(-50%)">' + tankSVG + '</div>'
          + '<div style="position:absolute;top:-8px;right:-6px;background:#fbbf24;color:#07090f;font-size:8px;font-weight:800;border-radius:6px;padding:1px 4px;font-family:Inter,sans-serif;border:1.5px solid #fff">' + rankLabel + '</div>'
          + '</div>',
        iconSize:[30,40], iconAnchor:[15,40], popupAnchor:[0,-42],
      })}).addTo(_lMap);
      m.bindPopup('<b>\u2605 Spot ' + (i+1) + '</b><br/>Elev: ' + s.elev.toFixed(1) + ' ft<br/>'
        + s.treesAbove + '/' + trees.length + ' trees with \u22651% gravity flow<br/>'
        + s.lat.toFixed(5) + ', ' + s.lon.toFixed(5));
      _lSpotMarkers.push(m);
    });
    setFindingSpots(false);
  };

  const removePin = id => {
    const updated = pinsRef.current.filter(p => p.id!==id);
    setPins(updated); ls.set('sg_lines_pins', updated);
    if (_lMarkers[id]) { _lMarkers[id].remove(); delete _lMarkers[id]; }
    if (editingId === id) { setEditingId(null); setEditLabel(''); }
  };
  const clearAll = () => {
    setPins([]); ls.set('sg_lines_pins', []);
    Object.values(_lMarkers).forEach(m => m.remove()); _lMarkers = {};
    _clearRouteLines(); _clearSpotMarkers();
    setRouteResults([]); setTankSpots([]); setRouteMsg(''); setRouteProgress('');
    setEditingId(null); setEditLabel('');
  };


  const treePins  = pins.filter(p => p.type === 'tree');
  const tankPins  = pins.filter(p => p.type === 'tank');
  const otherPins = pins.filter(p => p.type !== 'tree' && p.type !== 'tank');
  const totalTaps = treePins.reduce((s, p) => s + (parseInt(p.taps) || 0), 0);
  const readyTrees = treePins.filter(p => p.elev != null).length;
  const readyTanks = tankPins.filter(p => p.elev != null).length;
  const gravityLines = routeResults.filter(r => r.goodFlow).length;
  const selectedPin = pins.find(p => p.id === selectedPinId) || null;

  const updatePinField = (id, field, val) => {
    const updated = pinsRef.current.map(p => p.id === id ? { ...p, [field]: val } : p);
    setPins(updated); ls.set('sg_lines_pins', updated);
    pinsRef.current = updated;
    const pin = updated.find(p => p.id === id);
    if (pin) _sbUpdateMarker(pin);
  };

  // Icon + colour mapping for each mode — matches app nav-tab style
  const _MODE_TABS = [
    { id:'tree',       Icon:I.mapleLeaf, label:'Tap Tree',   color:'#2dd4a7' },
    { id:'tank',       Icon:I.tank,      label:'Tank',       color:'#3b82f6' },
    { id:'sugarhouse', Icon:I.home,      label:'Sugarhouse', color:'#f59e0b' },
    { id:'pump',       Icon:I.settings,  label:'Pump',       color:'#f97316' },
    { id:'junction',   Icon:I.crosshair, label:'Junction',   color:'#8b5cf6' },
    { id:'marker',     Icon:I.mapPin,    label:'Waypoint',   color:'#ef4444' },
  ];
  const _activeCfg = _MODE_TABS.find(c => c.id === mode) || _MODE_TABS[0];

  const [betaDismissed, setBetaDismissed] = React.useState(() => ls.get('sg_map_beta_dismissed', false));
  const dismissBeta = () => { ls.set('sg_map_beta_dismissed', true); setBetaDismissed(true); };

  return (
    <div style={{ position:'relative' }}>

      {/* ── Beta notice ─────────────────────────────────────────────────── */}
      {!betaDismissed && (
        <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.25)',
          borderRadius:12, padding:'10px 14px', marginBottom:10,
          display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:'#fbbf24', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3 }}>
              β Beta Feature
            </div>
            <div style={{ fontSize:11, color:'#8a9ab5', lineHeight:1.5 }}>
              Sugarbush mapping is actively being improved. GPS accuracy varies under canopy (5–15 m typical). Route analysis and elevation data require internet. Tap <b style={{color:'#c9d1d9'}}>💾 Save offline</b> while connected to cache the map for field use.
            </div>
          </div>
          <button onClick={dismissBeta}
            style={{ background:'none', border:'none', color:'#5a6a7a', fontSize:18, cursor:'pointer', flexShrink:0, lineHeight:1, padding:'0 2px' }}>✕</button>
        </div>
      )}

      {/* ── Mode selector — nav-tab style ──────────────────────────────── */}
      <div style={{ display:'flex', gap:3, marginBottom:10, overflowX:'auto', paddingBottom:1 }}>
        {_MODE_TABS.map(({ id, Icon, label, color }) => {
          const active = mode === id;
          return (
            <button key={id} onClick={() => setMode(id)}
              style={{ flex:1, flexShrink:0, minWidth:52,
                background: active ? `linear-gradient(135deg,${color},${color}bb)` : 'transparent',
                border:'none', borderRadius:11, padding:'8px 5px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                fontWeight:600, fontSize:10, letterSpacing:'0.02em',
                color: active ? '#07090f' : '#3d5068',
                cursor:'pointer', transition:'all 0.18s',
                boxShadow: active ? `0 3px 16px ${color}44` : 'none' }}>
              <Icon size={17} color={active ? '#07090f' : '#3d5068'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Map card ───────────────────────────────────────────────────── */}
      <div style={{ background:'#0a1420', borderRadius:16, overflow:'hidden', marginBottom:10, boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>

        {/* Top control strip */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 12px 0' }}>
          {/* Sat / Street pill */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:999, padding:2 }}>
            {[{v:'satellite',l:'Sat'},{v:'street',l:'Street'}].map(o => (
              <button key={o.v} onClick={() => setMapType(o.v)}
                style={{ background:mapType===o.v?'rgba(255,255,255,0.12)':'transparent', border:'none', borderRadius:999,
                  padding:'5px 11px', fontSize:11, fontWeight:600, color:mapType===o.v?'#e2e8f0':'#4a5a6a', cursor:'pointer' }}>
                {o.l}
              </button>
            ))}
          </div>

          {/* Season pill */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:999, padding:2, flex:1 }}>
            {[{v:'off',l:'Live'},{v:'naip',l:'☀'},{v:'clarity',l:'❄'},{v:'compare',l:'⟺'}].map(o => (
              <button key={o.v} onClick={() => setSeasonMode(o.v)}
                style={{ flex:1, background:seasonMode===o.v?'rgba(59,130,246,0.35)':'transparent', border:'none', borderRadius:999,
                  padding:'5px 6px', fontSize:11, fontWeight:700,
                  color:seasonMode===o.v?'#93c5fd':'#4a5a6a', cursor:'pointer', whiteSpace:'nowrap' }}>
                {o.l}
              </button>
            ))}
          </div>

          {/* GPS drop */}
          <button onClick={markGPS} disabled={gpsLoading}
            style={{ background:gpsLoading?'rgba(255,255,255,0.05)':'rgba(88,166,255,0.18)', border:'none', borderRadius:999,
              padding:'5px 10px', fontSize:11, fontWeight:700, color:gpsLoading?'#4a5a6a':'#58a6ff',
              whiteSpace:'nowrap', opacity:gpsLoading?0.5:1 }}>
            {gpsLoading ? '…' : '⊕ GPS'}
          </button>

          {/* Track toggle */}
          <button onClick={gpsTracking ? stopTracking : startTracking}
            style={{ background:gpsTracking?'rgba(239,68,68,0.18)':'rgba(255,255,255,0.06)', border:'none', borderRadius:999,
              padding:'5px 10px', fontSize:11, fontWeight:700, color:gpsTracking?'#f87171':'#4a5a6a', whiteSpace:'nowrap' }}>
            {gpsTracking ? '⏹ Stop' : '▶ Track'}
          </button>

          {/* XY */}
          <button onClick={() => setShowCoordPanel(v => !v)}
            style={{ background:showCoordPanel?'rgba(88,166,255,0.2)':'rgba(255,255,255,0.06)', border:'none', borderRadius:999,
              padding:'5px 10px', fontSize:11, fontWeight:700, color:showCoordPanel?'#58a6ff':'#4a5a6a' }}>
            XY
          </button>

          {/* Save for offline */}
          <button onClick={saveOffline} disabled={caching || !leafletReady}
            title="Download visible map tiles so this area works offline"
            style={{ background:caching?'rgba(45,212,167,0.08)':'rgba(45,212,167,0.14)', border:'none', borderRadius:999,
              padding:'5px 10px', fontSize:11, fontWeight:700,
              color:caching?'#4a5a6a':'#2dd4a7', whiteSpace:'nowrap',
              opacity:(caching||!leafletReady)?0.5:1, cursor:caching?'default':'pointer' }}>
            {caching ? `💾 ${cachePct}%` : '💾 Save offline'}
          </button>

        </div>

        {/* Cache progress / confirmation */}
        {cacheMsg ? (
          <div style={{ margin:'6px 12px 0', background:'rgba(45,212,167,0.08)', border:'1px solid rgba(45,212,167,0.2)',
            borderRadius:8, padding:'6px 12px', fontSize:11, color:'#2dd4a7', display:'flex', alignItems:'center', gap:8 }}>
            {caching && (
              <div style={{ flex:1, height:3, background:'rgba(45,212,167,0.15)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${cachePct}%`, background:'#2dd4a7', borderRadius:2, transition:'width 0.2s' }} />
              </div>
            )}
            <span>{cacheMsg}</span>
          </div>
        ) : null}

        {/* Coordinate entry */}
        {showCoordPanel && (
          <div style={{ margin:'8px 12px 0', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px' }}>
            <div style={{ fontSize:11, color:'#4a5a6a', marginBottom:6 }}>
              Drop <b style={{ color:'#c9d1d9' }}>{_activeCfg?.label || mode}</b> at coordinates:
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <input value={coordLat} onChange={e=>setCoordLat(e.target.value)} placeholder="Lat  45.1234"
                style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8,
                  padding:'7px 10px', color:'#c9d1d9', fontSize:12, outline:'none' }}
                onKeyDown={e=>{if(e.key==='Enter')addByCoords();}} />
              <input value={coordLon} onChange={e=>setCoordLon(e.target.value)} placeholder="Lon  -72.567"
                style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8,
                  padding:'7px 10px', color:'#c9d1d9', fontSize:12, outline:'none' }}
                onKeyDown={e=>{if(e.key==='Enter')addByCoords();}} />
              <button onClick={addByCoords}
                style={{ background:'#2dd4a7', border:'none', borderRadius:8, padding:'7px 14px',
                  fontSize:12, fontWeight:700, color:'#07090f', cursor:'pointer', whiteSpace:'nowrap' }}>Drop</button>
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ padding:'8px 0 0' }}>
          {!leafletReady
            ? <div style={{ height:390, display:'flex', alignItems:'center', justifyContent:'center', color:'#4a5a6a', fontSize:13 }}>Loading map…</div>
            : <div ref={mapRef} style={{ height:390 }} />
          }
        </div>

        {/* ── Offline tile save — always-visible card inside map panel ── */}
        <div style={{ margin:'0 10px 10px', padding:'10px 12px', background:'rgba(45,212,167,0.05)', border:'1px solid rgba(45,212,167,0.15)', borderRadius:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#2dd4a7', marginBottom:2 }}>📶 Save Map for Offline</div>
              <div style={{ fontSize:10, color:'#5a6a7a', lineHeight:1.4 }}>
                Zoom to your sugarbush, then tap Save. Works on next visit without cell service.
              </div>
            </div>
            <button onClick={saveOffline} disabled={caching || !leafletReady}
              style={{ background:caching?'rgba(45,212,167,0.08)':'rgba(45,212,167,0.18)',
                border:'1px solid rgba(45,212,167,0.3)', borderRadius:8,
                padding:'7px 13px', fontSize:11, fontWeight:700, color:caching?'#4a5a6a':'#2dd4a7',
                whiteSpace:'nowrap', flexShrink:0,
                opacity:(caching||!leafletReady)?0.5:1, cursor:caching?'default':'pointer' }}>
              {caching ? `${cachePct}%` : 'Save'}
            </button>
          </div>
          {cacheMsg && (
            <div style={{ marginTop:8, fontSize:10, color: cacheMsg.startsWith('✓') ? '#2dd4a7' : cacheMsg.startsWith('⚠') ? '#f4a44a' : '#8a9ab5' }}>
              {caching && (
                <div style={{ height:2, background:'rgba(45,212,167,0.15)', borderRadius:1, marginBottom:5, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${cachePct}%`, background:'#2dd4a7', borderRadius:1, transition:'width 0.2s' }} />
                </div>
              )}
              {cacheMsg}
            </div>
          )}
        </div>

        {/* Stats + action strip */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px 10px', fontSize:11, color:'#4a5a6a' }}>
          {/* Counts */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, flexWrap:'wrap' }}>
            {treePins.length > 0 && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
                <I.mapleLeaf size={11} color="#2dd4a7" />
                <span style={{ color:'#2dd4a7', fontWeight:700 }}>{treePins.length}</span>
                {totalTaps > 0 && <span style={{ color:'#4a5a6a' }}>· {totalTaps}t</span>}
              </span>
            )}
            {tankPins.length > 0 && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
                <I.tank size={11} color="#60a5fa" />
                <span style={{ color:'#60a5fa', fontWeight:700 }}>{tankPins.length}</span>
              </span>
            )}
            {otherPins.length > 0 && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
                <I.flame size={11} color="#f59e0b" />
                <span style={{ color:'#f59e0b', fontWeight:700 }}>{otherPins.length}</span>
              </span>
            )}
            {routeResults.length > 0 && (
              <span style={{ color:gravityLines===routeResults.length?'#4ade80':'#f87171', fontWeight:700 }}>
                {gravityLines}/{routeResults.length} ✓
              </span>
            )}
            {(readyTrees < treePins.length || readyTanks < tankPins.length) && (
              <span style={{ color:'#f59e0b' }}>⏳</span>
            )}
          </div>

          {/* Undo */}
          <button onClick={() => { if (pins.length) removePin(pins[pins.length - 1].id); }}
            disabled={pins.length === 0}
            style={{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:8,
              padding:'5px 11px', fontSize:11, fontWeight:700,
              color:pins.length?'#8b949e':'#2d3d50', cursor:pins.length?'pointer':'default',
              display:'flex', alignItems:'center', gap:4 }}>
            ↩ Undo
          </button>

          {/* Clear all */}
          <button onClick={clearAll} disabled={pins.length === 0}
            style={{ background:'rgba(239,68,68,0.1)', border:'none', borderRadius:8,
              padding:'5px 11px', fontSize:11, fontWeight:700,
              color:pins.length?'#f87171':'#2d3d50', cursor:pins.length?'pointer':'default' }}>
            Clear All
          </button>
        </div>
      </div>

      {/* ── Main tab bar ─────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:3, marginBottom:10 }}>
        {[
          {id:'map',       l:'Map Tools'},
          {id:'trees',     l:'🍁 Trees'},
          {id:'mainlines', l:'Mainlines'},
          {id:'property',  l:'Property'},
        ].map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            style={{ flex:1, background:mainTab===t.id?'rgba(255,255,255,0.1)':'transparent',
              border:'none', borderRadius:9, padding:'8px 4px', fontSize:11, fontWeight:700,
              color:mainTab===t.id?'#e2e8f0':'#4a5a6a', cursor:'pointer', transition:'all .15s' }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── MAP TOOLS TAB ────────────────────────────────────────────── */}
      {mainTab === 'map' && (
        <div>
          {/* Action buttons */}
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <button onClick={analyzeRoutes} disabled={analyzing||!treePins.length||!tankPins.length}
              style={{ flex:2, background:analyzing?'#0d1a2b':'linear-gradient(135deg,#3fb950,#2ea043)',
                border:'none', borderRadius:10, padding:'13px', fontSize:14, fontWeight:700,
                color:'#fff', cursor:'pointer', opacity:(!treePins.length||!tankPins.length)?0.4:1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <I.ruler size={16} color="#fff" /> {analyzing ? 'Analyzing…' : 'Analyze Routes'}
            </button>
            <button onClick={findTankSpots} disabled={findingSpots||treePins.length<2}
              style={{ flex:1, background:findingSpots?'#0d1a2b':'linear-gradient(135deg,#e6b800,#b08800)',
                border:'none', borderRadius:10, padding:'13px', fontSize:13, fontWeight:700,
                color:'#07090f', cursor:'pointer', opacity:treePins.length<2?0.4:1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              {findingSpots ? '…' : '★'} Tank Spots
            </button>
          </div>

          {/* Progress + messages */}
          {routeProgress && (
            <div style={{ background:'rgba(63,185,80,0.1)', border:'1px solid #2ea043', borderRadius:10, padding:'8px 14px', marginBottom:8, fontSize:12, color:'#3fb950' }}>{routeProgress}</div>
          )}
          {routeMsg && (
            <div style={{ background:'rgba(248,81,73,0.1)', border:'1px solid #f85149', borderRadius:10, padding:'10px 14px', marginBottom:8, fontSize:13, color:'#f85149' }}>{routeMsg}</div>
          )}

          {/* Route results */}
          {routeResults.length > 0 && (
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div className="card-title" style={{ marginBottom:0 }}>
                  <CardIcon bg="#0d2b15" icon="trendUp" />
                  {routeResults.length} Line{routeResults.length!==1?'s':''} · {routeResults.reduce((s,r)=>s+r.trees.length,0)} Trees
                </div>
                <button className="btn-secondary" style={{ padding:'5px 12px', fontSize:12 }} onClick={clearRoutes}>Clear</button>
              </div>

              {routeResults.map((r, ri) => {
                const col = _gradeColor(r.overallGrade);
                const statusIcon = r.goodFlow ? '✓' : r.overallGrade < 0 ? '⚠' : r.minGrade < 0.5 ? '⚠' : '↗';
                const statusText = r.overallGrade < 0    ? 'Uphill — no gravity flow'
                  : r.minGrade < 0.5  ? 'Too flat — sap pools. Vacuum needed.'
                  : r.minGrade < 1.0  ? 'Marginal — vacuum assist recommended'
                  : r.overallGrade > 6 ? 'Very steep — check fittings & connections'
                  : 'Good gravity flow';
                return (
                  <div key={r.tank.id} style={{ background:'#0f1720', borderRadius:12, padding:'12px 14px', marginBottom:10, border:`1px solid ${col}44` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, cursor:'pointer' }}
                      onClick={() => {
                        if (!_lMap) return;
                        const pts = r.lineNodes.map(n => [n.lat, n.lon]);
                        if (pts.length >= 2) _lMap.fitBounds(pts, { padding:[40,40] });
                      }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, flex:1, minWidth:0 }}>
                        <I.tank size={15} color="#58a6ff" />
                        <span style={{ fontWeight:700, fontSize:14, color:'#c9d1d9' }}>{r.tank.label}</span>
                        <span style={{ fontSize:11, color:'#5a6a7a', flexShrink:0 }}>· {r.trees.length} tree{r.trees.length!==1?'s':''}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        <span style={{ fontSize:10, color:'#5a6a7a' }}>overall</span>
                        <span style={{ fontWeight:800, color:col, fontSize:18 }}>{r.overallGrade.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Flow visualization */}
                    <div style={{ overflowX:'auto', paddingBottom:4, marginBottom:10 }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:0, minWidth:'max-content' }}>
                        {r.lineNodes.map((node, ni) => {
                          const seg = r.segments[ni];
                          const isTank = node.type === 'tank';
                          const nc = isTank ? '#58a6ff' : '#3fb950';
                          return (
                            <React.Fragment key={node.id}>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'0 2px' }}>
                                <div style={{ width:30, height:30, borderRadius:isTank?6:'50%', background:nc+'22', border:`2px solid ${nc}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  {isTank ? <I.tank size={13} color={nc} /> : <I.tree size={13} color={nc} />}
                                </div>
                                <span style={{ fontSize:9, color:'#8b949e', maxWidth:52, textAlign:'center', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{node.label}</span>
                                <span style={{ fontSize:9, color:'#5a6a7a' }}>{node.elev!=null ? node.elev.toFixed(0)+'ft' : '—'}</span>
                              </div>
                              {seg && (
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:'0 0 auto', padding:'0 1px', marginTop:-12 }}>
                                  <span style={{ fontSize:10, fontWeight:700, color:_gradeColor(seg.grade) }}>{seg.grade.toFixed(1)}%</span>
                                  <div style={{ height:3, width:44, background:_gradeColor(seg.grade), borderRadius:2, opacity:0.9 }} />
                                  <span style={{ fontSize:8, color:'#3d5068' }}>
                                    {seg.dist < 5280 ? seg.dist.toFixed(0)+'ft' : (seg.dist/5280).toFixed(2)+'mi'}
                                  </span>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, marginBottom:8 }}>
                      {[
                        { l:'OVERALL', v:r.overallGrade.toFixed(2)+'%', c:col },
                        { l:'WORST SEG', v:r.minGrade.toFixed(2)+'%', c:_gradeColor(r.minGrade) },
                        { l:'TOTAL DROP', v:Math.abs(r.totalDrop).toFixed(1)+' ft', c:'#c9d1d9' },
                        { l:'LINE LEN', v:r.totalDist<5280?r.totalDist.toFixed(0)+' ft':(r.totalDist/5280).toFixed(2)+' mi', c:'#c9d1d9' },
                      ].map(item => (
                        <div key={item.l} style={{ textAlign:'center', background:'#081622', borderRadius:6, padding:'5px 2px' }}>
                          <div style={{ fontSize:9, color:'#5a6a7a', fontWeight:600, letterSpacing:'0.04em' }}>{item.l}</div>
                          <div style={{ fontWeight:700, color:item.c, fontSize:12, marginTop:2 }}>{item.v}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize:12, color:col, fontWeight:600, marginBottom:r.badSegs.length?4:0 }}>
                      {statusIcon} {statusText}
                    </div>
                    {r.badSegs.length > 0 && (
                      <div style={{ marginTop:4 }}>
                        {r.badSegs.map((s, bi) => (
                          <div key={bi} style={{ fontSize:11, color:'#f0883e', display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                            <span style={{ background:'#f0883e22', borderRadius:4, padding:'1px 5px', fontWeight:700 }}>{s.grade.toFixed(2)}%</span>
                            {s.from.label} → {s.to.label}
                            <span style={{ color:'#5a6a7a' }}>({s.dist.toFixed(0)} ft, {Math.abs(s.drop).toFixed(1)} ft drop)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Legend */}
              <div style={{ background:'#081622', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#5a6a7a', display:'flex', flexWrap:'wrap', gap:'8px 16px', alignItems:'center' }}>
                <span style={{ color:'#8b949e', fontWeight:600 }}>Grade key:</span>
                <span><span style={{ color:'#f85149', fontWeight:700 }}>━</span> &lt;0.5% flat</span>
                <span><span style={{ color:'#f0883e', fontWeight:700 }}>━</span> 0.5–1% marginal</span>
                <span><span style={{ color:'#3fb950', fontWeight:700 }}>━</span> 1–6% ✓ ideal</span>
                <span><span style={{ color:'#f0883e', fontWeight:700 }}>━</span> &gt;6% steep</span>
              </div>
            </div>
          )}

          {/* ── Materials Estimator ── */}
          {routeResults.length > 0 && (() => {
            const totalTrees2  = routeResults.reduce((s, r) => s + r.trees.length, 0);
            const lateralFt    = routeResults.reduce((s, r) => s + r.segments.filter(sg=>!sg.isToTank).reduce((a,sg)=>a+sg.dist,0), 0);
            const mainFt       = routeResults.reduce((s, r) => s + r.segments.filter(sg=>sg.isToTank).reduce((a,sg)=>a+sg.dist,0), 0);
            const dropFt       = totalTrees2 * 3;
            const numSpiles    = totalTrees2;
            const numTees      = totalTrees2;
            const numMainTees  = routeResults.length;
            const latDia       = vacSystem ? '5/16"' : '3/16"';
            const latNote      = vacSystem ? 'vacuum system' : 'gravity — natural siphon effect';
            const mainRec      = totalTrees2 >= 100 ? '1"' : '3/4"';
            const orderFt = ft => Math.ceil(ft / 100) * 100;
            const latCost    = lateralFt  * matPrices.lateral;
            const mainCost   = mainFt     * matPrices.mainline;
            const dropCost   = dropFt     * matPrices.drop;
            const spileCost  = numSpiles  * matPrices.spile;
            const teeCost    = numTees    * matPrices.tee;
            const mainTeeCost= numMainTees* matPrices.mainTee;
            const total      = latCost + mainCost + dropCost + spileCost + teeCost + mainTeeCost;
            return (
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div className="card-title" style={{ marginBottom:0 }}><CardIcon bg="#0d1a2b" icon="ruler" />Materials Estimator</div>
                  <button onClick={()=>setShowMatPrices(v=>!v)}
                    style={{ background:'none', border:'1px solid #1e2d3d', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#5a6a7a', cursor:'pointer' }}>
                    {showMatPrices ? 'Hide' : 'Edit'} Prices
                  </button>
                </div>

                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                  <div style={{ flex:1 }}>
                    <div className="field-label">Collection System</div>
                    <div style={{ display:'flex', gap:6 }}>
                      {[['Gravity','grav'],['Vacuum','vac']].map(([lbl,key])=>(
                        <button key={key} onClick={()=>setVacSystem(key==='vac')}
                          style={{ flex:1, background:(vacSystem===(key==='vac'))?'linear-gradient(135deg,#58a6ff,#1f6feb)':'#131e2c', border:'1px solid '+(vacSystem===(key==='vac')?'#58a6ff':'#1e2d3d'), borderRadius:8, padding:'7px 4px', fontSize:12, fontWeight:600, color:(vacSystem===(key==='vac'))?'#fff':'#5a6a7a', cursor:'pointer' }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="field-label">Main Line Size</div>
                    <div style={{ display:'flex', gap:6 }}>
                      {['3/4"','1"'].map(sz=>(
                        <button key={sz} onClick={()=>setMainSize(sz)}
                          style={{ flex:1, background:mainSize===sz?'linear-gradient(135deg,#3fb950,#2ea043)':'#131e2c', border:'1px solid '+(mainSize===sz?'#3fb950':'#1e2d3d'), borderRadius:8, padding:'7px 4px', fontSize:12, fontWeight:600, color:mainSize===sz?'#07090f':'#5a6a7a', cursor:'pointer' }}>{sz}</button>
                      ))}
                    </div>
                    {mainSize !== mainRec && <div style={{ fontSize:10, color:'#f0883e', marginTop:3 }}>⚠ Recommend {mainRec} for {totalTrees2} taps</div>}
                  </div>
                </div>

                {showMatPrices && (
                  <div style={{ background:'#081622', borderRadius:10, padding:'12px', marginBottom:12, border:'1px solid #1e2d3d' }}>
                    <div style={{ fontSize:12, color:'#5a6a7a', marginBottom:8 }}>Price per unit (edit to match your supplier)</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                      {[
                        ['lateral',  `${latDia} lateral ($/ft)`],
                        ['mainline', `${mainSize} main line ($/ft)`],
                        ['drop',     '3/16" drop tubing ($/ft)'],
                        ['spile',    'Spile / spout (each)'],
                        ['tee',      '3-way tee (each)'],
                        ['mainTee',  'Main line tee (each)'],
                      ].map(([k, label]) => (
                        <div key={k}>
                          <div style={{ fontSize:10, color:'#5a6a7a', marginBottom:2 }}>{label}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ color:'#3fb950', fontSize:12 }}>$</span>
                            <input type="number" defaultValue={matPrices[k]} step="0.01" min="0"
                              onBlur={e=>updateMatPrice(k, e.target.value)}
                              style={{ flex:1, background:'#0d1520', border:'1px solid #1e2d3d', borderRadius:6, padding:'4px 6px', color:'#c9d1d9', fontSize:12, outline:'none' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {routeResults.map((r) => {
                  const rLat  = r.segments.filter(sg=>!sg.isToTank).reduce((a,sg)=>a+sg.dist,0);
                  const rMain = r.segments.filter(sg=>sg.isToTank).reduce((a,sg)=>a+sg.dist,0);
                  return (
                    <div key={r.tank.id} style={{ background:'#0f1720', borderRadius:10, padding:'10px 12px', marginBottom:6, border:'1px solid #1e2d3d' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:600, fontSize:13 }}>
                          <I.tank size={13} color="#58a6ff" /> {r.tank.label}
                        </div>
                        <span style={{ fontSize:11, color:'#5a6a7a' }}>{r.trees.length} taps</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4, fontSize:11 }}>
                        <div style={{ background:'#081622', borderRadius:6, padding:'5px 6px' }}>
                          <div style={{ color:'#5a6a7a' }}>{latDia} lateral</div>
                          <div style={{ fontWeight:700, color:'#58a6ff' }}>{rLat.toFixed(0)} ft</div>
                        </div>
                        <div style={{ background:'#081622', borderRadius:6, padding:'5px 6px' }}>
                          <div style={{ color:'#5a6a7a' }}>{mainSize} main</div>
                          <div style={{ fontWeight:700, color:'#3fb950' }}>{rMain.toFixed(0)} ft</div>
                        </div>
                        <div style={{ background:'#081622', borderRadius:6, padding:'5px 6px' }}>
                          <div style={{ color:'#5a6a7a' }}>drops + tees</div>
                          <div style={{ fontWeight:700, color:'#e0a44a' }}>{r.trees.length} × each</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div style={{ background:'#0d2b15', borderRadius:10, padding:'12px 14px', border:'1px solid #1a4a25', marginTop:4 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'#3fb950', marginBottom:10 }}>📦 Order List</div>
                  {[
                    { item:`${latDia} lateral tubing`, qty:`${lateralFt.toFixed(0)} ft`, order:`${orderFt(lateralFt)} ft`, cost:latCost, color:'#58a6ff' },
                    { item:`${mainSize} main line`,     qty:`${mainFt.toFixed(0)} ft`,    order:`${orderFt(mainFt)} ft`,   cost:mainCost,  color:'#3fb950' },
                    { item:'3/16" drop tubing (3 ft/tap)', qty:`${dropFt} ft`,            order:`${orderFt(dropFt)} ft`,  cost:dropCost,  color:'#c9d1d9' },
                    { item:'Spiles / spouts',           qty:`${numSpiles}`,               order:`${numSpiles}`,            cost:spileCost, color:'#c9d1d9' },
                    { item:'3-way tee connectors',      qty:`${numTees}`,                 order:`${numTees}`,              cost:teeCost,   color:'#c9d1d9' },
                    { item:'Main line tees',            qty:`${numMainTees}`,             order:`${numMainTees}`,          cost:mainTeeCost, color:'#c9d1d9' },
                  ].map((row, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid #1a4a25' }}>
                      <div>
                        <div style={{ fontSize:13, color:row.color, fontWeight:500 }}>{row.item}</div>
                        <div style={{ fontSize:10, color:'#3d5068' }}>Measured: {row.qty} · Order: {row.order}</div>
                      </div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#3fb950', flexShrink:0, marginLeft:8 }}>${row.cost.toFixed(2)}</div>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                    <div>
                      <div style={{ fontWeight:700, color:'#3fb950', fontSize:15 }}>Est. Total</div>
                      <div style={{ fontSize:11, color:'#5a6a7a' }}>Material cost only · {latNote}</div>
                    </div>
                    <div style={{ fontSize:22, fontWeight:800, color:'#3fb950' }}>${total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tank spots */}
          {tankSpots.length > 0 && (
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div className="card-title" style={{ marginBottom:0 }}><CardIcon bg="#1a1500" icon="mapPin" />Tank Spots</div>
                <button className="btn-secondary" style={{ padding:'5px 12px', fontSize:12 }} onClick={clearSpots}>Clear</button>
              </div>
              <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:8 }}>Suggested collection points — ranked by gravity-flow score.</div>
              {tankSpots.map((s,i) => (
                <div key={i} style={{ background:'#0f1720', borderRadius:10, padding:'10px 14px', marginBottom:6, border:'1px solid #2d2000' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:600, color:'#e6b800', fontSize:13 }}>★ Spot {i+1}</div>
                      <div style={{ fontSize:11, color:'#5a6a7a', marginTop:2 }}>
                        {s.lat.toFixed(5)}, {s.lon.toFixed(5)} · {s.treesAbove}/{treePins.filter(p=>p.elev!=null).length} trees ≥1% grade
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                      <div style={{ fontWeight:700, color:'#e0a44a', fontSize:15 }}>{s.elev.toFixed(1)} ft</div>
                      <button onClick={()=>placeSpotAsTank(s)} style={{ background:'linear-gradient(135deg,#58a6ff,#1f6feb)', border:'none', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#fff', cursor:'pointer', whiteSpace:'nowrap' }}>+ Place as Tank</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TREE INVENTORY TAB ───────────────────────────────────────── */}
      {mainTab === 'trees' && (
        <div>
          {treePins.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🍁</div>
                <div className="empty-title">No trees yet</div>
                Tap the map in Tap Tree mode to add your first tree.
              </div>
            </div>
          ) : (
            <>
              {/* Health summary grid */}
              <div className="card">
                <div className="card-title"><CardIcon bg="#0d2b15" icon="tree" />Health Overview · {treePins.length} Trees · {totalTaps} Taps</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:5, marginBottom:12 }}>
                  {Object.entries(_HEALTH_LABELS).map(([k,l]) => {
                    const cnt = treePins.filter(p => p.health === k).length;
                    return (
                      <div key={k} style={{ background:'#0f1720', borderRadius:8, padding:'8px 4px', textAlign:'center', border:`1px solid ${_HEALTH_COLORS[k]}44` }}>
                        <div style={{ fontSize:16, fontWeight:800, color:_HEALTH_COLORS[k] }}>{cnt}</div>
                        <div style={{ fontSize:9, color:'#5a6a7a', marginTop:2 }}>{l}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Species breakdown */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
                  {Object.entries(_SPECIES_LABELS).map(([k,l]) => {
                    const cnt = treePins.filter(p => p.species === k).length;
                    if (cnt === 0) return null;
                    return (
                      <span key={k} style={{ background:_SPECIES_COLORS[k]+'22', border:`1px solid ${_SPECIES_COLORS[k]}55`, borderRadius:6, padding:'3px 8px', fontSize:11, color:_SPECIES_COLORS[k], fontWeight:600 }}>
                        {l} ({cnt})
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Tree list */}
              <div className="card">
                <div className="card-title"><CardIcon bg="#0d2b15" icon="list" />All Trees</div>
                {treePins.map(p => {
                  const sColor = _SPECIES_COLORS[p.species] || '#5a6a7a';
                  const hColor = _HEALTH_COLORS[p.health] || '#5a6a7a';
                  const mlColor = p.mainline ? _ML_COLORS[p.mainline] : null;
                  return (
                    <div key={p.id} style={{ background:'#0f1720', borderRadius:10, padding:'10px 12px', marginBottom:5, border:'1px solid #1e2d3d', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
                      onClick={() => { setSelectedPinId(p.id); setShowPinPanel(true); zoomToPin(p); }}>
                      {/* Species circle with health ring */}
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:sColor+'33', border:`3px solid ${hColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🍁</div>
                        {mlColor && (
                          <div style={{ position:'absolute', bottom:-3, right:-3, width:14, height:14, borderRadius:'50%', background:mlColor, border:'1.5px solid #0a1420', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, color:'#fff' }}>
                            {p.mainline}
                          </div>
                        )}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:'#c9d1d9', display:'flex', alignItems:'center', gap:6 }}>
                          {p.label}
                          <span style={{ fontSize:10, color:sColor, background:sColor+'22', borderRadius:4, padding:'1px 5px' }}>{_SPECIES_LABELS[p.species]||'Unknown'}</span>
                        </div>
                        <div style={{ fontSize:11, color:'#5a6a7a', marginTop:2, display:'flex', gap:8, flexWrap:'wrap' }}>
                          {p.dbh && <span>DBH: {p.dbh}"</span>}
                          {p.taps && <span>Taps: {p.taps}</span>}
                          {p.elev != null && <span style={{ color:'#e0a44a' }}>↑ {p.elev.toFixed(0)} ft</span>}
                          <span style={{ color:hColor }}>{_HEALTH_LABELS[p.health]||'?'}</span>
                        </div>
                      </div>
                      <div style={{ color:'#3d5068', fontSize:12 }}>›</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MAINLINES TAB ────────────────────────────────────────────── */}
      {mainTab === 'mainlines' && (
        <div>
          {mainlines.map(ml => {
            const mlTrees = treePins.filter(p => p.mainline === ml.id);
            const mlTaps  = mlTrees.reduce((s, p) => s + (parseInt(p.taps) || 0), 0);
            return (
              <div key={ml.id} className="card" style={{ borderLeft:`3px solid ${ml.color}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:mlTrees.length?10:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:ml.color+'33', border:`2px solid ${ml.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:ml.color, fontSize:13 }}>{ml.id}</div>
                    <div>
                      <div style={{ fontWeight:700, color:'#c9d1d9', fontSize:13 }}>{ml.label}</div>
                      <div style={{ fontSize:11, color:'#5a6a7a' }}>{mlTrees.length} tree{mlTrees.length!==1?'s':''} · {mlTaps} tap{mlTaps!==1?'s':''}</div>
                    </div>
                  </div>
                </div>
                {mlTrees.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {mlTrees.map(p => (
                      <button key={p.id} onClick={() => { setSelectedPinId(p.id); setShowPinPanel(true); zoomToPin(p); }}
                        style={{ background:ml.color+'22', border:`1px solid ${ml.color}55`, borderRadius:6, padding:'3px 9px', fontSize:11, color:ml.color, cursor:'pointer', fontWeight:600 }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unassigned */}
          {(() => {
            const unassigned = treePins.filter(p => !p.mainline);
            if (!unassigned.length) return null;
            return (
              <div className="card">
                <div className="card-title" style={{ color:'#5a6a7a' }}><CardIcon bg="#1e2d3d" icon="mapPin" />Unassigned ({unassigned.length})</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {unassigned.map(p => (
                    <button key={p.id} onClick={() => { setSelectedPinId(p.id); setShowPinPanel(true); zoomToPin(p); }}
                      style={{ background:'#1e2d3d', border:'1px solid #2d3d50', borderRadius:6, padding:'3px 9px', fontSize:11, color:'#8b949e', cursor:'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── PROPERTY TAB ─────────────────────────────────────────────── */}
      {mainTab === 'property' && (
        <div className="card">
          <div className="card-title"><CardIcon bg="#1a1020" icon="mapPin" />Property Lines</div>
          <div style={{ fontSize:12, color:'#5a6a7a', marginBottom:12, lineHeight:1.6 }}>
            Import your property boundary from a GPS app or GIS export. Supported formats: KML (Google Earth), GPX, GeoJSON.
          </div>
          <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', borderRadius:10, padding:'13px', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer' }}>
            📂 Import Property File
            <input type="file" accept=".kml,.gpx,.geojson,.json" style={{ display:'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) _sbImportPropertyFile(f); e.target.value=''; }} />
          </label>
          {_lPropertyLayers.length > 0 && (
            <button onClick={() => { _lPropertyLayers.forEach(l => { try { _lMap?.removeLayer(l); } catch {} }); _lPropertyLayers.length = 0; }}
              style={{ width:'100%', marginTop:8, background:'#1a0f0f', border:'1px solid #3d1515', borderRadius:10, padding:'10px', fontSize:13, fontWeight:600, color:'#f85149', cursor:'pointer' }}>
              ✕ Clear Property Lines
            </button>
          )}
          <div style={{ marginTop:12, fontSize:11, color:'#3d5068', lineHeight:1.6 }}>
            Tip: In Google Earth, right-click your polygon → Save place as → KML.
            In onX Hunt or CalTopo, export as GeoJSON.
          </div>
        </div>
      )}

      {/* ── PIN DETAIL SLIDE-UP PANEL ────────────────────────────────── */}
      {showPinPanel && selectedPin && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:9999, background:'#0d1521', borderTop:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px 20px 0 0', padding:'12px 16px 36px', maxHeight:'72vh', overflowY:'auto', boxShadow:'0 -12px 40px rgba(0,0,0,0.8)' }}>
          {/* Handle */}
          <div style={{ width:36, height:3.5, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 14px' }} />

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>{_PIN_TYPE_CFG.find(c=>c.id===selectedPin.type)?.emoji||'📍'}</span>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:'#c9d1d9' }}>{selectedPin.label}</div>
                <div style={{ fontSize:11, color:'#5a6a7a', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  <span>{selectedPin.lat.toFixed(5)}, {selectedPin.lon.toFixed(5)}</span>
                  {selectedPin.accuracy != null && (
                    <span style={{
                      fontWeight:700, fontSize:10, borderRadius:4, padding:'1px 5px',
                      background: selectedPin.accuracy <= 5 ? 'rgba(45,212,167,0.15)' : selectedPin.accuracy <= 15 ? 'rgba(244,164,74,0.15)' : 'rgba(248,113,113,0.15)',
                      color:       selectedPin.accuracy <= 5 ? '#2dd4a7'              : selectedPin.accuracy <= 15 ? '#f4a44a'              : '#f87171',
                    }}>± {selectedPin.accuracy} m</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setShowPinPanel(false)} style={{ background:'#1e2d3d', border:'none', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', color:'#8b949e', cursor:'pointer', fontSize:16 }}>✕</button>
          </div>

          {/* Tree-specific fields */}
          {selectedPin.type === 'tree' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
              {/* Species */}
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#5a6a7a', marginBottom:4 }}>SPECIES</div>
                <select value={selectedPin.species||'sugar_maple'} onChange={e => updatePinField(selectedPin.id, 'species', e.target.value)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:'8px 10px', color:'#c9d1d9', fontSize:12, outline:'none' }}>
                  {Object.entries(_SPECIES_LABELS).map(([k,l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>

              {/* Health */}
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#4a5a6a', marginBottom:4, letterSpacing:'0.06em' }}>HEALTH</div>
                <select value={selectedPin.health||'good'} onChange={e => updatePinField(selectedPin.id, 'health', e.target.value)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:'8px 10px', color:'#c9d1d9', fontSize:12, outline:'none' }}>
                  {Object.entries(_HEALTH_LABELS).map(([k,l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>

              {/* DBH */}
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#5a6a7a', marginBottom:4 }}>DBH (inches)</div>
                <input type="number" min="1" max="60" step="0.5"
                  value={selectedPin.dbh||''} placeholder="e.g. 14"
                  onChange={e => updatePinField(selectedPin.id, 'dbh', e.target.value)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:'8px 10px', color:'#c9d1d9', fontSize:12, outline:'none', boxSizing:'border-box' }} />
              </div>

              {/* Taps */}
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#4a5a6a', marginBottom:4, letterSpacing:'0.06em' }}>TAP COUNT</div>
                <input type="number" min="0" max="4" step="1"
                  value={selectedPin.taps||''} placeholder="0–4"
                  onChange={e => updatePinField(selectedPin.id, 'taps', e.target.value)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:'8px 10px', color:'#c9d1d9', fontSize:12, outline:'none', boxSizing:'border-box' }} />
              </div>

              {/* Mainline */}
              <div style={{ gridColumn:'1/-1' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#5a6a7a', marginBottom:4 }}>MAINLINE ASSIGNMENT</div>
                <div style={{ display:'flex', gap:6 }}>
                  {[{id:'',label:'None'},...mainlines].map(ml => (
                    <button key={ml.id} onClick={() => updatePinField(selectedPin.id, 'mainline', ml.id)}
                      style={{ flex:1, background:(selectedPin.mainline||'')===ml.id?(ml.id?_ML_COLORS[ml.id]+'33':'#1e2d3d'):'transparent',
                        border:`1px solid ${(selectedPin.mainline||'')===ml.id?(ml.id?_ML_COLORS[ml.id]:'#58a6ff'):'#1e2d3d'}`,
                        borderRadius:8, padding:'7px 4px', fontSize:12, fontWeight:700,
                        color:(selectedPin.mainline||'')===ml.id?(ml.id?_ML_COLORS[ml.id]:'#58a6ff'):'#5a6a7a', cursor:'pointer' }}>
                      {ml.id || '—'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Label (rename) */}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#4a5a6a', marginBottom:4, letterSpacing:'0.06em' }}>LABEL</div>
            <input value={selectedPin.label} onChange={e => updatePinField(selectedPin.id, 'label', e.target.value)}
              style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:'9px 12px', color:'#e2e8f0', fontSize:13, outline:'none', boxSizing:'border-box', fontWeight:600 }} />
          </div>

          {/* Notes */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#4a5a6a', marginBottom:4, letterSpacing:'0.06em' }}>NOTES</div>
            <textarea value={selectedPin.notes||''} onChange={e => updatePinField(selectedPin.id, 'notes', e.target.value)}
              placeholder="Add notes…" rows={2}
              style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:'9px 12px', color:'#c9d1d9', fontSize:12, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }} />
          </div>

          {/* Elevation display */}
          {selectedPin.elev != null && (
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'8px 12px', marginBottom:14, display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'#4a5a6a' }}>Elevation</span>
              <span style={{ color:'#fbbf24', fontWeight:700 }}>{selectedPin.elev.toFixed(1)} ft</span>
            </div>
          )}

          {/* Delete */}
          <button onClick={() => { removePin(selectedPin.id); setShowPinPanel(false); setSelectedPinId(null); }}
            style={{ width:'100%', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'11px', fontSize:13, fontWeight:700, color:'#f87171', cursor:'pointer' }}>
            Delete Pin
          </button>
        </div>
      )}
    </div>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding:20, background:'#1a0000', border:'2px solid #f85149', borderRadius:12, margin:20, color:'#ff6b6b' }}>
          <h2 style={{ color:'#f85149', marginBottom:10 }}>⚠ App Error</h2>
          <pre style={{ whiteSpace:'pre-wrap', fontSize:12, color:'#ccc' }}>{String(this.state.error)}</pre>
          <pre style={{ whiteSpace:'pre-wrap', fontSize:11, color:'#888', marginTop:10 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── SAP RUN SCORING (Acer saccharum physiology, Cornell/UVM Proctor research) ──
function _sapRunScore(hiF, loF, windMph, precipIn, sunSec, prevHiF, runStreak) {
  if (loF >= 32 || hiF <= 32) return { score:0, quality:'No Flow', buddyRisk:false };
  let score = 0;
  // Night freeze quality — ideal 18-28°F (-8 to -2°C)
  if      (loF >= 28) score += 5;
  else if (loF >= 18) score += 25;
  else if (loF >= 5)  score += 15;
  else                score += Math.max(0, 3 + (loF - 5) * 0.3);
  // Day thaw quality — ideal 40-46°F (4-8°C); >50°F = buddy risk
  const buddyRisk = hiF >= 50;
  if (!buddyRisk) {
    if      (hiF >= 40 && hiF < 46) score += 25;
    else if (hiF >= 46 && hiF < 50) score += 18;
    else if (hiF >= 33 && hiF < 40) score += 12;
    else                             score += 5;
  }
  // Temperature swing ΔT — bigger is better
  score += Math.min(25, ((hiF - loF) / 35) * 25);
  // Sunshine bonus (max 8 pts at 9h)
  score += Math.min(8, ((sunSec || 0) / 3600) * 0.9);
  // Wind penalty (>15 mph hurts)
  if (windMph > 15) score -= Math.min(8, ((windMph - 15) / 15) * 8);
  // Precip penalty (>0.1" dilutes/washes sap)
  if (precipIn > 0.1) score -= Math.min(10, ((precipIn - 0.1) / 0.8) * 10);
  // Previous warm day — builds toward bud break
  if (prevHiF != null && prevHiF > 48) score -= Math.min(10, (prevHiF - 48) * 0.8);
  // Consecutive run days — trees need a refreeze between runs
  if ((runStreak || 0) >= 3) score -= Math.min(12, (runStreak - 2) * 4);
  score = Math.max(0, Math.min(100, Math.round(score)));
  let quality;
  if      (score >= 80) quality = 'Excellent';
  else if (score >= 62) quality = 'Good';
  else if (score >= 44) quality = 'Fair';
  else if (score >= 22) quality = 'Poor';
  else                  quality = 'No Flow';
  return { score, quality, buddyRisk };
}

// ─── WEATHER TAB ──────────────────────────────────────────────────────────────
function WeatherTab({ lang='en', trees=0, units='GAL' }) {
  const [locName,    setLocName]    = useState(() => ls.get('sg_wx_name',''));
  const [wxLat,      setWxLat]      = useState(() => ls.get('sg_wx_lat', null));
  const [wxLon,      setWxLon]      = useState(() => ls.get('sg_wx_lon', null));
  const [query,      setQuery]      = useState('');
  const [geoResults, setGeoResults] = useState([]);
  const [wxData,     setWxData]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error,      setError]      = useState('');
  const [selDay,     setSelDay]     = useState(0);
  const [showSearch, setShowSearch] = useState(() => !ls.get('sg_wx_lat', null));

  useEffect(() => {
    const la = ls.get('sg_wx_lat', null);
    const lo = ls.get('sg_wx_lon', null);
    if (la && lo) _wxFetch(la, lo);
  }, []);

  const _wxFetch = async (la, lo) => {
    setLoading(true); setError('');
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + la + '&longitude=' + lo
        + '&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_sum,sunshine_duration,weathercode'
        + '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch'
        + '&timezone=auto&forecast_days=7';
      const r = await fetch(url);
      const d = await r.json();
      setWxData(d);
      setSelDay(0);
      setShowSearch(false);
    } catch(e) { setError('Could not load weather. Check your connection.'); }
    setLoading(false);
  };

  const _reverseGeocode = async (la, lo) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const d = await r.json();
      const a = d.address || {};
      // Pick the most human-useful level: town > city > county > state
      const place = a.town || a.city || a.village || a.hamlet || a.county || a.state || '';
      const state = a.state || a.country || '';
      if (place) return [place, state].filter(Boolean).join(', ');
    } catch {}
    // Fallback to coordinates if reverse geocode fails
    return la.toFixed(2) + '°, ' + lo.toFixed(2) + '°';
  };

  const useGPS = () => {
    if (location.protocol === 'file:') {
      setError('GPS requires HTTPS hosting. Use zip/city search, or serve from a local server.');
      return;
    }
    if (!navigator.geolocation) { setError('GPS not supported by this browser.'); return; }
    setLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const la = pos.coords.latitude, lo = pos.coords.longitude;
        const name = await _reverseGeocode(la, lo);
        setWxLat(la); setWxLon(lo); setLocName(name);
        ls.set('sg_wx_lat', la); ls.set('sg_wx_lon', lo); ls.set('sg_wx_name', name);
        _wxFetch(la, lo);
      },
      e => {
        setLoading(false);
        if (e.code === 1) setError('Location denied — allow location access in browser settings.');
        else if (e.code === 2) setError('Location unavailable. Try zip/city search.');
        else setError('Location timed out. Try zip/city search.');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const searchGeo = async () => {
    if (!query.trim()) return;
    setGeoLoading(true); setGeoResults([]); setError('');
    try {
      const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=5&language=en&format=json');
      const d = await r.json();
      if (d.results && d.results.length) setGeoResults(d.results);
      else setError('Location not found. Try a different city or zip.');
    } catch { setError('Search failed. Check your connection.'); }
    setGeoLoading(false);
  };

  const pickLocation = (res) => {
    const la = res.latitude, lo = res.longitude;
    const name = [res.name, res.admin1, res.country_code].filter(Boolean).join(', ');
    setWxLat(la); setWxLon(lo); setLocName(name);
    ls.set('sg_wx_lat', la); ls.set('sg_wx_lon', lo); ls.set('sg_wx_name', name);
    setGeoResults([]); setQuery('');
    _wxFetch(la, lo);
  };

  // Build scored forecast from API data
  let days = [];
  if (wxData && wxData.daily) {
    const D = wxData.daily;
    let runStreak = 0;
    days = D.time.slice(0, 7).map((date, i) => {
      const hiF      = Math.round(D.temperature_2m_max?.[i] ?? 32);
      const loF      = Math.round(D.temperature_2m_min?.[i] ?? 20);
      const windMph  = Math.round(D.windspeed_10m_max?.[i] || 0);
      const precipIn = +((D.precipitation_sum?.[i] || 0).toFixed(2));
      const sunSec   = D.sunshine_duration?.[i] || 0;
      const prevHiF  = i > 0 ? Math.round(D.temperature_2m_max[i-1]) : null;
      const sc       = _sapRunScore(hiF, loF, windMph, precipIn, sunSec, prevHiF, runStreak);
      if (sc.score >= 44) runStreak++; else runStreak = 0;
      const dt       = new Date(date + 'T12:00:00');
      return {
        date, hiF, loF, windMph, precipIn, sunSec,
        score: sc.score, quality: sc.quality, buddyRisk: sc.buddyRisk,
        dayLabel:  i === 0 ? t(lang,'today') : (DAY[lang] || DAY['en'])[dt.getDay()],
        dateLabel: (MON[lang] || MON['en'])[dt.getMonth()] + ' ' + dt.getDate()
      };
    });
  }

  const goodDays  = days.filter(d => d.score >= 44).length;
  const bestScore = days.length ? Math.max(...days.map(d => d.score)) : 0;

  const scoreColor = (s) =>
    s >= 80 ? '#3fb950' : s >= 62 ? '#7cc950' : s >= 44 ? '#d4a017' : s >= 22 ? '#8b5a2b' : '#3d5068';
  const scoreBg = (s) =>
    s >= 80 ? 'rgba(63,185,80,0.13)' : s >= 62 ? 'rgba(124,201,80,0.11)' :
    s >= 44 ? 'rgba(212,160,23,0.11)' : 'rgba(61,80,104,0.08)';

  const sel = days[selDay] || null;

  return (
    <div>

      {/* ── Location card ── */}
      <div className="card" style={{ padding:'12px 14px' }}>
        {locName && !showSearch ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
              <I.mapPin size={15} color="#2dd4a7" />
              <span style={{ fontWeight:600, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{locName}</span>
            </div>
            <button onClick={() => setShowSearch(true)}
              style={{ background:'#1c2128', border:'1px solid #30363d', borderRadius:8, padding:'5px 12px', color:'#8b949e', fontSize:12, cursor:'pointer', flexShrink:0 }}>
              {t(lang,'wxChange')}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#5a6a7a', marginBottom:8, letterSpacing:'0.06em' }}>{t(lang,'wxSetLoc')}</div>
            <button className="btn-secondary" style={{ marginBottom:10 }} onClick={useGPS}>
              <I.mapPin size={15} color="#8b949e" /> {t(lang,'wxUseGPS')}
            </button>
            <div style={{ textAlign:'center', color:'#3d5068', fontSize:12, marginBottom:8 }}>{t(lang,'wxOr')}</div>
            <div style={{ display:'flex', gap:8 }}>
              <input type="text" placeholder={t(lang,'wxCityPh')}
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchGeo()}
                style={{ flex:1 }} />
              <button onClick={searchGeo}
                style={{ background:'#2dd4a7', border:'none', borderRadius:8, width:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}>
                {geoLoading ? <span style={{ color:'#0d1117', fontSize:16, fontWeight:700 }}>…</span> : <I.search size={18} color="#0d1117" />}
              </button>
            </div>
            {geoResults.length > 0 && (
              <div style={{ marginTop:6, border:'1px solid #30363d', borderRadius:8, overflow:'hidden' }}>
                {geoResults.map((res, i) => (
                  <button key={i} onClick={() => pickLocation(res)}
                    className="wx-geo-result"
                    style={{ background: i % 2 === 0 ? '#1c2128' : '#161b22', borderBottom: i < geoResults.length - 1 ? '1px solid #30363d' : 'none' }}>
                    <span style={{ fontWeight:600 }}>{res.name}</span>
                    {res.admin1 && <span style={{ color:'#8b949e' }}>, {res.admin1}</span>}
                    {res.country_code && <span style={{ color:'#5a6a7a' }}> ({res.country_code})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {error && <div style={{ color:'#f85149', fontSize:13, marginTop:8 }}>{error}</div>}
      </div>

      {/* ── Loading spinner ── */}
      {loading && (
        <div style={{ textAlign:'center', padding:'32px 0', color:'#5a6a7a', fontSize:14 }}>{t(lang,'wxLoadingForecast')}</div>
      )}

      {/* ── Forecast content ── */}
      {!loading && wxData && (
        <div>

          {/* Summary banner */}
          <div style={{
            background: goodDays > 0 ? '#081e0e' : '#0d1117',
            border: '1px solid ' + (goodDays > 0 ? '#1a4a25' : '#21262d'),
            borderRadius:12, padding:'12px 16px', marginBottom:12,
            display:'flex', justifyContent:'space-between', alignItems:'center'
          }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color: goodDays > 0 ? '#3fb950' : '#5a6a7a' }}>
                {goodDays > 0
                  ? (lang==='fr' ? goodDays + (goodDays !== 1 ? ' jours de coulée' : ' jour de coulée') + ' à venir' : goodDays + ' run day' + (goodDays !== 1 ? 's' : '') + ' ahead')
                  : t(lang,'wxNoRunDays')}
              </div>
              <div style={{ fontSize:12, color:'#5a6a7a', marginTop:2 }}>
                {goodDays > 0
                  ? (lang==='fr' ? 'Meilleur score\u00a0: ' + bestScore + '/100 \u00b7 Appuyez pour les détails' : 'Best score: ' + bestScore + '/100 \u00b7 Tap a day for details')
                  : t(lang,'wxNoRunDaysHint')}
              </div>
            </div>
            <div style={{ fontSize:28 }}>{goodDays > 0 ? '\uD83C\uDF41' : '\u2744\uFE0F'}</div>
          </div>

          {/* 7-day score bar strip */}
          <div className="card" style={{ padding:'14px 12px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#5a6a7a', letterSpacing:'0.08em', marginBottom:12 }}>
              {t(lang,'wxSapForecast')}
            </div>
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
              {days.map((day, i) => (
                <button key={i} onClick={() => setSelDay(i)}
                  className="wx-score-col"
                  style={{
                    width: 'calc(' + Math.floor(100/days.length) + '% - 6px)',
                    background: selDay === i ? scoreBg(day.score) : 'transparent',
                    borderColor: selDay === i ? scoreColor(day.score) : '#21262d'
                  }}>
                  <span style={{ fontSize:11, fontWeight:700, color: selDay === i ? '#e6edf3' : '#8b949e' }}>
                    {day.dayLabel}
                  </span>
                  <div style={{ width:22, height:64, background:'#21262d', borderRadius:11, position:'relative', overflow:'hidden', margin:'2px 0' }}>
                    {day.score > 0 && (
                      <div style={{
                        position:'absolute', bottom:0, left:0, right:0,
                        height: day.score + '%',
                        background: scoreColor(day.score),
                        borderRadius:11
                      }} />
                    )}
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color: scoreColor(day.score) }}>
                    {day.score > 0 ? day.score : '\u2014'}
                  </span>
                  <span style={{ fontSize:10, color:'#f0883e', fontWeight:600 }}>{day.hiF}\u00b0</span>
                  <span style={{ fontSize:10, color:'#58a6ff' }}>{day.loF}\u00b0</span>
                </button>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 12px', marginTop:10, paddingTop:10, borderTop:'1px solid #21262d' }}>
              {[[`#3fb950`,t(lang,'scoreLeg80')],[`#7cc950`,t(lang,'scoreLeg62')],[`#d4a017`,t(lang,'scoreLeg44')],[`#3d5068`,t(lang,'scoreLegNo')]].map(([c, lbl]) => (
                <div key={lbl} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#8b949e' }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:c, flexShrink:0 }} />
                  {lbl}
                </div>
              ))}
            </div>
          </div>

          {/* Selected day detail */}
          {sel && (
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:17 }}>{sel.dayLabel} \u2014 {sel.dateLabel}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color: scoreColor(sel.score) }}>
                      {({'Excellent':t(lang,'qualExcellent'),'Good':t(lang,'qualGood'),'Fair':t(lang,'qualFair'),'Poor':t(lang,'qualPoor'),'No Flow':t(lang,'qualNoFlow')}[sel.quality]||sel.quality)} ({sel.score}/100)
                    </span>
                    {sel.buddyRisk && (
                      <span style={{ fontSize:11, color:'#f0883e', fontWeight:700, background:'rgba(240,136,62,0.12)', border:'1px solid rgba(240,136,62,0.3)', borderRadius:8, padding:'2px 8px' }}>
                        {t(lang,'wxBuddyRiskBadge')}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'#f0883e', lineHeight:1.1 }}>{sel.hiF}\u00b0F</div>
                  <div style={{ fontSize:17, fontWeight:700, color:'#58a6ff' }}>{sel.loF}\u00b0F</div>
                </div>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:'#5a6a7a', letterSpacing:'0.08em', marginBottom:6 }}>{t(lang,'wxScoringFactors')}</div>
              {[
                { icon:'\u2744\uFE0F', label:t(lang,'wxNightFreeze'), val:sel.loF+'\u00b0F',
                  note: sel.loF >= 18 && sel.loF <= 28 ? t(lang,'wxIdealRange') : sel.loF < 18 ? t(lang,'wxVeryCold') : sel.loF < 32 ? t(lang,'wxLightFreeze') : t(lang,'wxNoFreeze') },
                { icon:'\u2600\uFE0F', label:t(lang,'wxDayThaw'),    val:sel.hiF+'\u00b0F',
                  note: sel.hiF >= 40 && sel.hiF < 46 ? t(lang,'wxIdealRange') : sel.hiF >= 50 ? t(lang,'wxBuddyRunRisk') : sel.hiF >= 33 ? t(lang,'wxMarginalThaw') : t(lang,'wxNoThaw') },
                { icon:'\uD83D\uDCCA', label:t(lang,'wxDtSwing'), val:(sel.hiF-sel.loF)+'\u00b0F',
                  note: (sel.hiF-sel.loF) >= 25 ? t(lang,'wxExcellent') : (sel.hiF-sel.loF) >= 18 ? t(lang,'wxGood') : t(lang,'wxLimited') },
                { icon:'\uD83D\uDCA8', label:t(lang,'wxWind'),       val:sel.windMph+' mph',
                  note: sel.windMph <= 10 ? t(lang,'wxCalm') : sel.windMph <= 20 ? t(lang,'wxLightWind') : t(lang,'wxReducesFlow') },
                { icon:'\uD83C\uDF27', label:t(lang,'wxPrecip'),     val:sel.precipIn+'"',
                  note: sel.precipIn < 0.05 ? t(lang,'wxClearSky') : sel.precipIn < 0.2 ? t(lang,'wxLightRain') : t(lang,'wxHeavyRain') },
                { icon:'\uD83C\uDF24', label:t(lang,'wxSunshine'),   val:((sel.sunSec||0)/3600).toFixed(1)+'h',
                  note: (sel.sunSec||0)/3600 >= 7 ? t(lang,'wxSunny') : (sel.sunSec||0)/3600 >= 4 ? t(lang,'wxPartlySunny') : t(lang,'wxOvercast') }
              ].map(row => (
                <div key={row.label} className="wx-factor-row">
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>{row.icon}</span>
                    <span style={{ fontSize:13, color:'#8b949e' }}>{row.label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#e6edf3' }}>{row.val}</span>
                    <span style={{ fontSize:11, color:'#5a6a7a', minWidth:80, textAlign:'right' }}>{row.note}</span>
                  </div>
                </div>
              ))}
              {sel.buddyRisk && (
                <div style={{ marginTop:12, background:'rgba(240,136,62,0.08)', border:'1px solid rgba(240,136,62,0.2)', borderRadius:8, padding:'9px 12px', fontSize:12, color:'#f0883e', lineHeight:1.5 }}>
                  <strong>\u26A0 Buddy Run:</strong> High temps above 50\u00b0F can trigger bud break, turning sap bitter and ending the season. Taste your sap and watch the trees closely.
                </div>
              )}
              <div style={{ marginTop:10, fontSize:11, color:'#3d5068', lineHeight:1.6 }}>
                Model based on Acer saccharum physiology (Cornell/UVM Proctor research). Factors: freeze depth, thaw quality, \u0394T swing, sunshine, wind, precipitation, run streak. Individual sugarbush conditions vary.
              </div>
            </div>
          )}

          {/* Freeze / Thaw 7-day list */}
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:12, fontWeight:600, letterSpacing:'0.08em', color:'#5a6a7a', marginBottom:12 }}>
              <I.snowflake size={14} color="#58a6ff" /> {t(lang,'ftTitle')} <I.sun size={14} color="#e0a44a" />
            </div>
            {days.map((day, i) => {
              const ideal      = day.hiF >= 40 && day.loF <= 28;
              const freezeThaw = !ideal && day.hiF >= 32 && day.loF < 32;
              const tooWarm    = day.hiF > 50 && day.loF > 32;
              const allFreeze  = day.hiF < 32;
              let badge = null;
              if      (ideal)      badge = <span style={{ background:'rgba(63,185,80,0.15)', color:'#3fb950', fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:12, border:'1px solid rgba(63,185,80,0.25)' }}>{t(lang,'badgeIdeal')}</span>;
              else if (freezeThaw) badge = <span className="good-badge">{t(lang,'badgeFreezeThaw')}</span>;
              else if (tooWarm)    badge = <span style={{ background:'rgba(240,136,62,0.13)', color:'#f0883e', fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:12, border:'1px solid rgba(240,136,62,0.22)' }}>{t(lang,'badgeTooWarm')}</span>;
              else if (allFreeze)  badge = <span className="freeze-badge">{t(lang,'badgeAllFreeze')}</span>;
              return (
                <div key={day.date} className="weather-day" style={{ borderLeft: ideal?'3px solid #3fb950':tooWarm?'3px solid #f0883e':'3px solid transparent' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{day.dayLabel}</div>
                    <div style={{ color:'#5a6a7a', fontSize:12 }}>{day.dateLabel}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ color:'#f0883e', fontWeight:600 }}>{day.hiF}\u00b0</span>
                    <span style={{ color:'#5a6a7a', fontSize:13 }}>/</span>
                    <span style={{ color:'#58a6ff', fontWeight:600 }}>{day.loF}\u00b0</span>
                    {badge}
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize:12, color:'#3d5068', marginTop:8, textAlign:'center' }}>
              {t(lang,'ftLegend')}
            </div>
          </div>

        </div>
      )}

      {/* ── Breakeven Calculator ── */}
      <BreakevenCalculator trees={trees} units={units} />

      {/* ── Empty state ── */}
      {!loading && !wxData && (
        <div className="card" style={{ textAlign:'center', padding:'28px 14px' }}>
          <div style={{ fontSize:42, marginBottom:12 }}>🌡️</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{t(lang,'wxEmptyTitle')}</div>
          <div style={{ color:'#5a6a7a', fontSize:13, lineHeight:1.7, marginBottom:16 }}>
            SweetRun pulls the 7-day forecast from Open-Meteo and scores each day for sap flow potential based on freeze-thaw cycles, temperature swing, sunshine, wind, and precipitation.
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {[
              ['\u2744\uFE0F','Ideal freeze: 18\u201328\u00b0F'],
              ['\u2600\uFE0F','Ideal thaw: 40\u201346\u00b0F'],
              ['\uD83D\uDCCA','\u0394T swing \u2265 25\u00b0F = excellent'],
              ['\uD83D\uDCA8','High wind reduces flow']
            ].map(([ic, tx]) => (
              <div key={tx} style={{ background:'#161b22', border:'1px solid #21262d', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#8b949e', display:'flex', alignItems:'center', gap:6 }}>
                {ic} {tx}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── SUGARSAGE KNOWLEDGE BASE + AI ────────────────────────────────────────────

const SS_KB = [
  // ── BIOLOGY & SAP FLOW ──────────────────────────────────────────────────────
  { id:'bio_01', cat:'biology',
    q:'Why does maple sap flow in spring?',
    kw:['sap flow','spring','freeze thaw','pressure','why sap flows','when does sap flow'],
    a:`Maple sap flow is driven by a unique stem pressure mechanism tied to freeze-thaw cycles. When temperatures drop below freezing at night, gas in wood fibers dissolves into the cooling xylem fluid and CO₂ is absorbed by living ray cells — creating negative pressure (tension) that draws water from the soil into the tree. When daytime temperatures rise above freezing, that dissolved CO₂ re-expands, building positive pressure (up to 30 psi in a healthy tree) that pushes sap outward through any tap hole. Sugar maples (Acer saccharum) are unique in generating this pressure; most other hardwoods rely on root pressure alone, which is far weaker. The result is a gravity-defying flow that can yield 1–2 gallons per tap on an ideal run day.`,
    src:'Tyree & Zimmermann, Xylem Structure and Function (2002); UVM Proctor Maple Research Center, Tech Report 2019',
    tip:'Runs stop when either daytime highs stay below freezing (no thaw) or nights stay above freezing (no recharge). The sweet spot is 20–24°F nights and 40–45°F days.' },

  { id:'bio_02', cat:'biology',
    q:'How is sugar stored in a maple tree, and how does it affect sap sugar content?',
    kw:['sucrose','starch','sugar storage','brix','sap sweetness','sugar content'],
    a:`In late summer and fall, sugar maples convert photosynthate to starch and store it in ray parenchyma cells throughout the wood. During the winter thaw cycle, amylase enzymes convert that starch back to sucrose, which dissolves into sap water. The tree's stored starch reserve — built during the previous growing season — is the primary determinant of sap sugar concentration. A tree that lost canopy to disease or had a poor growing season will have lower starch reserves and thinner sap (often <1.5°Brix). Average commercial sap runs 2–2.5°Brix; exceptional taps on well-sited trees can reach 3–4°Brix.`,
    src:'Perkins & van den Berg, "Maple Syrup — Sucrose Composition and Tree Physiology," Cornell Sugar Maple Research (2016)',
    tip:'Fertilizing around the drip line with a balanced 10-10-10 in early fall can modestly improve starch reserves the following season.' },

  { id:'bio_03', cat:'biology',
    q:'What is the ideal age and size of a maple tree for tapping?',
    kw:['tree size','tapping age','diameter','when to tap','tree health','minimum size'],
    a:`The standard guideline is a minimum trunk diameter of 10 inches (25 cm) measured at breast height (DBH, ~4.5 ft off the ground). A tree that size is typically 40+ years old. At 10–17 in DBH, one tap is appropriate. At 18–24 in, two taps. Above 25 in, three taps maximum — though modern low-wound research supports staying at two taps even on large trees to maximize long-term health. Over-tapping creates excessive wound wood (walling-off tissue), reducing future tap yield and potentially shortening the tree's productive lifespan.`,
    src:'Cornell Maple Program, "Maple Tapping Guidelines" (2021); Vermont Agency of Agriculture Best Management Practices',
    tip:'Never tap a tree showing crown dieback, heavy lichen growth, or prior heavy tap-hole clustering — these signal stress that tapping will worsen.' },

  { id:'bio_04', cat:'biology',
    q:'How does vacuum affect sap yield at the cellular level?',
    kw:['vacuum','yield','sap flow','cellular','how vacuum works','suction'],
    a:`Under gravity, sap exits a tap hole only when internal stem pressure exceeds atmospheric pressure (~14.7 psi). Vacuum tapping reverses this by creating a pressure differential: applied vacuum (typically 15–27 in Hg) reduces the pressure at the tap hole outlet below atmospheric, allowing sap to flow even when stem pressure is neutral or slightly negative. Research shows that each additional inch of vacuum above ~15 in Hg yields roughly 1.5–2% more sap per tap, up to a practical ceiling around 26–27 in Hg. Beyond that, diminishing returns occur and lateral tube freeze-ups become more frequent at high vacuum on marginal-temperature days.`,
    src:'UVM Proctor Maple Research Center, "Vacuum and Sap Yield" (2018); Perkins et al., NJAS Wageningen Journal (2019)',
    tip:'Leak management matters more than adding pump capacity. A system losing 5 in Hg to leaks will never hit 25 in Hg regardless of pump size.' },

  { id:'bio_05', cat:'biology',
    q:'Why does sap turn buddy (buddy sap) near the end of the season, and can it still be used?',
    kw:['buddy sap','end of season','off flavor','buds','sap quality','maple buddy'],
    a:`As temperatures consistently warm in late season, maple trees break dormancy and begin activating their buds. During this process, microorganisms in the sap increase rapidly, and the tree's own metabolism shifts — producing compounds like tyrosine-derived amino acids that degrade into phenolic compounds during evaporation. The result is a distinctly unpleasant, bitter, "buddy" flavor that cannot be removed by filtration or any processing method. Buddy sap is not dangerous, but the resulting syrup is commercially and culinary unacceptable. The best field test: foam the sap vigorously and smell it — a faint grassy or barnyard note is an early warning sign. Once detectable in taste, that run should be discarded.`,
    src:'Perkins, T.D., "Sap Quality and Season Termination," UVM Proctor (2014); Quebec IRDA Maple Research Bulletin No. 7',
    tip:'Watch bud swell, not calendar date. On a warm spring, buddy sap can arrive 2–3 weeks earlier than your historical average.' },

  // ── TAPPING TECHNIQUE ───────────────────────────────────────────────────────
  { id:'tap_01', cat:'tapping',
    q:'What is the correct tap hole diameter, depth, and placement?',
    kw:['tap hole','drill','spout size','tapping depth','where to tap','placement','5/16'],
    a:`The industry has largely moved from 7/16 in to 5/16 in spouts (sometimes called "health spouts"). Research from UVM Proctor shows that 5/16 in tap holes produce only marginally less sap than 7/16 in holes on vacuum systems, while generating dramatically less wound wood — roughly 30% less discolored sapwood per tap. Optimal depth is 1.5–2 in into sound white wood (stop before heartwood). Placement: select a fresh spot 4–6 in horizontally and 12–18 in vertically from any prior tap hole scar. On high-vacuum systems (>20 in Hg), many operations now use 19/64 in or specialized check-valve spouts that further reduce wound wood.`,
    src:'UVM Proctor Maple Research Center, "Spout Size and Tree Wound Response" (2017); Cornell Maple Program Best Practices',
    tip:'Drill slightly upward (~5° angle) so that sap drains naturally by gravity even before full vacuum builds.' },

  { id:'tap_02', cat:'tapping',
    q:'When should I tap — date vs. weather cues?',
    kw:['when to tap','tapping date','timing','late tap','early tap','optimal timing'],
    a:`Date-based tapping is less reliable than weather-based. The goal is to tap as close as possible to the first freeze-thaw cycle that will produce sap flow — but not so early that tap holes desiccate and dry out before the season begins. In the northeastern US, this typically means 4–6 weeks before the expected first run (late January to mid-February in Zone 5, late February to early March in colder zones). Check-valve spouts reduce the desiccation risk, allowing tapping 2–3 weeks earlier with minimal sap quality penalty. Never tap into frozen wood — wait until daytime temperatures reach at least 34–36°F so the outer sapwood is thawed and you're drilling into active tissue.`,
    src:'Cornell Maple Program, "Optimizing Tap Timing" (2020); Vermont Maple Industry Council Producers Guide',
    tip:'A test tap on a south-facing tree 2 weeks before your planned tapping date is the best real-world predictor of season start.' },

  { id:'tap_03', cat:'tapping',
    q:'How many taps can I safely put on a tree without harming it?',
    kw:['tap number','how many taps','over-tapping','tree stress','taps per tree'],
    a:`UVM and Cornell research consistently recommends: 1 tap for 10–17 in DBH; 2 taps for 18–24 in DBH; and a maximum of 3 taps for trees above 25 in — though current best practice suggests staying at 2 taps even for very large trees. Studies show that beyond 2 taps, incremental sap gain is small (often <15%) while the cumulative wound wood area increases substantially. On high-vacuum tubing systems, the original "2-tap threshold" should be lowered: the elevated yield per tap on vacuum means 1 tap per tree is often more profitable and healthier long-term.`,
    src:'Perkins et al., "Tapping Intensity and Long-Term Tree Health," Forest Ecology and Management (2018)',
    tip:'Track tap hole location on a simple tree map. Efficient vertical and horizontal spacing adds up to measurable yield gains over a 20-year rotation.' },

  { id:'tap_04', cat:'tapping',
    q:'What causes dry or slow-flowing taps, and how do I fix it?',
    kw:['dry tap','slow tap','no sap','tap not flowing','stuck tap','low flow'],
    a:`The most common causes of dry or underperforming taps: (1) Tap hole dried out — the inner wood surface exposed by drilling desiccates within days if temperatures don't support sap flow. Remedy: retap 1 in beside or below the old hole. (2) Vacuum leak at the spout — a loose spout or cracked drop line kills flow. Check-valve spouts mitigate this. (3) Tapping into wounded wood — drilling into a prior-year scar or stained heartwood yields little sap. (4) Tree stress — a declining tree has lower stem pressure and starch reserves. (5) Late-season sap check — once the tree fully leafs out, sap sugar drops and flow becomes erratic.`,
    src:'Cornell Maple Program Field Diagnostics Guide (2019)',
    tip:'On a vacuum system, any tap that shows consistently lower vacuum than neighbors (5+ in Hg difference) is either leaking or in compromised wood.' },

  // ── VACUUM & TUBING ─────────────────────────────────────────────────────────
  { id:'vac_01', cat:'vacuum',
    q:'What vacuum level should I target, and how do I measure it?',
    kw:['vacuum level','target vacuum','inches hg','vacuum gauge','how much vacuum'],
    a:`Most commercial operations target 25–27 in Hg at the pump, with the goal of maintaining 22–25 in Hg at the bush lateral lines. Each inch of Hg of vacuum above gravity corresponds to roughly 1.5–2% additional sap yield per tap, making vacuum one of the highest-ROI investments in maple production. Vacuum is measured with a Dwyer magnehelic gauge or a liquid manometer; digital vacuum gauges are increasingly common and allow remote monitoring. The key measurement is at the end of long lateral runs, not at the pump — pump vacuum tells you what you're generating, lateral vacuum tells you what trees actually experience.`,
    src:'UVM Proctor Maple Research Center, "Vacuum System Management" (2020)',
    tip:'Install a vacuum gauge at the furthest point in your system. If you see >3 in Hg drop from pump to that point, prioritize leak hunting before adding more pump capacity.' },

  { id:'vac_02', cat:'vacuum',
    q:'How do I find and fix vacuum leaks?',
    kw:['vacuum leak','leak detection','leak hunting','hissing','low vacuum','fix leaks'],
    a:`Vacuum leaks are the #1 yield killer in tubing systems. Systematic leak detection: (1) Isolate sections — close off mainline valves one lateral at a time and watch the vacuum gauge. A section that jumps 3+ in Hg when isolated has a significant leak. (2) Walk the lines on a quiet morning — hissing is audible from 10–15 ft in calm conditions. (3) Use a smoke generator or soap solution on fittings. (4) Inspect drop lines first — freeze-crack, woodpecker damage, and UV brittleness cluster on drop lines. (5) Check all union fittings, tees, and saddle connections — these fail more than straight tubing. After repairs, verify vacuum recovery before moving to the next section.`,
    src:'Cornell Maple Program, "Vacuum Tubing System Troubleshooting" (2021)',
    tip:'A systematic spring leak walk before tapping — not mid-season — saves the most sap. Fix leaks when the lines are empty and you can see clearly.' },

  { id:'vac_03', cat:'vacuum',
    q:'What size vacuum pump do I need for my operation?',
    kw:['pump size','vacuum pump','cfm','how big a pump','pump capacity','pump selection'],
    a:`Pump sizing is based on CFM (cubic feet per minute) of air removal capacity, not horsepower alone. The rule of thumb is 1 CFM per 100 taps at 25 in Hg, but this assumes a tight (low-leak) system. A leaky system can demand 3–5x that CFM. For a new installation: start with 1.5 CFM/100 taps to give yourself margin. Oil-sealed rotary vane pumps are the industry standard for reliability and high vacuum; liquid ring pumps are common in large operations. For <500 taps, a 1–1.5 HP oil rotary vane pump (e.g., Gast, Welch) is adequate. Variable-speed drives (VFDs) on larger pumps allow vacuum modulation to match weather conditions — worth the investment above 2,000 taps.`,
    src:'UVM Extension, "Vacuum Pump Selection for Maple Operations" (2019)',
    tip:'Always size up one model rather than running a pump at its rated limit — pump longevity doubles when run at 70–80% capacity.' },

  { id:'vac_04', cat:'vacuum',
    q:'How does temperature affect vacuum performance and sap yield on vacuum?',
    kw:['vacuum temperature','cold weather vacuum','vacuum sap yield','marginal run day'],
    a:`Cold temperatures thicken the sap and increase viscosity, reducing flow rates through small-diameter tubing even at the same vacuum. Below about 30°F ambient, sap may freeze in lateral lines before reaching the mainline — this is especially common in 3/16 in laterals on north-facing slopes. Conversely, on days when temperatures stay above freezing all night, stem pressure cannot recharge and vacuum has little to pull. The optimal vacuum benefit is on days when temperatures cross the freezing threshold twice (classic freeze-thaw). On purely warm days with no freezing, vacuum provides minimal additional yield over gravity.`,
    src:'UVM Proctor, "Temperature Effects on Vacuum Tubing Performance" (2017)',
    tip:'Consider installing a vacuum controller (e.g., Sap Sucker Automation) that modulates pump speed to reduce freeze-up risk on near-freezing nights.' },

  // ── REVERSE OSMOSIS ─────────────────────────────────────────────────────────
  { id:'ro_01', cat:'ro',
    q:'How does reverse osmosis work for maple sap concentration?',
    kw:['reverse osmosis','ro','how ro works','concentration','membrane','osmosis'],
    a:`Reverse osmosis (RO) forces sap at high pressure (typically 150–300 psi) through semi-permeable membranes that block sucrose molecules while allowing water to pass. The result is two streams: permeate (nearly pure water, removed from the process) and concentrate (sap with elevated sugar content). A standard single-pass RO can take 2°Brix sap to 8–10°Brix; a double-pass can reach 14–18°Brix. Because evaporating water is by far the largest energy cost in maple production (it takes ~1 lb of wood or fuel to evaporate roughly 1 lb of water), pre-concentrating sap with RO dramatically reduces boiling time and fuel use. Modern high-efficiency RO membranes can remove 60–75% of the water from raw sap in a single pass.`,
    src:'Perkins & van den Berg, "Reverse Osmosis in Maple Syrup Production," Vermont Maple Bulletin (2018)',
    tip:'RO membranes are sensitive to bacterial biofilm. Sanitize thoroughly with a citric acid wash after every use and store membranes in a food-grade preservative solution (bisulfite) between seasons.' },

  { id:'ro_02', cat:'ro',
    q:'What concentration level should I target with my RO before boiling?',
    kw:['ro concentration','target brix','ro brix','how concentrated','double pass','ro output'],
    a:`The sweet spot for concentrate Brix depends on your evaporator and goals. Most operations target 8–12°Brix for single-pass systems. Going above 16°Brix risks sucrose crystallization in the RO circuit and concentrate tanks, especially in cold ambient conditions. For flavor quality, there is ongoing debate: some producers and researchers argue that over-concentrating (>16°Brix) can slightly depress flavor development during the Maillard reactions in the evaporator; others find no detectable difference through 18°Brix. The consensus from UVM sensory studies is that up to 14–16°Brix, flavor impact is minimal. Beyond 18°Brix, very fast boils at high Brix can mute some volatile aromatics.`,
    src:'UVM Proctor, "RO Concentration Levels and Syrup Flavor" (2019); IMSI Technical Bulletin No. 4',
    tip:'If your raw sap runs >2.5°Brix naturally (lucky tree site!), a single-pass RO to 8–10°Brix may give you a better Maillard reaction profile than pushing to 14+°Brix.' },

  { id:'ro_03', cat:'ro',
    q:'How do I maintain RO membranes and prevent fouling?',
    kw:['ro membrane','fouling','clean ro','membrane maintenance','sanitize ro','ro care'],
    a:`RO membrane longevity is almost entirely maintenance-dependent. Critical practices: (1) Flush with clean cold water immediately after each use — never let concentrate sap sit in membranes. (2) Perform a citric acid clean (0.5% solution, 30-min recirculation) at least weekly during heavy production periods. (3) Sanitize with sodium metabisulfite or food-grade chloramine solution for storage between runs. (4) End-of-season: flush with RO permeate, do a final citric acid clean, then store wet in a bisulfite preservative (0.5% sodium metabisulfite) at 35–40°F. Never allow membranes to freeze. (5) Monitor permeate flow rate — a >15% drop from baseline indicates fouling that requires a caustic clean (sodium hydroxide 0.1% solution, food grade).`,
    src:'DOW Water Solutions, "Filmtec Membrane Maintenance Manual"; Cornell Maple Program RO Maintenance Guide (2020)',
    tip:'Keep a logbook of permeate flow rate, feed pressure, and temperature at each use. Gradual fouling is invisible without trending data.' },

  { id:'ro_04', cat:'ro',
    q:'What is the payback period for a small-farm RO system?',
    kw:['ro cost','ro payback','return on investment','ro worth it','buy ro','small ro'],
    a:`For a 500–2,000 tap operation, a quality single-pass RO system (e.g., CDL, Leader, H2O Innovation) typically costs $8,000–$18,000 installed. The payback calculation hinges on your current fuel cost per gallon of syrup. If you're burning $80/cord of wood and your evaporator uses ~0.8 cords per gallon of syrup without RO, that's $64/gallon in fuel alone. A good RO at 8°Brix concentrate cuts boiling water by ~70%, reducing fuel cost to ~$19/gallon — a $45/gallon saving. At 500 gallons/season, that's $22,500/year in fuel savings, yielding a payback of under one season for most mid-scale operations. Labor savings from reduced boiling time typically add another 20–30% to the effective ROI.`,
    src:'Cornell Maple Program, "Economic Analysis of RO Systems" (2021)',
    tip:'Don\'t overlook the "phantom RO" benefit: with less boiling time, your evaporator pans accumulate niter (mineral deposits) more slowly, reducing cleaning labor significantly.' },

  // ── EVAPORATION ─────────────────────────────────────────────────────────────
  { id:'evap_01', cat:'evaporation',
    q:'What is a standard evaporation rate and how do I improve mine?',
    kw:['evaporation rate','gallons per hour','evaporator efficiency','boil rate','slow evaporator'],
    a:`Standard evaporation rates for arch-fired flat-pan evaporators run 10–15 gal/hr per square foot of pan surface area — so a 2×6 ft evaporator (12 sq ft) should theoretically produce 120–180 gal/hr water evaporation. In practice, most operations see 40–70% of theoretical due to firebox efficiency, pan fouling, and sap feed rate management. Key improvements: (1) Preheat incoming sap — adding a condensate preheater above the stack can raise incoming sap from 40°F to 160°F, reducing the energy cost of bringing sap to boil. (2) Keep pans clean — niter (calcium compounds) insulates pan surfaces and can reduce heat transfer by 15–30%. (3) Optimize air-fuel ratio — clean, hot fire with good draft outperforms a smothered, slow fire every time. (4) Use a steamaway or hood to capture latent heat. (5) Ensure pan depth is correct: syrup pan 2–3 in, sap pan 4–6 in.`,
    src:'IMSI Evaporator Operations Guide (2020); UVM Extension, "Improving Evaporator Efficiency" (2018)',
    tip:'A quick test: if your stack exhaust is dark brown or black smoke, you have incomplete combustion — you\'re wasting 20–30% of your fuel energy as soot.' },

  { id:'evap_02', cat:'evaporation',
    q:'How do I properly finish syrup to correct density?',
    kw:['finishing','density','hydrometer','syrup density','66.9 brix','proper density','thermometer finish'],
    a:`Maple syrup must be packed at 66–68.9°Brix (66°Brix is the USDA/Canadian regulatory minimum for "maple syrup"). Below 66°Brix, syrup is under-density and will ferment in the container. Above 68.9°Brix, it will crystallize (sugar sand / niter formation is accelerated, and sucrose crystallization can occur in the jar). Measurement methods: (1) Hydrometer: read at 211°F (water boils at ~212°F at sea level; syrup finishes at 219°F at sea level, adjusting for altitude). (2) Refractometer: read Brix at room temperature — far more practical for small-batch finishing. (3) Temperature method: syrup finishes at exactly 7.1°F above the current water boiling point (measure water boiling that same day — it varies with elevation and barometric pressure).`,
    src:'Vermont Agency of Agriculture, "Maple Syrup Density Standards" (2022); IMSI Technical Bulletin No. 2',
    tip:'Always use the temperature method as a double-check alongside a refractometer. Refractometers can drift with temperature and calibration. A $15 digital instant-read thermometer pays for itself the first time you avoid a under-density pack.' },

  { id:'evap_03', cat:'evaporation',
    q:'What causes niter (sugar sand) and how do I reduce it?',
    kw:['niter','sugar sand','grit','sediment','cloudy syrup','niter filter','calcium'],
    a:`Niter (also called sugar sand or bloom) is primarily calcium malate and calcium phosphate precipitated from sap during evaporation. All maple syrup contains some niter; the goal is to remove it before packing. Formation is influenced by: (1) Sap mineral content — varies by soil geology, soil pH, and season timing. Early-season sap typically has lower mineral content. (2) Boiling temperature and time — prolonged high-heat boiling at the finishing stage precipitates more niter. (3) pH — slightly acidic sap (pH 6.0–6.5) forms less niter than alkaline sap. Reduction strategies: hot-pack filter through orlon felt filters immediately after finishing while syrup is above 180°F. Cold-filtering is ineffective. Replace filters frequently — niter-saturated filters restrict flow and can introduce off-flavors.`,
    src:'Perkins & van den Berg, "Niter Formation in Maple Syrup" (2015); Cornell Maple Program Finishing Guide',
    tip:'If your syrup consistently has heavy niter, test your sap pH. A pH above 7.0 is unusual and may indicate contamination. Ideal sap pH is 6.5–7.0.' },

  { id:'evap_04', cat:'evaporation',
    q:'What wood species is best for firing an arch evaporator?',
    kw:['firewood','best wood','cord wood','wood species','btu','hardwood','softwood evaporator'],
    a:`Hardwoods with high BTU content and low moisture are the gold standard: sugar maple, yellow birch, beech, red oak, and ash all deliver 23–27 million BTU/cord (air-dried). Softwoods (pine, spruce, fir) deliver only 15–19 million BTU/cord and burn faster with more creosote buildup. The critical variable is moisture content — "seasoned" wood (≤20% moisture content) burns 40–50% more efficiently than green wood (40–60% moisture). A moisture meter (cheap, $20–40) is one of the best investments for firewood management. Split smaller (3–4 in diameter) for faster, hotter burns in an evaporator arch compared to fireplace-sized logs.`,
    src:'USFS Forest Products Lab, "Wood as Fuel" (2020); IMSI Fuel Guide',
    tip:'Weigh your wood at the start of a season and track gallons of syrup produced. This gives you a real $/gallon fuel cost that beats any estimate.' },

  { id:'evap_05', cat:'evaporation',
    q:'What is a steam-away preheater and is it worth adding?',
    kw:['preheater','steam away','condensate','heat recovery','preheater value','energy savings'],
    a:`A condensate preheater (commonly called a steam-away or stack preheater) recycles the thermal energy from steam rising off the evaporator pans to preheat incoming cold sap before it enters the back pan. Without a preheater, incoming sap at 34–40°F must be heated to boiling (~212°F) entirely by firebox energy. A well-designed preheater can deliver incoming sap at 150–180°F, reducing the firebox load for that thermal lift by 60–70%. In practice, most operators report 10–20% reduction in fuel use. Stack preheaters (using exhaust gas heat) can supplement this further. Cost: $800–$2,500 installed depending on evaporator size. Payback at $80/cord and 200 cords/season is typically 1–2 seasons.`,
    src:'UVM Extension, "Evaporator Heat Recovery Systems" (2019); IMSI Technical Bulletin No. 8',
    tip:'Measure inlet sap temperature before and after installing a preheater for one season. Real-world data will confirm (or disprove) your specific efficiency gain.' },

  // ── FINISHING & GRADING ─────────────────────────────────────────────────────
  { id:'fin_01', cat:'finishing',
    q:'How does the new USDA/Canadian maple syrup grading system work?',
    kw:['grading','grade a','grade b','amber','dark','golden','color class','light transmittance'],
    a:`Since 2015, both the USDA and Canada adopted a unified grading system based on light transmittance measured in percent light transmission (%Tc) through a 10mm sample at 560 nm wavelength: Grade A Golden Color / Delicate Taste: >75%Tc. Grade A Amber Color / Rich Taste: 44–74.9%Tc. Grade A Dark Color / Robust Taste: 25–43.9%Tc. Grade A Very Dark / Strong Taste: <25%Tc. All syrup sold to consumers must be Grade A. Syrup below Grade A density standards or with off-flavors is Grade B (processing/commercial grade). In practice, Golden syrup is rare and commands a premium; Amber is the most widely sold; Dark and Very Dark are popular for cooking and with consumers who prefer strong maple flavor.`,
    src:'USDA Agricultural Marketing Service, "United States Standards for Grades of Maple Syrup" (2015); Agriculture and Agri-Food Canada Maple Syrup Standards',
    tip:'Color is primarily determined by season timing: early-season sap produces lighter (Golden/Amber) syrup; late-season produces darker (Dark/Very Dark) syrup. Temperature during boiling also affects color.' },

  { id:'fin_02', cat:'finishing',
    q:'What causes off-flavors in maple syrup and how do I prevent them?',
    kw:['off flavor','bad syrup','sour syrup','buddy','fermented','metallic','plastic taste','off flavors'],
    a:`Common off-flavors and their causes: (1) Sour / fermented: sap held too long or too warm before processing — bacteria (Pseudomonas, Enterobacter spp.) consume sucrose and produce lactic/acetic acid. Process within 24 hours of collection in warm weather. (2) Buddy: late-season sap from trees beginning to bud — unmistakable bitter phenolic taste. No fix; discard. (3) Metallic: zinc or iron contamination from galvanized or old steel equipment. Use only food-grade stainless, food-safe poly, or aluminum. (4) Caramelized / burned: overheating in the syrup pan or finishing pan — keep syrup moving and finish at correct temperature. (5) Plastic / solvent: contaminated tubing or fittings — replace with food-grade poly or NSF-certified materials. (6) Smoky: incomplete combustion or smoke infiltrating the pan — check stack draft and firebox seals.`,
    src:'Cornell Maple Program, "Maple Syrup Flavor Defects and Solutions" (2020)',
    tip:'Do a fresh taste test on each batch before packing. Trust your palate — experienced tasters detect off-notes at concentrations too low for any instrument.' },

  { id:'fin_03', cat:'finishing',
    q:'What is the best way to pack and store maple syrup?',
    kw:['packing','hot pack','storage','shelf life','jars','containers','syrup storage'],
    a:`Hot-pack at 180–185°F (82–85°C) minimum into clean, sterilized containers (glass or food-grade HDPE) and seal immediately. The heat kills any residual bacteria and creates a vacuum seal as the syrup cools. Syrup properly packed this way is shelf-stable for 4+ years unopened. Once opened, refrigerate and use within 1–2 years; freeze for longer storage. Containers: glass is ideal for retail quality and flavor neutrality; HDPE jugs are durable and lighter for bulk. Never pack in reclaimed containers not designed for food use. For bulk drums (30 or 55 gal), hot-pack at 185°F, bung immediately, and flip upside-down for 5 minutes to sterilize the headspace.`,
    src:'Vermont Agency of Agriculture, "Maple Syrup Packing Standards" (2022); NSF/ANSI 61 Food Safety Standard',
    tip:'Glass containers lose their vacuum seal if packed under 180°F. Use a digital thermometer in the syrup — surface temperature lags by 3–5°F.' },

  // ── WEATHER & SEASON FORECASTING ────────────────────────────────────────────
  { id:'wea_01', cat:'weather',
    q:'What weather conditions produce the best maple sap runs?',
    kw:['run day','weather','forecast','best runs','ideal conditions','freeze thaw','sap run weather'],
    a:`The classic "run day" requires: nights below freezing (ideally 20–28°F) followed by days above freezing (ideally 38–45°F) with moderate sun. These conditions allow stem pressure to recharge overnight (freeze phase dissolves CO₂, builds tension) and discharge during the warm day. The best runs often follow a sunny day after a cold night, with light winds (strong wind cools trees and suppresses pressure buildup). Extended cloudy periods with temperatures oscillating near 32°F produce erratic, low-volume runs. Snow cover on the ground is beneficial — it insulates the root zone and moderates soil temperature swings. Late-season runs after sustained warm nights produce shorter, lower-sugar flows.`,
    src:'UVM Proctor Maple Research Center, "Weather and Sap Flow" (2016); NRCC Northeast Climate Center, Maple Season Analysis',
    tip:'A 7-day forecast showing at least 3 nights below 26°F and 3 days above 38°F is your best predictor of a productive week. Watch for the pattern, not individual days.' },

  { id:'wea_02', cat:'weather',
    q:'How is climate change affecting maple syrup production?',
    kw:['climate change','warming','season length','shorter season','maple future','climate'],
    a:`Long-term data from UVM Proctor and USDA show maple sap seasons in the northeastern US and Canada have shifted 7–10 days earlier since the 1970s, and season length has shortened by an average of 8–10 days over the same period. Higher minimum winter temperatures reduce the frequency of deep-freeze recharge nights that prime the pressure system. In some years, the entire January–February recharge period is truncated. Northward range shift of optimal climate conditions is occurring: Vermont and Quebec currently have among the most favorable climates, but models project that by 2080, only the northern portions of these regions and areas farther north (Ontario, New Brunswick) will have reliable freeze-thaw seasons. Producers at southern margins (Pennsylvania, Ohio, New York south) are already experiencing shorter, less reliable seasons.`,
    src:'Rapp et al., "Phenological shifts in northeastern maple production," International Journal of Biometeorology (2019); USDA Forest Service, "Vulnerability of Maple to Climate Change" (2018)',
    tip:'Consider planting diversity: red maple (Acer rubrum) is more cold-tolerant and stress-resistant than sugar maple, and while sap sugar is lower, red maple may outlast sugar maple at marginal sites as climate shifts.' },

  { id:'wea_03', cat:'weather',
    q:'What is the impact of a late freeze on already-tapped trees?',
    kw:['late freeze','freeze after tapping','cold snap','post-tap freeze','refreeze'],
    a:`A hard freeze after tapping (below ~20°F) affects sap flow but does not harm the tree. Sap in the lateral lines and drop lines may freeze, temporarily halting flow or causing line pressure buildup. On gravity systems, frozen lines simply don't flow until they thaw. On vacuum systems, ice plugs can displace liquid and sometimes cause check-valve spouts to unseat — inspect spouts after a hard freeze. For the tree itself, refreezing after the tap hole has been drilled causes no additional damage. The tap wound's biological response (callus formation) is purely temperature-driven and pauses in the cold. Prolonged freezes in March can actually improve late-season sap quality by inhibiting microbial growth in the collection system.`,
    src:'Cornell Maple Program, "Cold Weather Impacts on Tapped Trees" (2018)',
    tip:'After a hard freeze with tubing systems, do a quick walkthrough to check for ice plugs at low points in main lines — these create pressure differentials that stress fittings.' },

  // ── TREE HEALTH & FOREST MANAGEMENT ────────────────────────────────────────
  { id:'tree_01', cat:'tree_health',
    q:'What is maple decline, and what causes it?',
    kw:['maple decline','dieback','crown dieback','dying maple','tree decline','forest health'],
    a:`Maple decline is a syndrome of gradual crown dieback and reduced vigor observed in sugar maples, particularly in the northeastern US and eastern Canada. Causes are multifactorial: (1) Acid deposition (acid rain) depletes base cations (calcium, magnesium) from soil, stressing trees through nutrient deficiency. (2) Defoliation by insects (forest tent caterpillar, gypsy moth) reduces carbon reserves. (3) Drought stress, particularly in summer, limits starch accumulation. (4) Repeated over-tapping. (5) Frost damage in late spring after bud break. Affected trees show: crown transparency, dead branches in upper crown, smaller-than-normal leaves, and off-color foliage in late summer. Declined trees yield less sap, lower Brix, and are more susceptible to opportunistic pathogens.`,
    src:'Long et al., "Sugar Maple Decline in the Northeastern United States," USDA Forest Service Gen. Tech. Report NE-261 (1997); ongoing monitoring by Harvard Forest',
    tip:'Calcium application (limestone or wollastonite) to declining woodlots can measurably improve tree health and sap yield over a 5–10 year period. UVM\'s Hubbard Brook research showed 10–15% sap yield improvement after wollastonite treatment.' },

  { id:'tree_02', cat:'tree_health',
    q:'Should I fertilize my maple trees, and if so, how?',
    kw:['fertilize maple','fertilizer','calcium','soil pH','maple nutrition','lime','wollastonite'],
    a:`Direct fertilization of tapped sugar maples is not standard practice and can have unintended effects — excess nitrogen stimulates competing vegetation. However, lime or calcium application to acidified soils is well-supported by research as beneficial. Target soil pH of 5.0–6.0 (slightly acidic) — below 4.5, nutrient availability drops sharply and fine root mortality increases. Wollastonite (calcium silicate) is preferred over agricultural lime in research settings because it releases calcium slowly and doesn't raise pH as rapidly. Application rate: 2–4 tons/acre wollastonite for severely acidic sites, surface-broadcast. The effect is gradual — expect measurable tree response over 5–10 years. Avoid applying directly over tap root zones.`,
    src:'Juice et al., "Long-term response of sugar maple to calcium addition at Hubbard Brook," Ecosystems (2006)',
    tip:'Get a soil test before any amendment. Cornell Cooperative Extension or UVM Extension can advise on maple-specific soil management for your specific region.' },

  { id:'tree_03', cat:'tree_health',
    q:'What pests and diseases most threaten maple sugar orchards?',
    kw:['pests','disease','insects','gypsy moth','tent caterpillar','maple threat','invasive','fungal'],
    a:`Key threats to maple sugar bushes: (1) Forest Tent Caterpillar (Malacosoma disstria): cyclical outbreaks defoliate maples in June; 3+ consecutive defoliation years can kill weakened trees. (2) Spongy Moth (Lymantria dispar): expanding its range northward; maples are a secondary host but can be heavily defoliated in outbreak years. (3) Asian Longhorned Beetle (Anoplophora glabripennis): regulated pest in NY and MA; kills maples; report suspected sightings immediately. (4) Armillaria root rot: opportunistic decay fungus that colonizes stressed trees; no cure, manage by maintaining tree vigor. (5) Eutypella canker: fungal canker on sugar maple stems, identifiable by elliptical target-shaped dead bark areas. Not fatal alone but creates structural weakness. (6) Drought: increasing drought frequency is the emerging threat that amplifies all other stressors.`,
    src:'USDA Forest Service, "Common Insects and Diseases of Sugar Maple" (2019); Cornell University Maple IPM Guide',
    tip:'An annual walk-through in late summer, when stress symptoms are most visible, catches problems when management options are still available.' },

  // ── BUSINESS & ECONOMICS ────────────────────────────────────────────────────
  { id:'biz_01', cat:'business',
    q:'What is the typical yield of maple syrup per tap?',
    kw:['yield per tap','production','gallons per tap','how much syrup','tap yield','average yield'],
    a:`Industry averages: gravity tapping yields 0.1–0.25 gallons of syrup per tap per season. Vacuum tapping (20–26 in Hg) yields 0.3–0.6 gallons per tap. Exceptional high-vacuum operations in optimal conditions report up to 0.7–0.8 gal/tap. The conversion ratio from sap to syrup depends on Brix: the classic ratio is 86.4 ÷ sap°Brix = gallons of sap per gallon of syrup (e.g., 2°Brix sap: 86.4÷2 = 43.2 gal sap/gal syrup). At 2°Brix, 0.4 gal/tap translates to roughly 17 gallons of sap collected per tap per season — a reasonable benchmark for a good vacuum system. Track your own ratio: sap collected ÷ syrup made each season tells you your actual effective Brix.`,
    src:'IMSI, "Production Benchmarks for Maple Operations" (2021); Vermont Maple Industry Council Annual Statistics',
    tip:'Your yield per tap is the single most useful efficiency metric. Set a benchmark at the start of each season and compare year-over-year to catch equipment or forest health issues early.' },

  { id:'biz_02', cat:'business',
    q:'What does maple syrup sell for, and what pricing strategy makes sense?',
    kw:['maple syrup price','selling price','retail price','bulk price','pricing','value','direct sales'],
    a:`Pricing varies significantly by channel: Bulk/wholesale (drums to processors): $1.00–$1.40/lb ($28–$40 per gallon equivalent), highly commoditized and subject to Quebec board pricing. Direct-to-consumer retail (farm stand, farmers market, online): $10–$16 per 8 oz, or $60–$90/gallon — representing 2–3x the bulk price. Specialty/premium (single-source, organic certified, specialty grades like Golden): up to $20+ per 8 oz retail. The economics of maple production strongly favor direct sales — shifting even 20% of volume from bulk to direct retail can increase total revenue by 50%. Value-added products (maple cream, candy, sugar, infused syrups) command even higher margins per pound of maple sugar solids.`,
    src:'Cornell Maple Program, "Maple Syrup Marketing and Pricing" (2022); Vermont Agency of Agriculture Market Report (2023)',
    tip:'Calculate your true cost per gallon before setting prices. Most small operations underestimate labor. Include your time at a real market wage — you may find bulk pricing generates a loss.' },

  { id:'biz_03', cat:'business',
    q:'What certifications can I get for my maple syrup and are they worth it?',
    kw:['organic certification','certified organic','usda organic','certifications','label','maple certification'],
    a:`Key certifications available to maple producers: (1) USDA Organic: requires certified organic land management (no synthetic pesticides/herbicides for 3 years, buffer zones, compliant equipment). Premiums vary: 15–30% over conventional at direct retail; not always achievable in bulk markets. Application through an accredited certifying agency ($500–$2,000/year). (2) Kosher: relatively easy to obtain for maple syrup (it is naturally kosher); opens institutional and specialty retail markets. (3) Non-GMO Project Verified: meaningful for some retailers. (4) Vermont Seal of Quality / other state programs: low cost, useful for direct market differentiation. Worth it? Organic certification pencils out primarily if selling >60% direct-to-consumer at premium prices or supplying natural food distributors. For bulk operations, the cost rarely pays back.`,
    src:'USDA AMS National Organic Program; Cornell Maple Program, "Value-Added and Certification Guide" (2021)',
    tip:'Before pursuing organic certification, survey your direct sales customers — many consumers can\'t distinguish certified organic from traditional maple production and won\'t pay a premium for the label.' },

  // ── TROUBLESHOOTING ──────────────────────────────────────────────────────────
  { id:'trb_01', cat:'troubleshooting',
    q:'Why is my sap yield low this year compared to last year?',
    kw:['low yield','bad year','less sap','sap down','poor production','why less sap'],
    a:`Year-over-year yield variation of 20–40% is normal in maple production. Key diagnostic factors: (1) Weather: insufficient freeze-thaw cycles, too-warm nights, or drought the previous summer reducing starch reserves. (2) Tap hole placement: tapping into old scars or wounded wood significantly reduces flow per tap. (3) Vacuum system leaks: a system that maintained 22 in Hg last year may be at 17 in Hg this year due to accumulated fittings failures. (4) Tree health changes: crown dieback from a hard winter or summer drought. (5) Season length: was your season structurally shorter this year (fewer run days)? Segment your analysis — sap per run-day comparison removes weather variability and isolates equipment/tree issues.`,
    src:'Cornell Maple Program, "Diagnosing Production Variation" (2019)',
    tip:'Compare "sap gallons per run day" not just total season sap. This normalizes for weather and makes year-over-year equipment and management comparisons valid.' },

  { id:'trb_02', cat:'troubleshooting',
    q:'My syrup is cloudy even after filtering. What is wrong?',
    kw:['cloudy syrup','hazy syrup','turbid','filter','clarity','why cloudy syrup'],
    a:`Persistent cloudiness after filtering has several causes: (1) Filtering while too cool — niter filters only when syrup is above 180°F. Cold syrup allows small niter particles to pass through orlon felt. Always filter hot and replace filters when flow slows. (2) Pectin haze: gel-like cloudiness from high-pectin late-season sap. More common in buddy season sap; not fixable by filtration. (3) Yeast / microbial haze: occurs when syrup is packed below 180°F or in a contaminated container. These syrups may also ferment. (4) Mineral haze from very high-mineral sap: more filtering passes through denser filter pads may help. (5) Under-density syrup: syrup packed below 66°Brix will develop haze and eventually ferment. Check density every batch.`,
    src:'Cornell Maple Program, "Syrup Clarity and Filtration" (2020)',
    tip:'Use a filter press with pressure if volume justifies it. Gravity orlon filtration is adequate for small batches but requires careful hot-pack management.' },

  { id:'trb_03', cat:'troubleshooting',
    q:'My evaporator is boiling slower than it used to. What should I check?',
    kw:['slow boil','slow evaporator','evaporator efficiency','boil rate down','sluggish evaporator'],
    a:`Declining evaporator performance is almost always one of four things: (1) Niter buildup on pan surfaces — even 1/16 in of calcium scale dramatically reduces heat transfer. Annual muriatic acid cleaning of sap and syrup pans is essential. (2) Firebox/arch refractory deterioration — cracked firebrick or failed arch seals allow cold air infiltration, cooling the firebox and reducing flame intensity. Inspect and repair with refractory cement before season. (3) Wet/green firewood — moisture content above 25% steals enormous energy as steam before combustion heat is released. (4) Stack draft issues — blocked stack cap, creosote buildup, or downdraft from nearby trees. Check draft by holding a smoke source at the firebox door.`,
    src:'IMSI, "Evaporator Maintenance and Performance" (2019)',
    tip:'Keep a running average of gallons evaporated per cord of wood (or BTU per gallon). A 15%+ drop from baseline is your trigger to diagnose before the next season.' },

  { id:'trb_04', cat:'troubleshooting',
    q:'My vacuum is lower than expected at the lines. How do I systematically find the problem?',
    kw:['low vacuum','vacuum troubleshooting','vacuum drop','vacuum system','debug vacuum'],
    a:`Systematic vacuum troubleshooting: (1) Start at the pump — record vacuum at pump discharge. If it matches spec, proceed. If pump vacuum is low, check pump oil, belt tension, inlet filter, and pump temperature. (2) Isolate mainline sections — close ball valves one lateral at a time while watching the central vacuum gauge. A section that shows 2+ in Hg gain when isolated has a significant leak. (3) Walk the isolated section — listen for hissing, look for disconnected lines, check all tee and saddle connections, inspect check-valve spouts for cracks. (4) Inspect low points — sap or ice accumulation at low points blocks vacuum transmission. Verify release points are clear. (5) Measure vacuum at the end of each lateral with a portable gauge — document drop from mainline to lateral end for every run in a new system.`,
    src:'UVM Proctor Maple Research Center, "Vacuum System Troubleshooting Flowchart" (2021)',
    tip:'Create a vacuum map of your system — note the gauge reading at 5–6 key points every season. This is your baseline for detecting year-over-year changes before they become major losses.' },

  { id:'trb_05', cat:'troubleshooting',
    q:'Why does my sap ferment in the collection tank before I can boil it?',
    kw:['fermented sap','sour sap','sap fermentation','bacteria','warm weather sap','spoiled sap'],
    a:`Sap fermentation is caused by naturally present bacteria (primarily Leuconostoc and Pseudomonas species) that consume sucrose and produce lactic acid. Fermentation rate doubles roughly every 10°F of temperature increase above 32°F. Prevention: (1) Collect sap daily when ambient temperatures exceed 40°F. (2) Store sap cold — maintain collection tank temperature below 38°F. Shading the collection tank and using ice packs extends safe hold time. (3) Keep collection equipment scrupulously clean — biofilm in tanks and lines dramatically accelerates fermentation. (4) Process promptly — "fresh" is relative: at 34°F, sap stays clean for 3–4 days; at 50°F, 12–24 hours. (5) Check sap pH — normal fresh sap pH is 6.5–7.0; below 6.0 indicates significant bacterial activity.`,
    src:'Perkins, T.D., "Sap Microbiology and Fermentation Prevention," UVM Proctor (2013)',
    tip:'A refractometer doubles as a freshness test — compare Brix at collection vs. at the evaporator. A drop of >0.2°Brix indicates significant bacterial sucrose consumption.' },

  // ── LINES & COLLECTION SYSTEMS ──────────────────────────────────────────────
  { id:'lin_01', cat:'lines',
    q:'What tubing sizes should I use for my tubing system?',
    kw:['tubing size','3/16','5/16','mainline','lateral','drop line','tubing layout','line sizing'],
    a:`The standard maple tubing hierarchy: Drop lines (from spout to lateral): 5/16 in ID tubing, 6–24 in length. Lateral lines (tree to tree): 5/16 in or 3/16 in. The 3/16 in lateral creates higher internal vacuum from sap column weight but has less flow capacity — best for slopes of 10%+ where gravity assist adds to vacuum. 5/16 in laterals work better on flatter terrain. Sub-mainlines (lateral to mainline): 3/4 in or 1 in tubing. Mainlines (to collection tank): 1.5 in, 2 in, or 3 in depending on tap count. Rough rule: 1 in mainline handles up to ~500 taps; 1.5 in up to ~1,200 taps; 2 in up to ~3,000 taps. Oversizing mainlines reduces velocity, allowing sap to stagnate and warm — go with the minimum that doesn't restrict flow.`,
    src:'Cornell Maple Program, "Tubing System Design Guide" (2021)',
    tip:'Never mix 3/16 in and 5/16 in laterals on the same vacuum circuit without accounting for the differential pressure — 3/16 in lines generate higher column vacuum that can backflow into 5/16 in laterals.' },

  { id:'lin_02', cat:'lines',
    q:'How do I sanitize my tubing system at the end of the season?',
    kw:['sanitize lines','clean tubing','end of season lines','chemical clean','tubing sanitation'],
    a:`End-of-season tubing sanitation is critical for preventing microbial biofilm that would contaminate next season's sap. Standard protocol: (1) Hot water flush — push 140°F+ water through the entire system within 48 hours of pulling taps. This softens and flushes biofilm. (2) Peroxyacetic acid (PAA) treatment: circulate 200 ppm PAA solution through lines for 30 minutes. PAA is food-safe, breaks down to water and oxygen, and is more effective than bleach on biofilm. (3) Rinse with clean cold water. (4) Blow out with compressed air to prevent standing water (bacterial growth medium). Never use chlorine bleach above 100 ppm — it degrades polyethylene tubing rapidly, releasing flavor-contaminating breakdown products. Replace any sections showing UV brittleness, cracking, or persistent off-odor.`,
    src:'Cornell Maple Program, "Tubing Sanitation Protocols" (2020); NSF food safety guidelines for polyethylene tubing',
    tip:'On a small system (<200 taps), individual soaking of spouts and fittings in PAA solution is practical. On larger systems, a recirculating chemical pump on the mainline saves hours of labor.' },

  // ── ADDITIONAL ADVANCED TOPICS ───────────────────────────────────────────────
  { id:'adv_01', cat:'biology',
    q:'What is the relationship between sap Brix and syrup yield?',
    kw:['brix formula','sap to syrup','conversion ratio','jones rule','66 brix','yield calculation'],
    a:`The standard calculation for sap-to-syrup conversion is derived from the "Rule of 86" (sometimes called Jones' Rule): Gallons of sap needed per gallon of syrup = 86.4 ÷ Brix of raw sap. This assumes a final syrup density of 66°Brix. Example: 2.0°Brix sap → 86.4 ÷ 2.0 = 43.2 gal sap/gal syrup. At 2.5°Brix → 34.6 gal/gallon. At 3.0°Brix → 28.8 gal/gallon. The variation is enormous and has a direct impact on boiling time and fuel costs. This is why measuring sap Brix accurately and daily is one of the most valuable habits in maple production — it directly predicts your fuel and labor requirements for that run.`,
    src:'Jones, C.E., "A Simple Formula for Determining the Amount of Sap Required to Make a Given Amount of Maple Syrup," VT Agr. Exp. Sta. Bulletin 13 (1946); still in standard use',
    tip:'On a vacuum system, Brix can vary significantly between taps — low-performing taps often have lower Brix as well, dragging down your average. Testing individual taps during diagnostics can reveal high-value vs. low-value tap zones.' },

  { id:'adv_02', cat:'evaporation',
    q:'What is the Maillard reaction in maple syrup and how does it affect flavor?',
    kw:['maillard','flavor development','browning','color','maple flavor chemistry','taste','aroma'],
    a:`The characteristic flavor and color of maple syrup are largely products of Maillard reactions — non-enzymatic browning reactions between reducing sugars (primarily fructose and glucose, minor sucrose hydrolysis products) and amino acids during evaporation at high temperatures. These reactions produce hundreds of flavor compounds including furans, pyrazines, and volatile phenolics responsible for maple's caramel, vanilla, and woody notes. Higher boiling temperatures and longer evaporation times intensify these reactions, producing darker, more robustly flavored syrup. Early-season sap (cold, fresh, lower amino acid content) undergoes fewer Maillard reactions, yielding lighter, more delicate Golden/Amber syrup. Late-season sap is richer in amino acids and produces more Maillard products, hence the darker, stronger Very Dark grade.`,
    src:'Filion et al., "Flavor Compounds in Maple Syrup," Journal of Agricultural and Food Chemistry (2019)',
    tip:'If you want to produce premium Golden syrup, boil fresh early-season sap quickly at controlled temperature and pack immediately. Prolonged boiling or reheating amplifies Maillard browning.' },

  { id:'adv_03', cat:'ro',
    q:'Can RO concentrate be held overnight before boiling?',
    kw:['store concentrate','ro concentrate overnight','hold ro concentrate','delay boiling','ro storage'],
    a:`RO concentrate is significantly more susceptible to microbial spoilage than raw sap because bacterial populations grow proportionally with sugar concentration — the bacteria have more food available per volume. At 8°Brix concentrate, fermentation can begin meaningfully within 12–18 hours at 40°F. The safe storage guidelines: process RO concentrate the same day whenever possible. If you must hold overnight, keep concentrate at 34–36°F (just above freezing) and never exceed 24 hours before boiling. Never hold concentrate above 40°F. Some producers use a food-grade acid wash (citric acid to pH 6.0) for short-term holds, though this must be fully boiled off — follow your state's regulations. Airtight covered tanks reduce surface oxidation and microbial contamination from airborne sources.`,
    src:'UVM Proctor, "RO Concentrate Handling and Food Safety" (2020)',
    tip:'Taste test your concentrate before every boil. Off-flavor in concentrate means off-flavor in syrup — no amount of filtration will remove bacterial metabolites once formed.' },

  { id:'adv_04', cat:'finishing',
    q:'What is maple cream and how is it made?',
    kw:['maple cream','maple butter','spread','crystallization','how to make cream','maple products'],
    a:`Maple cream (also called maple butter) is made by controlled crystallization of maple syrup into a smooth, spreadable paste with fine crystal structure. Process: (1) Start with a light Amber or Golden syrup (darker grades produce acceptable cream but with stronger flavor). (2) Cook to 22–24°F above the local water boiling point (about 234°F at sea level) — this concentrates syrup to ~69–71°Brix. (3) Cool rapidly (ice bath) without stirring to ~65°F. (4) Stir vigorously (by hand or stand mixer) until the syrup "turns" — it will change from glossy to opaque and thicken dramatically. Stir until a smooth, spreadable consistency is achieved (~15–30 minutes). (5) Pack into clean containers; store refrigerated. Shelf life: 6–12 months refrigerated, 1–2 years frozen.`,
    src:'Cornell Maple Program, "Value-Added Maple Products: Cream, Candy, Sugar" (2019)',
    tip:'The exact temperature target for cream is critical — 2°F too high produces dry, crumbly cream; 2°F too low produces grainy or liquid cream. Use a calibrated digital thermometer.' },

  { id:'adv_05', cat:'tapping',
    q:'What are check-valve spouts and should I switch to them?',
    kw:['check valve','spout','check valve spout','flush spout','modern spout','spout type'],
    a:`Check-valve spouts (e.g., CDL Extreme, Leader EZ Tap, Health Check spout) contain a small one-way valve that opens when vacuum pulls sap but closes when vacuum drops (e.g., at night, during freezing). Benefits: (1) Prevents backflow of ambient air into the tap hole, dramatically reducing tap hole desiccation and bacterial intrusion. (2) Allows earlier tapping (2–3 weeks) with minimal quality impact since the check valve protects the tap hole between runs. (3) Reduces niter and sap contamination from reverse flow events. (4) Can add 5–10% more sap per tap in research comparisons versus standard spouts, primarily from reduced desiccation. Cost: check-valve spouts cost $0.50–$1.00 more per unit than standard spouts but pay back quickly in yield and quality improvements. Suitable for all vacuum levels.`,
    src:'UVM Proctor Maple Research Center, "Check Valve Spout Evaluation" (2018)',
    tip:'If switching to check-valve spouts, ensure your vacuum pump can achieve consistent vacuum — check valves open only above a threshold vacuum, so a leaky system below that threshold gets no benefit.' },

  { id:'adv_06', cat:'vacuum',
    q:'What is the difference between a releaser and a vacuum collection tank?',
    kw:['releaser','vacuum releaser','collection tank','sap releaser','vacuum vs gravity','releaser vs tank'],
    a:`A releaser is a device that automatically breaks vacuum momentarily to discharge collected sap from the vacuum tubing system into an atmospheric collection tank, then reseals to restore vacuum. This allows vacuum lines to drain continuously without flooding the system. Types: (1) Mechanical float releaser: a float-actuated valve that opens when sap reaches a set level — passive, reliable, requires maintenance. (2) Electronic releaser: timed or sensor-controlled solenoid valve — more controllable but requires power. (3) Vacuum collection tank (direct-to-tank): the mainline ends directly into a sealed tank that itself maintains vacuum, with a pump transferring sap to an atmospheric holding tank. This "closed" system avoids the vacuum break of a traditional releaser, maintaining higher average vacuum at the taps. Most modern large operations use vacuum collection tanks for highest yield.`,
    src:'Cornell Maple Program, "Collection System Design: Releasers vs. Vacuum Tanks" (2021)',
    tip:'If using a mechanical releaser, inspect the float valve gasket at the start of every season — a worn gasket allows perpetual air bleed that will cost you 3–5 in Hg across the entire system.' },

  { id:'adv_07', cat:'weather',
    q:'How does barometric pressure affect sap runs?',
    kw:['barometric pressure','pressure drop','weather front','barometer','sap run predictor'],
    a:`Barometric pressure has a documented but modest effect on sap flow. Falling barometric pressure (approaching weather fronts) corresponds to reduced atmospheric pressure, which slightly reduces the pressure differential needed for sap to exit the tap hole — potentially increasing flow during the early phase of a pressure drop. Rising pressure after a cold front can briefly enhance flow as freeze conditions intensify. However, temperature dominates over pressure in most studies. The practical take: a falling barometer combined with the correct temperature pattern (cold night, warm day approaching) is a positive indicator for an upcoming run. A rising barometer following a warm spell may signal the end of a run as cold air returns.`,
    src:'Tyree, M.T., "Stem Pressure and Weather Effects on Sap Flow," Tree Physiology (1995); UVM field data compilation',
    tip:'Some experienced producers use a simple barometer (aneroid or digital) alongside temperature forecasting. Combined, they provide a more complete picture than temperature alone.' },

  { id:'adv_08', cat:'business',
    q:'What production records should I keep for a maple operation?',
    kw:['record keeping','logs','production records','track','data','accounting','maple records'],
    a:`Recommended records for a well-managed maple operation: (1) Daily: sap collected (gallons), sap Brix, syrup produced (gallons), syrup grade/color class, fuel used (cords or gallons), labor hours, and ambient temperature high/low. (2) Seasonal: tap count, tapping date, first run date, last run date, vacuum levels at key points, total sap collected, total syrup produced, total fuel used, RO permeate/concentrate volumes. (3) Financial: revenue by channel (bulk, direct, value-added), fuel cost/gallon of syrup, labor cost/gallon, packaging cost, total cost/gallon. (4) Tree health: annual crown assessment, tap hole spacing records, new tap locations. This data enables year-over-year benchmarking, tax reporting, food safety documentation, and operational improvement.`,
    src:'Vermont Agency of Agriculture, "Good Agricultural Practices for Maple Operations" (2022); Cornell Maple Program Record-Keeping Templates',
    tip:'Even a simple spreadsheet tracking daily sap and syrup production, with season totals, pays dividends. Within 3 seasons you\'ll have enough data to spot trends invisible in a single year.' },

  { id:'adv_09', cat:'tree_health',
    q:'How do I regenerate a maple sugar bush that has become overstocked or declined?',
    kw:['sugarbush management','regeneration','thinning','overstocked','forest management','logging','silviculture'],
    a:`A well-managed sugar bush maintains 60–80% crown closure, with healthy, well-spaced trees. In overstocked stands, trees compete for light and water, resulting in smaller crowns, lower starch reserves, and reduced sap yield per tree. Management approaches: (1) Improvement thinning: remove competing species (beech, ironwood, poplar) and crowded, low-quality maples to release crop trees. Target final spacing of 15–20 ft between canopy trees. (2) Release crop trees: a tree with a full, symmetrical crown produces 2–3x the sap of a suppressed tree of the same DBH. (3) Encourage regeneration: modest canopy gaps (0.25–0.5 acres) encourage maple seedling establishment in the understory. (4) Control invasives: beech scale disease, buckthorn, and barberry competition all reduce maple regeneration success.`,
    src:'USDA Forest Service, "Silvicultural Guide for Sugar Maple" (2013); Quebec IRDA Sugarbush Management Bulletin',
    tip:'Engage a licensed forester before any timber harvest in your sugarbush. Improper logging (heavy equipment, soil compaction, slash handling) is a leading cause of long-term sugarbush decline.' },

  { id:'adv_10', cat:'evaporation',
    q:'What is a divided flow evaporator and how does it improve efficiency?',
    kw:['divided flow','drop flue','flue pan','divided pan','evaporator design','leader','CDL evaporator'],
    a:`A divided-flow (or "drop flue") evaporator pan design routes incoming raw sap in a longer, back-and-forth flow path across the hottest parts of the firebox, maximizing heat exposure time before reaching the syrup pan. In a flat-pan design, fresh sap enters the back pan and is continuously displaced toward the syrup pan by new incoming sap. In a divided-flow design, internal baffles and flue channels create a long serpentine flow path, increasing residence time in the heat zone by 40–60% compared to an open flat pan of the same size. This improves evaporation rate per BTU and produces more consistent syrup density. Combined with a syrup pan with cross-flow channels, a well-designed divided-flow evaporator can achieve 20–35% higher efficiency than an equivalent flat-pan setup.`,
    src:'IMSI, "Evaporator Design and Efficiency" (2020); CDL / Leader Evaporator technical guides',
    tip:'If purchasing or upgrading an evaporator, request evaporation rate data from the manufacturer at your firebox depth and wood species — spec sheet numbers assume ideal conditions that rarely exist in the field.' },

  { id:'adv_11', cat:'finishing',
    q:'How do I test and adjust the density of my syrup accurately in the field?',
    kw:['density test','hydrometer','refractometer','brix check','syrup density field','calibrate'],
    a:`Three methods for field density testing: (1) Hydrometers: a maple syrup hydrometer (reads 59°–67° Baumé or 56–67° Brix) is the traditional tool. Read at 211°F for the most accurate result — the scale is calibrated for this temperature. If reading at a different temperature, apply a correction factor (+0.5°Brix per 10°F below 211°F, -0.5 per 10°F above). (2) Refractometer: digital or optical, reads at room temperature. Highly practical for finished syrup; check calibration against distilled water (0°Brix) at least seasonally. Temperature compensation is essential for accurate readings. (3) Thermometer method: measure the current boiling point of water, then finish syrup at exactly 7.1°F above that point (e.g., if water boils at 210°F, finish syrup at 217.1°F). This method is independent of any instrument calibration and is extremely reliable.`,
    src:'Vermont Agency of Agriculture, "Maple Density Testing Methods" (2022)',
    tip:'On humid days, water boils at a slightly lower temperature. Always measure water boiling point the same day you\'re finishing syrup — don\'t rely on a boiling point table from last week.' },

  { id:'adv_12', cat:'ro',
    q:'What membrane type and configuration is best for small farm RO systems?',
    kw:['ro membrane type','spiral wound','plate frame','small ro','membrane selection','ro configuration'],
    a:`For small farm maple RO systems (100–2,000 taps), spiral-wound polyamide thin-film composite (TFC) membranes are the standard. These are the same membrane technology used in municipal RO and food processing. Key specs for maple applications: (1) Rejection rate: >99% sucrose rejection — commercial food-grade membranes easily meet this. (2) Operating pressure: 150–250 psi for single-pass to 8–10°Brix; double-pass to 16°Brix requires 250–350 psi. (3) Membrane size: 2.5×40 in membranes (common in small farm systems) handle roughly 200–500 gal/hr of raw sap. 4×40 in handles 700–1,500 gal/hr. (4) System configuration: most small-farm commercial units (Leader, CDL, H2O Innovation) come pre-configured in stainless housings with pressure gauges and flow controls — buying a complete system is strongly preferred over DIY for food safety compliance.`,
    src:'DOW Water Solutions Filmtec Product Guide; H2O Innovation Maple RO Technical Specifications',
    tip:'Always buy membranes from reputable maple equipment suppliers — membranes marketed for water treatment may lack NSF 61 food-safety certification required by most state maple programs.' },

  { id:'adv_13', cat:'biology',
    q:'How does red maple compare to sugar maple for syrup production?',
    kw:['red maple','acer rubrum','sugar maple vs red maple','red maple sap','alternative maple'],
    a:`Red maple (Acer rubrum) can be tapped for syrup, but differs from sugar maple (Acer saccharum) in important ways. Sap sugar content: red maple averages 1.5–2.0°Brix vs. 2.0–2.5°Brix for sugar maple — producing proportionally more sap to make a gallon of syrup. Season timing: red maple buds break 1–3 weeks earlier than sugar maple, ending the productive sap season sooner. Flavor: red maple syrup is considered by many to have a lighter, slightly different flavor profile — quality varies considerably by tree. Yield: research shows red maple sap volume per tap is comparable to sugar maple, but lower Brix means 25–35% more sap to process. Opportunity: red maple's greater climate tolerance makes it increasingly relevant as a backup or supplemental species in operations at the warm edge of the maple belt.`,
    src:'UVM Proctor Maple Research Center, "Red Maple for Syrup Production" (2017)',
    tip:'If you have a mixed sugarbush, consider tracking sap Brix from red vs. sugar maple taps separately for one season. The data will tell you whether red maple taps are worth the processing overhead.' },

  { id:'adv_14', cat:'tapping',
    q:'What is spout sanitization and why does it matter?',
    kw:['spout sanitation','clean spouts','sanitize spouts','spout bacteria','spout hygiene'],
    a:`Research from UVM Proctor demonstrates that new or properly sanitized spouts increase sap yield by 10–20% compared to used, unsanitized spouts. Biofilm that accumulates on spout surfaces from the previous season, combined with residual sap and exposed wood surface at the tap hole, creates a bacterial colony that colonizes the new tap wound immediately and reduces sap flow. Sanitization protocols: (1) Replace spouts annually (most cost-effective approach at $0.10–0.25/spout for standard plastic). (2) Alternatively, soak used spouts in 200 ppm peroxyacetic acid (PAA) solution for 30 minutes and rinse before installation. (3) Never reuse spouts that show visible discoloration, biofilm, or off-odor — these harbor resistant biofilm that PAA alone won't fully eliminate.`,
    src:'UVM Proctor Maple Research Center, "Spout Sanitation and Sap Yield" (2016)',
    tip:'The cost of replacing all spouts annually on a 500-tap system is roughly $50–$125. The yield benefit typically represents hundreds of dollars in additional syrup — arguably the best ROI of any single maintenance task.' },

  { id:'adv_15', cat:'weather',
    q:'What is "second-season" or "fall maple" tapping and is it worthwhile?',
    kw:['fall tapping','second season','autumn tapping','late season','fall sap','second run'],
    a:`"Fall tapping" or second-season tapping (September–November) exploits the same freeze-thaw pressure mechanism as spring, but in reverse seasonal context. In some years, particularly after early fall frosts followed by warm spells, sap does flow from fall taps. However, the practice is controversial: (1) Fall-tapped trees have significantly more wound wood and pathogen exposure going into winter, potentially reducing spring yield at the same wound site. (2) Sap quality in fall can be highly variable — often lower sugar content and higher microbial load. (3) Season length is unpredictable. (4) Most state extension programs do not recommend routine fall tapping for commercial operations. For research or curiosity, a test of 20–30 taps in a diverse section of the bush can be informative without meaningfully impacting the following spring.`,
    src:'Cornell Maple Program, "Fall Tapping: Risks and Rewards" (2018)',
    tip:'If you do try fall tapping, tap fresh sites — do not use spring tap holes, which are already in a healing state and should not be disturbed.' },
];

const SS_STOP = new Set(['the','and','is','it','a','an','of','to','in','for','on','with','are','was','be','or','at','by','from','that','this','but','not','have','has','can','will','do','does','how','what','why','when','where','should','would','my','i','we','you','your']);

function ssSearch(query, ctx) {
  const tokens = query.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !SS_STOP.has(w));
  if (!tokens.length) return [];
  return SS_KB.map(e => {
    const hay = `${e.q} ${e.kw.join(' ')} ${e.a}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      const matches = (hay.match(new RegExp(t,'g'))||[]).length;
      score += matches;
      if (e.q.toLowerCase().includes(t)) score += 4;
      if (e.kw.some(k => k.includes(t))) score += 3;
    }
    if (ctx) {
      if (ctx.hasRO && e.cat === 'ro') score += 1;
      if (ctx.hasVacuum && e.cat === 'vacuum') score += 1;
      if (ctx.trees > 0 && e.cat === 'business') score += 0.5;
    }
    return { ...e, score };
  }).filter(e => e.score > 0).sort((a,b) => b.score - a.score).slice(0, 5);
}

const SS_CATS = [
  { id:'all',          label:'All Topics',       icon:'🍁' },
  { id:'biology',      label:'Sap Biology',      icon:'🌳' },
  { id:'tapping',      label:'Tapping',          icon:'🔨' },
  { id:'vacuum',       label:'Vacuum & Tubing',  icon:'💨' },
  { id:'ro',           label:'Reverse Osmosis',  icon:'💧' },
  { id:'evaporation',  label:'Evaporation',      icon:'🔥' },
  { id:'finishing',    label:'Finishing & Grade', icon:'🏆' },
  { id:'weather',      label:'Weather & Climate', icon:'🌤️' },
  { id:'tree_health',  label:'Tree Health',      icon:'🌿' },
  { id:'business',     label:'Business & Econ',  icon:'📊' },
  { id:'lines',        label:'Lines & Collection',icon:'〰️' },
  { id:'troubleshooting',label:'Troubleshoot',   icon:'🔧' },
];

function SubScoreBar({ label, score, color }) {
  return (
    <div className="sage-fadein">
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
        <span style={{fontSize:10,color:'#5a6a7a',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</span>
        <span style={{fontSize:10,color,fontWeight:800}}>{score}%</span>
      </div>
      <div style={{height:5,background:'#1e2d3d',borderRadius:3,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${score}%`,background:color,borderRadius:3,boxShadow:`0 0 8px ${color}50`,transition:'width 0.8s ease'}} />
      </div>
    </div>
  );
}

function InsightRow({ ins }) {
  const [open, setOpen] = React.useState(false);
  const borderColor = ins.type==='success'?'#3fb950':ins.type==='warn'?'#f0883e':'#58a6ff';
  const icon = ins.type==='success'?'✓':ins.type==='warn'?'!':'→';
  return (
    <div className="sage-fadein" style={{borderLeft:`3px solid ${borderColor}`,background:'#07090f',borderRadius:'0 8px 8px 0',padding:'8px 12px',cursor:'pointer',transition:'background 0.15s'}}
      onClick={()=>setOpen(v=>!v)}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,fontWeight:900,color:borderColor,width:14,textAlign:'center',lineHeight:1}}>{icon}</span>
          <span style={{fontSize:13,fontWeight:600,color:'#c9d1d9'}}>{ins.title}</span>
        </div>
        <span style={{fontSize:10,color:'#3d5068',marginLeft:8}}>{open?'▲':'▼'}</span>
      </div>
      <div style={{fontSize:11,color:'#5a6a7a',marginTop:3,marginLeft:22,lineHeight:1.5}}>{ins.body}</div>
      {open && (
        <div style={{marginTop:8,marginLeft:22,background:'#0d1a2b',borderRadius:6,padding:'8px 10px',border:`1px solid ${borderColor}30`}}>
          <div style={{fontSize:10,color:borderColor,fontWeight:700,letterSpacing:'0.06em',marginBottom:3}}>WHAT TO DO</div>
          <div style={{fontSize:12,color:'#8b949e',lineHeight:1.6}}>{ins.action}</div>
        </div>
      )}
    </div>
  );
}

function BrixSparkline({ data }) {
  if (data.length < 2) return null;
  const min = Math.min(...data) * 0.85;
  const max = Math.max(...data) * 1.15;
  const H = 44, W = 260;
  const pts = data.map((v,i)=>{
    const x = (i/(data.length-1))*W;
    const y = H - ((v-min)/(max-min||1))*H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = data[data.length-1];
  const first = data[0];
  const trend = last > first+0.1 ? '↑' : last < first-0.1 ? '↓' : '→';
  const trendColor = trend==='↑'?'#f0883e':trend==='↓'?'#3fb950':'#58a6ff';
  const trendLabel = trend==='↑'?'Rising':'↓'===trend?'Falling':'Stable';
  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{flex:1}}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e2d3d"/>
            <stop offset="100%" stopColor="#58a6ff"/>
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="url(#sparkGrad)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {data.map((v,i)=>{
          const x=(i/(data.length-1))*W;
          const y=H-((v-min)/(max-min||1))*H;
          return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill="#58a6ff" stroke="#0d1a2b" strokeWidth="1.5"/>;
        })}
      </svg>
      <div style={{textAlign:'right',flexShrink:0,minWidth:52}}>
        <div style={{fontSize:22,fontWeight:900,color:trendColor,lineHeight:1}}>{trend}</div>
        <div style={{fontSize:11,fontWeight:700,color:trendColor}}>{trendLabel}</div>
        <div style={{fontSize:10,color:'#5a6a7a'}}>{last}° Brix</div>
      </div>
    </div>
  );
}

function SeasonIntelligence({ season, sapBrix, trees }) {
  const [analyzing, setAnalyzing] = React.useState(true);
  const [condHigh,  setCondHigh]  = React.useState('');
  const [condLow,   setCondLow]   = React.useState('');

  React.useEffect(()=>{
    const t = setTimeout(()=>setAnalyzing(false), 1100);
    return ()=>clearTimeout(t);
  },[season]);

  const slog     = ls.get('sg_logs2',{})[season]||{};
  const sapGal   = (slog.sapCollected||[]).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
  const syrupGal = (slog.syrupMade||[]).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
  const roGal    = (slog.sapRO||[]).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
  const fuelGal  = (slog.fuelUsed||[]).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
  const taps  = parseInt(trees)||0;
  const brix  = parseFloat(sapBrix)||2.0;
  const runLogs  = slog.sapCollected||[];
  const brixLog  = (ls.get('sg_brixlog',{})[season]||[]);
  const sparkData= brixLog.map(e=>parseFloat(e.val)||0).filter(v=>v>0).slice(-12);
  const dataPoints=[sapGal>0,syrupGal>0,taps>0,brixLog.length>2,fuelGal>0,roGal>0].filter(Boolean).length;
  const confidence= dataPoints<=1?'low':dataPoints<=3?'medium':'high';
  const confColor = confidence==='high'?'#3fb950':confidence==='medium'?'#f0883e':'#3d5068';

  if (taps===0&&sapGal===0) return (
    <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:16,padding:'20px 24px',marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:'#3d5068'}}/>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#3d5068'}}>SEASON INTELLIGENCE</span>
      </div>
      <div style={{textAlign:'center',padding:'20px 0'}}>
        <div style={{fontSize:36,marginBottom:10}}>🧠</div>
        <div style={{fontSize:14,fontWeight:600,color:'#8b949e'}}>Awaiting season data</div>
        <div style={{fontSize:12,color:'#3d5068',marginTop:4,lineHeight:1.6}}>Log taps, sap, and syrup in the Log tab<br/>to activate intelligence.</div>
      </div>
    </div>
  );

  if (analyzing) return (
    <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:16,padding:'20px 24px',marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <div className="sage-pulse" style={{width:8,height:8,borderRadius:'50%',background:'#3fb950'}}/>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#3fb950'}}>ANALYZING SEASON DATA…</span>
      </div>
      {[75,55,85,65].map((w,i)=>(
        <div key={i} style={{height:13,background:'#1e2d3d',borderRadius:6,marginBottom:9,overflow:'hidden'}}>
          <div className="shimmer-line" style={{height:'100%',width:`${w}%`,borderRadius:6}}/>
        </div>
      ))}
    </div>
  );

  // ── scores ──────────────────────────────────────────────────────────────────
  let yieldScore=null, effScore=null, fuelScore=null;
  const insights=[];

  if (taps>0&&syrupGal>0) {
    const ypp=syrupGal/taps;
    yieldScore=Math.min(100,Math.round((ypp/0.3)*100));
    if (ypp>=0.3)       insights.push({type:'success',title:'Strong yield per tap',       body:`${ypp.toFixed(2)} gal/tap — above the 0.25–0.3 industry benchmark. Excellent season.`,action:'Document your tap placement and vacuum settings — replicate this exact setup next year.'});
    else if (ypp>=0.2)  insights.push({type:'neutral',title:'Average yield per tap',       body:`${ypp.toFixed(2)} gal/tap — near industry average. Room to grow.`,                    action:'Upgrade to check-valve spouts and audit vacuum leaks at each lateral connection.'});
    else                insights.push({type:'warn',   title:'Below-average yield per tap', body:`${ypp.toFixed(2)} gal/tap is below the 0.25 benchmark.`,                              action:'Inspect spout health, verify tap placement in fresh white wood, and test vacuum at the tree.'});
  }
  if (sapGal>0&&syrupGal>0) {
    const ratio=sapGal/syrupGal;
    const theoretical=86.4/brix;
    const eff=Math.min(100,Math.round((theoretical/ratio)*100));
    effScore=eff;
    if (eff>=95)       insights.push({type:'success',title:'Excellent evaporation efficiency',  body:`${ratio.toFixed(0)}:1 ratio — ${eff}% of theoretical max for ${brix}°Brix sap.`,       action:'Document your evaporator setup — this is benchmark-quality operation.'});
    else if (eff>=80)  insights.push({type:'neutral',title:'Good evaporation efficiency',       body:`${ratio.toFixed(0)}:1 at ${eff}% of theoretical.`,                                      action:'Check float valve levels and flue pan draw-off. Small adjustments can recover 5–10%.'});
    else               insights.push({type:'warn',   title:'Evaporation efficiency concern',    body:`${ratio.toFixed(0)}:1 is ${100-eff}% below theoretical for ${brix}°Brix sap.`,          action:'Check flue pan flow rate, evaporator level, and finisher draw-off timing.'});
  }
  if (fuelGal>0&&syrupGal>0) {
    const fr=fuelGal/syrupGal;
    fuelScore=Math.min(100,Math.round((1.0/fr)*100));
    if (fr<0.8)   insights.push({type:'success',title:'Fuel-efficient operation',  body:`${fr.toFixed(2)} gal oil/gal syrup — well below the 1.0 industry benchmark.`,  action:'If not already using RO, your evaporator is dialed in. Consider adding a preheater.'});
    else if(fr>1.5) insights.push({type:'warn', title:'High fuel consumption',     body:`${fr.toFixed(2)} gal oil/gal syrup — above the 1.0 target.`,                   action:'RO preconcentration to 8–10°Brix could cut fuel use 60–70%.'});
  }
  if (roGal>0&&sapGal>0) {
    const pct=Math.round((roGal/sapGal)*100);
    insights.push({type:'success',title:'RO contributing to efficiency',body:`${pct}% of sap processed through RO this season.`,action:'Push RO concentration to 10–12°Brix for maximum fuel savings if membranes allow.'});
  }

  const activeSc=[yieldScore,effScore,fuelScore].filter(s=>s!==null);
  const overall = activeSc.length>0 ? Math.round(activeSc.reduce((a,b)=>a+b,0)/activeSc.length) : 0;
  const grade = overall>=90?'A':overall>=80?'B':overall>=70?'C':overall>=60?'D':'F';
  const gradeColor = overall>=90?'#3fb950':overall>=80?'#58a6ff':overall>=70?'#f0883e':'#f85149';

  const bestRun = runLogs.length>0 ? runLogs.reduce((b,e)=>(parseFloat(e.val)||0)>(parseFloat(b.val)||0)?e:b, runLogs[0]) : null;

  // flow forecast
  const high=parseFloat(condHigh), low=parseFloat(condLow);
  let flowScore=0,flowLabel='',flowColor='#3d5068';
  if (!isNaN(high)&&!isNaN(low)) {
    if      (low<=28&&high>=36&&high<=50) { flowScore=95; flowLabel='Excellent run expected';    flowColor='#3fb950'; }
    else if (low<=32&&high>=34&&high<=55) { flowScore=72; flowLabel='Good flow likely';           flowColor='#58a6ff'; }
    else if (high>=32&&low<=35)           { flowScore=40; flowLabel='Marginal conditions';        flowColor='#f0883e'; }
    else                                  { flowScore=8;  flowLabel='Poor conditions for flow';   flowColor='#f85149'; }
  }

  // tip of the month
  const monthTips=['Inspect all fittings & replace cracked tubing before the freeze.',
    'Sharpen drill bits and sort spouts — fresh holes drill cleaner and seal better.',
    'Peak season: check vacuum at the pump daily — even 2″ Hg loss cuts yield.',
    'Watch sap color carefully. Buddy sap appears when trees bud — stop immediately.',
    'Pull taps promptly. Leaving spouts in damages cambium and reduces next-year yield.',
    'Service RO membranes now — flush and store in food-safe preservative solution.',
    'Inspect mainline for UV damage and wildlife chews. Replace any cracked sections.',
    'Great time to scout new taps — healthy maples 10″+ DBH.',
    'Install new tubing runs before leaves fall. Grade-check all mainlines.',
    'Blow out all lines with compressed air before the first hard freeze.',
    'Order supplies early — spouts and tubing sell out by February.',
    'Review this season\'s logs and set yield targets for next year.'];
  const tip = monthTips[new Date().getMonth()];

  return (
    <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:16,padding:'20px 24px',marginBottom:20}} className="sage-fadein">

      {/* ── header row ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div className="sage-pulse" style={{width:8,height:8,borderRadius:'50%',background:'#3fb950'}}/>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#3fb950'}}>SEASON INTELLIGENCE</span>
          <span style={{fontSize:11,color:'#3d5068'}}>· {season}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:'#07090f',borderRadius:20,padding:'3px 10px',border:'1px solid #1e2d3d'}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:confColor}}/>
          <span style={{fontSize:9,color:'#5a6a7a',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{confidence} confidence · {dataPoints} signals</span>
        </div>
      </div>

      {/* ── grade + sub-scores ── */}
      <div style={{display:'flex',gap:14,marginBottom:16,alignItems:'stretch'}}>
        <div style={{background:'#07090f',borderRadius:12,padding:'14px 18px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minWidth:76,border:`1.5px solid ${gradeColor}50`,flexShrink:0}}>
          <div style={{fontSize:46,fontWeight:900,color:gradeColor,lineHeight:1,textShadow:`0 0 24px ${gradeColor}80`}}>{grade}</div>
          <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.1em',marginTop:4,textTransform:'uppercase'}}>Season Score</div>
          <div style={{fontSize:11,color:gradeColor,fontWeight:700,marginTop:2}}>{overall}%</div>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:9,justifyContent:'center'}}>
          {yieldScore!==null && <SubScoreBar label="Yield / Tap" score={yieldScore} color="#3fb950"/>}
          {effScore!==null   && <SubScoreBar label="Efficiency"  score={effScore}   color="#58a6ff"/>}
          {fuelScore!==null  && <SubScoreBar label="Fuel Use"    score={fuelScore}   color="#f0883e"/>}
          {activeSc.length===0 && <div style={{fontSize:12,color:'#3d5068'}}>Log syrup & sap to generate scores</div>}
        </div>
      </div>

      {/* ── insights ── */}
      {insights.length>0 && (
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
          {insights.map((ins,i)=><InsightRow key={i} ins={ins}/>)}
        </div>
      )}

      {/* ── best run ── */}
      {bestRun&&parseFloat(bestRun.val)>0 && (
        <div style={{background:'#07090f',border:'1px solid #1e2d3d',borderRadius:10,padding:'10px 14px',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}} className="sage-fadein">
          <div>
            <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.1em',marginBottom:2}}>BEST RUN THIS SEASON</div>
            <div style={{fontSize:16,fontWeight:800,color:'#c9d1d9'}}>{parseFloat(bestRun.val).toFixed(1)} gal sap</div>
            <div style={{fontSize:11,color:'#5a6a7a'}}>{bestRun.date||'Date not logged'}</div>
          </div>
          <div style={{fontSize:28}}>🏆</div>
        </div>
      )}

      {/* ── brix sparkline ── */}
      {sparkData.length>=3 && (
        <div style={{background:'#07090f',border:'1px solid #1e2d3d',borderRadius:10,padding:'10px 14px',marginBottom:12}} className="sage-fadein">
          <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.1em',marginBottom:8}}>BRIX TREND THIS SEASON</div>
          <BrixSparkline data={sparkData}/>
        </div>
      )}

      {/* ── flow forecast ── */}
      <div style={{background:'#07090f',border:'1px solid #1e2d3d',borderRadius:10,padding:'12px 14px',marginBottom:12}}>
        <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.1em',marginBottom:10}}>TODAY'S FLOW FORECAST</div>
        <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:'#5a6a7a',marginBottom:4}}>Night low (°F)</div>
            <input type="number" value={condLow} onChange={e=>setCondLow(e.target.value)} placeholder="e.g. 28"
              style={{width:'100%',boxSizing:'border-box',background:'#131e2c',border:'1px solid #1e2d3d',borderRadius:8,padding:'8px 10px',color:'#c9d1d9',fontSize:13,outline:'none'}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:'#5a6a7a',marginBottom:4}}>Day high (°F)</div>
            <input type="number" value={condHigh} onChange={e=>setCondHigh(e.target.value)} placeholder="e.g. 42"
              style={{width:'100%',boxSizing:'border-box',background:'#131e2c',border:'1px solid #1e2d3d',borderRadius:8,padding:'8px 10px',color:'#c9d1d9',fontSize:13,outline:'none'}}/>
          </div>
          {flowScore>0 && (
            <div style={{textAlign:'center',minWidth:58,paddingBottom:2}}>
              <div style={{fontSize:24,fontWeight:900,color:flowColor,lineHeight:1}}>{flowScore}%</div>
              <div style={{fontSize:9,color:flowColor,fontWeight:700,letterSpacing:'0.05em'}}>FLOW</div>
            </div>
          )}
        </div>
        {flowScore>0 && (
          <div style={{marginTop:10}}>
            <div style={{height:6,background:'#1e2d3d',borderRadius:3,overflow:'hidden',marginBottom:6}}>
              <div style={{height:'100%',width:`${flowScore}%`,background:flowColor,borderRadius:3,transition:'width 0.6s ease'}}/>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:flowColor}}>{flowLabel}</div>
            <div style={{fontSize:11,color:'#3d5068',marginTop:3}}>Based on freeze-thaw science: best flow requires overnight freeze (≤32°F) + daytime thaw (36–50°F).</div>
          </div>
        )}
        {flowScore===0 && <div style={{fontSize:11,color:'#3d5068',marginTop:6}}>Enter tonight's low and tomorrow's high to get a flow prediction.</div>}
      </div>

      {/* ── tip of the month ── */}
      <div style={{borderLeft:'3px solid #58a6ff',background:'#07090f',borderRadius:'0 10px 10px 0',padding:'10px 14px'}}>
        <div style={{fontSize:9,color:'#58a6ff',fontWeight:700,letterSpacing:'0.1em',marginBottom:4}}>TIP OF THE MONTH</div>
        <div style={{fontSize:12,color:'#8b949e',lineHeight:1.65}}>{tip}</div>
      </div>
    </div>
  );
}


// ─── Breakeven Calculator ─────────────────────────────────────────────────────
function BreakevenCalculator({ trees, units }) {
  const wizData     = ls.get('sg_wizard_data', {});
  const [taps,      setTaps]      = React.useState(()=> ls.get('sg_bev_taps',   parseInt(trees)||0));
  const [fuelCost,  setFuelCost]  = React.useState(()=> ls.get('sg_bev_fuel',   wizData.fuelCost||300));
  const [syrupPx,   setSyrupPx]   = React.useState(()=> ls.get('sg_bev_price',  wizData.syrupPrice||40));
  const [supplies,  setSupplies]  = React.useState(()=> ls.get('sg_bev_supply', 0));
  const [laborHrs,  setLaborHrs]  = React.useState(()=> ls.get('sg_bev_lhrs',  0));
  const [laborRate, setLaborRate] = React.useState(()=> ls.get('sg_bev_lrate', 15));
  const [hobby,     setHobby]     = React.useState(()=> ls.get('sg_bev_hobby',  true));

  // persist on change
  React.useEffect(()=>{ ls.set('sg_bev_taps',   taps);     },[taps]);
  React.useEffect(()=>{ ls.set('sg_bev_fuel',   fuelCost); },[fuelCost]);
  React.useEffect(()=>{ ls.set('sg_bev_price',  syrupPx);  },[syrupPx]);
  React.useEffect(()=>{ ls.set('sg_bev_supply', supplies); },[supplies]);
  React.useEffect(()=>{ ls.set('sg_bev_lhrs',   laborHrs); },[laborHrs]);
  React.useEffect(()=>{ ls.set('sg_bev_lrate',  laborRate);},[laborRate]);
  React.useEffect(()=>{ ls.set('sg_bev_hobby',  hobby);    },[hobby]);

  const t        = Math.max(1, parseInt(taps)   || 1);
  const fuel     = parseFloat(fuelCost)  || 0;
  const price    = Math.max(0.01, parseFloat(syrupPx) || 40);
  const supCost  = parseFloat(supplies)  || 0;
  const labor    = hobby ? 0 : (parseFloat(laborHrs)||0) * (parseFloat(laborRate)||0);
  const totalCost = fuel + supCost + labor;
  const bevGal   = price > 0 ? totalCost / price : 0;   // total syrup gal to break even
  const bevPerTap = bevGal / t;                          // gal/tap to break even

  // 3 scenarios: bad / average / great
  const scenarios = [
    { label:'Bad Year',  yld:0.14, color:'#f85149', bgc:'rgba(248,81,73,0.06)'  },
    { label:'Average',   yld:0.22, color:'#f59e0b', bgc:'rgba(245,158,11,0.06)' },
    { label:'Great Year',yld:0.30, color:'#3fb950', bgc:'rgba(63,185,80,0.06)'  },
  ];

  const BevInput = ({ label, val, set, prefix, suffix, small }) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:5}}>{label}</div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:'#0a1420',border:`1.5px solid ${focused?'#3fb950':'#1e2d3d'}`,borderRadius:9,padding:'8px 12px',transition:'border-color 0.15s'}}>
          {prefix && <span style={{color:'#5a6a7a',fontSize:14,flexShrink:0}}>{prefix}</span>}
          <input type="number" value={val||''} onChange={e=>set(parseFloat(e.target.value)||0)}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
            placeholder="0" min="0"
            style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#e2eaf4',fontSize:small?13:15,fontFamily:'inherit'}}/>
          {suffix && <span style={{color:'#5a6a7a',fontSize:11,flexShrink:0}}>{suffix}</span>}
        </div>
      </div>
    );
  };

  const maxYld = 0.35;

  return (
    <div style={{background:'#0a1420',border:'1px solid #1e2d3d',borderRadius:12,padding:'16px 16px',marginBottom:16}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <div style={{width:32,height:32,borderRadius:8,background:'rgba(88,166,255,0.1)',border:'1px solid rgba(88,166,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{fontSize:16}}>💰</span>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:'#e2eaf4',lineHeight:1.2}}>Break-Even Calculator</div>
          <div style={{fontSize:11,color:'#5a6a7a',marginTop:2}}>How much do you need to make to cover costs?</div>
        </div>
      </div>

      {/* Input grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,columnGap:12}}>
        <BevInput label="Number of Taps"         val={taps}     set={setTaps}     suffix="taps"/>
        <BevInput label="Fuel Cost (season)"     val={fuelCost} set={setFuelCost} prefix="$"/>
        <BevInput label="Syrup Price / Gallon"   val={syrupPx}  set={setSyrupPx}  prefix="$"/>
        <BevInput label="Supplies & Misc"        val={supplies} set={setSupplies} prefix="$"/>
      </div>

      {/* Labor toggle */}
      <div style={{marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.06em'}}>Labor Cost</div>
          <button onClick={()=>setHobby(v=>!v)}
            style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',padding:0}}>
            <div style={{width:32,height:18,borderRadius:9,background:hobby?'#3fb950':'#1e2d3d',transition:'background 0.2s',position:'relative',flexShrink:0}}>
              <div style={{position:'absolute',top:2,left:hobby?14:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}/>
            </div>
            <span style={{fontSize:11,color:hobby?'#3fb950':'#5a6a7a',fontWeight:600}}>{hobby?'Hobby ($0)':'Paid labor'}</span>
          </button>
        </div>
        {!hobby && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <BevInput label="Hours / Season" val={laborHrs}  set={setLaborHrs}  suffix="hrs" small/>
            <BevInput label="Hourly Rate"    val={laborRate} set={setLaborRate} prefix="$"   small/>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{borderTop:'1px solid #1e2d3d',marginBottom:16}}/>

      {/* Break-even answer */}
      <div style={{background:'linear-gradient(135deg,#071020,#0d1a2b)',border:'1px solid #1a304a',borderRadius:10,padding:'14px 16px',marginBottom:14}}>
        {totalCost === 0 ? (
          <div style={{textAlign:'center',color:'#5a6a7a',fontSize:13}}>Enter your costs above to calculate break-even.</div>
        ) : (
          <>
            <div style={{fontSize:11,fontWeight:700,color:'#58a6ff',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Your Break-Even Point</div>
            <div style={{fontSize:13,color:'#c9d1d9',lineHeight:1.9}}>
              <span style={{color:'#58a6ff',fontWeight:800,fontSize:22}}>{bevPerTap.toFixed(2)}</span>
              <span style={{color:'#5a6a7a',fontSize:13}}> gal/tap needed  ·  </span>
              <span style={{color:'#a78bfa',fontWeight:700,fontSize:16}}>{bevGal.toFixed(1)} gal</span>
              <span style={{color:'#5a6a7a',fontSize:12}}> total</span>
            </div>
            <div style={{fontSize:12,color:'#5a6a7a',marginTop:4}}>
              Total season cost: <span style={{color:'#f59e0b',fontWeight:600}}>${totalCost.toLocaleString()}</span>
              {labor > 0 && <span> (incl. ${labor.toFixed(0)} labor)</span>}
            </div>
          </>
        )}
      </div>

      {/* Scenario bars */}
      <div style={{fontSize:10,fontWeight:700,color:'#5a6a7a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Season Scenarios</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {scenarios.map(({label,yld,color,bgc})=>{
          const syrupGal  = t * yld;
          const revenue   = syrupGal * price;
          const profit    = revenue - totalCost;
          const above     = bevPerTap > 0 ? yld >= bevPerTap : true;
          const barWidth  = Math.min(100, (yld / maxYld) * 100);
          const bevLine   = bevPerTap > 0 ? Math.min(100, (bevPerTap / maxYld) * 100) : null;
          return (
            <div key={label} style={{background:bgc,border:`1px solid ${color}30`,borderRadius:10,padding:'10px 12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:700,color}}>{label}</span>
                <span style={{fontSize:12,fontWeight:700,color:above?'#3fb950':'#f85149'}}>
                  {totalCost===0?'—':profit>=0?`+$${profit.toFixed(0)}`:`-$${Math.abs(profit).toFixed(0)}`}
                </span>
              </div>
              {/* Bar */}
              <div style={{position:'relative',height:8,background:'#131e2c',borderRadius:4,overflow:'hidden'}}>
                <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${barWidth}%`,
                  background:color,borderRadius:4,transition:'width 0.4s ease'}}/>
                {bevLine != null && (
                  <div style={{position:'absolute',left:`${bevLine}%`,top:-2,height:12,width:2,
                    background:'#fff',borderRadius:1,opacity:0.6}}/>
                )}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                <span style={{fontSize:10,color:'#5a6a7a'}}>{yld.toFixed(2)} gal/tap · {syrupGal.toFixed(1)} gal total</span>
                <span style={{fontSize:10,color:above?'#3fb950':'#f85149',fontWeight:600}}>
                  {totalCost===0?'':above?'Above break-even ✓':'Below break-even'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {totalCost > 0 && bevPerTap > 0.30 && (
        <div style={{marginTop:12,background:'rgba(248,81,73,0.06)',border:'1px solid rgba(248,81,73,0.2)',borderRadius:8,padding:'10px 12px',fontSize:12,color:'#f85149',lineHeight:1.5}}>
          ⚠️ Your break-even ({bevPerTap.toFixed(2)} gal/tap) is above the great-year benchmark. Consider reducing costs or increasing your selling price.
        </div>
      )}
    </div>
  );
}


// ─── Sap Freshness Tracker ────────────────────────────────────────────────────
function SapFreshnessTracker() {
  const BASE_F       = 40;    // °F — bacterial growth threshold for maple sap
  const WARN_HU      = 80;    // degree-hours: start warning
  const CRITICAL_HU  = 150;   // degree-hours: boil now or dump risk

  const [startTs,  setStartTs]  = React.useState(() => ls.get('sg_fresh_start', null));
  const [status,   setStatus]   = React.useState(() => ls.get('sg_fresh_status', 'idle')); // idle|tracking|boiled|dumped
  const [hourlyF,  setHourlyF]  = React.useState([]);  // [{ts, temp}]
  const [loading,  setLoading]  = React.useState(false);
  const [locErr,   setLocErr]   = React.useState('');
  const [open,     setOpen]     = React.useState(true);

  // Use weather tab location first (sg_wx_lat/lon), fall back to degree-day tab location
  const lat = ls.get('sg_wx_lat', null) ?? ls.get('sg_ddlat', null);
  const lon = ls.get('sg_wx_lon', null) ?? ls.get('sg_ddlon', null);

  // Fetch hourly temps: past 2 days + next 2 days
  const fetchTemps = React.useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true); setLocErr('');
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&hourly=temperature_2m&temperature_unit=fahrenheit&past_days=2&forecast_days=2&timezone=auto`;
      const d = await fetch(url).then(r => r.json());
      if (!d.hourly) throw new Error('No data');
      const times = d.hourly.time;
      const temps = d.hourly.temperature_2m;
      setHourlyF(times.map((t, i) => ({ ts: new Date(t).getTime(), temp: temps[i] })));
    } catch { setLocErr('Could not load temperature data. Check your location in the Weather tab.'); }
    setLoading(false);
  }, [lat, lon]);

  React.useEffect(() => { if (status === 'tracking') fetchTemps(); }, [status]);

  // ── Heat unit calculation ──────────────────────────────────────────────────
  const now = Date.now();

  // Slice hourly readings from collection start to now (actual recorded temps)
  const pastReadings = hourlyF.filter(h => h.ts >= (startTs||now) && h.ts <= now);
  // Future readings from now to end of forecast
  const futureReadings = hourlyF.filter(h => h.ts > now);

  // Tank temp lags air temp: 2-hour smoothing offset for large tanks
  const smoothTemp = (temp) => Math.max(32, temp - 3); // tank ~3°F cooler than air avg

  const currentHU = pastReadings.reduce((s, h) => s + Math.max(0, smoothTemp(h.temp) - BASE_F), 0);

  // Project forward: when will we hit thresholds?
  let projHU = currentHU;
  let warnEta = null, critEta = null;
  for (const h of futureReadings) {
    projHU += Math.max(0, smoothTemp(h.temp) - BASE_F);
    if (!warnEta && projHU >= WARN_HU)     warnEta = h.ts;
    if (!critEta && projHU >= CRITICAL_HU) critEta = h.ts;
    if (critEta) break;
  }

  // Find next cold window (best boil time = consecutive hours below 45°F)
  let bestBoilStart = null;
  for (let i = 0; i < futureReadings.length - 3; i++) {
    if (futureReadings.slice(i, i+3).every(h => h.temp < 45)) {
      bestBoilStart = futureReadings[i].ts;
      break;
    }
  }

  // Current outdoor temp
  const currentTemp = hourlyF.find(h => Math.abs(h.ts - now) < 1800000)?.temp ?? null;

  // Elapsed time since collection
  const elapsedHrs = startTs ? (now - startTs) / 3_600_000 : 0;

  // Status colour
  const pct = Math.min(100, (currentHU / CRITICAL_HU) * 100);
  const gaugeColor = pct < 40 ? '#3fb950' : pct < 70 ? '#f59e0b' : '#f85149';
  const statusLabel = pct < 40 ? '🟢 Fresh' : pct < 70 ? '🟡 Boil Soon' : '🔴 Boil Now';

  const fmtEta = (ts) => {
    if (!ts) return null;
    const hrs = Math.round((ts - now) / 3_600_000);
    if (hrs <= 0) return 'now';
    if (hrs < 24) return `in ~${hrs}h`;
    return `in ~${Math.round(hrs/24)}d`;
  };

  const startTracking = () => {
    const ts = Date.now();
    ls.set('sg_fresh_start', ts); setStartTs(ts);
    ls.set('sg_fresh_status', 'tracking'); setStatus('tracking');
  };
  const markBoiled = () => { ls.set('sg_fresh_status','boiled'); setStatus('boiled'); };
  const markDumped = () => { ls.set('sg_fresh_status','dumped'); setStatus('dumped'); };
  const reset = () => {
    ls.set('sg_fresh_start', null); setStartTs(null);
    ls.set('sg_fresh_status', 'idle'); setStatus('idle');
    setHourlyF([]);
  };

  // Trigger browser alert at critical threshold
  React.useEffect(() => {
    if (status === 'tracking' && currentHU >= CRITICAL_HU) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SweetRun — Sap Spoilage Alert', {
          body: `Your sap has accumulated ${currentHU.toFixed(0)} heat units. Boil now or risk dumping.`,
          icon: './apple-touch-icon.png'
        });
      }
    }
  }, [currentHU, status]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{marginBottom:14}}>
      {/* Header toggle */}
      <button onClick={()=>setOpen(v=>!v)} style={{width:'100%',display:'flex',justifyContent:'space-between',
        alignItems:'center',background:'linear-gradient(135deg,#1a0a00,#2a1200)',
        border:'1px solid #5c2d00',borderRadius:open?'12px 12px 0 0':12,
        padding:'12px 16px',cursor:'pointer'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18}}>🧪</span>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:13,fontWeight:800,color:'#f0883e'}}>Sap Freshness Tracker</div>
            <div style={{fontSize:11,color:'#8a6040'}}>Degree-hour spoilage predictor</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {status === 'tracking' && (
            <span style={{fontSize:11,fontWeight:700,color:gaugeColor,background:`${gaugeColor}18`,
              border:`1px solid ${gaugeColor}40`,borderRadius:6,padding:'2px 8px'}}>
              {statusLabel}
            </span>
          )}
          <span style={{color:'#5a6a7a',fontSize:11}}>{open?'▲':'▼'}</span>
        </div>
      </button>

      {open && (
        <div style={{background:'#0a0800',border:'1px solid #5c2d00',borderTop:'none',
          borderRadius:'0 0 12px 12px',padding:16}}>

          {/* No location set */}
          {!lat && (
            <div style={{textAlign:'center',padding:'20px 0',color:'#8a6040',fontSize:13}}>
              Set your location in the <strong style={{color:'#f0883e'}}>Weather tab</strong> or <strong style={{color:'#f0883e'}}>Boil Point tab</strong> first,
              then come back to enable freshness tracking.
            </div>
          )}

          {/* Idle state */}
          {lat && status === 'idle' && (
            <div style={{textAlign:'center',padding:'12px 0'}}>
              <div style={{fontSize:13,color:'#8a9ab5',marginBottom:16,lineHeight:1.6}}>
                Start the timer right after you collect sap. SweetRun tracks the cumulative
                heat your sap experiences and tells you when to boil.
              </div>
              <button onClick={startTracking}
                style={{background:'#f0883e',border:'none',borderRadius:10,padding:'12px 28px',
                  fontWeight:800,fontSize:14,color:'#07090f',cursor:'pointer'}}>
                🧊 Start Freshness Timer
              </button>
            </div>
          )}

          {/* Done states */}
          {(status === 'boiled' || status === 'dumped') && (
            <div style={{textAlign:'center',padding:'14px 0'}}>
              <div style={{fontSize:28,marginBottom:8}}>{status==='boiled'?'✅':'🗑️'}</div>
              <div style={{fontSize:14,fontWeight:700,color: status==='boiled'?'#3fb950':'#f85149',marginBottom:4}}>
                {status==='boiled'?'Marked as Boiled — great work!':'Marked as Dumped'}
              </div>
              <div style={{fontSize:12,color:'#5a6a7a',marginBottom:16}}>
                Accumulated {currentHU.toFixed(0)} heat units over {elapsedHrs.toFixed(1)} hours.
              </div>
              <button onClick={reset}
                style={{background:'transparent',border:'1px solid #1e2d3d',borderRadius:8,
                  padding:'8px 18px',fontSize:12,color:'#8a9ab5',cursor:'pointer'}}>
                Start New Batch
              </button>
            </div>
          )}

          {/* Tracking state */}
          {status === 'tracking' && (
            <>
              {loading && (
                <div style={{textAlign:'center',padding:'12px 0',fontSize:12,color:'#5a6a7a'}}>
                  Loading temperature data…
                </div>
              )}
              {locErr && (
                <div style={{background:'rgba(248,81,73,0.08)',border:'1px solid rgba(248,81,73,0.2)',
                  borderRadius:8,padding:'10px 12px',fontSize:12,color:'#f85149',marginBottom:12}}>
                  {locErr}
                </div>
              )}
              {!loading && !locErr && hourlyF.length > 0 && (
                <>
                  {/* Gauge */}
                  <div style={{marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span style={{fontSize:13,fontWeight:700,color:gaugeColor}}>{statusLabel}</span>
                      <span style={{fontSize:12,color:'#5a6a7a'}}>
                        {currentHU.toFixed(0)} / {CRITICAL_HU} heat units
                      </span>
                    </div>
                    <div style={{height:10,background:'#131e2c',borderRadius:5,overflow:'hidden',position:'relative'}}>
                      <div style={{height:'100%',width:`${pct}%`,borderRadius:5,
                        background:`linear-gradient(90deg, #3fb950, ${gaugeColor})`,
                        transition:'width 0.5s ease'}}/>
                      {/* Warn marker */}
                      <div style={{position:'absolute',left:`${(WARN_HU/CRITICAL_HU)*100}%`,
                        top:0,bottom:0,width:2,background:'rgba(255,255,255,0.3)'}}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:10,color:'#3d5068'}}>
                      <span>Fresh</span><span>Warn</span><span>Critical</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14}}>
                    {[
                      ['Elapsed',    elapsedHrs < 24 ? `${elapsedHrs.toFixed(1)}h` : `${(elapsedHrs/24).toFixed(1)}d`, '#58a6ff'],
                      ['Outdoor',    currentTemp != null ? `${currentTemp.toFixed(0)}°F` : '—', currentTemp > 50 ? '#f85149' : currentTemp > 40 ? '#f59e0b' : '#3fb950'],
                      ['Heat Units', currentHU.toFixed(0), gaugeColor],
                    ].map(([lbl,val,clr])=>(
                      <div key={lbl} style={{background:'#0d1a2b',borderRadius:8,padding:'10px 8px',textAlign:'center'}}>
                        <div style={{fontSize:18,fontWeight:800,color:clr,lineHeight:1}}>{val}</div>
                        <div style={{fontSize:10,color:'#5a6a7a',marginTop:3}}>{lbl}</div>
                      </div>
                    ))}
                  </div>

                  {/* Predictions */}
                  <div style={{background:'#0d1a2b',borderRadius:10,padding:'12px 14px',marginBottom:14}}>
                    <div style={{fontSize:10,fontWeight:700,color:'#f0883e',textTransform:'uppercase',
                      letterSpacing:'0.08em',marginBottom:10}}>Forecast</div>
                    {currentHU < WARN_HU && warnEta && (
                      <div style={{display:'flex',justifyContent:'space-between',
                        fontSize:12,color:'#c9d1d9',marginBottom:6}}>
                        <span>⚡ Boil-soon threshold</span>
                        <span style={{color:'#f59e0b',fontWeight:700}}>{fmtEta(warnEta)}</span>
                      </div>
                    )}
                    {critEta && (
                      <div style={{display:'flex',justifyContent:'space-between',
                        fontSize:12,color:'#c9d1d9',marginBottom:6}}>
                        <span>🚨 Critical — boil or dump</span>
                        <span style={{color:'#f85149',fontWeight:700}}>{fmtEta(critEta)}</span>
                      </div>
                    )}
                    {!critEta && !warnEta && (
                      <div style={{fontSize:12,color:'#3fb950'}}>
                        ✓ Temps look cold — no spoilage risk in the next 48 hours.
                      </div>
                    )}
                    {bestBoilStart && (
                      <div style={{display:'flex',justifyContent:'space-between',
                        fontSize:12,color:'#c9d1d9',marginTop:6,paddingTop:6,borderTop:'1px solid #1e2d3d'}}>
                        <span>❄️ Best boil window</span>
                        <span style={{color:'#58a6ff',fontWeight:700}}>{fmtEta(bestBoilStart)}</span>
                      </div>
                    )}
                  </div>

                  {/* Critical alert */}
                  {currentHU >= CRITICAL_HU && (
                    <div style={{background:'rgba(248,81,73,0.1)',border:'1px solid rgba(248,81,73,0.35)',
                      borderRadius:10,padding:'12px 14px',marginBottom:14,textAlign:'center'}}>
                      <div style={{fontSize:14,fontWeight:800,color:'#f85149',marginBottom:4}}>
                        🚨 Boil Now or Dump
                      </div>
                      <div style={{fontSize:12,color:'#c9d1d9',lineHeight:1.5}}>
                        Your sap has accumulated {currentHU.toFixed(0)} degree-hours of heat stress.
                        Quality is at serious risk.
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    <button onClick={fetchTemps}
                      style={{padding:'10px 8px',borderRadius:9,border:'1px solid #1e2d3d',
                        background:'transparent',color:'#8a9ab5',fontSize:12,cursor:'pointer',fontWeight:600}}>
                      ↻ Refresh
                    </button>
                    <button onClick={markBoiled}
                      style={{padding:'10px 8px',borderRadius:9,border:'none',
                        background:'#3fb950',color:'#07090f',fontSize:12,cursor:'pointer',fontWeight:700}}>
                      ✓ Boiled
                    </button>
                    <button onClick={markDumped}
                      style={{padding:'10px 8px',borderRadius:9,border:'1px solid #f85149',
                        background:'transparent',color:'#f85149',fontSize:12,cursor:'pointer',fontWeight:600}}>
                      🗑 Dumped
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SugarSageTab({ season, sapBrix, trees, units }) {
  const [query,        setQuery]        = React.useState('');
  const [activeCat,    setActiveCat]    = React.useState('all');
  const [results,      setResults]      = React.useState([]);
  const [searched,     setSearched]     = React.useState(false);
  const [expandedId,   setExpandedId]   = React.useState(null);
  const [showSeason,   setShowSeason]   = React.useState(true);
  const [promptIdx,    setPromptIdx]    = React.useState(0);
  const [promptFade,   setPromptFade]   = React.useState(true);
  const inputRef = React.useRef(null);

  const prompts = [
    'How can SugarSage help today?',
    'What would you like to know?',
    'Ask about yields, vacuum, RO, or anything maple.',
    'What are you working on this season?',
    'Ready when you are.',
    'What\'s on your mind?',
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPromptFade(false);
      setTimeout(() => {
        setPromptIdx(i => (i + 1) % prompts.length);
        setPromptFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slog  = ls.get('sg_logs2', {})[season] || {};
  const roGal = (slog.sapRO||[]).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
  const ctx   = { hasRO: roGal>0, hasVacuum: ls.get('sg_dx_vac','gravity')!=='gravity', trees: trees||0 };

  const doSearch = React.useCallback(() => {
    if (!query.trim() && activeCat==='all') { setResults([]); setSearched(false); return; }
    let res = query.trim() ? ssSearch(query, ctx) : SS_KB.filter(e=>e.cat===activeCat);
    if (activeCat !== 'all') res = res.filter(e=>e.cat===activeCat);
    setResults(res); setSearched(true);
  }, [query, activeCat]);

  React.useEffect(() => {
    const id = setTimeout(doSearch, 300);
    return () => clearTimeout(id);
  }, [doSearch]);

  const handleSubmit = (e) => { e.preventDefault(); doSearch(); };
  const clearSearch  = () => { setQuery(''); setResults([]); setSearched(false); setActiveCat('all'); inputRef.current?.focus(); };

  const catEntries  = activeCat==='all' ? SS_KB : SS_KB.filter(e=>e.cat===activeCat);
  const displayList = searched ? results : (activeCat!=='all' ? catEntries : []);

  const CAT_LABELS = {
    all:'All', biology:'Biology', tapping:'Tapping', vacuum:'Vacuum',
    ro:'R/O', evaporation:'Evaporation', finishing:'Finishing', weather:'Weather',
    tree_health:'Tree Health', business:'Business', lines:'Lines', troubleshooting:'Troubleshoot',
  };

  return (
    <div style={{maxWidth:740,margin:'0 auto',padding:'0 0 80px'}}>

      {/* ── Hero header ── */}
      <div style={{textAlign:'center',padding:'32px 16px 24px',borderBottom:'1px solid #1e2d3d',marginBottom:0}}>
        <div style={{fontSize:13,color:'#3fb950',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:10}}>🍁 Maple Intelligence</div>
        <div style={{fontSize:36,fontWeight:900,color:'#c9d1d9',letterSpacing:'-1px',lineHeight:1,marginBottom:14}}>SugarSage</div>
        <div style={{
          fontSize:16,color:'#5a6a7a',fontWeight:400,minHeight:24,
          opacity: promptFade ? 1 : 0,
          transition:'opacity 0.35s ease',
        }}>{prompts[promptIdx]}</div>
      </div>

      {/* ── Search form ── */}
      <div style={{padding:'20px 0 0',marginBottom:16}}>
        <form onSubmit={handleSubmit} style={{display:'flex',gap:0,position:'relative'}}>
          <input
            ref={inputRef}
            value={query}
            onChange={e=>{setQuery(e.target.value);setExpandedId(null);}}
            placeholder="Ask anything about maple production…"
            style={{flex:1,padding:'14px 52px 14px 18px',fontSize:15,
              border:'1.5px solid #1e2d3d',borderRadius:14,outline:'none',
              background:'#0d1a2b',color:'#c9d1d9',fontFamily:'inherit',
              transition:'border-color 0.15s,box-shadow 0.15s'}}
            onFocus={e=>{e.target.style.borderColor='#3fb950';e.target.style.boxShadow='0 0 0 3px #3fb95018';}}
            onBlur={e=>{e.target.style.borderColor='#1e2d3d';e.target.style.boxShadow='none';}}
          />
          {query
            ? <button type="button" onClick={clearSearch}
                style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',cursor:'pointer',color:'#3d5068',fontSize:18,
                  display:'flex',alignItems:'center',padding:4}}>✕</button>
            : <button type="submit"
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                  background:'#3fb950',border:'none',cursor:'pointer',color:'#07090f',
                  borderRadius:8,padding:'5px 10px',fontSize:13,fontWeight:700,
                  display:'flex',alignItems:'center',gap:4}}>Ask</button>
          }
        </form>

        {/* Suggestion chips */}
        {!searched && activeCat==='all' && (
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:12}}>
            {['Why does sap flow?','How does RO work?','Best vacuum level','Niter in syrup','Yield per tap','Off-flavors'].map(s=>(
              <button key={s} onClick={()=>{setQuery(s); setTimeout(doSearch,50);}}
                style={{padding:'6px 13px',borderRadius:20,border:'1px solid #1e2d3d',
                  background:'transparent',color:'#5a6a7a',fontSize:12,cursor:'pointer',
                  transition:'all 0.15s'}}
                onMouseEnter={e=>{e.target.style.borderColor='#3fb950';e.target.style.color='#c9d1d9';}}
                onMouseLeave={e=>{e.target.style.borderColor='#1e2d3d';e.target.style.color='#5a6a7a';}}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Category filter ── */}
      <div style={{display:'flex',overflowX:'auto',gap:4,marginBottom:20,paddingBottom:4,
        scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
        {['all','biology','tapping','vacuum','ro','evaporation','finishing','weather','tree_health','business','lines','troubleshooting'].map(id=>{
          const active = activeCat===id;
          return (
            <button key={id} onClick={()=>{setActiveCat(id);setExpandedId(null);}}
              style={{padding:'5px 14px',borderRadius:20,fontSize:11,fontWeight:600,cursor:'pointer',
                whiteSpace:'nowrap',flexShrink:0,
                border:`1px solid ${active?'#3fb950':'#1e2d3d'}`,
                background: active?'#3fb950':'transparent',
                color: active?'#07090f':'#5a6a7a',
                transition:'all 0.15s'}}>
              {CAT_LABELS[id]}
            </button>
          );
        })}
      </div>

      {/* ── Season intelligence toggle ── */}
      <button onClick={()=>setShowSeason(v=>!v)}
        style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',
          background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:10,
          padding:'10px 16px',cursor:'pointer',marginBottom: showSeason?0:16,
          borderBottomLeftRadius: showSeason?0:10, borderBottomRightRadius: showSeason?0:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:'#3fb950',boxShadow:'0 0 6px #3fb95080'}}/>
          <span style={{fontSize:12,fontWeight:700,color:'#5a6a7a',letterSpacing:'0.06em',textTransform:'uppercase'}}>Your Season Dashboard</span>
        </div>
        <span style={{fontSize:11,color:'#3d5068'}}>{showSeason?'Hide ▲':'Show ▼'}</span>
      </button>
      {showSeason && (
        <div style={{border:'1px solid #1e2d3d',borderTop:'none',borderRadius:'0 0 10px 10px',marginBottom:16,overflow:'hidden'}}>
          <SeasonIntelligence season={season} sapBrix={sapBrix} trees={trees}/>
        </div>
      )}

      {/* ── Breakeven Calculator ── */}
      <BreakevenCalculator trees={trees} units={units} />

      {/* ── Empty state ── */}
      {!searched && activeCat==='all' && (
        <div style={{textAlign:'center',padding:'24px 20px 8px',color:'#3d5068'}}>
          <div style={{fontSize:12,lineHeight:1.8}}>
            Sourced from UVM Proctor, Cornell Maple Program, and leading maple research.
          </div>
        </div>
      )}

      {/* ── Results ── */}
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {displayList.map(entry=>(
          <SageCard key={entry.id} entry={entry} expanded={expandedId===entry.id}
            onToggle={()=>setExpandedId(expandedId===entry.id ? null : entry.id)}/>
        ))}
      </div>

      {searched && results.length===0 && (
        <div style={{textAlign:'center',padding:'48px 20px'}}>
          <div style={{fontSize:14,fontWeight:600,color:'#5a6a7a',marginBottom:6}}>No results found</div>
          <div style={{fontSize:12,color:'#3d5068'}}>Try different keywords, or browse a category above.</div>
        </div>
      )}
    </div>
  );
}

function SageCard({ entry, expanded, onToggle }) {
  const catColors = {
    biology:'#3fb950', tapping:'#f0883e', vacuum:'#58a6ff', ro:'#22d3ee',
    evaporation:'#f0883e', finishing:'#c990ff', weather:'#58a6ff',
    tree_health:'#3fb950', business:'#58a6ff', lines:'#8b949e', troubleshooting:'#f85149',
  };
  const CAT_LABELS = {
    biology:'Biology', tapping:'Tapping', vacuum:'Vacuum', ro:'R/O',
    evaporation:'Evaporation', finishing:'Finishing', weather:'Weather',
    tree_health:'Tree Health', business:'Business', lines:'Lines', troubleshooting:'Troubleshoot',
  };
  const color    = catColors[entry.cat] || '#8b949e';
  const catLabel = CAT_LABELS[entry.cat] || entry.cat;

  return (
    <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderLeft:`3px solid ${color}`,
      borderRadius:'0 10px 10px 0',overflow:'hidden'}}>
      <button onClick={onToggle}
        style={{width:'100%',textAlign:'left',padding:'13px 16px',background:'none',border:'none',
          cursor:'pointer',display:'flex',alignItems:'flex-start',gap:10}}>
        <div style={{flex:1}}>
          <div style={{marginBottom:4}}>
            <span style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.06em'}}>
              {catLabel}
            </span>
          </div>
          <div style={{fontSize:14,fontWeight:600,color:'#c9d1d9',lineHeight:1.4}}>{entry.q}</div>
          {!expanded && (
            <div style={{fontSize:12,color:'#5a6a7a',marginTop:4,lineHeight:1.55,
              overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
              {entry.a.substring(0,160)}…
            </div>
          )}
        </div>
        <span style={{fontSize:11,color:'#3d5068',marginTop:2,flexShrink:0,marginLeft:8}}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>
      {expanded && (
        <div style={{padding:'0 16px 16px',borderTop:'1px solid #1e2d3d'}}>
          <p style={{fontSize:13,lineHeight:1.8,color:'#8b949e',margin:'12px 0 14px'}}>{entry.a}</p>
          {entry.tip && (
            <div style={{borderLeft:`2px solid ${color}`,paddingLeft:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color,letterSpacing:'0.08em',marginBottom:4,textTransform:'uppercase'}}>Pro tip</div>
              <div style={{fontSize:12,color:'#8b949e',lineHeight:1.65}}>{entry.tip}</div>
            </div>
          )}
          <div style={{fontSize:10,color:'#3d5068',lineHeight:1.5,borderTop:'1px solid #1e2d3d',paddingTop:10,marginTop:4}}>
            <span style={{color:'#5a6a7a',fontWeight:600}}>Source: </span>{entry.src}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TUBING CALCULATOR TAB ────────────────────────────────────────────────────
function TInput({label, val, set, ph, unit, hint}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:'#5a6a7a',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <input
          value={val}
          onChange={e=>set(e.target.value)}
          onFocus={e=>{setFocused(true); e.target.select();}}
          onBlur={()=>setFocused(false)}
          placeholder={ph}
          type="text"
          inputMode="decimal"
          style={{flex:1,padding:'9px 12px',border:`1.5px solid ${focused?'#58a6ff':'#1e2d3d'}`,borderRadius:10,
            fontSize:15,outline:'none',fontFamily:'inherit',
            background:'#07090f',color:'#c9d1d9',transition:'border-color 0.15s'}}/>
        {unit && <span style={{fontSize:12,color:'#3d5068',whiteSpace:'nowrap',minWidth:40}}>{unit}</span>}
      </div>
      {hint && <div style={{fontSize:11,color:'#3d5068',marginTop:3,lineHeight:1.4}}>{hint}</div>}
    </div>
  );
}

function TubingTab({ trees }) {
  const [taps,      setTaps]      = React.useState(trees || '');
  const [mainLen,   setMainLen]   = React.useState('');
  const [grade,     setGrade]     = React.useState('');
  const [targetVac, setTargetVac] = React.useState('25');
  const [latTaps,   setLatTaps]   = React.useState('12');

  const calc = React.useMemo(() => {
    const t  = parseInt(taps)      || 0;
    const ml = parseFloat(mainLen) || 0;
    const g  = parseFloat(grade)   || 0;
    const tv = parseFloat(targetVac) || 25;
    const lt = parseInt(latTaps)   || 12;
    if (!t || !ml) return null;

    let ms, msLabel, msColor;
    if      (t <=  100) { ms='3/4"';  msLabel='3/4 inch (19mm)';  msColor='#3fb950'; }
    else if (t <=  300) { ms='1"';    msLabel='1 inch (25mm)';     msColor='#58a6ff'; }
    else if (t <=  600) { ms='1¼"';   msLabel='1¼ inch (32mm)';    msColor='#c990ff'; }
    else if (t <= 1200) { ms='1½"';   msLabel='1½ inch (38mm)';    msColor='#f0883e'; }
    else                { ms='2"';    msLabel='2 inch (50mm)';      msColor='#f85149'; }

    const diamFactor = {'3/4"':1.8,'1"':1.0,'1¼"':0.65,'1½"':0.45,'2"':0.25};
    const vacLoss  = ((ml/1000)*(diamFactor[ms]||1.0)*2).toFixed(1);
    const elevDrop = (ml*(g/100)).toFixed(0);
    const vacGain  = ((ml*g/100)/10*0.4).toFixed(1);
    const vacPump  = (tv + parseFloat(vacLoss) - parseFloat(vacGain)).toFixed(1);
    const numLat   = Math.ceil(t/lt);
    const latFtTot = (numLat*lt*8).toFixed(0);
    const cfm      = Math.ceil(t*0.05);
    const pump     = cfm<=10  ? '½ HP rotary vane (10 CFM)'
                   : cfm<=20  ? '1 HP rotary vane (20 CFM)'
                   : cfm<=40  ? '2 HP rotary vane (40 CFM)'
                   : cfm<=75  ? '3–5 HP rotary vane (75 CFM)'
                   :            `Large system (${cfm}+ CFM)`;
    return { ms, msLabel, msColor, vacLoss, vacGain, vacPump, elevDrop,
      numLat, latFtTot, cfm, pump,
      mainFt: Math.ceil(ml*1.1), latFt: Math.ceil(parseInt(latFtTot)*1.1),
      dropFt: t*4, tees: t, caps: numLat };
  }, [taps, mainLen, grade, targetVac, latTaps]);

  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:'0 0 80px'}}>

      {/* Header */}
      <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:16,padding:'18px 22px',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
          <div style={{width:42,height:42,background:'linear-gradient(135deg,#0d1a2b,#1e3a5f)',borderRadius:10,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
            border:'1px solid #1e3a5f',flexShrink:0}}>🔧</div>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:'#c9d1d9',letterSpacing:'-0.5px'}}>Tubing Calculator</div>
            <div style={{fontSize:11,color:'#3d5068',marginTop:1}}>Mainline sizing · Vacuum analysis · Materials estimator</div>
          </div>
        </div>
        <div style={{fontSize:11,color:'#3d5068',marginTop:2}}>Based on Cornell Maple Program & UVM Proctor research guidelines</div>
      </div>

      {/* Inputs */}
      <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:16,padding:20,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'#5a6a7a',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.08em'}}>📐 Your System</div>
        <TInput label="Total Taps"             val={taps}      set={setTaps}      ph="e.g. 500"  unit="taps"    hint="Total taps in this tubing system"/>
        <TInput label="Mainline Length"         val={mainLen}   set={setMainLen}   ph="e.g. 2000" unit="ft"      hint="From vacuum pump to farthest tap"/>
        <TInput label="Average Downhill Grade"  val={grade}     set={setGrade}     ph="e.g. 8"    unit="% slope" hint="Slope toward collection tank — provides natural vacuum assist"/>
        <TInput label="Target Vacuum at Tap"    val={targetVac} set={setTargetVac} ph="25"         unit="in Hg"   hint="High-vacuum systems typically target 25–27 in Hg"/>
        <TInput label="Taps per Lateral"        val={latTaps}   set={setLatTaps}   ph="12"         unit="taps"    hint="Taps per lateral run — 8–15 is typical for 5/16″ line"/>
      </div>

      {calc ? (<>

        {/* Mainline recommendation */}
        <div style={{background:'#0d1a2b',border:`1.5px solid ${calc.msColor}40`,borderLeft:`4px solid ${calc.msColor}`,
          borderRadius:'0 14px 14px 0',padding:20,marginBottom:14}} className="sage-fadein">
          <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.1em',marginBottom:12}}>RECOMMENDED MAINLINE SIZE</div>
          <div style={{display:'flex',alignItems:'center',gap:18}}>
            <div style={{width:72,height:72,borderRadius:'50%',
              background:`${calc.msColor}15`,border:`3px solid ${calc.msColor}`,
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              boxShadow:`0 0 20px ${calc.msColor}30`}}>
              <span style={{fontSize:20,fontWeight:900,color:calc.msColor}}>{calc.ms}</span>
            </div>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:calc.msColor}}>{calc.msLabel}</div>
              <div style={{fontSize:12,color:'#5a6a7a',marginTop:4}}>For {taps} taps · {mainLen} ft mainline · Cornell guidelines</div>
            </div>
          </div>
        </div>

        {/* Vacuum analysis */}
        <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:14,padding:20,marginBottom:14}} className="sage-fadein">
          <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.1em',marginBottom:14}}>VACUUM ANALYSIS</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:14}}>
            {[
              {label:'Target at Tap', val:`${targetVac}"`,      color:'#58a6ff'},
              {label:'Line Loss',     val:`−${calc.vacLoss}"`,  color:'#f85149'},
              {label:'Grade Assist',  val:`+${calc.vacGain}"`,  color:'#3fb950'},
            ].map(x=>(
              <div key={x.label} style={{textAlign:'center',background:'#07090f',borderRadius:10,padding:'12px 6px',border:`1px solid ${x.color}25`}}>
                <div style={{fontSize:24,fontWeight:900,color:x.color,textShadow:`0 0 12px ${x.color}40`}}>{x.val}</div>
                <div style={{fontSize:10,color:'#5a6a7a',marginTop:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{x.label}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 16px',background:'#07090f',borderRadius:10,border:'1px solid #1e2d3d',
            display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,fontWeight:600,color:'#8b949e'}}>Required pump vacuum:</span>
            <span style={{fontSize:22,fontWeight:900,
              color: parseFloat(calc.vacPump)>28?'#f85149':parseFloat(calc.vacPump)>24?'#f0883e':'#3fb950',
              textShadow: `0 0 12px ${parseFloat(calc.vacPump)>28?'#f8514960':'#3fb95060'}`}}>
              {calc.vacPump}" Hg
            </span>
          </div>
          {parseFloat(calc.vacPump)>27 && (
            <div style={{marginTop:10,padding:'9px 12px',background:'#1a0a0a',borderLeft:'3px solid #f85149',borderRadius:'0 8px 8px 0',fontSize:12,color:'#f85149',lineHeight:1.5}}>
              ⚠ Pump requirement is high — consider upgrading mainline diameter or adding a mid-line pump.
            </div>
          )}
          {parseFloat(calc.vacGain)>2 && (
            <div style={{marginTop:8,padding:'9px 12px',background:'#071a0e',borderLeft:'3px solid #3fb950',borderRadius:'0 8px 8px 0',fontSize:12,color:'#3fb950',lineHeight:1.5}}>
              ✓ Your {calc.elevDrop} ft elevation drop provides meaningful natural vacuum assist.
            </div>
          )}
        </div>

        {/* Laterals + Pump */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:14,padding:18}} className="sage-fadein">
            <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.1em',marginBottom:10}}>LATERAL LINES</div>
            <div style={{fontSize:32,fontWeight:900,color:'#c9d1d9',lineHeight:1}}>{calc.numLat}</div>
            <div style={{fontSize:11,color:'#5a6a7a',marginTop:2,marginBottom:8}}>lateral runs</div>
            <div style={{fontSize:20,fontWeight:800,color:'#8b949e'}}>{parseInt(calc.latFtTot).toLocaleString()} ft</div>
            <div style={{fontSize:11,color:'#5a6a7a'}}>total lateral footage</div>
          </div>
          <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:14,padding:18}} className="sage-fadein">
            <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.1em',marginBottom:10}}>VACUUM PUMP</div>
            <div style={{fontSize:28,marginBottom:6}}>💨</div>
            <div style={{fontSize:13,fontWeight:700,color:'#c9d1d9',lineHeight:1.4}}>{calc.pump}</div>
            <div style={{fontSize:11,color:'#5a6a7a',marginTop:4}}>{calc.cfm} CFM needed</div>
          </div>
        </div>

        {/* Materials */}
        <div style={{background:'#0d1a2b',border:'1px solid #1e2d3d',borderRadius:14,padding:20}} className="sage-fadein">
          <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.1em',marginBottom:14}}>MATERIALS ESTIMATE</div>
          {[
            { item:`Mainline tubing (${calc.ms})`, qty:`${calc.mainFt.toLocaleString()} ft`,  note:'Includes 10% waste',   color:'#58a6ff' },
            { item:'Lateral tubing (5/16")',        qty:`${calc.latFt.toLocaleString()} ft`,   note:'Includes 10% waste',   color:'#3fb950' },
            { item:'Drop lines (5/16")',             qty:`${calc.dropFt.toLocaleString()} ft`,  note:'~4 ft per tap',        color:'#3fb950' },
            { item:'Tee fittings',                  qty:calc.tees.toLocaleString(),             note:'1 per tap',            color:'#f0883e' },
            { item:'Lateral end caps',              qty:calc.caps.toLocaleString(),             note:'1 per lateral',        color:'#c990ff' },
          ].map((r,i)=>(
            <div key={r.item} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'10px 0',borderBottom:i<4?'1px solid #1e2d3d':'none'}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'#c9d1d9'}}>{r.item}</div>
                <div style={{fontSize:11,color:'#3d5068'}}>{r.note}</div>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:r.color}}>{r.qty}</div>
            </div>
          ))}
          <div style={{marginTop:12,fontSize:11,color:'#3d5068',lineHeight:1.65,borderTop:'1px solid #1e2d3d',paddingTop:10}}>
            Cornell Maple Program guidelines · 8 ft average tree spacing assumed · Consult your dealer for exact quantities.
          </div>
        </div>

      </>) : (
        <div style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:44,marginBottom:12}}>🔧</div>
          <div style={{fontSize:15,fontWeight:700,color:'#8b949e',marginBottom:6}}>Enter your system details above</div>
          <div style={{fontSize:12,color:'#3d5068',lineHeight:1.65,marginBottom:20}}>
            Mainline size, vacuum analysis, pump sizing, and materials list will appear instantly.
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
            {[['Small woodlot','200','800','6'],['Mid-size','500','2000','8'],['Large operation','1200','4000','10']].map(([label,t,ml,g])=>(
              <button key={label} onClick={()=>{setTaps(t);setMainLen(ml);setGrade(g);}}
                style={{padding:'7px 14px',borderRadius:20,border:'1.5px solid #1e2d3d',
                  background:'#0d1a2b',color:'#58a6ff',fontSize:12,cursor:'pointer',fontWeight:600,
                  transition:'all 0.15s'}}
                onMouseEnter={e=>{e.target.style.borderColor='#58a6ff';}}
                onMouseLeave={e=>{e.target.style.borderColor='#1e2d3d';}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SEASON RECAP TAB ─────────────────────────────────────────────────────────

// ─── SWEETRUN SCORE ────────────────────────────────────────────────────────────
function SweetRunScore({ sapGal, syrupGal, sapBrix, trees, fuelGal, season }) {
  const taps    = parseInt(trees) || 0;
  const brix    = parseFloat(sapBrix) || 2.0;
  const [copied, setCopied] = React.useState(false);

  // ── Sub-scores (each 0–100) ────────────────────────────────────────────
  const scores = [];

  // 1. Yield per tap (30 pts weight)
  let yieldScore = null, yieldLabel = '', yieldColor = '#3d5068';
  if (taps > 0 && syrupGal > 0) {
    const ypp = syrupGal / taps;
    yieldScore = Math.min(100, Math.round((ypp / 0.30) * 100));
    if (ypp >= 0.30) { yieldLabel = `${ypp.toFixed(2)} gal/tap — above benchmark`; yieldColor = '#3fb950'; }
    else if (ypp >= 0.20) { yieldLabel = `${ypp.toFixed(2)} gal/tap — near average`; yieldColor = '#f0883e'; }
    else { yieldLabel = `${ypp.toFixed(2)} gal/tap — below benchmark`; yieldColor = '#f85149'; }
    scores.push({ label:'Yield / Tap', score: yieldScore, weight:30, color: yieldColor, detail: yieldLabel });
  }

  // 2. Evaporation efficiency (25 pts weight)
  let effScore = null;
  if (sapGal > 0 && syrupGal > 0 && brix > 0) {
    const ratio = sapGal / syrupGal;
    const theoretical = 86.4 / brix;
    effScore = Math.min(100, Math.round((theoretical / ratio) * 100));
    const effColor = effScore >= 90 ? '#3fb950' : effScore >= 75 ? '#f0883e' : '#f85149';
    scores.push({ label:'Evap Efficiency', score: effScore, weight:25, color: effColor,
      detail: `${ratio.toFixed(0)}:1 actual vs ${theoretical.toFixed(0)}:1 theoretical` });
  }

  // 3. Fuel efficiency (20 pts weight)
  let fuelScore = null;
  if (fuelGal > 0 && syrupGal > 0) {
    const fr = fuelGal / syrupGal;
    fuelScore = Math.min(100, Math.round((1.0 / fr) * 100));
    const fuelColor = fuelScore >= 90 ? '#3fb950' : fuelScore >= 60 ? '#f0883e' : '#f85149';
    scores.push({ label:'Fuel Efficiency', score: fuelScore, weight:20, color: fuelColor,
      detail: `${fr.toFixed(2)} units/gal syrup` });
  }

  // 4. Ratio accuracy (15 pts weight)
  let ratioScore = null;
  if (sapGal > 0 && syrupGal > 0 && brix > 0) {
    const actual = sapGal / syrupGal;
    const theor  = 86.4 / brix;
    ratioScore = Math.min(100, Math.round((theor / actual) * 100));
    const ratioColor = ratioScore >= 90 ? '#3fb950' : ratioScore >= 70 ? '#f0883e' : '#f85149';
    scores.push({ label:'Ratio Accuracy', score: ratioScore, weight:15, color: ratioColor,
      detail:`${actual.toFixed(0)}:1 vs ${theor.toFixed(0)}:1 theoretical` });
  }

  // 5. Data completeness (10 pts weight) — rewards logging
  const dataPts = [sapGal>0, syrupGal>0, taps>0, fuelGal>0].filter(Boolean).length;
  const dataScore = Math.round((dataPts / 4) * 100);
  const dataColor = dataScore >= 75 ? '#3fb950' : dataScore >= 50 ? '#f0883e' : '#58a6ff';
  scores.push({ label:'Data Complete', score: dataScore, weight:10, color: dataColor,
    detail:`${dataPts}/4 tracked fields` });

  // ── Weighted overall ──────────────────────────────────────────────────
  const totalWeight = scores.reduce((s,x) => s + x.weight, 0);
  const weighted    = scores.reduce((s,x) => s + (x.score * x.weight), 0);
  const overall     = totalWeight > 0 ? Math.round(weighted / totalWeight) : 0;

  const grade = overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'F';
  const gradeColor = overall >= 90 ? '#3fb950' : overall >= 80 ? '#58a6ff' : overall >= 70 ? '#f0883e' : '#f85149';

  const shareText = `My ${season} maple season scored ${overall}/100 (${grade}) on SweetRun · sweetrun.app`;

  const copyShare = () => {
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (scores.length <= 1) return null;

  return (
    <div style={{background:'#07090f',border:'1px solid #1e2d3d',borderRadius:16,padding:'20px',marginBottom:14,overflow:'hidden',position:'relative'}}>
      {/* Glow behind grade */}
      <div style={{position:'absolute',top:-30,right:-20,width:140,height:140,borderRadius:'50%',
        background:gradeColor,opacity:0.06,filter:'blur(30px)',pointerEvents:'none'}}/>

      <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14}}>
        SweetRun Score — {season} Season
      </div>

      {/* Main score row */}
      <div style={{display:'flex',alignItems:'stretch',gap:16,marginBottom:18}}>
        {/* Big grade */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          minWidth:88,background:'#0d1a2b',borderRadius:14,padding:'14px 10px',
          border:`2px solid ${gradeColor}40`,flexShrink:0}}>
          <div style={{fontSize:52,fontWeight:900,color:gradeColor,lineHeight:1,
            textShadow:`0 0 30px ${gradeColor}70`}}>{grade}</div>
          <div style={{fontSize:28,fontWeight:800,color:gradeColor,lineHeight:1,marginTop:4}}>{overall}</div>
          <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.1em',marginTop:2}}>OUT OF 100</div>
        </div>

        {/* Score bars */}
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:8,justifyContent:'center'}}>
          {scores.map((s,i) => (
            <div key={i}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:3}}>
                <span style={{fontSize:10,color:'#5a6a7a',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</span>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:10,color:'#3d5068'}}>{s.detail}</span>
                  <span style={{fontSize:11,fontWeight:800,color:s.color,minWidth:28,textAlign:'right'}}>{s.score}</span>
                </div>
              </div>
              <div style={{height:5,background:'#1e2d3d',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${s.score}%`,background:s.color,borderRadius:3,
                  boxShadow:`0 0 8px ${s.color}50`,transition:'width 1s ease'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        borderTop:'1px solid #1e2d3d',paddingTop:12,gap:12}}>
        <div style={{fontSize:11,color:'#3d5068',flex:1,lineHeight:1.5}}>{shareText}</div>
        <button onClick={copyShare}
          style={{background: copied?'#3fb950':'#0d1a2b',border:`1px solid ${copied?'#3fb950':'#1e2d3d'}`,
            borderRadius:8,padding:'7px 14px',fontSize:11,fontWeight:700,
            color: copied?'#07090f':'#5a6a7a',cursor:'pointer',whiteSpace:'nowrap',
            transition:'all 0.2s',flexShrink:0}}>
          {copied ? 'Copied!' : 'Share Score'}
        </button>
      </div>
    </div>
  );
}

// ─── YIELD GAP ANALYZER ────────────────────────────────────────────────────────
function YieldGapAnalyzer({ sapGal, syrupGal, sapBrix, trees, season }) {
  const [pricePerGal, setPricePerGal] = React.useState(() => ls.get('sg_syrup_price', 40));
  const taps = parseInt(trees) || 0;
  const brix = parseFloat(sapBrix) || 2.0;

  if (!taps || !syrupGal) return null;

  const theoretical      = 86.4 / brix;                         // theoretical sap:syrup ratio
  const theorMaxSyrup    = taps * 0.30;                         // benchmark 0.30 gal/tap
  const theorMaxSyrupLow = taps * 0.25;                         // low benchmark
  const gapHigh = Math.max(0, theorMaxSyrup    - syrupGal);
  const gapLow  = Math.max(0, theorMaxSyrupLow - syrupGal);
  const gapMid  = (gapHigh + gapLow) / 2;
  const dollarGap = gapMid * pricePerGal;

  const actualRatio = sapGal > 0 && syrupGal > 0 ? sapGal / syrupGal : null;
  const effPct = actualRatio ? Math.min(100, Math.round((theoretical / actualRatio) * 100)) : null;
  const ypp    = syrupGal / taps;

  // ── Diagnose root causes ──────────────────────────────────────────────
  const causes = [];

  if (ypp < 0.20) {
    causes.push({
      severity: 'high',
      title: 'Critical: Low yield per tap',
      detail: `${ypp.toFixed(2)} gal/tap vs. 0.25–0.30 benchmark. This alone accounts for most of your gap.`,
      fixes: [
        { action: 'Check every lateral for micro-leaks at tee connections', cost: '$0', time: '2–4 hrs', impact: 'high' },
        { action: 'Replace standard spouts with check-valve spouts', cost: '~$80–120', time: '1 day', impact: 'high' },
        { action: 'Verify tap holes are in fresh white wood, not scarred tissue', cost: '$0', time: '1 hr', impact: 'medium' },
      ]
    });
  } else if (ypp < 0.25) {
    causes.push({
      severity: 'medium',
      title: 'Below-average yield per tap',
      detail: `${ypp.toFixed(2)} gal/tap is close but leaves ${((0.25 - ypp) * taps).toFixed(0)} gal/season on the table.`,
      fixes: [
        { action: 'Audit vacuum at 5 random taps with a gauge — look for >2" Hg variance', cost: '$0', time: '1 hr', impact: 'medium' },
        { action: 'Upgrade to check-valve spouts on your lowest-producing laterals', cost: '~$40–80', time: '2 hrs', impact: 'medium' },
      ]
    });
  }

  if (effPct !== null && effPct < 80) {
    causes.push({
      severity: 'high',
      title: 'Evaporator running below efficiency',
      detail: `Your ${actualRatio?.toFixed(0)}:1 ratio is ${(100-effPct).toFixed(0)}% below theoretical for ${brix}° Brix sap. Sap is taking too long to concentrate.`,
      fixes: [
        { action: 'Check float valve — evaporator level should stay consistent during boil', cost: '$0', time: '30 min', impact: 'high' },
        { action: 'Descale flue pan — niter buildup cuts evaporation rate significantly', cost: '~$20 acid wash', time: '2 hrs', impact: 'high' },
        { action: 'Verify draw-off timing — pulling too early dilutes density and lowers yield', cost: '$0', time: '30 min', impact: 'medium' },
      ]
    });
  } else if (effPct !== null && effPct < 90) {
    causes.push({
      severity: 'medium',
      title: 'Minor evaporation efficiency loss',
      detail: `${actualRatio?.toFixed(0)}:1 ratio is ${(100-effPct)}% below theoretical. Small gains available.`,
      fixes: [
        { action: 'Check float valve calibration and flue pan draw-off point', cost: '$0', time: '1 hr', impact: 'medium' },
      ]
    });
  }

  if (sapGal > 0 && syrupGal > 0 && sapGal / syrupGal > theoretical * 1.15) {
    causes.push({
      severity: 'medium',
      title: 'Consider RO to cut boil time and fuel',
      detail: `Pre-concentrating sap from ${brix}° to 8°Brix with a single-pass RO reduces boiling water by ~70%.`,
      fixes: [
        { action: 'Single-pass RO system (CDL, Leader, H2O Innovation)', cost: '$8,000–$18,000', time: 'Off-season install', impact: 'very high' },
        { action: 'Custom RO build (DIY membranes + pump)', cost: '$2,000–$4,000', time: 'Off-season project', impact: 'high' },
      ]
    });
  }

  if (causes.length === 0) {
    causes.push({
      severity: 'low',
      title: 'Your operation is performing well',
      detail: `Yield and efficiency are at or near benchmark. Focus on consistency and scaling.`,
      fixes: [
        { action: 'Document tap placement, vacuum readings, and best-run conditions for next year', cost: '$0', time: 'Ongoing', impact: 'high' },
      ]
    });
  }

  const sevColor = s => s==='high'?'#f85149':s==='medium'?'#f0883e':s==='low'?'#3fb950':'#58a6ff';

  return (
    <div style={{background:'#07090f',border:'1px solid #1e2d3d',borderRadius:16,padding:'20px',marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:16}}>
        Yield Gap Analyzer — {season} Season
      </div>

      {/* Gap visual */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
        <div style={{background:'#0d1a2b',borderRadius:12,padding:'14px 10px',textAlign:'center',border:'1px solid #3fb95040'}}>
          <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.08em',marginBottom:6}}>YOU MADE</div>
          <div style={{fontSize:28,fontWeight:900,color:'#3fb950',lineHeight:1}}>{syrupGal.toFixed(1)}</div>
          <div style={{fontSize:11,color:'#5a6a7a',marginTop:2}}>gallons</div>
        </div>
        <div style={{background:'#0d1a2b',borderRadius:12,padding:'14px 10px',textAlign:'center',border:'1px solid #58a6ff40'}}>
          <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.08em',marginBottom:6}}>BENCHMARK</div>
          <div style={{fontSize:28,fontWeight:900,color:'#58a6ff',lineHeight:1}}>{theorMaxSyrupLow.toFixed(0)}–{theorMaxSyrup.toFixed(0)}</div>
          <div style={{fontSize:11,color:'#5a6a7a',marginTop:2}}>at 0.25–0.30/tap</div>
        </div>
        <div style={{background:'#0d1a2b',borderRadius:12,padding:'14px 10px',textAlign:'center',
          border:`1px solid ${gapMid > 0 ? '#f0883e40' : '#3fb95040'}`}}>
          <div style={{fontSize:9,color:'#3d5068',fontWeight:700,letterSpacing:'0.08em',marginBottom:6}}>
            {gapMid > 0 ? 'GAP' : 'SURPLUS'}
          </div>
          <div style={{fontSize:28,fontWeight:900,lineHeight:1,
            color: gapMid > 0 ? '#f0883e' : '#3fb950'}}>
            {gapMid > 0 ? `~${gapMid.toFixed(0)}` : `+${Math.abs(gapLow).toFixed(0)}`}
          </div>
          <div style={{fontSize:11,color:'#5a6a7a',marginTop:2}}>gallons</div>
        </div>
      </div>

      {/* Dollar impact */}
      {gapMid > 2 && (
        <div style={{background:'linear-gradient(135deg,#1a0a0a,#2b1010)',border:'1px solid #f0883e30',
          borderRadius:12,padding:'14px 16px',marginBottom:16,
          display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'#f0883e',marginBottom:3}}>
              That gap costs approximately
            </div>
            <div style={{fontSize:11,color:'#5a6a7a',lineHeight:1.5}}>
              Based on ${pricePerGal}/gal retail · adjust below
            </div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontSize:32,fontWeight:900,color:'#f0883e',
              textShadow:'0 0 20px #f0883e60'}}>${Math.round(dollarGap).toLocaleString()}</div>
            <div style={{fontSize:10,color:'#3d5068',marginTop:2}}>per season</div>
          </div>
        </div>
      )}

      {/* Price input */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,
        background:'#0d1a2b',borderRadius:10,padding:'10px 14px',border:'1px solid #1e2d3d'}}>
        <span style={{fontSize:11,color:'#5a6a7a',whiteSpace:'nowrap'}}>Your retail price per gallon ($)</span>
        <input type="number" value={pricePerGal}
          onChange={e=>{const v=parseFloat(e.target.value)||40; setPricePerGal(v); ls.set('sg_syrup_price',v);}}
          style={{width:70,background:'#07090f',border:'1px solid #1e2d3d',borderRadius:8,
            padding:'6px 10px',color:'#c9d1d9',fontSize:13,outline:'none',textAlign:'center'}}/>
      </div>

      {/* Gap bar */}
      {gapMid > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#3d5068',marginBottom:4}}>
            <span>0 gal</span>
            <span>Benchmark {theorMaxSyrup.toFixed(0)} gal</span>
          </div>
          <div style={{height:12,background:'#1e2d3d',borderRadius:6,overflow:'hidden',position:'relative'}}>
            <div style={{height:'100%',width:`${Math.min(100,(syrupGal/theorMaxSyrup)*100)}%`,
              background:'linear-gradient(90deg,#3fb950,#2dd4a7)',borderRadius:6}}/>
            <div style={{position:'absolute',top:0,right:0,height:'100%',
              width:`${Math.min(100,(gapHigh/theorMaxSyrup)*100)}%`,
              background:'repeating-linear-gradient(90deg,transparent,transparent 6px,#f0883e30 6px,#f0883e30 8px)',
              borderRight:'2px solid #f0883e'}}/>
          </div>
          <div style={{display:'flex',gap:16,marginTop:6,fontSize:10}}>
            <span style={{color:'#3fb950'}}>■ Your yield ({syrupGal.toFixed(1)} gal)</span>
            <span style={{color:'#f0883e'}}>■ Gap ({gapHigh.toFixed(0)} gal potential)</span>
          </div>
        </div>
      )}

      {/* Root cause analysis */}
      <div style={{fontSize:10,fontWeight:700,color:'#3d5068',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>
        Root Cause Analysis
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {causes.map((c,i) => (
          <CauseCard key={i} cause={c} sevColor={sevColor}/>
        ))}
      </div>
    </div>
  );
}

function CauseCard({ cause, sevColor }) {
  const [open, setOpen] = React.useState(false);
  const color = sevColor(cause.severity);
  return (
    <div style={{borderLeft:`3px solid ${color}`,background:'#0d1a2b',borderRadius:'0 10px 10px 0',overflow:'hidden'}}>
      <button onClick={()=>setOpen(v=>!v)}
        style={{width:'100%',textAlign:'left',padding:'10px 14px',background:'none',border:'none',cursor:'pointer',
          display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color,marginBottom:3}}>{cause.title}</div>
          <div style={{fontSize:11,color:'#5a6a7a',lineHeight:1.5}}>{cause.detail}</div>
        </div>
        <span style={{fontSize:10,color:'#3d5068',flexShrink:0,marginTop:2}}>{open?'▲':'▼'}</span>
      </button>
      {open && (
        <div style={{padding:'0 14px 12px',borderTop:'1px solid #1e2d3d'}}>
          <div style={{fontSize:9,fontWeight:700,color:'#3d5068',letterSpacing:'0.1em',textTransform:'uppercase',margin:'10px 0 8px'}}>
            Fix Priority
          </div>
          {cause.fixes.map((fix,j) => (
            <div key={j} style={{display:'flex',gap:10,padding:'8px 0',
              borderBottom: j < cause.fixes.length-1 ? '1px solid #131e2c' : 'none'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:'#c9d1d9',lineHeight:1.5,marginBottom:4}}>{fix.action}</div>
                <div style={{display:'flex',gap:12,fontSize:10,color:'#3d5068'}}>
                  <span>Cost: <span style={{color:'#8b949e'}}>{fix.cost}</span></span>
                  <span>Time: <span style={{color:'#8b949e'}}>{fix.time}</span></span>
                </div>
              </div>
              <div style={{flexShrink:0,textAlign:'right'}}>
                <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',
                  color: fix.impact==='very high'?'#3fb950':fix.impact==='high'?'#58a6ff':fix.impact==='medium'?'#f0883e':'#3d5068'}}>
                  {fix.impact} impact
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecapTab({ season, units, sapBrix, trees=0, lang='en' }) {
  const [operatorName, setOperatorName] = React.useState(() => ls.get('sg_operator', ''));
  const saveOp = v => { setOperatorName(v); ls.set('sg_operator', v); };

  // ── RO Savings inputs ─────────────────────────────────────────────────────
  const [recapEvapRate,  setRecapEvapRate]  = React.useState(() => ls.get('sg_recap_evap',   50));
  const [burnLbsHr,      setBurnLbsHr]      = React.useState(() => ls.get('sg_recap_burn',   23));
  const [hasPreheater,   setHasPreheater]   = React.useState(() => ls.get('sg_recap_preheat', false));
  const [recapRoBrix,    setRecapRoBrix]    = React.useState(() => ls.get('sg_dx_robrix',     8));
  const [showROInputs,   setShowROInputs]   = React.useState(false);
  const saveR = (key, setter) => v => { setter(v); ls.set(key, v); };

  // ── Pull data ─────────────────────────────────────────────────────────────
  const allLogs    = ls.get('sg_logs2', {});
  const slog       = allLogs[season]      || {};
  const prevLog    = allLogs[season - 1]  || {};
  const brixArr    = ls.get('sg_brixlog', []);
  const uLbl       = units === 'GAL' ? 'gal' : 'L';

  const sumLog = arr => (arr || []).reduce((s, e) => s + (parseFloat(e.val) || 0), 0);
  const sapGal    = sumLog(slog.sapCollected);
  const syrupGal  = sumLog(slog.syrupMade);
  const roGal     = sumLog(slog.sapRO);
  const evapGal   = sumLog(slog.sapEvap);
  const fuelGal   = sumLog(slog.fuelUsed);
  const prevSap   = sumLog(prevLog.sapCollected);
  const prevSyrup = sumLog(prevLog.syrupMade);

  const theorRatio  = sapBrix > 0 ? (86 / sapBrix) : 0;
  const actualRatio = syrupGal > 0 ? sapGal / syrupGal : 0;

  // Best single collection day
  const sapEntries = [...(slog.sapCollected || [])].sort((a, b) => (parseFloat(b.val)||0) - (parseFloat(a.val)||0));
  const bestDay    = sapEntries[0];

  // Season span from log entry dates
  const allDates = [...(slog.sapCollected||[]), ...(slog.syrupMade||[])].map(e=>e.date).filter(Boolean).sort();
  const firstDate = allDates[0] || null;
  const lastDate  = allDates[allDates.length-1] || null;
  const parseDate = s => { try { return new Date(s); } catch { return null; } };
  const seasonDays = (firstDate && lastDate)
    ? Math.round((parseDate(lastDate) - parseDate(firstDate)) / 86400000) + 1 : null;

  // Brix stats from brixLog
  const bVals  = brixArr.map(e => parseFloat(e.brix)).filter(v => !isNaN(v) && v > 0);
  const avgBrix = bVals.length > 0 ? bVals.reduce((s,v)=>s+v,0)/bVals.length : null;
  const maxBrix = bVals.length > 0 ? Math.max(...bVals) : null;
  const minBrix = bVals.length > 0 ? Math.min(...bVals) : null;

  // YoY
  const sapChg   = prevSap   > 0 ? ((sapGal   - prevSap)   / prevSap   * 100) : null;
  const syrupChg = prevSyrup > 0 ? ((syrupGal - prevSyrup) / prevSyrup * 100) : null;

  const hasData = sapGal > 0 || syrupGal > 0;

  // ── SVG Sap Collection Bar Chart ─────────────────────────────────────────
  const SapChart = () => {
    const entries = (slog.sapCollected || [])
      .map(e => ({ date: e.date, val: parseFloat(e.val)||0 }))
      .filter(e => e.val > 0)
      .sort((a,b) => (a.date||'') < (b.date||'') ? -1 : 1);
    if (entries.length === 0) return null;
    const W = 320, H = 90, PAD = 4;
    const maxVal = Math.max(...entries.map(e=>e.val), 1);
    const barW   = Math.max(2, Math.floor((W - PAD*2) / entries.length) - 2);
    const gap    = (W - PAD*2 - barW * entries.length) / Math.max(entries.length - 1, 1);
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H+16}`} style={{ display:'block', overflow:'visible' }}>
        {entries.map((e, i) => {
          const barH  = Math.max(2, Math.round((e.val / maxVal) * H));
          const x     = PAD + i * (barW + gap);
          const y     = H - barH;
          const isBest = e.val === maxVal;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH}
                fill={isBest ? '#2dd4a7' : 'rgba(45,212,167,0.35)'}
                rx={barW > 4 ? 2 : 0} />
              {isBest && (
                <text x={x + barW/2} y={y - 3} fontSize="9" fill="#2dd4a7"
                  textAnchor="middle" fontWeight="700">{e.val.toFixed(0)}</text>
              )}
            </g>
          );
        })}
        {/* Axis label */}
        <text x={PAD} y={H+14} fontSize="9" fill="#3d5068">{firstDate}</text>
        {lastDate !== firstDate && (
          <text x={W-PAD} y={H+14} fontSize="9" fill="#3d5068" textAnchor="end">{lastDate}</text>
        )}
      </svg>
    );
  };

  // ── Brix Sparkline ───────────────────────────────────────────────────────
  const BrixLine = () => {
    if (bVals.length < 2) return null;
    const W = 320, H = 50;
    const mn = Math.min(...bVals) - 0.2, mx = Math.max(...bVals) + 0.2, rng = mx - mn || 1;
    const pts = bVals.map((v, i) => {
      const x = (i / (bVals.length - 1)) * W;
      const y = H - ((v - mn) / rng) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H+4}`} style={{ display:'block' }}>
        <polyline points={pts} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
        {bVals.map((v, i) => {
          const x = (i / (bVals.length - 1)) * W;
          const y = H - ((v - mn) / rng) * H;
          return <circle key={i} cx={x} cy={y} r="3" fill="#a78bfa" />;
        })}
      </svg>
    );
  };

  // ── Stat card ──────────────────────────────────────────────────────────────
  const Stat = ({ val, lbl, sub, accent='#2dd4a7' }) => (
    <div className="recap-stat-card" style={{ background:'#0d1a2b', border:'1px solid #1a304a', borderRadius:12, padding:'12px 10px', textAlign:'center' }}>
      <div className="recap-stat-val" style={{ fontSize:22, fontWeight:800, color:accent, lineHeight:1.1 }}>{val}</div>
      <div className="recap-stat-lbl" style={{ fontSize:11, color:'#8a9ab0', fontWeight:600, marginTop:2 }}>{lbl}</div>
      {sub && <div style={{ fontSize:10, color:'#3d5068', marginTop:2 }}>{sub}</div>}
    </div>
  );

  const Sec = ({ title, children, icon }) => (
    <div className="recap-section" style={{ background:'#0d1a2b', border:'1px solid #1a304a', borderRadius:14, padding:'14px 16px', marginBottom:12 }}>
      <div style={{ fontSize:11, fontWeight:700, color:'#3d5068', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
        {icon}{title}
      </div>
      {children}
    </div>
  );

  const YoYBadge = ({ pct, label }) => {
    if (pct === null) return null;
    const up = pct >= 0;
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #131e2c' }}>
        <span style={{ fontSize:13, color:'#8a9ab0' }}>{label}</span>
        <span className={up ? 'recap-yoy-up' : 'recap-yoy-dn'}
          style={{ fontWeight:700, fontSize:14, color: up ? '#2dd4a7' : '#f85149' }}>
          {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="recap-printable" style={{ padding:'16px 14px 60px' }}>

      {/* ── Print header (only visible on print) ── */}
      <div style={{ display:'none' }} className="recap-print-header">
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:26, fontWeight:800 }}>🍁 {season} Maple Season Recap</div>
          {operatorName && <div style={{ fontSize:15, color:'#444', marginTop:4 }}>{operatorName}</div>}
          <div style={{ fontSize:12, color:'#666', marginTop:2 }}>Generated by SweetRun · sweetrun.app</div>
        </div>
      </div>

      {/* ── Screen header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <div className="recap-header" style={{ fontWeight:800, fontSize:20, lineHeight:1.2 }}>{season} {lang==='fr'?'Bilan de saison':'Season Recap'}</div>
          <div className="recap-sub" style={{ fontSize:13, color:'#5a6a7a', marginTop:2 }}>{t(lang,'recapSub')}</div>
        </div>
        <button
          className="recap-print-btn"
          onClick={() => window.print()}
          style={{ background:'linear-gradient(135deg,#2dd4a7,#1fbf94)', border:'none', borderRadius:10, padding:'8px 14px', fontWeight:700, fontSize:13, color:'#07090f', cursor:'pointer', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}
        >
          <I.download size={15} color="#07090f" /> {t(lang,'exportPDF')}
        </button>
      </div>

      {/* ── Operator name input ── */}
      <div className="recap-no-print" style={{ marginBottom:14 }}>
        <input
          type="text"
          value={operatorName}
          onChange={e => saveOp(e.target.value)}
          placeholder={t(lang,'operatorPh')}
          style={{ width:'100%', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:10, padding:'8px 12px', color:'#e2eaf4', fontSize:13, boxSizing:'border-box' }}
        />
      </div>

      {!hasData && (
        <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:'14px 16px', fontSize:13, color:'#f59e0b', lineHeight:1.5, marginBottom:16 }}>
          ⚠️ {t(lang,'noDataMsgRecap').replace('{year}',season)}
        </div>
      )}

      {hasData && <SweetRunScore sapGal={sapGal} syrupGal={syrupGal} sapBrix={sapBrix} trees={parseInt(trees)||0} fuelGal={fuelGal} season={season} />}
      {hasData && <YieldGapAnalyzer sapGal={sapGal} syrupGal={syrupGal} sapBrix={sapBrix} trees={parseInt(trees)||0} season={season} />}

      {/* ── Big 4 stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <Stat val={sapGal > 0 ? sapGal.toLocaleString('en-US',{maximumFractionDigits:1}) : '—'} lbl={`${t(lang,'totalSapLbl')} (${uLbl})`} sub={`${(slog.sapCollected||[]).length} ${(slog.sapCollected||[]).length!==1?t(lang,'collectionPlur'):t(lang,'collectionSing')}`} />
        <Stat val={syrupGal > 0 ? syrupGal.toFixed(1) : '—'} lbl={`${t(lang,'syrupMadeLbl')} (${uLbl})`} sub={`${(slog.syrupMade||[]).length} ${(slog.syrupMade||[]).length!==1?t(lang,'batchPlur'):t(lang,'batchSing')}`} accent="#a78bfa" />
        <Stat val={actualRatio > 0 ? actualRatio.toFixed(1)+':1' : '—'} lbl={t(lang,'actualRatioLbl')} sub={theorRatio > 0 ? `${t(lang,'theoryPrefix')} ${theorRatio.toFixed(1)}:1` : null} accent={actualRatio > 0 && theorRatio > 0 && actualRatio <= theorRatio * 1.15 ? '#2dd4a7' : '#f59e0b'} />
        <Stat val={seasonDays != null ? `${seasonDays}d` : '—'} lbl={t(lang,'seasonLengthLbl')} sub={firstDate && lastDate ? `${firstDate} – ${lastDate}` : null} accent="#58a6ff" />
      </div>

      {/* ── Secondary stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
        <Stat val={bestDay ? bestDay.val+'' : '—'} lbl={`${t(lang,'bestRunLbl')} (${uLbl})`} sub={bestDay?.date || null} accent="#f59e0b" />
        <Stat val={roGal > 0 ? roGal.toFixed(0) : '—'} lbl={`${t(lang,'rodLbl')} (${uLbl})`} sub={roGal > 0 && evapGal > 0 ? `${(roGal/evapGal*100).toFixed(0)}% util` : null} accent="#2dd4a7" />
        <Stat val={avgBrix != null ? avgBrix.toFixed(2)+'°' : sapBrix+'°'} lbl={t(lang,'avgBrixLbl')} sub={maxBrix != null ? `${minBrix?.toFixed(2)}–${maxBrix?.toFixed(2)}°` : t(lang,'estimatedLbl')} accent="#a78bfa" />
      </div>

      {/* ── Sap collection chart ── */}
      {(slog.sapCollected||[]).length > 1 && (
        <Sec title={t(lang,'sapCollByRun')} icon={<I.droplet size={12} color="#2dd4a7"/>}>
          <SapChart />
          <div style={{ fontSize:11, color:'#3d5068', marginTop:6 }}>
            {t(lang,'peakRunNote')}
          </div>
        </Sec>
      )}

      {/* ── Brix trend ── */}
      {bVals.length >= 2 && (
        <Sec title={t(lang,'sapBrixTrend')} icon={<I.percent size={12} color="#a78bfa"/>}>
          <BrixLine />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#5a6a7a', marginTop:6 }}>
            <span>{t(lang,'lowLbl')}: {minBrix?.toFixed(2)}°Bx</span>
            <span>{t(lang,'avgLbl')}: {avgBrix?.toFixed(2)}°Bx</span>
            <span>{t(lang,'highLbl')}: {maxBrix?.toFixed(2)}°Bx</span>
          </div>
        </Sec>
      )}

      {/* ── Year-over-year ── */}
      {(sapChg !== null || syrupChg !== null) && (
        <Sec title={t(lang,'vsLastSeason').replace('{year}',season-1)} icon={<I.trendUp size={12} color="#58a6ff"/>}>
          <YoYBadge pct={sapChg}   label={`${t(lang,'sapCollectedLbl')} (${uLbl})`} />
          <YoYBadge pct={syrupChg} label={`${t(lang,'syrupProducedLbl')} (${uLbl})`} />
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, fontSize:12, color:'#3d5068' }}>
            <span>{season-1}: {prevSap.toFixed(1)} gal sap / {prevSyrup.toFixed(1)} gal syrup</span>
          </div>
        </Sec>
      )}

      {/* ── Conversion notes ── */}
      {actualRatio > 0 && theorRatio > 0 && (
        <Sec title={t(lang,'convEfficiency')} icon={<I.scale size={12} color="#f59e0b"/>}>
          <div style={{ display:'flex', gap:12, justifyContent:'space-between', marginBottom:8 }}>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:18, fontWeight:800, color: actualRatio <= theorRatio*1.12 ? '#2dd4a7' : '#f59e0b' }}>{actualRatio.toFixed(1)}:1</div>
              <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'actualRatioShort')}</div>
            </div>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:18, fontWeight:800, color:'#8a9ab0' }}>{theorRatio.toFixed(1)}:1</div>
              <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'rule86Lbl')} ({sapBrix}°Brix)</div>
            </div>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:18, fontWeight:800, color: actualRatio <= theorRatio*1.12 ? '#2dd4a7' : '#f59e0b' }}>
                {actualRatio > 0 ? ((actualRatio - theorRatio)/theorRatio*100).toFixed(0) : '—'}%
              </div>
              <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'vsTheoretical')}</div>
            </div>
          </div>
          {actualRatio > theorRatio * 1.15 && (
            <div style={{ fontSize:12, color:'#f59e0b', lineHeight:1.5 }}>
              Your ratio is {((actualRatio - theorRatio)/theorRatio*100).toFixed(0)}% above theoretical — check for foam loss, evaporator leaks, or thin drawoff.
            </div>
          )}
        </Sec>
      )}

      {/* ── RO Savings Chart ── */}
      {sapGal > 0 && recapEvapRate > 0 && (() => {
        // Straight-boil: boil all the sap at evap rate
        const straightHrs  = sapGal / recapEvapRate;
        const straightWood = straightHrs * burnLbsHr;

        // With RO: concentrate the ro'd portion, then boil
        const roConc      = recapRoBrix > sapBrix && roGal > 0
          ? roGal * (sapBrix / recapRoBrix)   // RO reduces volume proportionally
          : roGal;
        const roReducedSap = (sapGal - roGal) + roConc;
        const preH         = hasPreheater ? 0.85 : 1.0;  // preheater saves ~15% boil time
        const roHrs        = (roReducedSap / recapEvapRate) * preH;
        const roWood       = roHrs * burnLbsHr * (hasPreheater ? 0.88 : 1.0);

        const savedHrs  = straightHrs - roHrs;
        const savedWood = straightWood - roWood;

        const maxHrs  = Math.max(straightHrs, 0.1);
        const maxWood = Math.max(straightWood, 0.1);
        const W = 280;

        const Bar = ({ label, value, max, color, unit, secondary }) => {
          const pct = Math.min(1, value / max);
          const BAR_W = Math.round(W * pct);
          return (
            <div style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8a9ab0', marginBottom:3 }}>
                <span style={{ fontWeight:600 }}>{label}</span>
                <span style={{ color, fontWeight:700 }}>{value >= 10 ? value.toFixed(0) : value.toFixed(1)} {unit}</span>
              </div>
              <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:4, height:16, overflow:'hidden' }}>
                <div style={{ width: BAR_W, height:'100%', background: color, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:4 }}>
                </div>
              </div>
              {secondary && <div style={{ fontSize:11, color:'#3d5068', marginTop:2, textAlign:'right' }}>{secondary}</div>}
            </div>
          );
        };

        return (
          <Sec title={t(lang,'roSavingsVsBoil')} icon={<I.filter size={12} color="#58a6ff"/>}>
            {/* Inputs toggle */}
            <div style={{ marginBottom:12 }}>
              <button onClick={() => setShowROInputs(s=>!s)}
                style={{ background:'none', border:'none', color:'#3d5068', fontSize:12, cursor:'pointer', textDecoration:'underline', padding:0 }}>
                {showROInputs ? `▲ ${t(lang,'hideInputs')}` : `▼ ${t(lang,'adjustInputs')}`}
              </button>
              {showROInputs && (
                <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div>
                    <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>{t(lang,'evapRateInput')}</div>
                    <input type="number" value={recapEvapRate} min={1} max={500} step={5}
                      onChange={e => saveR('sg_recap_evap', setRecapEvapRate)(parseFloat(e.target.value)||50)}
                      style={{ width:'100%', boxSizing:'border-box', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:8, padding:'6px 10px', color:'#e2eaf4', fontSize:13 }} />
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>{t(lang,'woodBurnInput')}</div>
                    <input type="number" value={burnLbsHr} min={5} max={100} step={1}
                      onChange={e => saveR('sg_recap_burn', setBurnLbsHr)(parseFloat(e.target.value)||23)}
                      style={{ width:'100%', boxSizing:'border-box', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:8, padding:'6px 10px', color:'#e2eaf4', fontSize:13 }} />
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:3 }}>{t(lang,'roBrixInput')}</div>
                    <input type="number" value={recapRoBrix} min={1} max={20} step={0.5}
                      onChange={e => saveR('sg_dx_robrix', setRecapRoBrix)(parseFloat(e.target.value)||8)}
                      style={{ width:'100%', boxSizing:'border-box', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:8, padding:'6px 10px', color:'#e2eaf4', fontSize:13 }} />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:18 }}>
                    <input type="checkbox" id="preheat-chk" checked={hasPreheater}
                      onChange={e => saveR('sg_recap_preheat', setHasPreheater)(e.target.checked)}
                      style={{ accentColor:'#58a6ff', width:16, height:16 }} />
                    <label htmlFor="preheat-chk" style={{ fontSize:13, color:'#8a9ab0', cursor:'pointer' }}>{t(lang,'preheaterLbl')}</label>
                  </div>
                </div>
              )}
            </div>

            {/* Boil time bars */}
            <div style={{ fontSize:11, fontWeight:700, color:'#3d5068', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6 }}>{t(lang,'boilTimeLbl')}</div>
            <Bar label={t(lang,'straightBoilLbl')} value={straightHrs} max={maxHrs} color="#f85149" unit="hrs" />
            <Bar label={hasPreheater?t(lang,'withROPreLbl'):t(lang,'withROLbl')} value={roHrs} max={maxHrs} color="#58a6ff" unit="hrs"
              secondary={roGal > 0 ? t(lang,'roConcentratedNote').replace('{ro}',roGal.toFixed(0)).replace('{conc}',roConc.toFixed(0)) : t(lang,'noRODataNote')} />

            {/* Wood bars */}
            <div style={{ fontSize:11, fontWeight:700, color:'#3d5068', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6, marginTop:14 }}>{t(lang,'woodUsedLbl')}</div>
            <Bar label={t(lang,'straightBoilLbl')} value={straightWood} max={maxWood} color="#f85149" unit="lbs" />
            <Bar label={hasPreheater?t(lang,'withROPreLbl'):t(lang,'withROLbl')} value={roWood} max={maxWood} color="#58a6ff" unit="lbs" />

            {/* Savings summary */}
            {savedHrs > 0 && (
              <div style={{ background:'rgba(45,212,167,0.08)', border:'1px solid rgba(45,212,167,0.25)', borderRadius:10, padding:'10px 14px', marginTop:14, display:'flex', gap:20, justifyContent:'center' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:'#2dd4a7' }}>{savedHrs.toFixed(0)} hrs</div>
                  <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'savedBoilingLbl')}</div>
                </div>
                <div style={{ width:1, background:'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:'#2dd4a7' }}>{savedWood >= 1000 ? (savedWood/1000).toFixed(1)+'k' : savedWood.toFixed(0)} lbs</div>
                  <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'woodSavedLbl')}</div>
                </div>
                <div style={{ width:1, background:'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:'#2dd4a7' }}>{(savedWood/2000).toFixed(2)}</div>
                  <div style={{ fontSize:11, color:'#5a6a7a' }}>{t(lang,'cordsSavedLbl')}</div>
                </div>
              </div>
            )}
            {roGal === 0 && (
              <div style={{ fontSize:12, color:'#3d5068', marginTop:8, lineHeight:1.5 }}>
                {t(lang,'logRONote')}
              </div>
            )}
          </Sec>
        );
      })()}

      {/* ── Per-point breakdown ── */}
      {(() => {
        const cpoints = ls.get('sg_cpoints', []);
        if (cpoints.length === 0) return null;
        const sapEntries = slog.sapCollected || [];
        const syrupEntries = slog.syrupMade || [];
        // Check if any entries are tagged
        const hasTagged = [...sapEntries, ...syrupEntries].some(e => e.point);
        if (!hasTagged) return null;
        const uLbl2 = units === 'GAL' ? 'gal' : 'L';
        return (
          <Sec title={t(lang,'byCollPoint')} icon={<I.circle size={12} color="#a78bfa"/>}>
            {cpoints.map(pt => {
              const ptSap   = sapEntries.filter(e => e.point === pt.id).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
              const ptSyrup = syrupEntries.filter(e => e.point === pt.id).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
              const ptRuns  = sapEntries.filter(e => e.point === pt.id).length;
              const ptRatio = ptSyrup > 0 ? (ptSap / ptSyrup).toFixed(1)+':1' : '—';
              return (
                <div key={pt.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #131e2c' }}>
                  <div style={{ width:11, height:11, borderRadius:'50%', background:pt.color, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#e2eaf4' }}>{pt.name}</div>
                    <div style={{ fontSize:12, color:'#5a6a7a', marginTop:2 }}>{ptRuns} {t(lang,'runsLbl')} · {t(lang,'ratioLbl')} {ptRatio}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, fontSize:15, color:pt.color }}>{ptSap.toFixed(1)} <span style={{ fontSize:11, fontWeight:400 }}>{uLbl2} {t(lang,'sapShort')}</span></div>
                    {ptSyrup > 0 && <div style={{ fontSize:12, color:'#8a9ab0' }}>{ptSyrup.toFixed(1)} {uLbl2} {t(lang,'syrupShort')}</div>}
                  </div>
                </div>
              );
            })}
            {/* Untagged / shared */}
            {(() => {
              const unSap   = sapEntries.filter(e => !e.point).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
              const unSyrup = syrupEntries.filter(e => !e.point).reduce((s,e)=>s+(parseFloat(e.val)||0),0);
              if (unSap === 0 && unSyrup === 0) return null;
              return (
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0' }}>
                  <div style={{ width:11, height:11, borderRadius:'50%', background:'#3d5068', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#5a6a7a' }}>Unassigned / shared</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#5a6a7a' }}>{unSap.toFixed(1)} {uLbl} sap</div>
                    {unSyrup > 0 && <div style={{ fontSize:12, color:'#3d5068' }}>{unSyrup.toFixed(1)} {uLbl} syrup</div>}
                  </div>
                </div>
              );
            })()}
          </Sec>
        );
      })()}

      {/* ── Footer / attribution ── */}
      <div style={{ textAlign:'center', marginTop:20, color:'#2d3d4d', fontSize:11 }}>
        Generated by SweetRun · {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

// ─── DIAGNOSE TAB (BETA) ──────────────────────────────────────────────────────
function DiagnoseTab({ season, trees, units, sapBrix, lang='en' }) {
  const [syrupPrice, setSyrupPrice] = React.useState(() => ls.get('sg_dx_price', 65));
  const [woodCost,   setWoodCost]   = React.useState(() => ls.get('sg_dx_wood',  80));
  const [laborRate,  setLaborRate]  = React.useState(() => ls.get('sg_dx_labor', 20));
  const [vacLevel,   setVacLevel]   = React.useState(() => ls.get('sg_dx_vac',   'gravity'));
  const [roOutBrix,  setRoOutBrix]  = React.useState(() => ls.get('sg_dx_robrix', 0));
  const [expanded,   setExpanded]   = React.useState({});
  const [findings,   setFindings]   = React.useState(null);
  const [ran,        setRan]        = React.useState(false);

  const save = (key, setter) => v => { setter(v); ls.set(key, v); };

  // ── Diagnostic engine ──────────────────────────────────────────────────────
  function runDiagnostics() {
    const allLogs  = ls.get('sg_logs2', {});
    const slog     = allLogs[season] || {};
    const prevLog  = allLogs[season - 1] || {};
    const brixLog  = ls.get('sg_brixlog', []);   // stored as flat array in SeasonTab
    const pins     = ls.get('sg_lines_pins', []);
    const results  = [];

    // Helper: sum an array of log entries
    const sumLog = arr => (arr || []).reduce((s, e) => s + (parseFloat(e.val) || 0), 0);
    const sapGal  = sumLog(slog.sapCollected);
    const roGal   = sumLog(slog.sapRO);
    const evapGal = sumLog(slog.sapEvap);
    const syrupGal = sumLog(slog.syrupMade);

    // ── 1. Yield-per-tap ────────────────────────────────────────────────────
    const numTrees = parseInt(trees) || 0;
    const tapCount = numTrees;  // simplified: 1 tap per tracked tree
    if (sapGal > 0 && tapCount > 0) {
      const yieldPerTap = sapGal / tapCount;
      // Benchmarks: gravity ~10-15 gal/tap, 15" vac ~20-28, high vac ~30-45
      const benchLow  = vacLevel === 'high' ? 30 : vacLevel === 'vac15' ? 20 : 10;
      const benchHigh = vacLevel === 'high' ? 45 : vacLevel === 'vac15' ? 28 : 15;
      const pct = Math.round(((yieldPerTap - benchLow) / (benchLow)) * 100);
      const gap = Math.max(0, benchLow - yieldPerTap);
      const potentialSyrup = gap * tapCount / (units === 'GAL' ? 86 / sapBrix : 86 / sapBrix * 3.785);
      const roiVal = potentialSyrup * syrupPrice;
      if (yieldPerTap < benchLow) {
        results.push({
          id: 'yield',
          severity: yieldPerTap < benchLow * 0.6 ? 'high' : 'medium',
          title: 'Low sap yield per tap',
          summary: `${yieldPerTap.toFixed(1)} gal/tap vs. ${benchLow}–${benchHigh} benchmark for your vacuum level.`,
          action: vacLevel === 'gravity'
            ? 'Consider upgrading to 15" vacuum tubing (3/16" laterals) — natural siphon can add 5–10 gal/tap with no electricity.'
            : 'Check for air leaks in lines, verify pump is pulling target inches, inspect check valves, and confirm taps are sealed.',
          effort: 'Medium',
          payback: roiVal > 0 ? `~$${roiVal.toFixed(0)} potential revenue this season` : null,
          roi: roiVal,
          details: [
            `Your operation: ${yieldPerTap.toFixed(1)} gal/tap`,
            `Benchmark for ${vacLevel === 'gravity' ? 'gravity' : vacLevel === 'vac15' ? '15" vacuum' : 'high vacuum'}: ${benchLow}–${benchHigh} gal/tap`,
            `Gap: ${gap.toFixed(1)} gal/tap × ${tapCount} taps = ${(gap * tapCount).toFixed(0)} gal sap lost`,
            `At ${rule86(sapBrix).toFixed(1)}:1 ratio = ${potentialSyrup.toFixed(1)} gal syrup × $${syrupPrice} = $${roiVal.toFixed(0)}`,
            'Source: UVM Proctor Maple Research Center, 2023 Vermont Maple Industry Stats',
          ],
        });
      } else {
        results.push({
          id: 'yield',
          severity: 'good',
          title: 'Yield per tap looks solid',
          summary: `${yieldPerTap.toFixed(1)} gal/tap is within or above the ${benchLow}–${benchHigh} benchmark.`,
          roi: 0,
        });
      }
    }

    // ── 2. Sap-to-syrup conversion ratio ───────────────────────────────────
    if (sapGal > 0 && syrupGal > 0) {
      const actualRatio = sapGal / syrupGal;
      const theorRatio  = rule86(sapBrix);
      const pctOff = ((actualRatio - theorRatio) / theorRatio) * 100;
      if (pctOff > 15) {
        const lostSyrup = (actualRatio - theorRatio) / (actualRatio * theorRatio) * sapGal;
        const roiVal = lostSyrup * syrupPrice;
        results.push({
          id: 'conversion',
          severity: pctOff > 35 ? 'high' : 'medium',
          title: 'Sap-to-syrup conversion worse than expected',
          summary: `Using ${actualRatio.toFixed(1)}:1 vs. theoretical ${theorRatio.toFixed(1)}:1 — ${pctOff.toFixed(0)}% more sap per gallon syrup.`,
          action: 'Check for: foam overflow during boil, equipment leaks, syrup drawn off too thin, or inaccurate volume tracking.',
          effort: 'Low',
          payback: `~${lostSyrup.toFixed(1)} gal syrup lost = $${roiVal.toFixed(0)}`,
          roi: roiVal,
          details: [
            `Your ratio: ${actualRatio.toFixed(1)}:1  |  Rule of 86 at ${sapBrix}°Brix: ${theorRatio.toFixed(1)}:1`,
            `Excess sap used: ${((actualRatio - theorRatio) * syrupGal).toFixed(0)} gal`,
            `Equivalent lost syrup: ~${lostSyrup.toFixed(1)} gal × $${syrupPrice} = $${roiVal.toFixed(0)}`,
            'Source: Cornell Maple Program, Sugar Maple Research & Extension',
          ],
        });
      } else {
        results.push({
          id: 'conversion',
          severity: 'good',
          title: 'Sap conversion ratio is on target',
          summary: `${actualRatio.toFixed(1)}:1 actual vs. ${theorRatio.toFixed(1)}:1 theoretical (${Math.abs(pctOff).toFixed(0)}% variance).`,
          roi: 0,
        });
      }
    }

    // ── 3. RO utilization ──────────────────────────────────────────────────
    if (roGal > 0 && evapGal > 0) {
      const roUtil = roGal / evapGal;
      if (roUtil < 0.7) {
        const potentialFuelSave = (evapGal - roGal) * 0.6 * (woodCost / 128); // cords saved estimate
        results.push({
          id: 'ro_util',
          severity: 'medium',
          title: 'RO underutilized relative to evaporator',
          summary: `Only ${(roUtil * 100).toFixed(0)}% of evaporator sap went through RO first. Target >90%.`,
          action: 'Pre-concentrate all incoming sap before evaporation. RO is your highest-ROI piece of equipment.',
          effort: 'Low',
          payback: `~${potentialFuelSave.toFixed(1)} cord wood saved = $${(potentialFuelSave * woodCost).toFixed(0)}`,
          roi: potentialFuelSave * woodCost,
          details: [
            `RO processed: ${roGal.toFixed(1)} gal  |  Evaporated: ${evapGal.toFixed(1)} gal`,
            `Gap: ${(evapGal - roGal).toFixed(1)} gal not RO'd`,
            `Running RO first reduces evaporation by 60–75%`,
            `Wood cost assumption: $${woodCost}/cord`,
            'Source: UVM Proctor — RO Energy Savings Analysis',
          ],
        });
      } else {
        results.push({
          id: 'ro_util',
          severity: 'good',
          title: 'RO utilization is strong',
          summary: `${(roUtil * 100).toFixed(0)}% of evaporator sap went through RO — great fuel savings.`,
          roi: 0,
        });
      }
    } else if (evapGal > 50 && roGal === 0) {
      const potentialSave = evapGal * 0.65 * (woodCost / 128);
      results.push({
        id: 'ro_util',
        severity: 'high',
        title: 'No RO usage detected',
        summary: `You evaporated ${evapGal.toFixed(1)} gal with no RO pre-concentration — significant fuel cost opportunity.`,
        action: 'A small RO system (e.g., 150 GPH) pays back in 1–3 seasons for operations over 500 taps. Consider renting before buying.',
        effort: 'High',
        payback: `~$${potentialSave.toFixed(0)}/season in wood costs at current evaporation volume`,
        roi: potentialSave,
        details: [
          `Total evaporated: ${evapGal.toFixed(1)} gal with no RO`,
          `RO reduces evaporation workload by 60–75%`,
          `Estimated wood saved: ${(evapGal * 0.65 / 128).toFixed(1)} cords × $${woodCost} = $${potentialSave.toFixed(0)}`,
          'Source: Maine Maple Producers Association — RO Economics Guide',
        ],
      });
    }

    // ── 4. RO output Brix ──────────────────────────────────────────────────
    const roBrix = parseFloat(roOutBrix) || 0;
    if (roBrix > 0) {
      if (roBrix < 6) {
        results.push({
          id: 'ro_brix',
          severity: 'medium',
          title: 'RO output Brix is low',
          summary: `${roBrix}°Brix out of RO. Target 8–12°Brix for best evaporator efficiency.`,
          action: 'Run a second pass, increase RO pressure, or slow feed rate. Check membrane condition if output is consistently low.',
          effort: 'Low',
          payback: 'Doubling output Brix halves evaporation time and fuel cost',
          roi: evapGal > 0 ? ((8 - roBrix) / roBrix) * evapGal * 0.5 * (woodCost / 128) * woodCost : 50,
          details: [
            `Current output: ${roBrix}°Brix  |  Target: 8–12°Brix`,
            'Low output Brix means membranes may need cleaning or replacement',
            'Ideal: two-pass RO to 12–16°Brix before evaporation',
            'Source: Cornell Maple Program — RO Optimization',
          ],
        });
      } else if (roBrix >= 6 && roBrix <= 14) {
        results.push({
          id: 'ro_brix',
          severity: 'good',
          title: 'RO output Brix is in a good range',
          summary: `${roBrix}°Brix is solid. Running above 10°Brix means excellent evaporator efficiency.`,
          roi: 0,
        });
      }
    }

    // ── 5. Vacuum level check ──────────────────────────────────────────────
    if (vacLevel === 'gravity' && tapCount >= 100) {
      const addlSap = tapCount * 8; // ~8 extra gal/tap with 15" vac
      const addlSyrup = addlSap / rule86(sapBrix);
      const roiVal = addlSyrup * syrupPrice;
      results.push({
        id: 'vacuum',
        severity: 'medium',
        title: 'Gravity system — vacuum upgrade opportunity',
        summary: `${tapCount} taps on gravity. Natural 3/16" siphon vacuum at this scale could add $${roiVal.toFixed(0)}/season.`,
        action: 'Upgrade laterals to 3/16" tubing to create natural siphon vacuum (12–15"). No pump or electricity needed. Best ROI upgrade for gravity operations.',
        effort: 'Medium',
        payback: `~$${roiVal.toFixed(0)}/season additional revenue from extra sap`,
        roi: roiVal,
        details: [
          `3/16" lateral tubing creates 12–15" natural vacuum via siphon effect`,
          `Benchmark gain: +6–10 gal/tap over standard gravity`,
          `${tapCount} taps × 8 gal estimate = ${addlSap} gal sap → ${addlSyrup.toFixed(1)} gal syrup`,
          `At $${syrupPrice}/gal = $${roiVal.toFixed(0)} additional revenue`,
          'Source: UVM Proctor — 3/16" Tubing Research (2015–2022)',
        ],
      });
    }

    // ── 6. Line grade check ────────────────────────────────────────────────
    const linesPins = pins.filter(p => p.type !== 'tank');
    const tankPins  = pins.filter(p => p.type === 'tank');
    if (linesPins.length >= 3 && tankPins.length >= 1) {
      const routeResults = ls.get('sg_lines_results', []);
      if (routeResults.length > 0) {
        const badLines = routeResults.filter(r => !r.goodFlow);
        const worstGrade = routeResults.reduce((min, r) => Math.min(min, r.minGrade || 0), 100);
        if (badLines.length > 0) {
          results.push({
            id: 'grades',
            severity: badLines.length > routeResults.length / 2 ? 'high' : 'medium',
            title: `${badLines.length} of ${routeResults.length} lines have flow problems`,
            summary: `Worst segment grade: ${worstGrade.toFixed(1)}%. Lines need ≥1% grade for reliable sap flow.`,
            action: 'Re-route problem lines to avoid flat or uphill sections. Consider a mid-line releaser, or add vacuum to compensate for flat terrain.',
            effort: 'High',
            payback: 'Proper grade prevents stale sap, bacterial growth, and lost collections',
            roi: badLines.length * tapCount * 2 * syrupPrice / routeResults.length,
            details: [
              `Lines analyzed: ${routeResults.length}  |  Problem lines: ${badLines.length}`,
              `Minimum acceptable grade: 1.0% (roughly 1 ft drop per 100 ft run)`,
              `Ideal grade: 2–5% — steeper is better for gravity flow`,
              `Flat or uphill sections cause sap to pool and ferment`,
              'Source: UVM Extension — Maple Tubing System Design Guide',
            ],
          });
        } else {
          results.push({
            id: 'grades',
            severity: 'good',
            title: 'Line grades look good',
            summary: `All ${routeResults.length} analyzed lines have adequate flow grade. Overall: ${worstGrade.toFixed(1)}% minimum.`,
            roi: 0,
          });
        }
      }
    }

    // ── 7. YoY comparison ─────────────────────────────────────────────────
    const prevSap   = sumLog(prevLog.sapCollected);
    const prevSyrup = sumLog(prevLog.syrupMade);
    if (sapGal > 0 && prevSap > 0) {
      const sapChg   = ((sapGal - prevSap) / prevSap) * 100;
      const syrupChg = prevSyrup > 0 ? ((syrupGal - prevSyrup) / prevSyrup) * 100 : null;
      const isDown = sapChg < -15;
      results.push({
        id: 'yoy',
        severity: isDown ? 'medium' : 'good',
        title: isDown ? `Sap volume down ${Math.abs(sapChg).toFixed(0)}% vs. last year` : `Sap volume up ${sapChg.toFixed(0)}% vs. last year`,
        summary: `${season}: ${sapGal.toFixed(1)} gal  vs.  ${season-1}: ${prevSap.toFixed(1)} gal (${sapChg > 0 ? '+' : ''}${sapChg.toFixed(0)}%)`,
        action: isDown ? 'Review tap timing, sap collection frequency, equipment downtime, and weather patterns. Bacterial growth from late tapping can reduce yield.' : null,
        effort: isDown ? 'Low investigation' : null,
        roi: isDown ? Math.abs(sapChg / 100 * sapGal / rule86(sapBrix) * syrupPrice) : 0,
        details: [
          `${season-1} sap: ${prevSap.toFixed(1)} gal  →  ${season} sap: ${sapGal.toFixed(1)} gal (${sapChg > 0 ? '+' : ''}${sapChg.toFixed(0)}%)`,
          syrupChg != null ? `Syrup: ${prevSyrup.toFixed(1)} → ${syrupGal.toFixed(1)} gal (${syrupChg > 0 ? '+' : ''}${syrupChg.toFixed(0)}%)` : 'No prior syrup data',
          'Year-over-year swings >20% may indicate tap timing, weather, or equipment issues',
          'Note: natural yield variation of ±15% is normal between seasons',
        ],
      });
    }

    // ── 8. Sap Brix trend ─────────────────────────────────────────────────
    const brixEntries = Array.isArray(brixLog) ? brixLog : [];
    if (brixEntries.length >= 3) {
      const avg  = brixEntries.reduce((s, e) => s + (parseFloat(e.brix) || 0), 0) / brixEntries.length;
      const late = brixEntries.slice(-3).reduce((s, e) => s + (parseFloat(e.brix) || 0), 0) / 3;
      const falling = late < avg * 0.85;
      if (falling) {
        results.push({
          id: 'brix_trend',
          severity: 'low',
          title: 'Sap Brix declining — season may be ending',
          summary: `Recent average ${late.toFixed(2)}°Brix vs. season avg ${avg.toFixed(2)}°Brix. Declining Brix often signals season close.`,
          action: 'When Brix drops below 1.5–1.8° consistently and nights stop freezing, consider pulling taps to prevent bark damage and bacterial buildup.',
          effort: 'Low',
          payback: 'Pulling taps at the right time prevents tree stress and preserves next year\'s yield',
          roi: 0,
          details: [
            `Season average: ${avg.toFixed(2)}°Brix  |  Last 3 readings avg: ${late.toFixed(2)}°Brix`,
            'Brix naturally declines as trees break dormancy',
            'Buddy sap (>1% green taste) is unacceptable for syrup',
            'Source: Maine MPA — When to Pull Taps',
          ],
        });
      } else {
        results.push({
          id: 'brix_trend',
          severity: 'good',
          title: 'Sap Brix is stable this season',
          summary: `${brixEntries.length} readings avg ${avg.toFixed(2)}°Brix. No concerning decline yet.`,
          roi: 0,
        });
      }
    }

    // ── 9. Labor efficiency ───────────────────────────────────────────────
    const collectionEntries = (slog.sapCollected || []).length;
    if (collectionEntries > 0 && syrupGal > 0 && laborRate > 0) {
      const estHours = collectionEntries * 2 + syrupGal * 0.5; // rough: 2h/collection + 30min/gal syrup
      const laborCost = estHours * laborRate;
      const revEstimate = syrupGal * syrupPrice;
      const laborPct = (laborCost / revEstimate) * 100;
      if (laborPct > 45) {
        results.push({
          id: 'labor',
          severity: 'low',
          title: 'Labor costs are a significant portion of revenue',
          summary: `Estimated ~${estHours.toFixed(0)} labor hours at $${laborRate}/hr = $${laborCost.toFixed(0)} (${laborPct.toFixed(0)}% of ~$${revEstimate.toFixed(0)} revenue).`,
          action: 'Look at bulk sales to sugarhouses, shared equipment co-ops, or automating collection scheduling. Vacuum systems with fewer collection trips improve labor per gallon.',
          effort: 'Medium',
          payback: 'Reducing labor to <30% of revenue is a common benchmark for profitability',
          roi: Math.max(0, laborCost - revEstimate * 0.3),
          details: [
            `Collection events logged: ${collectionEntries}  |  Syrup produced: ${syrupGal.toFixed(1)} gal`,
            `Labor estimate: ${estHours.toFixed(0)} hrs × $${laborRate}/hr = $${laborCost.toFixed(0)}`,
            `Revenue estimate: ${syrupGal.toFixed(1)} gal × $${syrupPrice} = $${revEstimate.toFixed(0)}`,
            `Labor as % of revenue: ${laborPct.toFixed(0)}%  |  Industry target: <30%`,
            'Source: USDA NASS Maple Syrup Production Survey',
          ],
        });
      } else {
        results.push({
          id: 'labor',
          severity: 'good',
          title: 'Labor costs look manageable',
          summary: `Est. ${estHours.toFixed(0)} hrs at $${laborRate}/hr is ${laborPct.toFixed(0)}% of estimated revenue — within range.`,
          roi: 0,
        });
      }
    }

    // ── Sort: high → medium → low → good, then by ROI descending ─────────
    const order = { high: 0, medium: 1, low: 2, good: 3 };
    results.sort((a, b) => {
      const od = (order[a.severity] || 3) - (order[b.severity] || 3);
      return od !== 0 ? od : (b.roi || 0) - (a.roi || 0);
    });

    setFindings(results);
    setRan(true);
  }

  // ── Severity styling ───────────────────────────────────────────────────────
  const sevStyle = {
    high:   { bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.35)',   dot:'#ef4444', label:'High Priority'   },
    medium: { bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.35)',  dot:'#f59e0b', label:'Opportunity'     },
    low:    { bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.35)',  dot:'#6366f1', label:'Watch'           },
    good:   { bg:'rgba(45,212,167,0.08)', border:'rgba(45,212,167,0.25)', dot:'#2dd4a7', label:'Looking Good'    },
  };

  const Card = ({ f }) => {
    const s = sevStyle[f.severity] || sevStyle.good;
    const open = expanded[f.id];
    return (
      <div style={{ background: s.bg, border:`1px solid ${s.border}`, borderRadius:14, marginBottom:10, overflow:'hidden' }}>
        <button
          onClick={() => setExpanded(prev => ({ ...prev, [f.id]: !prev[f.id] }))}
          style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:'14px 16px', textAlign:'left', display:'flex', alignItems:'flex-start', gap:10 }}
        >
          <div style={{ width:10, height:10, borderRadius:'50%', background:s.dot, flexShrink:0, marginTop:4 }} />
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#e2eaf4', lineHeight:1.3 }}>{f.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                {f.roi > 0 && (
                  <span style={{ background:'rgba(45,212,167,0.15)', border:'1px solid rgba(45,212,167,0.3)', borderRadius:10, padding:'2px 8px', fontSize:11, fontWeight:700, color:'#2dd4a7' }}>
                    ${f.roi >= 1000 ? (f.roi/1000).toFixed(1)+'k' : f.roi.toFixed(0)} ROI
                  </span>
                )}
                <span style={{ background:'rgba(255,255,255,0.06)', borderRadius:8, padding:'2px 8px', fontSize:11, color:'#5a6a7a', fontWeight:600 }}>{s.label}</span>
                <I.chevDown size={14} color="#3d5068" style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'0.18s' }} />
              </div>
            </div>
            <div style={{ fontSize:12, color:'#8a9ab0', marginTop:4, lineHeight:1.5 }}>{f.summary}</div>
          </div>
        </button>
        {open && (
          <div style={{ borderTop:`1px solid ${s.border}`, padding:'14px 16px 16px', paddingLeft:36 }}>
            {f.action && (
              <div style={{ background:'rgba(45,212,167,0.08)', border:'1px solid rgba(45,212,167,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#2dd4a7', marginBottom:4 }}>Recommended Action</div>
                <div style={{ fontSize:13, color:'#c8d8e8', lineHeight:1.55 }}>{f.action}</div>
              </div>
            )}
            {f.payback && (
              <div style={{ fontSize:12, color:'#f59e0b', fontWeight:600, marginBottom:10 }}>
                💰 {f.payback}
              </div>
            )}
            {f.effort && (
              <div style={{ fontSize:12, color:'#5a6a7a', marginBottom:10 }}>
                <span style={{ color:'#8a9ab0', fontWeight:600 }}>Effort: </span>{f.effort}
              </div>
            )}
            {f.details && f.details.length > 0 && (
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:10, marginTop:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#3d5068', marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>Details & Sources</div>
                {f.details.map((d, i) => (
                  <div key={i} style={{ fontSize:12, color:'#6a7a8a', lineHeight:1.5, marginBottom:3, paddingLeft:8, borderLeft:'2px solid rgba(255,255,255,0.06)' }}>{d}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const hasLogs = (() => {
    const slog = (ls.get('sg_logs2', {}))[season] || {};
    return (slog.sapCollected || []).length > 0 || (slog.syrupMade || []).length > 0;
  })();

  return (
    <div style={{ padding:'16px 14px 40px' }}>
      <div style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>Diagnose My Operation</div>
      <div style={{ fontSize:13, color:'#5a6a7a', marginBottom:18, lineHeight:1.5 }}>
        Rule-based bottleneck analysis using your {season} log data and industry benchmarks.
      </div>

      {/* ── Inputs ── */}
      <div style={{ background:'#0d1a2b', border:'1px solid #1a304a', borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#3d5068', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>Operation Inputs</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:4 }}>Syrup price ($/gal)</div>
            <input type="number" value={syrupPrice} onChange={e => save('sg_dx_price', setSyrupPrice)(parseFloat(e.target.value)||0)}
              style={{ width:'100%', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:8, padding:'7px 10px', color:'#e2eaf4', fontSize:14, fontWeight:600, boxSizing:'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:4 }}>Wood cost ($/cord)</div>
            <input type="number" value={woodCost} onChange={e => save('sg_dx_wood', setWoodCost)(parseFloat(e.target.value)||0)}
              style={{ width:'100%', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:8, padding:'7px 10px', color:'#e2eaf4', fontSize:14, fontWeight:600, boxSizing:'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:4 }}>Labor rate ($/hr)</div>
            <input type="number" value={laborRate} onChange={e => save('sg_dx_labor', setLaborRate)(parseFloat(e.target.value)||0)}
              style={{ width:'100%', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:8, padding:'7px 10px', color:'#e2eaf4', fontSize:14, fontWeight:600, boxSizing:'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:4 }}>RO output (°Brix)</div>
            <input type="number" value={roOutBrix} onChange={e => save('sg_dx_robrix', setRoOutBrix)(parseFloat(e.target.value)||0)}
              style={{ width:'100%', background:'#0a1420', border:'1px solid #1e2d3d', borderRadius:8, padding:'7px 10px', color:'#e2eaf4', fontSize:14, fontWeight:600, boxSizing:'border-box' }}
              placeholder="0 = no RO" />
          </div>
        </div>
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:11, color:'#5a6a7a', marginBottom:4 }}>Vacuum system</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[['gravity','Gravity'],['vac15','15" Vacuum'],['high','High Vac (25"+)']].map(([val,lbl]) => (
              <button key={val} onClick={() => save('sg_dx_vac', setVacLevel)(val)}
                style={{ background: vacLevel===val ? 'rgba(45,212,167,0.2)' : '#0a1420', border:`1px solid ${vacLevel===val ? '#2dd4a7' : '#1e2d3d'}`, borderRadius:8, padding:'6px 12px', color: vacLevel===val ? '#2dd4a7' : '#5a6a7a', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Run button ── */}
      {!hasLogs && (
        <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:'12px 16px', marginBottom:14, fontSize:13, color:'#f59e0b', lineHeight:1.5 }}>
          ⚠️ No {season} log data found. Add sap and syrup entries in the Log tab first for a full diagnosis.
        </div>
      )}

      <button
        onClick={runDiagnostics}
        style={{ width:'100%', background:'linear-gradient(135deg,#2dd4a7,#1fbf94)', border:'none', borderRadius:12, padding:'14px', fontWeight:800, fontSize:15, color:'#07090f', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20, boxShadow:'0 4px 20px rgba(45,212,167,0.3)' }}
      >
        <I.zap size={18} color="#07090f" />
        Run Diagnosis — {season} Season
      </button>

      {/* ── Results ── */}
      {ran && findings && (
        <>
          {/* Summary bar */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
            {['high','medium','low','good'].map(sev => {
              const count = findings.filter(f => f.severity === sev).length;
              const s = sevStyle[sev];
              return (
                <div key={sev} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:10, padding:'8px 6px', textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:s.dot }}>{count}</div>
                  <div style={{ fontSize:10, color:'#5a6a7a', fontWeight:600, lineHeight:1.3 }}>{s.label}</div>
                </div>
              );
            })}
          </div>

          {findings.length === 0 && (
            <div style={{ textAlign:'center', color:'#5a6a7a', padding:'30px 0', fontSize:14 }}>
              No issues detected — add more log data for a richer diagnosis.
            </div>
          )}

          {findings.map(f => <Card key={f.id} f={f} />)}

          {/* Total ROI banner */}
          {findings.reduce((s, f) => s + (f.roi || 0), 0) > 0 && (
            <div style={{ background:'rgba(45,212,167,0.1)', border:'1px solid rgba(45,212,167,0.3)', borderRadius:14, padding:'14px 16px', marginTop:8, textAlign:'center' }}>
              <div style={{ fontSize:12, color:'#5a6a7a', marginBottom:4 }}>Total identified opportunity</div>
              <div style={{ fontSize:26, fontWeight:800, color:'#2dd4a7' }}>
                ${findings.reduce((s, f) => s + (f.roi || 0), 0).toLocaleString('en-US', { maximumFractionDigits:0 })}
              </div>
              <div style={{ fontSize:11, color:'#3d5068', marginTop:4 }}>estimated annual improvement potential</div>
            </div>
          )}

          {/* Benchmarks footer */}
          <div style={{ marginTop:18, padding:'12px 14px', background:'#080f18', border:'1px solid #131e2c', borderRadius:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#2d3d4d', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Benchmark Sources</div>
            {[
              'UVM Proctor Maple Research Center — Vermont maple production data',
              'Cornell Maple Program — RO, sugaring efficiency, and industry guides',
              'Maine Maple Producers Association (MPA) — tapping and operation guides',
              'USDA NASS — Annual Maple Syrup Production Survey',
            ].map((s, i) => (
              <div key={i} style={{ fontSize:11, color:'#3d5068', lineHeight:1.5, marginBottom:2 }}>• {s}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [tab,      setTab]      = useState('sap');
  const [units,    setUnits]    = useState(()=>ls.get('sg_units','GAL'));
  const [season,   setSeason]   = useState(()=>ls.get('sg_season',new Date().getFullYear()));
  const [sapBrix,  setSapBrix]  = useState(()=>ls.get('sg_brix',2));
  const [trees,    setTrees]    = useState(()=>ls.get('sg_trees',50));
  const [waterBP,  setWaterBP]  = useState(()=>ls.get('sg_bp',212));
  const [evapRate, setEvapRate] = useState(12);
  const [fuelType, setFuelType] = useState(()=>ls.get('sg_fuel','Firewood (cord)'));
  const [fuelCost, setFuelCost] = useState(()=>ls.get('sg_fuelcost',300));
  const [onboard,  setOnboard]  = useState(()=>ls.get('sg_onboarded',false)===false);
  const [showWizard, setShowWizard] = useState(false);
  const [notifLat, setNotifLat] = useState(() => ls.get('sg_ddlat', null));
  const [notifLon, setNotifLon] = useState(() => ls.get('sg_ddlon', null));
  const [notifBanner, setNotifBanner] = useState(null);
  const [lang,      setLang]      = useState(()=>ls.get('sg_lang','en'));

  useEffect(()=>{ ls.set('sg_units',units);       },[units]);
  useEffect(()=>{ ls.set('sg_season',season);     },[season]);
  useEffect(()=>{ ls.set('sg_brix',sapBrix);      },[sapBrix]);
  useEffect(()=>{ ls.set('sg_trees',trees);       },[trees]);
  useEffect(()=>{ ls.set('sg_bp',waterBP);        },[waterBP]);
  useEffect(()=>{ ls.set('sg_fuel',fuelType);     },[fuelType]);
  useEffect(()=>{ ls.set('sg_fuelcost',fuelCost); },[fuelCost]);
  useEffect(()=>{ ls.set('sg_lang',lang);       },[lang]);

  // ── Run condition check on app load (once per day) ──────────
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (ls.get('sg_notif_checked','') === today) return;
    const lat = ls.get('sg_ddlat', null);
    const lon = ls.get('sg_ddlon', null);
    if (!lat || !lon) return;
    ls.set('sg_notif_checked', today);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=3&timezone=auto`)
      .then(r => r.json())
      .then(d => {
        if (!d.daily) return;
        for (let i = 1; i <= 2; i++) {
          const hi = Math.round(d.daily.temperature_2m_max[i]);
          const lo = Math.round(d.daily.temperature_2m_min[i]);
          const ideal = hi >= 40 && lo <= 28;
          if (ideal) {
            const day = i === 1 ? 'tomorrow' : 'in 2 days';
            const msg = `🍁 Ideal sap run ${day} — high ${hi}°F, low ${lo}°F`;
            setNotifBanner(msg);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('SweetRun — Sap Run Alert', { body: msg, icon: './apple-touch-icon.png' });
            }
            break;
          }
        }
      }).catch(() => {});
  }, []);

  const tabs = [
    { id:'sap',     Icon:I.droplet,     label:t(lang,'tabSap')     },
    { id:'evap',    Icon:I.flame,       label:t(lang,'tabEvap')    },
    { id:'ro',      Icon:I.filter,      label:t(lang,'tabRO')      },
    { id:'finish',  Icon:I.thermometer, label:t(lang,'tabFinish')  },
    { id:'tapping', Icon:I.mapleLeaf,   label:t(lang,'tabTapping') },
    { id:'boilpt',  Icon:I.mapPin,      label:t(lang,'tabBoilPt')  },
    { id:'season',  Icon:I.trendUp,     label:t(lang,'tabSeason')  },
    { id:'recap',   Icon:I.mapleLeaf,   label:'Season Recap'       },
    { id:'tubing',    Icon:I.wrench,    label:'Tubing 🔧'          },
    { id:'sugarsage', Icon:I.leaf,      label:'SugarSage 🍁'       },
    { id:'log',     Icon:I.package,     label:t(lang,'tabLog')     },
    { id:'equip',   Icon:I.wrench,      label:t(lang,'tabEquip')   },
    { id:'tasks',   Icon:I.clipboard,   label:t(lang,'tabTasks')   },
    { id:'weather', Icon:I.snowflake,   label:'Weather'            },
    ...(BETA_FEATURES ? [{ id:'lines',    Icon:I.tree, label:'Map β'       }] : []),
    ...(BETA_FEATURES ? [{ id:'diagnose', Icon:I.zap,  label:'Diagnose 🧪' }] : []),
  ];

  return (
    <div className="app-wrap" style={{ maxWidth:540, margin:'0 auto' }}>
      {/* ── Header / Desktop Sidebar ── */}
      <div className="app-header" style={{ background:'#07090f', borderBottom:'1px solid #131e2c', padding:'14px 16px 0', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
        <div className="app-header-top" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, background:'linear-gradient(135deg,#1a4a3a,#0d2e26)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 3px 12px rgba(45,212,167,0.2)' }}>
              <I.mapleLeaf size={22} color="#2dd4a7" />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:21, letterSpacing:'-0.6px', lineHeight:1.1, marginBottom:3 }}>SweetRun</div>
              <div style={{ fontSize:10, color:'#2dd4a7', fontWeight:700, letterSpacing:'0.12em', opacity:0.9 }}>{t(lang,'appSub')}</div>
            </div>
          </div>
          <div className="app-header-controls" style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ background:'rgba(45,212,167,0.1)', border:'1px solid rgba(45,212,167,0.2)', borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:700, color:'#2dd4a7', letterSpacing:'0.02em' }}>{season}</div>
            <div style={{ display:'flex', background:'#0f1720', border:'1px solid #1e2d3d', borderRadius:20, padding:2 }}>
              {['GAL','L'].map(u=>(
                <button key={u} onClick={()=>setUnits(u)} style={{ background:units===u?'linear-gradient(135deg,#2dd4a7,#1fbf94)':'transparent', color:units===u?'#07090f':'#5a6a7a', border:'none', borderRadius:18, padding:'4px 12px', fontWeight:700, fontSize:13, transition:'all 0.18s', boxShadow:units===u?'0 2px 8px rgba(45,212,167,0.25)':'none' }}>{u}</button>
              ))}
            </div>
            <div style={{ display:'flex', background:'#0f1720', border:'1px solid #1e2d3d', borderRadius:20, padding:2 }}>
              {['EN','FR'].map(l=>(
                <button key={l} onClick={()=>setLang(l.toLowerCase())} style={{ background:lang===l.toLowerCase()?'linear-gradient(135deg,#a855f7,#9333ea)':'transparent', color:lang===l.toLowerCase()?'#fff':'#5a6a7a', border:'none', borderRadius:18, padding:'4px 10px', fontWeight:700, fontSize:13, transition:'all 0.18s', boxShadow:lang===l.toLowerCase()?'0 2px 8px rgba(168,85,247,0.25)':'none' }}>{l}</button>
              ))}
            </div>
            <button onClick={()=>setShowWizard(true)} title="Season Setup Wizard"
              style={{ background:'rgba(45,212,167,0.08)', border:'1px solid rgba(45,212,167,0.2)', borderRadius:10,
                padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <I.compass size={16} color="#2dd4a7" />
            </button>
          </div>
        </div>
        {/* Scrollable nav (horizontal on mobile/tablet, vertical on desktop) */}
        <div className="tab-bar-wrap">
          <div className="tab-bar">
            {tabs.map(t => (
              <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
                <t.Icon size={16} color={tab===t.id?'#07090f':'#3d5068'} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main area (banner + content) ── */}
      <div className="app-main" style={{ minWidth:0, flex:1 }}>
        {/* ── Season Setup Banner (shown when trees unconfigured) ── */}
        {!ls.get('sg_wizard_done', false) && parseInt(trees) === 0 && !onboard && !showWizard && (
          <div style={{ background:'linear-gradient(135deg,#071a0e,#0d2b15)', border:'1px solid #2d6a4f',
            borderRadius:0, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#3fb950', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2 }}>
                🌳 First Season?
              </div>
              <div style={{ fontSize:13, color:'#8a9ab5' }}>Get a personalized season plan in 2 minutes.</div>
            </div>
            <button onClick={()=>setShowWizard(true)}
              style={{ background:'#3fb950', border:'none', borderRadius:10, padding:'9px 16px',
                fontWeight:700, fontSize:12, color:'#07090f', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
              Set Up Season →
            </button>
          </div>
        )}

        {/* ── Sap Run Alert Banner ── */}
        {notifBanner && (
          <div style={{ background:'#081e0e', border:'1px solid #1a4a25', borderRadius:0, padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'#3fb950', fontWeight:600 }}>{notifBanner}</span>
            <button onClick={()=>setNotifBanner(null)} style={{ background:'none', border:'none', color:'#3d5068', cursor:'pointer', padding:'0 4px' }}><I.x size={14}/></button>
          </div>
        )}

        {/* ── Content ── */}
        <div className="tab-content">
          {(onboard || showWizard) && (
            <FirstSeasonWizard
              onClose={()=>{ setOnboard(false); setShowWizard(false); }}
              onComplete={data=>{
                if(data.trees > 0) { setTrees(data.trees); ls.set('sg_trees', data.trees); }
                if(data.fuelType) { setFuelType(data.fuelType); ls.set('sg_fuel', data.fuelType); }
                if(data.fuelCost) { setFuelCost(data.fuelCost); ls.set('sg_fuelcost', data.fuelCost); }
                setOnboard(false); setShowWizard(false);
              }}
            />
          )}
          {tab==='sap'     && <SapTab     sapBrix={sapBrix} setSapBrix={setSapBrix} trees={trees} units={units} lang={lang} />}
          {tab==='evap'    && <EvapTab    sapBrix={sapBrix} setSapBrix={setSapBrix} units={units} setEvapRate={setEvapRate} fuelType={fuelType} setFuelType={setFuelType} fuelCost={fuelCost} setFuelCost={setFuelCost} season={season} trees={trees} lang={lang} />}
          {tab==='ro'      && <ROTab      sapBrix={sapBrix} setSapBrix={setSapBrix} evapRate={evapRate} fuelType={fuelType} fuelCost={fuelCost} units={units} lang={lang} />}
          {tab==='finish'  && <FinishTab  waterBP={waterBP} setWaterBP={setWaterBP} lang={lang} />}
          {tab==='tapping' && <TappingTab sapBrix={sapBrix} trees={trees} setTrees={setTrees} units={units} lang={lang} />}
          {tab==='boilpt'  && <BoilPtTab  waterBP={waterBP} setWaterBP={setWaterBP} lang={lang} />}
          {tab==='season'  && <SeasonTab  season={season} lang={lang} />}
          {tab==='recap'   && <RecapTab   season={season} units={units} sapBrix={sapBrix} trees={trees} lang={lang} />}
          {tab==='tubing'    && <TubingTab trees={trees} />}
          {tab==='sugarsage' && <SugarSageTab season={season} sapBrix={sapBrix} trees={trees} units={units} />}
          {tab==='log'     && <LogTab     season={season} setSeason={setSeason} trees={trees} setTrees={setTrees} units={units} sapBrix={sapBrix} lang={lang} />}
          {tab==='equip'   && <EquipTab lang={lang} />}
          {tab==='tasks'   && <TasksTab   season={season} lang={lang} />}
          {tab==='weather' && <WeatherTab lang={lang} trees={trees} units={units} />}
          {BETA_FEATURES && tab==='lines'    && <LinesTab lang={lang} />}
          {BETA_FEATURES && tab==='diagnose' && <DiagnoseTab season={season} trees={trees} units={units} sapBrix={sapBrix} lang={lang} />}

          {/* ── Notification enable prompt ── */}
          {'Notification' in window && Notification.permission === 'default' && ls.get('sg_ddlat',null) && (
            <div style={{ background:'#0d1a2b', border:'1px solid #1a304a', borderRadius:12, padding:'14px 16px', marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:'#58a6ff' }}>{t(lang,'runAlertTitle')}</div>
                <div style={{ fontSize:12, color:'#5a6a7a', marginTop:2 }}>{t(lang,'runAlertDesc')}</div>
              </div>
              <button onClick={()=>Notification.requestPermission()} style={{ background:'#58a6ff', border:'none', borderRadius:10, padding:'8px 14px', fontWeight:600, fontSize:13, color:'#07090f', flexShrink:0, marginLeft:12 }}>{t(lang,'enable')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  ReactDOM.createRoot(document.getElementById('root')).render(<AppErrorBoundary><App /></AppErrorBoundary>);
} catch(_e) {
  document.getElementById('root').innerHTML =
    '<pre style="color:#fa0;background:#1a0000;padding:20px;font-size:13px;border:2px solid red;margin:12px;border-radius:8px;white-space:pre-wrap">'
    + 'INIT CRASH:\n' + String(_e) + '\n\n' + (_e && _e.stack ? _e.stack : '')
    + '</pre>';
}
