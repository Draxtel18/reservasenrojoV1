export const documentary = {
  id: 'w7axbt3LLbg',
  title: 'Reservas en rojo',
  description: 'Una investigación sobre las dificultades de acceso a la sangre durante emergencias médicas en Piura, Perú.',
};

export const sections = [
  ['reportaje', 'Documental'], ['comic', 'Cómic'], ['podcast', 'Podcast'],
  ['participa', 'Cuestionario'], ['cronologia', 'Cronología'],
  ['lectura', 'Reportaje escrito'], ['equipo', 'Equipo'],
] as const;

export const questions = [
  {
    prompt: '¿En qué ciudad investigamos?',
    answers: ['Lima', 'Piura', 'Arequipa'], correct: 1,
    explanation: 'El especial se centra en las dificultades de acceso a la sangre en Piura, Perú. Fuente: presentación del proyecto.',
  },
  {
    prompt: '¿Cuál es el tema del especial?',
    answers: ['El acceso a la sangre en emergencias', 'La construcción de hospitales', 'La industria farmacéutica'], correct: 0,
    explanation: 'El eje de la investigación es el acceso a la sangre durante emergencias médicas. Fuente: presentación del proyecto.',
  },
  {
    prompt: '¿Qué respalda una afirmación?',
    answers: ['Su popularidad en redes', 'Una suposición convincente', 'Fuentes y evidencia verificables'], correct: 2,
    explanation: 'Este especial exige contrastar las afirmaciones con fuentes y evidencia. No se publican testimonios, cifras o acusaciones sin respaldo.',
  },
];

export const editorial = {
  lead: '¿Cuánto vale una gota de sangre cuando una vida está en juego?',
  context: 'En Piura, el acceso a la sangre durante una emergencia médica es el punto de partida de esta investigación. La mirada está puesta en los pacientes, sus familias y el sistema de atención.',
  purpose: 'El proyecto busca explorar las dificultades de acceso y las posibles prácticas de aprovechamiento económico de la necesidad. Son ejes de investigación, no conclusiones acreditadas en esta página.',
  status: 'El reportaje escrito completo, las entrevistas y las referencias documentales están pendientes de incorporación. Esta presentación no los sustituye.',
};

export const portals = [
  { id: 'reportaje', title: 'La historia, de cerca', label: 'Ver reportaje', kind: 'Reportaje audiovisual', image: 'banco', alt: 'Ingreso al banco de sangre y área de donantes', description: 'Una investigación sobre el acceso a la sangre durante emergencias médicas en Piura. El documental es el punto de partida.' },
  { id: 'comic', title: 'Otra forma de mirar', label: 'Explorar cómic', kind: 'Narrativa ilustrada', image: null, alt: '', description: 'La espera: un cómic ficticio de tres páginas, con un lector para explorar sus ilustraciones y conversaciones.' },
  { id: 'podcast', title: 'Escuchar para entender', label: 'Explorar podcast', kind: 'Narrativa sonora', image: 'procedimiento', alt: 'Trabajo del personal durante una extracción de sangre', description: 'Escucha una narración sintética de muestra, con controles de reproducción, descarga y transcripción completa.' },
  { id: 'participa', title: 'Pon tu mirada a prueba', label: 'Abrir cuestionario', kind: 'Experiencia interactiva', image: 'prueba', alt: 'Prueba realizada en el dedo de una persona', description: 'Tres preguntas sobre el enfoque de la investigación y el valor de la información verificada. Participa a tu ritmo.' },
  { id: 'cronologia', title: 'Los hechos, en contexto', label: 'Explorar cronología', kind: 'Línea de tiempo', image: 'donacion', alt: 'Bolsa de sangre en el equipo de extracción', description: 'Cinco jornadas de una secuencia ficticia. Una cronología de demostración, no un registro de hechos documentados.' },
  { id: 'lectura', title: 'Detrás de la urgencia', label: 'Leer el reportaje', kind: 'Reportaje escrito', image: 'reserva', alt: 'Material de extracción en una bandeja', description: 'Una lectura de ficción editorial que acompaña el cómic. Contenido de muestra, separado de la investigación real.' },
  { id: 'equipo', title: 'Quiénes investigan', label: 'Conocer al equipo', kind: 'Sobre nosotros', image: null, alt: '', description: 'Nueve perfiles ficticios con avatares ilustrados, roles y biografías de muestra para explorar la composición del equipo.' },
];
