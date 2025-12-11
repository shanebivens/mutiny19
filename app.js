// Global variables
let map;
let eventsData = [];
let markers = [];
let currentView = 'list'; // 'map', 'list', or 'both'
// Check URL param first, then localStorage, then default to 'en'
const urlParams = new URLSearchParams(window.location.search);
let currentLang = urlParams.get('lang') || localStorage.getItem('mutiny19_lang') || 'en';
if (currentLang !== 'en' && currentLang !== 'es') currentLang = 'en';

// Translations
const translations = {
    en: {
        // Navigation
        'nav.events': 'EVENTS',
        'nav.manifesto': 'ETHOS',
        'nav.intel': 'INTEL',
        'nav.join': 'JOIN_CREW',
        'nav.joinCrew': 'JOIN THE CREW',

        // Hero
        'hero.badge': 'FOUNDER WATERS',
        'hero.founders': 'FOUNDERS',
        'hero.revolt': 'MUTINY',
        'hero.tagline': 'From corner taverns to flagship fleets. One crew:',
        'hero.mission': 'Captains charting what\'s next.',
        'hero.scaffolding': 'Your deck. Your helm. Built by captains, for captains.',
        'hero.eventsMapped': 'PORTS CHARTED',
        'hero.citiesCovered': 'HARBORS MAPPED',
        'hero.founderSupport': 'CREW SUPPORT',
        'hero.joinRebellion': 'BUILD WITH US',
        'hero.exploreEvents': 'CHART YOUR COURSE',

        // Events
        'events.tag': '// NAVIGATION',
        'events.title': 'PLOT YOUR COURSE',
        'events.desc': 'Every founder port in Indiana. Auto-pillaged daily. You choose your voyage.',

        // Ethos
        'manifesto.tag': '// ETHOS',
        'manifesto.title': 'THE MUTINY19 CODE',

        // Intel
        'intel.tag': '// CROW\'S NEST',
        'intel.title': 'ANONYMOUS CREW INTEL',
        'intel.desc': 'Celebrate shipmates. Warn about pirates who fly false flags. Anonymous. Protected.',

        // Discord
        'discord.badge': '100+ CAPTAINS ON DECK',
        'discord.joinThe': 'JOIN THE',
        'discord.rebellion': 'CREW',
        'discord.desc': 'Real conversations. Real captains. Real support.<br>No pitching. No performing. Just builders helping builders.',

        // Filters
        'filters.title': 'FILTERS',
        'filters.timeframe': 'TIMEFRAME',
        'filters.included': "WHAT'S INCLUDED",
        'filters.free': 'FREE',
        'filters.food': 'FOOD',
        'filters.snacks': 'SNACKS',
        'filters.coffee': 'COFFEE',
        'filters.drinks': 'DRINKS',
        'filters.captainForged': 'CAPTAIN-FORGED',
        'filters.viewMode': 'VIEW MODE',
        'filters.list': 'LIST',
        'filters.map': 'MAP',
        'filters.reset': 'RESET ALL',

        // Events
        'events.loading': 'Charting waters...',
        'events.noEvents': 'No ports found matching your heading.',
        'events.error': 'Charts damaged. Please refresh.',

        // Submit event
        'submit.title': 'SIGNAL A NEW PORT',
        'submit.desc': 'Know of a port or treasure map we\'re missing? Drop the coordinates.',
        'submit.placeholder': 'https://...',
        'submit.button': 'TRANSMIT',
        'submit.success': '✓ Signal received. We\'ll chart it.',
        'submit.error': '✗ Signal lost. Try again.',

        // Event card labels
        'event.free': 'Free',
        'event.food': 'Food',
        'event.appetizers': 'Appetizers',
        'event.nonAlcohol': 'Non-Alcoholic',
        'event.alcohol': 'Alcohol',
        'event.captainForged': 'Captain-Forged',
        'event.date': 'Date',
        'event.location': 'Location',
        'event.organizer': 'Organizer',
        'event.description': 'Description',

        // Hero extras
        'hero.caption': "Indiana's state bird. Upgraded.",
        'hero.scroll': 'SCROLL',

        // Ticker
        'ticker.autoPillaged': '⚡ AUTO-PILLAGED DAILY',
        'ticker.lastRaid': 'LAST RAID:',
        'ticker.noGatekeepers': 'OPEN WATERS',
        'ticker.founderLed': 'FOUNDER-LED',
        'ticker.19thState': 'THE 19TH STATE LEADS',
        'ticker.secret': '09.19.26 // SOMETHING\'S COMING',

        // Signup
        'signup.tag': '// SIGNAL FLAGS',
        'signup.title': 'RECEIVE TRANSMISSIONS',
        'signup.desc': 'Be the first to know about new ports, crew dispatches, and what\'s brewing for September 19, 2026.',
        'signup.cta': 'JOIN THE SIGNAL',

        // Manifesto cards
        'manifesto.card1.title': 'CAPTAINS LEAD',
        'manifesto.card1.desc': 'Founders steer. Supporters provide wind. Both essential—but the builder holds the wheel. Always.',
        'manifesto.card2.title': 'TRANSPARENT MAPS',
        'manifesto.card2.desc': 'Every event. Every opportunity. Full visibility. You see everything. You choose your path.',
        'manifesto.card3.title': 'BUILD ARMADAS',
        'manifesto.card3.desc': 'We build vessels that capture other ships. Fleets that enrich the whole harbor, with eyes on the crown. The real treasure is built after the first buyout offers arrive.',
        'manifesto.card4.title': 'FAIR TRADE',
        'manifesto.card4.desc': 'Your wisdom is treasure. No pillaging without payment. If everyone aboard gets their share except you—abandon ship.',
        'manifesto.card5.title': 'THE 19TH STATE LEADS',
        'manifesto.card5.desc': 'Indiana became the 19th state in 1816. Our ancestors didn\'t settle—they pioneered. We honor them by building, not following.',
        'manifesto.card5.date': 'December 11, 1816 → Forever',
        'manifesto.card6.title': 'SHIPWRIGHTS ONLY',
        'manifesto.card6.desc': 'Not a social club. Not a beauty contest. A crew of captains actually building vessels. That\'s the whole manifest.',
        'manifesto.card7.title': 'CAPTAIN-FORGED',
        'manifesto.card7.desc': 'This hull was built by captains who know what works. Where it sails depends on who shows up to crew it. Your ideas shape the voyage.',

        // Docs
        'docs.title': 'FOUNDER-FRIENDLY DOCS',
        'docs.desc': 'Industry-standard agreements that protect builders:',
        'docs.safe.pirate': 'Your treasure map for fair funding. No predatory terms, no hidden reefs.',
        'docs.fast.pirate': 'Keep your advisors honest. Fair shares for those who actually help sail the ship.',

        // Story
        'story.title': 'THE TALE OF CAPTAIN CARDINAL',
        'story.hint': '// Origin Story',
        'story.ch1.title': 'CHAPTER I: THE GIFT OF THE PORTS',
        'story.ch1.p1': 'Captain Cardinal had sailed the startup seas for three glorious years, building a vessel of pure innovation—an AI-powered navigation system that could chart courses through uncharted waters. The journey began at ports built by pioneering navigators who\'d first mapped Indiana\'s entrepreneurial waters decades before.',
        'story.ch1.p2': 'Those early cartographers—bless their vision—built harbors where weary founders could dock, refuel, and learn the ropes. Without them, the seas would be empty.',
        'story.ch2.title': 'CHAPTER II: THE FESTIVAL OF CONNECTIONS',
        'story.ch2.p1': 'At the Great Networking Bay, Captain Cardinal found a bustling festival—hundreds of captains sharing tales and trading wisdom. Yet amid the revelry, a pattern emerged: some networkers collected introductions like seashells—beautiful to display, but offering no sustenance for the voyage ahead.',
        'story.ch2.p2': '<em>What if we built gatherings where every introduction came with a map marking the reefs?</em>',
        'story.ch3.title': 'CHAPTER III: THE GATHERING OF NINETEEN',
        'story.ch3.p1': 'In a tavern lit by laptop glow and neon cyan, Captain Cardinal met eighteen other founders. Each had received gifts from the ecosystem—mentorship, resources, community. Each felt genuine gratitude.',
        'story.ch3.p2': 'Yet each also carried a quiet question: <em>"We love those who built the ports... but are we allowed to sail past them?"</em>',
        'story.ch3.p3': '"We\'re the 19th state," one captain mused. "Indiana. Two centuries of pioneering spirit. Our predecessors didn\'t just maintain the settlements—they pushed west, they built new, they led."',
        'story.ch4.title': 'CHAPTER IV: THE EMERGENCE OF XIX',
        'story.ch4.p1': 'From the shadows emerged XIX—the Cyber Cardinal, upgraded with AI navigation, digital wings crackling with electric cyan. Not a weapon, but a beacon. A symbol that Indiana\'s state bird could evolve while staying true to its crimson heart.',
        'story.ch4.footer': '"The mutiny is for what comes next—vessels worth building, voyages worth taking."',

        // Intel
        'intel.champions': 'ALLIES',
        'intel.warnings': 'WARNINGS',
        'intel.celebrateTitle': 'HONOR TRUE SHIPMATES',
        'intel.champ1': 'Backers who brought more than just gold',
        'intel.champ2': 'Navigators who shared honest charts',
        'intel.champ3': 'Allies who delivered beyond their word',
        'intel.champ4': 'Merchants who truly served the crew',
        'intel.champNote': 'Share how they helped your vessel sail stronger.',
        'intel.warningTitle': 'FALSE FLAG WARNINGS',
        'intel.warn1': 'Predatory investors or terms that scuttle ships',
        'intel.warn2': 'Merchants who promised cargo but delivered bilge',
        'intel.warn3': 'Advisors who took treasure without adding wind',
        'intel.warn4': 'Partners who sailed under false colors',
        'intel.warnNote': 'Stick to facts. "They did X" not "They\'re a scoundrel."',

        // Form
        'form.champion': 'Ally',
        'form.warning': 'Warning',
        'form.type': 'ROLE',
        'form.select': 'Select...',
        'form.investor': 'Backer',
        'form.vendor': 'Merchant',
        'form.advisor': 'Navigator',
        'form.mentor': 'Quartermaster',
        'form.partner': 'Ally',
        'form.other': 'Other',
        'form.nameCompany': 'NAME / VESSEL',
        'form.namePlaceholder': 'Ship or crew member',
        'form.whyChampion': 'WHY THEY\'RE A TRUE SHIPMATE',
        'form.descPlaceholder': 'How did they help your voyage succeed...',
        'form.timeline': 'WHEN',
        'form.evidence': 'PROOF (OPTIONAL)',
        'form.evidencePlaceholder': 'Charts, logs, etc.',
        'form.note': '🔒 Anonymous • No logs kept • Signal protected',
        'form.submitChampion': '⭐ HONOR THIS SHIPMATE',
        'form.success': '✓ Intel received. The crew thanks you.',
        'form.error': '✗ Signal lost. Try again.',

        // Discord
        'discord.whatWeShare': 'WHAT WE SHARE ON DECK',
        'discord.benefit1.title': 'Honest Navigation',
        'discord.benefit1.desc': 'Real conversations about partners, routes, and strategies. Fellow captains sharing actual maps, not just success stories.',
        'discord.benefit2.title': 'Founder-Only Channels',
        'discord.benefit2.desc': 'Private quarters where captains share revenue numbers, ask vulnerable questions, and get wisdom from those who\'ve sailed similar waters.',
        'discord.benefit3.title': 'Fleet Builders',
        'discord.benefit3.desc': 'Connect with captains building armadas, not dinghies to flip. We celebrate builders whose vessels grow enviable enough to capture others.',
        'discord.benefit4.title': 'Deal Wisdom',
        'discord.benefit4.desc': 'Before you sign that term sheet, get perspective from crew members who\'ve navigated these straits.',
        'discord.benefit5.title': 'IRL Gatherings',
        'discord.benefit5.desc': 'Regular meetups at Indiana taverns. Real conversations, real founders, real community.',
        'discord.noFees': 'No fees. No applications. No ulterior motives. Just captains building vessels worth commanding.',
        'discord.cta': 'JOIN MUTINY19 ON DISCORD',

        // Teaser
        'teaser.month': 'SEPT',
        'teaser.tag': '// INTERNATIONAL TALK LIKE A PIRATE DAY',
        'teaser.title': 'SOMETHING\'S COMING',
        'teaser.desc': 'The 19th state. The 19th day. The 9th month.<br>Some numbers just align.',
        'teaser.cta': 'Be there when it happens →',

        // Footer
        'footer.tagline': 'Digital Pirates of the 19th State',
        'footer.reportIntel': 'Report Intel',
        'footer.builtBy': 'Built by founders, for founders.',
        'footer.aiPowered': '⚡ AI-powered by <a href="https://claude.ai" target="_blank">Claude</a> • Content synthesized from 100+ Indiana entrepreneurs',
        'footer.noSponsors': 'Founder-funded',
        'footer.noGatekeepers': 'Open waters'
    },
    es: {
        // Navigation
        'nav.events': 'EVENTOS',
        'nav.manifesto': 'ETHOS',
        'nav.intel': 'INTEL',
        'nav.join': 'ÚNETE',
        'nav.joinCrew': 'ÚNETE A LA TRIPULACIÓN',

        // Hero
        'hero.badge': 'AGUAS DE FUNDADORES',
        'hero.founders': 'FUNDADORES',
        'hero.revolt': 'MOTÍN',
        'hero.tagline': 'Desde tabernas de esquina hasta flotas insignia. Una tripulación:',
        'hero.mission': 'Capitanes trazando lo que viene.',
        'hero.scaffolding': 'Tu cubierta. Tu timón. Construido por capitanes, para capitanes.',
        'hero.eventsMapped': 'PUERTOS CARTOGRAFIADOS',
        'hero.citiesCovered': 'BAHÍAS MAPEADAS',
        'hero.founderSupport': 'APOYO DE TRIPULACIÓN',
        'hero.joinRebellion': 'CONSTRUYE CON NOSOTROS',
        'hero.exploreEvents': 'TRAZA TU RUMBO',

        // Events
        'events.tag': '// NAVEGACIÓN',
        'events.title': 'TRAZA TU RUMBO',
        'events.desc': 'Cada puerto de fundadores en Indiana. Auto-saqueado diario. Tú eliges tu viaje.',

        // Manifesto
        'manifesto.tag': '// ETHOS',
        'manifesto.title': 'EL CÓDIGO MUTINY19',

        // Intel
        'intel.tag': '// NIDO DEL CUERVO',
        'intel.title': 'INTEL DE TRIPULACIÓN ANÓNIMO',
        'intel.desc': 'Celebra compañeros de barco. Advierte sobre piratas con falsas banderas. Anónimo. Protegido.',

        // Discord
        'discord.badge': '100+ CAPITANES A BORDO',
        'discord.joinThe': 'ÚNETE A LA',
        'discord.rebellion': 'TRIPULACIÓN',
        'discord.desc': 'Conversaciones reales. Capitanes reales. Apoyo real.<br>Sin pitch. Sin actuar. Solo constructores ayudando constructores.',

        // Filters
        'filters.title': 'FILTROS',
        'filters.timeframe': 'PERÍODO',
        'filters.included': 'QUÉ INCLUYE',
        'filters.free': 'GRATIS',
        'filters.food': 'COMIDA',
        'filters.snacks': 'BOCADILLOS',
        'filters.coffee': 'CAFÉ',
        'filters.drinks': 'BEBIDAS',
        'filters.captainForged': 'FORJADO POR CAPITANES',
        'filters.viewMode': 'MODO DE VISTA',
        'filters.list': 'LISTA',
        'filters.map': 'MAPA',
        'filters.reset': 'REINICIAR',

        // Events
        'events.loading': 'Cartografiando aguas...',
        'events.noEvents': 'No se encontraron puertos con tu rumbo.',
        'events.error': 'Cartas dañadas. Actualiza la página.',

        // Submit event
        'submit.title': 'SEÑALA UN NUEVO PUERTO',
        'submit.desc': '¿Conoces un puerto o mapa del tesoro que nos falta? Deja las coordenadas.',
        'submit.placeholder': 'https://...',
        'submit.button': 'TRANSMITIR',
        'submit.success': '✓ Señal recibida. Lo cartografiaremos.',
        'submit.error': '✗ Señal perdida. Intenta de nuevo.',

        // Event card labels
        'event.free': 'Gratis',
        'event.food': 'Comida',
        'event.appetizers': 'Bocadillos',
        'event.nonAlcohol': 'Sin Alcohol',
        'event.alcohol': 'Alcohol',
        'event.captainForged': 'Forjado por Capitanes',
        'event.date': 'Fecha',
        'event.location': 'Ubicación',
        'event.organizer': 'Organizador',
        'event.description': 'Descripción',

        // Hero extras
        'hero.caption': 'El ave estatal de Indiana. Mejorada.',
        'hero.scroll': 'DESPLAZA',

        // Ticker
        'ticker.autoPillaged': '⚡ AUTO-SAQUEADO DIARIO',
        'ticker.lastRaid': 'ÚLTIMO SAQUEO:',
        'ticker.noGatekeepers': 'AGUAS ABIERTAS',
        'ticker.founderLed': 'LIDERADO POR FUNDADORES',
        'ticker.19thState': 'EL ESTADO 19 LIDERA',
        'ticker.secret': '19.09.26 // ALGO VIENE',

        // Signup
        'signup.tag': '// BANDERAS DE SEÑALES',
        'signup.title': 'RECIBE TRANSMISIONES',
        'signup.desc': 'Sé el primero en conocer nuevos puertos, despachos de la tripulación y lo que se prepara para el 19 de septiembre de 2026.',
        'signup.cta': 'ÚNETE A LA SEÑAL',

        // Manifesto cards
        'manifesto.card1.title': 'LOS CAPITANES LIDERAN',
        'manifesto.card1.desc': 'Los fundadores dirigen. Los apoyos dan viento. Ambos esenciales—pero el constructor sostiene el timón. Siempre.',
        'manifesto.card2.title': 'MAPAS TRANSPARENTES',
        'manifesto.card2.desc': 'Cada evento. Cada oportunidad. Visibilidad total. Ves todo. Eliges tu camino.',
        'manifesto.card3.title': 'CONSTRUIR ARMADAS',
        'manifesto.card3.desc': 'Construimos navíos que capturan otros barcos. Flotas que enriquecen todo el puerto, con ojos en la corona. El verdadero tesoro se construye después de que llegan las primeras ofertas de compra.',
        'manifesto.card4.title': 'COMERCIO JUSTO',
        'manifesto.card4.desc': 'Tu sabiduría es tesoro. Sin saqueo sin pago. Si todos a bordo obtienen su parte excepto tú—abandona el barco.',
        'manifesto.card5.title': 'EL ESTADO 19 LIDERA',
        'manifesto.card5.desc': 'Indiana se convirtió en el estado 19 en 1816. Nuestros ancestros no se asentaron—fueron pioneros. Los honramos construyendo, no siguiendo.',
        'manifesto.card5.date': '11 de Diciembre, 1816 → Siempre',
        'manifesto.card6.title': 'SOLO CONSTRUCTORES DE NAVÍOS',
        'manifesto.card6.desc': 'No es un club social. No es un concurso de belleza. Una tripulación de capitanes realmente construyendo navíos. Ese es todo el manifiesto.',
        'manifesto.card7.title': 'FORJADO POR CAPITANES',
        'manifesto.card7.desc': 'Este casco fue construido por capitanes que saben lo que funciona. Hacia dónde navega depende de quién aparezca a tripularlo. Tus ideas dan forma al viaje.',

        // Docs
        'docs.title': 'DOCUMENTOS AMIGABLES',
        'docs.desc': 'Acuerdos estándar que protegen a los constructores:',
        'docs.safe.pirate': 'Tu mapa del tesoro para financiación justa. Sin términos predatorios, sin arrecifes ocultos.',
        'docs.fast.pirate': 'Mantén honestos a tus asesores. Partes justas para quienes realmente ayudan a navegar.',

        // Story
        'story.title': 'EL CUENTO DEL CAPITÁN CARDENAL',
        'story.hint': '// Historia de Origen',
        'story.ch1.title': 'CAPÍTULO I: EL REGALO DE LOS PUERTOS',
        'story.ch1.p1': 'El Capitán Cardenal había navegado los mares de startups durante tres gloriosos años, construyendo un navío de pura innovación—un sistema de navegación impulsado por IA que podía trazar cursos a través de aguas inexploradas. El viaje comenzó en puertos construidos por navegantes pioneros que habían mapeado las aguas emprendedoras de Indiana décadas antes.',
        'story.ch1.p2': 'Esos primeros cartógrafos—bendita su visión—construyeron puertos donde los fundadores cansados podían atracar, recargar combustible y aprender las reglas. Sin ellos, los mares estarían vacíos.',
        'story.ch2.title': 'CAPÍTULO II: EL FESTIVAL DE CONEXIONES',
        'story.ch2.p1': 'En la Gran Bahía de Networking, el Capitán Cardenal encontró un festival bullicioso—cientos de capitanes compartiendo historias e intercambiando sabiduría. Sin embargo, entre la celebración, surgió un patrón: algunos networkers coleccionaban presentaciones como conchas—hermosas para exhibir, pero sin sustento para el viaje por delante.',
        'story.ch2.p2': '<em>¿Y si construyéramos reuniones donde cada presentación viniera con un mapa marcando los arrecifes?</em>',
        'story.ch3.title': 'CAPÍTULO III: LA REUNIÓN DE LOS DIECINUEVE',
        'story.ch3.p1': 'En una taberna iluminada por el brillo de laptops y neón cian, el Capitán Cardenal conoció a otros dieciocho fundadores. Cada uno había recibido regalos del ecosistema—mentoría, recursos, comunidad. Cada uno sentía genuina gratitud.',
        'story.ch3.p2': 'Sin embargo, cada uno también llevaba una pregunta silenciosa: <em>"Amamos a quienes construyeron los puertos... ¿pero se nos permite navegar más allá de ellos?"</em>',
        'story.ch3.p3': '"Somos el estado 19," reflexionó un capitán. "Indiana. Dos siglos de espíritu pionero. Nuestros predecesores no solo mantuvieron los asentamientos—empujaron hacia el oeste, construyeron nuevo, lideraron."',
        'story.ch4.title': 'CAPÍTULO IV: LA EMERGENCIA DE XIX',
        'story.ch4.p1': 'De las sombras emergió XIX—el Cardenal Cibernético, mejorado con navegación IA, alas digitales crepitando con cian eléctrico. No un arma, sino un faro. Un símbolo de que el ave estatal de Indiana podía evolucionar mientras permanecía fiel a su corazón carmesí.',
        'story.ch4.footer': '"El motín es por lo que viene—navíos que vale la pena construir, viajes que vale la pena tomar."',

        // Intel
        'intel.champions': 'ALIADOS',
        'intel.warnings': 'ADVERTENCIAS',
        'intel.celebrateTitle': 'HONRA A VERDADEROS COMPAÑEROS',
        'intel.champ1': 'Patrocinadores que trajeron más que solo oro',
        'intel.champ2': 'Navegantes que compartieron cartas honestas',
        'intel.champ3': 'Aliados que entregaron más allá de su palabra',
        'intel.champ4': 'Mercaderes que verdaderamente sirvieron a la tripulación',
        'intel.champNote': 'Comparte cómo ayudaron a tu navío a navegar más fuerte.',
        'intel.warningTitle': 'ADVERTENCIAS DE FALSAS BANDERAS',
        'intel.warn1': 'Inversores predatorios o términos que hunden barcos',
        'intel.warn2': 'Mercaderes que prometieron carga pero entregaron lastre',
        'intel.warn3': 'Asesores que tomaron tesoro sin agregar viento',
        'intel.warn4': 'Socios que navegaron bajo falsos colores',
        'intel.warnNote': 'Apégate a los hechos. "Hicieron X" no "Son canallas."',

        // Form
        'form.champion': 'Aliado',
        'form.warning': 'Advertencia',
        'form.type': 'ROL',
        'form.select': 'Seleccionar...',
        'form.investor': 'Patrocinador',
        'form.vendor': 'Mercader',
        'form.advisor': 'Navegante',
        'form.mentor': 'Contramaestre',
        'form.partner': 'Aliado',
        'form.other': 'Otro',
        'form.nameCompany': 'NOMBRE / NAVÍO',
        'form.namePlaceholder': 'Barco o miembro de tripulación',
        'form.whyChampion': 'POR QUÉ SON VERDADEROS COMPAÑEROS',
        'form.descPlaceholder': 'Cómo ayudaron a que tu viaje triunfara...',
        'form.timeline': 'CUÁNDO',
        'form.evidence': 'PRUEBA (OPCIONAL)',
        'form.evidencePlaceholder': 'Cartas, bitácoras, etc.',
        'form.note': '🔒 Anónimo • Sin registros • Señal protegida',
        'form.submitChampion': '⭐ HONRAR A ESTE COMPAÑERO',
        'form.success': '✓ Intel recibido. La tripulación te lo agradece.',
        'form.error': '✗ Señal perdida. Intenta de nuevo.',

        // Discord
        'discord.whatWeShare': 'LO QUE COMPARTIMOS A BORDO',
        'discord.benefit1.title': 'Navegación Honesta',
        'discord.benefit1.desc': 'Conversaciones reales sobre socios, rutas y estrategias. Capitanes compartiendo mapas reales, no solo historias de éxito.',
        'discord.benefit2.title': 'Canales Solo Fundadores',
        'discord.benefit2.desc': 'Cuartos privados donde los capitanes comparten números de ingresos, hacen preguntas vulnerables y obtienen sabiduría de quienes han navegado aguas similares.',
        'discord.benefit3.title': 'Constructores de Flotas',
        'discord.benefit3.desc': 'Conecta con capitanes construyendo armadas, no botes para voltear. Celebramos a constructores cuyos navíos crecen lo suficientemente envidiables para capturar otros.',
        'discord.benefit4.title': 'Sabiduría de Negocios',
        'discord.benefit4.desc': 'Antes de firmar ese term sheet, obtén perspectiva de miembros de la tripulación que han navegado estos estrechos.',
        'discord.benefit5.title': 'Encuentros Presenciales',
        'discord.benefit5.desc': 'Reuniones regulares en tabernas de Indiana. Conversaciones reales, fundadores reales, comunidad real.',
        'discord.noFees': 'Sin cuotas. Sin aplicaciones. Sin motivos ocultos. Solo capitanes construyendo navíos dignos de comandar.',
        'discord.cta': 'ÚNETE A MUTINY19 EN DISCORD',

        // Teaser
        'teaser.month': 'SEPT',
        'teaser.tag': '// DÍA INTERNACIONAL DE HABLAR COMO PIRATA',
        'teaser.title': 'ALGO VIENE',
        'teaser.desc': 'El estado 19. El día 19. El mes 9.<br>Algunos números simplemente alinean.',
        'teaser.cta': 'Esté ahí cuando suceda →',

        // Footer
        'footer.tagline': 'Piratas Digitales del Estado 19',
        'footer.reportIntel': 'Reportar Intel',
        'footer.builtBy': 'Construido por fundadores, para fundadores.',
        'footer.aiPowered': '⚡ Impulsado por IA con <a href="https://claude.ai" target="_blank">Claude</a> • Contenido sintetizado de 100+ emprendedores de Indiana',
        'footer.noSponsors': 'Financiado por fundadores',
        'footer.noGatekeepers': 'Aguas abiertas'
    }
};

