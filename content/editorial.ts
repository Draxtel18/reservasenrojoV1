export const documentary = {
  id: '-KErtns1Jv0',
  title: 'Reservas en rojo',
  description: 'Una investigación sobre las dificultades de acceso a la sangre durante emergencias médicas en Piura, Perú.',
};

export const sections = [
  ['reportaje', 'Reportaje'], ['comic', 'Cómic'], ['podcast', 'Podcast'],
  ['participa', 'Experiencia periodística gamificada'], ['cronologia', 'Cronología'],
  ['lectura', 'Reportaje escrito'], ['equipo', 'Equipo'],
] as const;

export const questions = [
  {
    prompt: '¿En qué ciudad investigamos?',
    answers: ['Lima', 'Piura', 'Arequipa'], correct: 1,
    explanation: 'El proyecto se centra en las dificultades de acceso a la sangre en Piura, Perú. Fuente: presentación del proyecto.',
  },
  {
    prompt: '¿Cuál es el tema del proyecto?',
    answers: ['El acceso a la sangre en emergencias', 'La construcción de hospitales', 'La industria farmacéutica'], correct: 0,
    explanation: 'El eje de la investigación es el acceso a la sangre durante emergencias médicas. Fuente: presentación del proyecto.',
  },
  {
    prompt: '¿Qué respalda una afirmación?',
    answers: ['Su popularidad en redes', 'Una suposición convincente', 'Fuentes y evidencia verificables'], correct: 2,
    explanation: 'Este proyecto exige contrastar las afirmaciones con fuentes y evidencia. No se publican testimonios, cifras o acusaciones sin respaldo.',
  },
];

export const editorial = {
  lead: '¿Cuánto vale una gota de sangre cuando una vida está en juego?',
  context: 'En Piura, el acceso a la sangre durante una emergencia médica es el punto de partida de esta investigación. La mirada está puesta en los pacientes, sus familias y el sistema de atención.',
  purpose: 'El proyecto busca explorar las dificultades de acceso y las posibles prácticas de aprovechamiento económico de la necesidad. Son ejes de investigación, no conclusiones acreditadas en esta página.',
  status: 'El reportaje escrito completo y las entrevistas están pendientes de incorporación. Esta presentación no los sustituye.',
};

export const readingNotes = [
  { title: 'El punto de partida', text: editorial.context },
  { title: 'Qué busca el proyecto', text: editorial.purpose },
  { title: 'Lo que falta por incorporar', text: editorial.status + ' La autoría, la fecha de publicación y las fuentes del texto están pendientes de confirmación.' },
];

export const timelineNotes = [
  { label: '1818', title: 'Primera transfusión humana exitosa', text: 'El inglés James Blundell realizó la primera transfusión de sangre humana.' },
  { label: '1901', title: 'Descubrimiento de los grupos sanguíneos', text: 'El austriaco Karl Landsteiner logró identificar los grupos A, B y O.' },
  { label: '1914', title: 'Conservación de sangre', text: 'Se utiliza citrato de sodio para evitar la coagulación y facilitar el almacenamiento.' },
  { label: '1937', title: 'Primeros bancos', text: 'Se crea uno de los primeros bancos de sangre en Chicago, Estados Unidos.' },
  { label: '1943', title: 'Primer banco de sangre en el Perú', text: 'Se fundó el primer banco de sangre en Perú, en el hospital 2 de mayo.' },
  { label: '1948', title: 'Donación voluntaria y organizada', text: 'Se impulsa la donación voluntaria y organizada de sangre globalmente.' },
  { label: '1952', title: 'Bolsas plásticas', text: 'Se implementan las bolsas plásticas para almacenar la sangre.' },
  { label: '1975', title: 'Del vidrio al plástico', text: 'Las bolsas de plástico se generalizan en lugar de las botellas de vidrio.' },
  { label: '1985', title: 'Detección del VIH', text: 'Se inicia el análisis de sangre donada para detectar el VIH.' },
  { label: '1990', title: 'Detección de hepatitis C', text: 'Se incorpora la detección de hepatitis C en las donaciones.' },
  { label: '2004', title: 'Día mundial del donante', text: 'Se establece el 14 de junio como el día mundial del donante de sangre.' },
  { label: '2005', title: 'Servicios de donación y transfusión', text: 'Se fortalecen los servicios de donación y transfusión.' },
  { label: '2017', title: 'Veinte bancos de sangre en el Perú', text: 'Sistemas Analíticos instaló 20 bancos de sangre en Perú y tamizó más de 380 mil bolsas.' },
  { label: '2023', title: 'Donantes aptos', text: 'Se registraron 1,100 donantes aptos para donaciones de sangre.' },
  { label: '2024', title: 'Composición de las donaciones', text: 'De 2,514 donantes, el 19% fue voluntario y el 80.1% por reposición.' },
  { label: '2025', title: 'Unidades recaudadas', text: 'Se recaudaron 382,586 unidades; faltan 242,162 para cubrir la demanda de 624,748.' },
  { label: '2026', title: 'La donación voluntaria salva vidas', text: 'La donación voluntaria salva millones de vidas mediante bancos de sangre y campañas.' },
];

// Estimate only the available text, not the unpublished full report.
export const readingMinutes = Math.max(1, Math.ceil(readingNotes.map(item => item.title + ' ' + item.text).join(' ').split(/\s+/).length / 200));

export const portals = [
  { id: 'reportaje', title: 'La historia, de cerca', label: 'Ver reportaje', kind: 'Reportaje audiovisual', image: 'banco', alt: 'Ingreso al banco de sangre y área de donantes', description: 'Una investigación sobre el acceso a la sangre durante emergencias médicas en Piura. El reportaje es el punto de partida.' },
  { id: 'comic', title: 'Otra forma de mirar', label: 'Explorar cómic', kind: 'Narrativa ilustrada', image: null, alt: '', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
  { id: 'podcast', title: 'Escuchar para entender', label: 'Explorar podcast', kind: 'Narrativa sonora', image: 'procedimiento', alt: 'Trabajo del personal durante una extracción de sangre', description: 'Conoce las opiniones y recomendaciones de expertos de distintos rubros sobre la donación de sangre.'},
  { id: 'participa', title: 'Pon tu mirada a prueba', label: 'Comenzar', kind: 'Experiencia gamificada', image: 'prueba', alt: 'Prueba realizada en el dedo de una persona', description: 'Una experiencia interactiva sobre la donación de sangre que te invita a tomar decisiones y descubrir cómo puedes salvar vidas.' },
  { id: 'cronologia', title: 'Los hechos, en contexto', label: 'Explorar cronología', kind: 'Línea de tiempo', image: 'donacion', alt: 'Bolsa de sangre en el equipo de extracción', description: 'Recorre los principales acontecimientos que marcaron la evolución de la donación y transfusión de sangre en el mundo y el Perú, desde sus primeros avances hasta la actualidad.' },
  { id: 'lectura', title: 'Detrás de la urgencia', label: 'Leer el reportaje', kind: 'Reportaje escrito', image: 'reserva', alt: 'Material de extracción en una bandeja', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
  { id: 'equipo', title: 'Quiénes investigan', label: 'Conocer al equipo', kind: 'Sobre nosotros', image: null, alt: '', description: 'Detrás de Reservas en Rojo hay un equipo comprometido con visibilizar la importancia de la donación de sangre y generar conciencia.'},
];
