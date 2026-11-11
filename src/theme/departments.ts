import { Department } from '../core/roy-engine/types';

export const PILPIS_DEPARTMENTS: Department[] = [
  {
    id: 'D1',
    code: 'D1-PROC',
    name: 'Coordinación y Diseño de Procesos',
    color: '#2563EB',      // Azul Técnico
    lightBg: '#EFF6FF',
    border: '#93C5FD',
    textColor: '#1D4ED8',
    description: 'Especificaciones de proceso, simulación y diseño básico de torres de separación',
    personnel: [
      'GARCÍA MADRID, PABLO',
      'GARCÍA VILLAR, JIMENA',
      'MORENO GONZÁLEZ, VÍCTOR',
      'VICENTE RUBIO, JIMENA'
    ]
  },
  {
    id: 'D2',
    code: 'D2-RECIP',
    name: 'Gestión de Proyectos y Recipientes',
    color: '#7C3AED',      // Violeta Industrial
    lightBg: '#F5F3FF',
    border: '#C4B5FD',
    textColor: '#6D28D9',
    description: 'Ingeniería básica de recipientes, almacenamiento 15d n-butano y programación del proyecto',
    personnel: [
      'ABURTO SILVA, SOFÍA ANTONIA',
      'CABALLERO RODRIGUEZ, PAULA',
      'GARCÍA DE LASTRES, DANIEL',
      'QUIJANO FERNÁNDEZ, SARA'
    ]
  },
  {
    id: 'D3',
    code: 'D3-BOMB',
    name: 'Control de Procesos y Diseño de Bombas',
    color: '#0D9488',      // Esmeralda / Cian Técnico
    lightBg: '#F0FDFA',
    border: '#99F6E4',
    textColor: '#0F766E',
    description: 'Ingeniería básica de bombas, instrumentación/control y Documento de Impacto Ambiental',
    personnel: [
      'MENECES CARLOS, ARACELY ABIGAIL',
      'MOSLARES ORGAZ, IVÁN',
      'RODRIGUEZ GONZALEZ, IVAN',
      'WAGNER-ROMERO, MARTÍN LORENZO'
    ]
  },
  {
    id: 'D4',
    code: 'D4-CAMB',
    name: 'Seguridad y Cambiadores de Calor',
    color: '#EA580C',      // Naranja Quemado / Seguridad
    lightBg: '#FFF7ED',
    border: '#FED7AA',
    textColor: '#C2410C',
    description: 'Diseño térmico/mecánico de intercambiadores, enfriador de fondo, antorcha y análisis HAZOP',
    personnel: [
      'ARIAS MONTALVO, ALEJANDRO',
      'BARQUILLA CEDILLO, BÁRBARA',
      'MOYA GÁLVEZ, ALEJANDRO',
      'VÁZQUEZ GONZÁLEZ, PAULA'
    ]
  },
  {
    id: 'D5',
    code: 'D5-PLANOS',
    name: 'Planos y Análisis Económico',
    color: '#16A34A',      // Verde Ingeniería
    lightBg: '#F0FDF4',
    border: '#BBF7D0',
    textColor: '#15803D',
    description: 'Isométricos, P&ID, dimensionamiento de líneas y evaluación económica (VAN/TIR/Sensibilidad)',
    personnel: [
      'LEIVA ZACARÍAS, CHRISTIAN JESÚS',
      'MENCHERO NAVARRO, ALICIA',
      'OME PEÑA, ESTEFANIA',
      'PÉREZ LORENZO, ADÁN'
    ]
  },
  {
    id: 'D6',
    code: 'D6-CONST',
    name: 'Aprovisionamiento y Construcción',
    color: '#475569',      // Gris Pizarra
    lightBg: '#F8FAFC',
    border: '#CBD5E1',
    textColor: '#334155',
    description: 'Gestión de compras de equipos críticos, obra civil, montaje mecánico y puesta en marcha',
    personnel: ['EQUIPO EXTERNO / SUPERVISIÓN PILPIS']
  }
];

export function getDepartmentById(id: string): Department {
  return PILPIS_DEPARTMENTS.find(d => d.id === id) || {
    id,
    code: id,
    name: 'Departamento General',
    color: '#64748B',
    lightBg: '#F1F5F9',
    border: '#CBD5E1',
    textColor: '#475569',
  };
}