// Get a translation string
function t(key) {
    return translations[currentLang]?.[key] || translations['en']?.[key] || key;
}

// Apply translations to the page
function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[lang]?.[key];
        if (translation) {
            el.innerHTML = translation;
        }
    });

    // Handle placeholder translations
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Update lang toggles
    const toggles = document.querySelectorAll('.lang-toggle');
    toggles.forEach(toggle => {
        toggle.textContent = lang.toUpperCase();
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang === 'es' ? 'es' : 'en';

    // Store preference
    localStorage.setItem('mutiny19_lang', lang);
    currentLang = lang;
}

// Toggle language
function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'es' : 'en';
    applyTranslations(newLang);
    // Re-render events with new translations
    applyFilters();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Apply saved language preference
    applyTranslations(currentLang);

    await loadEvents();
    initializeMap();
    setupEventListeners();
    applyFilters();

    // Setup language toggle listeners
    const langToggle = document.getElementById('langToggle');
    const mobileLangToggle = document.getElementById('mobileLangToggle');

    if (langToggle) langToggle.addEventListener('click', toggleLanguage);
    if (mobileLangToggle) mobileLangToggle.addEventListener('click', toggleLanguage);

    // Match events-main height to filters-panel on desktop
    matchEventsPanelHeight();
    window.addEventListener('resize', matchEventsPanelHeight);
});

