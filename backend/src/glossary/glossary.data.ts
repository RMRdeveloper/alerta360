export const supportedLocales = ['es', 'en'] as const;
export const defaultLocale = 'en' as const;

export const glossaryCategoryIds = ['platform', 'legal'] as const;

export const termKeysByCategory: Record<
  (typeof glossaryCategoryIds)[number],
  readonly string[]
> = {
  platform: [
    'sighting',
    'activeCase',
    'riskMap',
    'reward',
    'missingProfile',
    'preventiveRegistration',
  ],
  legal: [
    'amberAlert',
    'formalReport',
    'custody',
    'abduction',
    'humanTrafficking',
    'activeSearch',
  ],
};

type TermEntry = { term: string; definition: string };
type LocaleGlossary = {
  categories: Record<string, string>;
  terms: Record<string, TermEntry>;
};

export const glossaryByLocale: Record<string, LocaleGlossary> = {
  en: {
    categories: {
      platform: 'Platform Terms',
      legal: 'Legal & Contextual Terms',
    },
    terms: {
      sighting: {
        term: 'Sighting',
        definition:
          'A report submitted by a community member indicating a possible location where a missing person was seen. Sightings help narrow down search areas.',
      },
      activeCase: {
        term: 'Active Case',
        definition:
          'A missing person case that is currently being tracked and investigated. The person has not yet been found.',
      },
      riskMap: {
        term: 'Risk Map',
        definition:
          'An interactive geographic visualization showing the locations of active missing person cases and reported sightings.',
      },
      reward: {
        term: 'Reward',
        definition:
          'A monetary incentive offered by families or organizations for information that leads to finding a missing person.',
      },
      missingProfile: {
        term: 'Missing Profile',
        definition:
          'A detailed record containing all known information about a missing person, including physical characteristics, last known location, and photos.',
      },
      preventiveRegistration: {
        term: 'Preventive Registration',
        definition:
          "Proactive registration of a child's information so that, in case of an emergency, an instant alert can be generated with accurate data.",
      },
      amberAlert: {
        term: 'AMBER Alert',
        definition:
          'An emergency response system that broadcasts information about missing children. Named after Amber Hagerman, it helps mobilize the community to find abducted children.',
      },
      formalReport: {
        term: 'Formal Report',
        definition:
          'An official report filed with law enforcement authorities when a person goes missing. This initiates an official investigation.',
      },
      custody: {
        term: 'Custody',
        definition:
          'The legal right to care for and make decisions about a child. Custody disputes can sometimes lead to parental abductions.',
      },
      abduction: {
        term: 'Abduction',
        definition:
          'The illegal removal or retention of a person against their will. Can be committed by strangers or family members.',
      },
      humanTrafficking: {
        term: 'Human Trafficking',
        definition:
          'A serious crime involving the exploitation of people through force, fraud, or coercion for labor, services, or commercial sex acts.',
      },
      activeSearch: {
        term: 'Active Search',
        definition:
          'The official process conducted by authorities and volunteers to locate a missing person, including physical searches and investigations.',
      },
    },
  },
  es: {
    categories: {
      platform: 'Términos de la Plataforma',
      legal: 'Términos Legales y Contextuales',
    },
    terms: {
      sighting: {
        term: 'Avistamiento',
        definition:
          'Un reporte enviado por un miembro de la comunidad indicando una posible ubicación donde se vio a una persona desaparecida. Los avistamientos ayudan a reducir las áreas de búsqueda.',
      },
      activeCase: {
        term: 'Caso Activo',
        definition:
          'Un caso de persona desaparecida que actualmente está siendo rastreado e investigado. La persona aún no ha sido encontrada.',
      },
      riskMap: {
        term: 'Mapa de Riesgo',
        definition:
          'Una visualización geográfica interactiva que muestra las ubicaciones de casos activos de personas desaparecidas y avistamientos reportados.',
      },
      reward: {
        term: 'Recompensa',
        definition:
          'Un incentivo monetario ofrecido por familias u organizaciones por información que conduzca a encontrar a una persona desaparecida.',
      },
      missingProfile: {
        term: 'Perfil de Desaparecido',
        definition:
          'Un registro detallado que contiene toda la información conocida sobre una persona desaparecida, incluyendo características físicas, última ubicación conocida y fotos.',
      },
      preventiveRegistration: {
        term: 'Registro Preventivo',
        definition:
          'Registro proactivo de la información de un hijo para que, en caso de emergencia, se pueda generar una alerta instantánea con datos precisos.',
      },
      amberAlert: {
        term: 'Alerta AMBER',
        definition:
          'Un sistema de respuesta de emergencia que difunde información sobre menores desaparecidos. Nombrado en honor a Amber Hagerman, ayuda a movilizar a la comunidad para encontrar niños secuestrados.',
      },
      formalReport: {
        term: 'Denuncia',
        definition:
          'Un reporte oficial presentado ante las autoridades cuando una persona desaparece. Esto inicia una investigación oficial.',
      },
      custody: {
        term: 'Custodia',
        definition:
          'El derecho legal de cuidar y tomar decisiones sobre un menor. Las disputas de custodia a veces pueden derivar en sustracciones parentales.',
      },
      abduction: {
        term: 'Sustracción',
        definition:
          'La remoción o retención ilegal de una persona contra su voluntad. Puede ser cometida por extraños o miembros de la familia.',
      },
      humanTrafficking: {
        term: 'Trata de Personas',
        definition:
          'Un delito grave que involucra la explotación de personas mediante fuerza, fraude o coerción para trabajo, servicios o actos sexuales comerciales.',
      },
      activeSearch: {
        term: 'Búsqueda Activa',
        definition:
          'El proceso oficial realizado por autoridades y voluntarios para localizar a una persona desaparecida, incluyendo búsquedas físicas e investigaciones.',
      },
    },
  },
};