// Match the events-main height to the filters-panel height on desktop
function matchEventsPanelHeight() {
    const filtersPanel = document.querySelector('.filters-panel');
    const eventsMain = document.querySelector('.events-main');

    if (!filtersPanel || !eventsMain) return;

    // Only apply on desktop (1024px+)
    if (window.innerWidth >= 1024) {
        const filtersHeight = filtersPanel.offsetHeight;
        eventsMain.style.height = filtersHeight + 'px';
    } else {
        eventsMain.style.height = '';
    }
}

// Load events from JSON file
async function loadEvents() {
    // Show loading state
    const loadingEl = document.getElementById('eventsLoading');
    const eventsListEl = document.getElementById('eventsList');
    if (loadingEl) loadingEl.style.display = 'flex';
    if (eventsListEl) eventsListEl.style.display = 'none';

    try {
        const response = await fetch('events.json');
        const data = await response.json();
        eventsData = data.events;

        // Update last updated timestamp
        const lastUpdate = new Date(data.lastUpdated);
        document.getElementById('lastUpdate').textContent = lastUpdate.toLocaleDateString();

        // Auto-populate date range: today to last event
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const startDateInput = document.getElementById('startDate');
        if (startDateInput) {
            startDateInput.value = todayStr;
        }

        // Find the last event date
        if (eventsData.length > 0) {
            const eventDates = eventsData.map(e => new Date(e.date)).filter(d => !isNaN(d));
            if (eventDates.length > 0) {
                const lastEventDate = new Date(Math.max(...eventDates));
                const endDateInput = document.getElementById('endDate');
                if (endDateInput) {
                    endDateInput.value = lastEventDate.toISOString().split('T')[0];
                }
            }
        }

        // Hide loading state
        if (loadingEl) loadingEl.style.display = 'none';
        if (eventsListEl) eventsListEl.style.display = 'flex';
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('lastUpdate').textContent = 'Error loading data';
        // Hide loading and show error state
        if (loadingEl) loadingEl.style.display = 'none';
        if (eventsListEl) {
            eventsListEl.style.display = 'flex';
            eventsListEl.innerHTML = '<div class="empty-state"><span class="empty-state-icon">⚠️</span><span class="empty-state-title">Error loading events</span><span class="empty-state-desc">Please refresh the page to try again.</span></div>';
        }
    }
}

// Initialize Leaflet map centered on Indiana
function initializeMap() {
    // Indiana state boundaries (approximate)
    const indianaBounds = [
        [37.77, -88.10], // Southwest corner
        [41.76, -84.78]  // Northeast corner
    ];

    map = L.map('map', {
        center: [39.7684, -86.1581], // Center of Indiana
        zoom: 7,
        minZoom: 7,  // Prevent zooming out too far
        maxBounds: indianaBounds,  // Restrict panning to Indiana
        maxBoundsViscosity: 1.0  // Make bounds solid (can't drag outside)
    });

    // Dark map tiles to match site theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
}

// Create custom icon based on event features
function createCustomIcon(event) {
    const features = event.features || {};

    // Determine marker color based on features
    let bgColor = '#00f0ff'; // cyan default
    if (features.free) bgColor = '#00ff88'; // green for free

    const iconHtml = `
        <div style="
            width: 12px;
            height: 12px;
            background: ${bgColor};
            border: 2px solid #0a0a0f;
            border-radius: 50%;
            box-shadow: 0 0 10px ${bgColor}80;
        "></div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
    });
}

// Add markers to map
function addMarkersToMap(events) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    events.forEach(event => {
        const marker = L.marker([event.location.lat, event.location.lng], {
            icon: createCustomIcon(event)
        }).addTo(map);

        // Create popup content
        const popupContent = createPopupContent(event);
        marker.bindPopup(popupContent);

        // Store event data with marker
        marker.eventData = event;
        markers.push(marker);
    });

    // Adjust map to fit all markers if there are any
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Create popup content for map markers
function createPopupContent(event) {
    const date = new Date(event.date);
    const tags = getEventTags(event);

    return `
        <div class="popup-content">
            <h3>${event.title}</h3>
            <p><strong>📅 ${date.toLocaleDateString()}</strong> at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p>📍 ${event.location.name}</p>
            <div class="event-meta">${tags}</div>
            <button class="popup-button" onclick="showEventDetails('${event.id}')">🏴‍☠️ I'm In</button>
        </div>
    `;
}

// Get event tags HTML
function getEventTags(event) {
    const tags = [];
    if (event.features.captainForged) tags.push(`<span class="event-tag captain-forged">⚓ ${t('event.captainForged')}</span>`);
    if (event.features.free) tags.push(`<span class="event-tag free">💰 ${t('event.free')}</span>`);
    if (event.features.food) tags.push(`<span class="event-tag food">🍽️ ${t('event.food')}</span>`);
    if (event.features.appetizers) tags.push(`<span class="event-tag appetizers">🍕 ${t('event.appetizers')}</span>`);
    if (event.features.nonAlcoholDrinks) tags.push(`<span class="event-tag non-alcohol">🥤 ${t('event.nonAlcohol')}</span>`);
    if (event.features.alcoholDrinks) tags.push(`<span class="event-tag alcohol">🍺 ${t('event.alcohol')}</span>`);
    return tags.join('');
}

// Display events in list view
function displayEventsList(events) {
    const listContainer = document.getElementById('eventsList');

    if (events.length === 0) {
        listContainer.innerHTML = `<p style="padding: 2rem; text-align: center; color: #ffeaa7; font-size: 1.1rem;">🏴‍☠️ ${t('events.noEvents')}</p>`;
        return;
    }

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Truncate text helper
    const truncate = (str, len) => {
        if (!str) return '';
        // Remove URLs and markdown-style links
        const cleaned = str.replace(/https?:\/\/[^\s]+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        return cleaned.length > len ? cleaned.substring(0, len) + '...' : cleaned;
    };

    const eventsHtml = sortedEvents.map(event => {
        const date = new Date(event.date);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        const tags = getEventTags(event);
        const shortDesc = truncate(event.description, 100);
        const shortTitle = truncate(event.title, 60);
        const shortLocation = truncate(event.location.name + ', ' + event.location.address, 50);

        return `
            <div class="event-card" onclick="showEventDetails('${event.id}')">
                <h3>${shortTitle}</h3>
                <p>${shortDesc}</p>
                <p><strong>📅 ${date.toLocaleDateString()}</strong> ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}${endDate ? ' - ' + endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                <p>📍 ${shortLocation}</p>
                <div class="event-meta">${tags}</div>
            </div>
        `;
    }).join('');

    listContainer.innerHTML = eventsHtml;
}

// Show event details in modal
function showEventDetails(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');

    const date = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const tags = getEventTags(event);

    modalBody.innerHTML = `
        <h2>${event.title}</h2>
        <div class="event-details">
            <p><strong>📅 ${t('event.date')}:</strong> ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}${endDate ? ' - ' + endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
            <p><strong>📍 ${t('event.location')}:</strong> ${event.location.name}<br>${event.location.address}</p>
            <p><strong>👥 ${t('event.organizer')}:</strong> ${event.organizer}</p>
            <p><strong>ℹ️ ${t('event.description')}:</strong><br>${event.description}</p>
            <div class="event-meta">${tags}</div>
            ${event.url ? `<p><a href="${event.url}" target="_blank" class="btn-calendar" style="margin-top: 1rem;">🏴‍☠️ Take Me There</a></p>` : ''}
            <div class="calendar-buttons">
                <button class="btn-calendar" onclick="addToGoogleCalendar('${event.id}')">📅 Save to Calendar</button>
                <button class="btn-calendar" onclick="downloadICS('${event.id}')">💾 Download .ics</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Add to Google Calendar
function addToGoogleCalendar(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
    url.searchParams.append('details', event.description);
    url.searchParams.append('location', `${event.location.name}, ${event.location.address}`);

    window.open(url.toString(), '_blank');
}

// Download ICS file
function downloadICS(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Indiana Entrepreneur Events//EN
BEGIN:VEVENT
UID:${event.id}@indiana-events.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location.name}, ${event.location.address}
URL:${event.url || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Apply filters
function applyFilters() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const filterFree = document.getElementById('filterFree').checked;
    const filterFood = document.getElementById('filterFood').checked;
    const filterAppetizers = document.getElementById('filterAppetizers').checked;
    const filterNonAlcohol = document.getElementById('filterNonAlcohol').checked;
    const filterAlcohol = document.getElementById('filterAlcohol').checked;
    const filterCaptainForged = document.getElementById('filterCaptainForged').checked;

    let filteredEvents = eventsData.filter(event => {
        const eventDate = new Date(event.date);

        // Date filtering
        if (startDate && eventDate < new Date(startDate)) return false;
        if (endDate && eventDate > new Date(endDate + 'T23:59:59')) return false;

        // Feature filtering (show if ANY checked feature matches)
        const hasCheckedFeature =
            (filterFree && event.features.free) ||
            (filterFood && event.features.food) ||
            (filterAppetizers && event.features.appetizers) ||
            (filterNonAlcohol && event.features.nonAlcoholDrinks) ||
            (filterAlcohol && event.features.alcoholDrinks) ||
            (filterCaptainForged && event.features.captainForged);

        // If no filters are checked, show all events
        const anyFilterChecked = filterFree || filterFood || filterAppetizers || filterNonAlcohol || filterAlcohol || filterCaptainForged;

        return !anyFilterChecked || hasCheckedFeature;
    });

    // Update map
    addMarkersToMap(filteredEvents);

    // Update list view
    displayEventsList(filteredEvents);
}

// Setup event listeners
function setupEventListeners() {
    // Filter listeners
    document.getElementById('startDate').addEventListener('change', applyFilters);
    document.getElementById('endDate').addEventListener('change', applyFilters);
    document.getElementById('filterFree').addEventListener('change', applyFilters);
    document.getElementById('filterFood').addEventListener('change', applyFilters);
    document.getElementById('filterAppetizers').addEventListener('change', applyFilters);
    document.getElementById('filterNonAlcohol').addEventListener('change', applyFilters);
    document.getElementById('filterAlcohol').addEventListener('change', applyFilters);
    document.getElementById('filterCaptainForged').addEventListener('change', applyFilters);

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('filterFree').checked = true;
        document.getElementById('filterFood').checked = true;
        document.getElementById('filterAppetizers').checked = true;
        document.getElementById('filterNonAlcohol').checked = true;
        document.getElementById('filterAlcohol').checked = true;
        document.getElementById('filterCaptainForged').checked = true;
        applyFilters();
    });

    // View toggle listeners
    document.getElementById('mapViewBtn').addEventListener('click', () => {
        setView('map');
    });

    document.getElementById('listViewBtn').addEventListener('click', () => {
        setView('list');
    });

    // Modal close
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            modal.classList.remove('active');
        };
    }

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    };

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    });

    // Story accordion
    const readMoreBtn = document.getElementById('readMoreBtn');
    const fullStory = document.getElementById('fullStory');

    if (readMoreBtn && fullStory) {
        readMoreBtn.addEventListener('click', () => {
            if (fullStory.style.display === 'none' || fullStory.style.display === '') {
                fullStory.style.display = 'block';
                readMoreBtn.textContent = '⚡ Hide the Tale ⚡';
            } else {
                fullStory.style.display = 'none';
                readMoreBtn.textContent = '⚡ Read the Full Tale ⚡';
                // Scroll back to the button
                readMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Bad Actor Reporting Form
    const badActorForm = document.getElementById('badActorForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const warningBtn = document.getElementById('warningBtn');
    const championBtn = document.getElementById('championBtn');
    const reportTypeInput = document.getElementById('reportType');
    const warningGuidelines = document.getElementById('warningGuidelines');
    const championGuidelines = document.getElementById('championGuidelines');
    const descriptionLabel = document.getElementById('descriptionLabel');
    const evidenceLabel = document.getElementById('evidenceLabel');
    const submitBtn = document.getElementById('submitBtn');
    const whatHappenedTextarea = document.getElementById('whatHappened');

    // Toggle between Warning and Champion modes
    if (warningBtn && championBtn) {
        warningBtn.addEventListener('click', () => {
            // Update buttons
            warningBtn.classList.add('active', 'warning');
            warningBtn.classList.remove('champion');
            championBtn.classList.remove('active', 'champion');

            // Update hidden input
            reportTypeInput.value = 'warning';

            // Update guidelines
            warningGuidelines.style.display = 'block';
            championGuidelines.style.display = 'none';

            // Update form labels
            descriptionLabel.textContent = 'What Happened (Facts Only) *';
            evidenceLabel.textContent = 'Evidence (Optional)';
            submitBtn.textContent = '⚠️ Submit Warning Report';
            whatHappenedTextarea.placeholder = 'Describe what happened. Stick to verifiable facts.';
        });

        championBtn.addEventListener('click', () => {
            // Update buttons
            championBtn.classList.add('active', 'champion');
            championBtn.classList.remove('warning');
            warningBtn.classList.remove('active', 'warning');

            // Update hidden input
            reportTypeInput.value = 'champion';

            // Update guidelines
            warningGuidelines.style.display = 'none';
            championGuidelines.style.display = 'block';

            // Update form labels
            descriptionLabel.textContent = 'Why They\'re a Champion *';
            evidenceLabel.textContent = 'Specific Examples (Optional)';
            submitBtn.textContent = '⭐ Celebrate Champion';
            whatHappenedTextarea.placeholder = 'Describe how they went above and beyond to support you as a founder.';
        });
    }

    if (badActorForm) {
        badActorForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // SPAM PROTECTION 1: Honeypot check
            const honeypot = document.getElementById('website').value;
            if (honeypot) {
                console.log('Bot detected via honeypot');
                return; // Silently reject bots
            }

            // SPAM PROTECTION 2: Rate limiting (1 submission per hour)
            const lastSubmitTime = localStorage.getItem('mutiny19_last_submit');
            const currentTime = Date.now();
            const oneHour = 60 * 60 * 1000;

            if (lastSubmitTime && (currentTime - parseInt(lastSubmitTime)) < oneHour) {
                const timeLeft = Math.ceil((oneHour - (currentTime - parseInt(lastSubmitTime))) / 60000);
                formError.querySelector('p').textContent = `⏰ Please wait ${timeLeft} minutes before submitting another report.`;
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Get form data
            const formData = {
                reportType: document.getElementById('reportType').value,
                type: document.getElementById('actorType').value,
                name: document.getElementById('actorName').value,
                whatHappened: document.getElementById('whatHappened').value,
                timeline: document.getElementById('timeline').value,
                evidence: document.getElementById('evidence').value || 'None provided'
            };

            // SPAM PROTECTION 3: Minimum character requirements
            if (formData.whatHappened.length < 50) {
                formError.querySelector('p').textContent = '❌ Description must be at least 50 characters. Please provide more detail.';
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            if (formData.name.length < 3) {
                formError.querySelector('p').textContent = '❌ Please provide a valid name or company.';
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Hide previous messages
            formSuccess.style.display = 'none';
            formError.style.display = 'none';

            try {
                // Discord webhook URL for verified founders channel
                const webhookUrl = 'https://discord.com/api/webhooks/1440836011079761990/C9F3u_15uHf93FSxnh1yyJQs_eGVvJLLCXnz7C1bZ4m7m6vAWlNrZjhwmCarR3WAsqEZ';

                // Format message for Discord based on type
                let discordMessage;
                if (formData.reportType === 'champion') {
                    discordMessage = {
                        content: `**⭐ CHAMPION CELEBRATION ⭐**\n\n` +
                                 `**Type:** ${formData.type}\n` +
                                 `**Name/Company:** ${formData.name}\n` +
                                 `**Timeline:** ${formData.timeline}\n\n` +
                                 `**Why They're a Champion:**\n${formData.whatHappened}\n\n` +
                                 `**Specific Examples:** ${formData.evidence}\n\n` +
                                 `*Celebration submitted anonymously via Mutiny19.com* 🎉`
                    };
                } else {
                    discordMessage = {
                        content: `**⚠️ WARNING REPORT ⚠️**\n\n` +
                                 `**Type:** ${formData.type}\n` +
                                 `**Name/Company:** ${formData.name}\n` +
                                 `**Timeline:** ${formData.timeline}\n\n` +
                                 `**What Happened:**\n${formData.whatHappened}\n\n` +
                                 `**Evidence:** ${formData.evidence}\n\n` +
                                 `*Report submitted anonymously via Mutiny19.com*`
                    };
                }

                // Submit to Discord webhook
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(discordMessage)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit report');
                }

                // Store submission time for rate limiting
                localStorage.setItem('mutiny19_last_submit', currentTime.toString());

                // Update success message based on report type
                const successMessage = formData.reportType === 'champion'
                    ? '✅ Champion celebration submitted! Thank you for recognizing exceptional support.'
                    : '✅ Warning report submitted. Thank you for protecting the crew.';
                formSuccess.querySelector('p').textContent = successMessage;

                formSuccess.style.display = 'block';
                badActorForm.reset();

                // Reset to champion mode (default)
                if (championBtn && reportTypeInput) {
                    championBtn.click();
                }

                // Scroll to success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                console.error('Error submitting report:', error);
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
}

// Set view mode
function setView(mode) {
    currentView = mode;
    const mapContainer = document.getElementById('mapContainer');
    const listContainer = document.getElementById('listContainer');

    // Update button states
    document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));

    if (mode === 'map') {
        mapContainer.style.display = 'block';
        listContainer.style.display = 'none';
        document.getElementById('mapViewBtn').classList.add('active');
        setTimeout(() => map.invalidateSize(), 100);
    } else if (mode === 'list') {
        mapContainer.style.display = 'none';
        listContainer.style.display = 'block';
        document.getElementById('listViewBtn').classList.add('active');
    } else {
        mapContainer.style.display = 'block';
        listContainer.style.display = 'block';
        mapContainer.style.height = '400px';
        listContainer.style.height = '400px';
        document.getElementById('bothViewBtn').classList.add('active');
        setTimeout(() => map.invalidateSize(), 100);
    }
}

// Make functions globally accessible for onclick handlers
window.showEventDetails = showEventDetails;
window.addToGoogleCalendar = addToGoogleCalendar;
window.downloadICS = downloadICS;
