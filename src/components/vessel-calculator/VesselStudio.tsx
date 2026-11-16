import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Cylinder,
  CircleDot,
  Layers,
  Settings2,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Maximize2,
  ShieldCheck,
  Scale,
  Droplets,
  Gauge,
  Sparkles,
  FolderDown,
  FolderUp,
  Plus,
  Trash2,
  Sun,
  Moon,
  RotateCcw
} from 'lucide-react';

export interface VesselStudioProps {
  isDark?: boolean;
  onToggleDark?: () => void;
}

export type VesselGeometry = 'horizontal' | 'vertical' | 'esferico';
export type HeadType = 'eliptico_2_1' | 'toriesferico' | 'semiesferico' | 'plano';

export interface VesselState {
  tag: string;
  nombre: string;
  servicio: string;
  tipoGeometria: VesselGeometry;
  tipoCabezal: HeadType;
  
  // Proceso
  caudalM3h: number;
  densidadKgm3: number;
  tiempoRetencionMin: number;
  nllPct: number;
  
  // Geometría
  diametroInteriorMm: number;
  longitudTtMm: number;
  tieneBota: boolean;
  botaDiametroMm: number;
  botaAlturaMm: number;
  
  // Mecánica ASME
  presionOpBar: number;
  presionDesBar: number;
  tempDesC: number;
  material: string;
  tensionAdmisibleMpa: number;
  eficienciaSoldadura: number;
  sobreespesorCorrosionMm: number;
}

const PRESETS: Record<string, VesselState> = {
  v100: {
    tag: 'V-100',
    nombre: 'Tanque Pulmón de Carga C4',
    servicio: 'Amortiguamiento de alimentación a deisobutanizadora T-100',
    tipoGeometria: 'horizontal',
    tipoCabezal: 'eliptico_2_1',
    caudalM3h: 45.05,
    densidadKgm3: 555.0,
    tiempoRetencionMin: 15.0,
    nllPct: 50.0,
    diametroInteriorMm: 2000.0,
    longitudTtMm: 6600.0,
    tieneBota: false,
    botaDiametroMm: 400.0,
    botaAlturaMm: 600.0,
    presionOpBar: 10.79,
    presionDesBar: 12.75,
    tempDesC: 65.0,
    material: 'SA-516 Gr. 70',
    tensionAdmisibleMpa: 138.0,
    eficienciaSoldadura: 0.85,
    sobreespesorCorrosionMm: 2.0
  },
  v101: {
    tag: 'V-101',
    nombre: 'Acumulador de Reflujo y Destilado',
    servicio: 'Acumulación de condensado i-butano para reflujo y destilado',
    tipoGeometria: 'horizontal',
    tipoCabezal: 'eliptico_2_1',
    caudalM3h: 76.37,
    densidadKgm3: 545.0,
    tiempoRetencionMin: 8.0,
    nllPct: 50.0,
    diametroInteriorMm: 1900.0,
    longitudTtMm: 6600.0,
    tieneBota: true,
    botaDiametroMm: 400.0,
    botaAlturaMm: 600.0,
    presionOpBar: 5.88,
    presionDesBar: 8.34,
    tempDesC: 70.0,
    material: 'SA-516 Gr. 70',
    tensionAdmisibleMpa: 138.0,
    eficienciaSoldadura: 0.85,
    sobreespesorCorrosionMm: 2.0
  },
  v102: {
    tag: 'V-102',
    nombre: 'Tanque Pulmón de Fondos (n-Butano)',
    servicio: 'Aspiración bomba de envío B-4 (400 m, cota +20 m a parque)',
    tipoGeometria: 'horizontal',
    tipoCabezal: 'eliptico_2_1',
    caudalM3h: 30.58,
    densidadKgm3: 570.0,
    tiempoRetencionMin: 12.0,
    nllPct: 50.0,
    diametroInteriorMm: 1600.0,
    longitudTtMm: 5600.0,
    tieneBota: false,
    botaDiametroMm: 400.0,
    botaAlturaMm: 600.0,
    presionOpBar: 6.86,
    presionDesBar: 9.32,
    tempDesC: 85.0,
    material: 'SA-516 Gr. 70',
    tensionAdmisibleMpa: 138.0,
    eficienciaSoldadura: 0.85,
    sobreespesorCorrosionMm: 2.0
  },
  tk100_esfera: {
    tag: 'TK-100 A/B/C',
    nombre: 'Esfera Almacenamiento n-Butano (15 días)',
    servicio: 'Almacenamiento presurizado de n-butano producto en parque exterior',
    tipoGeometria: 'esferico',
    tipoCabezal: 'semiesferico',
    caudalM3h: 30.58,
    densidadKgm3: 565.0,
    tiempoRetencionMin: 360.0 * 60.0,
    nllPct: 85.0,
    diametroInteriorMm: 20300.0,
    longitudTtMm: 0.0,
    tieneBota: false,
    botaDiametroMm: 0,
    botaAlturaMm: 0,
    presionOpBar: 3.73,
    presionDesBar: 5.88,
    tempDesC: 55.0,
    material: 'SA-516 Gr. 70',
    tensionAdmisibleMpa: 138.0,
    eficienciaSoldadura: 1.00,
    sobreespesorCorrosionMm: 2.0
  },
  personalizado: {
    tag: 'V-NUEVO',
    nombre: 'Nuevo Recipiente Personalizado',
    servicio: 'Servicio de proceso configurable',
    tipoGeometria: 'horizontal',
    tipoCabezal: 'eliptico_2_1',
    caudalM3h: 25.0,
    densidadKgm3: 600.0,
    tiempoRetencionMin: 10.0,
    nllPct: 50.0,
    diametroInteriorMm: 1800.0,
    longitudTtMm: 5400.0,
    tieneBota: false,
    botaDiametroMm: 400.0,
    botaAlturaMm: 600.0,
    presionOpBar: 6.0,
    presionDesBar: 8.5,
    tempDesC: 60.0,
    material: 'SA-516 Gr. 70',
    tensionAdmisibleMpa: 138.0,
    eficienciaSoldadura: 0.85,
    sobreespesorCorrosionMm: 2.0
  }
};

const TABLAS_ESPESORES_COMERCIALES = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 40, 45, 50];

function redondearComercial(t: number): number {
  for (const esp of TABLAS_ESPESORES_COMERCIALES) {
    if (esp >= t) return esp;
  }
  return Math.ceil(t);
}

const DEFAULT_VESSELS: VesselState[] = [
  PRESETS.v100,
  PRESETS.v101,
  PRESETS.v102,
  PRESETS.tk100_esfera,
];

export const VesselStudio: React.FC<VesselStudioProps> = ({ isDark, onToggleDark }) => {
  const [vessels, setVessels] = useState<VesselState[]>(() => {
    try {
      const saved = localStorage.getItem('pilpis_vessels_library');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_VESSELS;
  });

  const [activeVesselIndex, setActiveVesselIndex] = useState<number>(0);
  const vessel = vessels[activeVesselIndex] || vessels[0] || PRESETS.v100;
  const [activeSubTab, setActiveSubTab] = useState<'esquema' | 'calculos' | 'comparativa'>('esquema');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Días para comparativa interactiva
  const [diasAlmacenamiento, setDiasAlmacenamiento] = useState<number>(15);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pilpis_vessels_library', JSON.stringify(vessels));
    } catch {
      // ignore
    }
  }, [vessels]);

  // Verificar backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  const updateVessel = (field: keyof VesselState, value: any) => {
    setVessels(prev => {
      const copy = [...prev];
      copy[activeVesselIndex] = { ...copy[activeVesselIndex], [field]: value };
      return copy;
    });
  };

  const handleAddVessel = () => {
    const nextNum = vessels.length + 1;
    const newVessel: VesselState = {
      ...PRESETS.personalizado,
      tag: `V-${100 + vessels.length}`,
      nombre: `Nuevo Recipiente ${nextNum}`,
      servicio: 'Nuevo servicio de proceso',
    };
    setVessels(prev => [...prev, newVessel]);
    setActiveVesselIndex(vessels.length);
  };

  const handleDuplicateVessel = () => {
    const current = vessels[activeVesselIndex];
    if (!current) return;
    const copy: VesselState = {
      ...current,
      tag: `${current.tag}-B`,
      nombre: `${current.nombre} (Copia)`,
    };
    setVessels(prev => [...prev, copy]);
    setActiveVesselIndex(vessels.length);
  };

  const handleDeleteVessel = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (vessels.length <= 1) {
      alert('El proyecto debe contener al menos un recipiente.');
      return;
    }
    const targetTag = vessels[idx]?.tag || 'este equipo';
    if (window.confirm(`¿Deseas eliminar el equipo ${targetTag} del proyecto?`)) {
      setVessels(prev => prev.filter((_, i) => i !== idx));
      setActiveVesselIndex(prev => (prev >= idx && prev > 0 ? prev - 1 : 0));
    }
  };

  const handleExportProjectJson = () => {
    const projectData = {
      app: 'PILPIS Vessel Studio',
      norma: 'ASME Boiler and Pressure Vessel Code Section VIII Division 1',
      version: '1.0.0',
      cliente: 'QUIMISUR S.A.',
      proyecto: 'Planta de Fraccionamiento de C4 (San Roque, Cádiz)',
      departamento: 'DPTO 2 — Gestión de Proyectos y Diseño de Recipientes',
      empresa: 'PILPIS S.A.',
      fechaExportacion: new Date().toISOString(),
      recipientes: vessels,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proyecto_Recipientes_PILPIS_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.recipientes && Array.isArray(parsed.recipientes) && parsed.recipientes.length > 0) {
          setVessels(parsed.recipientes);
          setActiveVesselIndex(0);
          alert(`Proyecto importado con éxito: ${parsed.recipientes.length} recipientes cargados.`);
        } else {
          alert('El archivo no contiene una lista válida de recipientes en el campo "recipientes".');
        }
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToPilpisDefaults = () => {
    if (window.confirm('¿Deseas restaurar la lista oficial de recipientes del anteproyecto PILPIS (V-100, V-101, V-102 y TK-100)?')) {
      setVessels(DEFAULT_VESSELS);
      setActiveVesselIndex(0);
    }
  };

  // -------------------------------------------------------------
  // MOTOR DE CÁLCULO EN CLIENTE (ASME VIII DIV 1)
  // -------------------------------------------------------------
  const resultados = useMemo(() => {
    const Di_m = vessel.diametroInteriorMm / 1000.0;
    const Ri_m = Di_m / 2.0;
    const L_m = vessel.longitudTtMm / 1000.0;
    const P_des_mpa = vessel.presionDesBar / 10.0;
    const S = vessel.tensionAdmisibleMpa;
    const E = vessel.eficienciaSoldadura;
    const c = vessel.sobreespesorCorrosionMm;

    let volCilM3 = 0;
    let volCabM3 = 0;
    let hCabM = 0;
    let LTotalM = 0;
    let relacionLd = 0;

    if (vessel.tipoGeometria === 'esferico') {
      volCabM3 = (4.0 / 3.0) * Math.PI * Math.pow(Ri_m, 3);
      LTotalM = Di_m;
      relacionLd = 1.0;
    } else {
      volCilM3 = Math.PI * Math.pow(Ri_m, 2) * L_m;
      if (vessel.tipoCabezal === 'eliptico_2_1') {
        volCabM3 = (Math.PI / 12.0) * Math.pow(Di_m, 3);
        hCabM = Di_m / 4.0;
      } else if (vessel.tipoCabezal === 'semiesferico') {
        volCabM3 = (4.0 / 3.0) * Math.PI * Math.pow(Ri_m, 3);
        hCabM = Ri_m;
      } else if (vessel.tipoCabezal === 'toriesferico') {
        volCabM3 = 0.0847 * Math.pow(Di_m, 3);
        hCabM = 0.169 * Di_m;
      } else {
        volCabM3 = 0;
        hCabM = 0;
      }
      LTotalM = L_m + 2.0 * hCabM;
      relacionLd = Di_m > 0 ? L_m / Di_m : 0;
    }

    const volGeomTotM3 = volCilM3 + volCabM3;
    const volUtilM3 = volGeomTotM3 * (vessel.nllPct / 100.0);
    const tiempoRetencionRealMin = vessel.caudalM3h > 0 ? volUtilM3 / (vessel.caudalM3h / 60.0) : 0;

    // Espesores
    let tReqVirMm = 0;
    let tReqCabMm = 0;

    if (vessel.tipoGeometria === 'esferico') {
      const den = 2.0 * S * E - 0.2 * P_des_mpa;
      tReqVirMm = den > 0 ? (P_des_mpa * (Ri_m * 1000.0)) / den + c : 0;
      tReqCabMm = tReqVirMm;
    } else {
      const denVir = S * E - 0.6 * P_des_mpa;
      tReqVirMm = denVir > 0 ? (P_des_mpa * (Ri_m * 1000.0)) / denVir + c : 0;

      if (vessel.tipoCabezal === 'eliptico_2_1') {
        const denCab = 2.0 * S * E - 0.2 * P_des_mpa;
        tReqCabMm = denCab > 0 ? (P_des_mpa * vessel.diametroInteriorMm) / denCab + c : 0;
      } else if (vessel.tipoCabezal === 'semiesferico') {
        const denCab = 2.0 * S * E - 0.2 * P_des_mpa;
        tReqCabMm = denCab > 0 ? (P_des_mpa * (Ri_m * 1000.0)) / denCab + c : 0;
      } else if (vessel.tipoCabezal === 'toriesferico') {
        const denCab = S * E - 0.1 * P_des_mpa;
        tReqCabMm = denCab > 0 ? (0.885 * P_des_mpa * vessel.diametroInteriorMm) / denCab + c : 0;
      } else {
        tReqCabMm = vessel.diametroInteriorMm * Math.sqrt((0.33 * P_des_mpa) / (S * E)) + c;
      }
    }

    const tNomVirMm = redondearComercial(tReqVirMm);
    const tNomCabMm = redondearComercial(tReqCabMm);

    // MAWP
    const tCorrVir = tNomVirMm - c;
    let mawpMpa = 0;
    if (vessel.tipoGeometria === 'esferico') {
      mawpMpa = (2.0 * S * E * tCorrVir) / (Ri_m * 1000.0 + 0.2 * tCorrVir);
    } else {
      mawpMpa = (S * E * tCorrVir) / (Ri_m * 1000.0 + 0.6 * tCorrVir);
    }
    const mawpBar = mawpMpa * 10.0;
    const pPruebaBar = 1.3 * mawpBar;

    // Pesos
    const rhoAcero = 7850.0;
    let pesoAceroKg = 0;
    if (vessel.tipoGeometria === 'esferico') {
      const areaEsf = 4.0 * Math.PI * Math.pow(Ri_m, 2);
      pesoAceroKg = areaEsf * (tNomVirMm / 1000.0) * rhoAcero * 1.12;
    } else {
      const areaCil = Math.PI * Di_m * L_m;
      const areaCab = 2.0 * (1.084 * Math.PI * Math.pow(Ri_m, 2));
      pesoAceroKg = (areaCil * (tNomVirMm / 1000.0) + areaCab * (tNomCabMm / 1000.0)) * rhoAcero * 1.15;
    }

    const pesoOperacionKg = pesoAceroKg + volUtilM3 * vessel.densidadKgm3;
    const pesoPruebaAguaKg = pesoAceroKg + volGeomTotM3 * 1000.0;

    return {
      volGeomTotM3,
      volUtilM3,
      tiempoRetencionRealMin,
      relacionLd,
      LTotalM,
      tReqVirMm,
      tNomVirMm,
      tReqCabMm,
      tNomCabMm,
      mawpBar,
      pPruebaBar,
      pesoAceroKg,
      pesoOperacionKg,
      pesoPruebaAguaKg
    };
  }, [vessel]);

  // Cálculos dinámicos de comparativa para almacenamiento
  const comparativaAlmacenamiento = useMemo(() => {
    const horas = diasAlmacenamiento * 24.0;
    const caudalMasicoFondos = 17432.6; // kg/h n-butano
    const masaTotalTm = (caudalMasicoFondos * horas) / 1000.0;
    const rhoButano = 565.0; // kg/m3 a 25 ºC
    const volNetoM3 = (caudalMasicoFondos * horas) / rhoButano;
    const llenadoMax = 0.85; // ITC-ICG
    const volGeomTotM3 = volNetoM3 / llenadoMax;

    // Opción 1: Esferas
    const nEsferas = 3;
    const volUnitEsfera = volGeomTotM3 / nEsferas;
    const RiEsf = Math.cbrt((3.0 * volUnitEsfera) / (4.0 * Math.PI));
    const DiEsf = 2.0 * RiEsf;
    const tEsfReq = (0.588 * (RiEsf * 1000.0)) / (2.0 * 138.0 * 1.0 - 0.2 * 0.588) + 2.0;
    const tEsfNom = redondearComercial(tEsfReq);
    const pesoAceroEsfTotTm = (4.0 * Math.PI * Math.pow(RiEsf, 2) * (tEsfNom / 1000.0) * 7850 * 1.12 * nEsferas) / 1000.0;
    const capexsEsfM = 1.45 * nEsferas;
    const areaTerrenoEsfM2 = 7500.0 * (diasAlmacenamiento / 15.0);

    // Opción 2: Cigarros
    const DiCig = 4.0;
    const LCig = 40.0;
    const volCigUnit = Math.PI * Math.pow(DiCig / 2.0, 2) * LCig + (Math.PI / 12.0) * Math.pow(DiCig, 3);
    const volUtilCigUnit = volCigUnit * llenadoMax;
    const nCigarros = Math.ceil(volNetoM3 / volUtilCigUnit);
    const tCigReq = (0.588 * 2000.0) / (138.0 * 0.85 - 0.6 * 0.588) + 2.0;
    const tCigNom = redondearComercial(tCigReq);
    const areaCigUnit = Math.PI * DiCig * LCig + 2.0 * (1.084 * Math.PI * Math.pow(DiCig / 2.0, 2));
    const pesoAceroCigTotTm = (areaCigUnit * (tCigNom / 1000.0) * 7850 * 1.15 * nCigarros) / 1000.0;
    const capexCigM = 0.235 * nCigarros;
    const areaTerrenoCigM2 = 19500.0 * (nCigarros / 26.0);

    return {
      dias: diasAlmacenamiento,
      masaTotalTm,
      volNetoM3,
      volGeomTotM3,
      esferas: {
        n: nEsferas,
        di: DiEsf,
        volUnit: volUnitEsfera,
        tNom: tEsfNom,
        pesoAceroTm: pesoAceroEsfTotTm,
        capexM: capexsEsfM,
        areaM2: areaTerrenoEsfM2
      },
      cigarros: {
        n: nCigarros,
        di: DiCig,
        l: LCig,
        volUnit: volCigUnit,
        tNom: tCigNom,
        pesoAceroTm: pesoAceroCigTotTm,
        capexM: capexCigM,
        areaM2: areaTerrenoCigM2
      }
    };
  }, [diasAlmacenamiento]);

  const handleCopySummary = () => {
    const text = `PILPIS | FICHA TÉCNICA RECIPIENTE ${vessel.tag}
Denominación: ${vessel.nombre}
Servicio: ${vessel.servicio}
Geometría: ${vessel.tipoGeometria.toUpperCase()} (${vessel.tipoCabezal})
Dimensiones: Di = ${vessel.diametroInteriorMm} mm, L = ${vessel.longitudTtMm} mm, L_tot = ${resultados.LTotalM.toFixed(2)} m
Volumen Geom.: ${resultados.volGeomTotM3.toFixed(2)} m³ | Vol. Útil (${vessel.nllPct}%): ${resultados.volUtilM3.toFixed(2)} m³
Retención Real: ${resultados.tiempoRetencionRealMin.toFixed(1)} min (Caudal: ${vessel.caudalM3h} m³/h)
Condiciones: P_op = ${vessel.presionOpBar} barg, P_des = ${vessel.presionDesBar} barg, T_des = ${vessel.tempDesC} ºC
Material: ${vessel.material} (S = ${vessel.tensionAdmisibleMpa} MPa, E = ${vessel.eficienciaSoldadura}, c = ${vessel.sobreespesorCorrosionMm} mm)
Espesor Virola: Req = ${resultados.tReqVirMm.toFixed(2)} mm -> Nominal = ${resultados.tNomVirMm} mm
Espesor Cabezal: Req = ${resultados.tReqCabMm.toFixed(2)} mm -> Nominal = ${resultados.tNomCabMm} mm
MAWP: ${resultados.mawpBar.toFixed(2)} barg | Prueba Hidrostática: ${resultados.pPruebaBar.toFixed(2)} barg
Pesos: Vacío = ${resultados.pesoAceroKg.toLocaleString()} kg | Operación = ${resultados.pesoOperacionKg.toLocaleString()} kg`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (tipo: 'excel' | 'word') => {
    if (backendOnline) {
      const url = tipo === 'excel'
        ? 'http://127.0.0.1:8000/api/descargar/excel-oficial'
        : 'http://127.0.0.1:8000/api/descargar/word-oficial';
      window.open(url, '_blank');
    } else {
      alert(
        `Para descargar el archivo oficial generado por Python (${tipo.toUpperCase()}):` +
        `\n\n1. Inicia el servidor backend: uv run python diseno_recipientes/backend/api.py` +
        `\n2. O abre directamente el archivo generado en tu Escritorio:` +
        `\n   - Hojas_Especificacion_Recipientes_PILPIS.xlsx` +
        `\n   - Memoria_Diseno_Recipientes_PILPIS.docx`
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Input oculto para cargar archivo de proyecto JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportProjectJson}
        accept=".json"
        className="hidden"
      />

      {/* Header Principal de la Aplicación */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md flex items-center justify-center">
            <Cylinder className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                PILPIS Vessel Studio
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                ASME VIII Div. 1
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              PILPIS S.A. | Cliente: QUIMISUR S.A. — San Roque, Cádiz
            </p>
          </div>
        </div>

        {/* Acciones de Proyecto (Cargar, Guardar, Restaurar) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Cargar proyecto desde archivo JSON"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FolderUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Cargar (.json)</span>
          </button>

          <button
            onClick={handleExportProjectJson}
            title="Guardar todo el proyecto en archivo JSON"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FolderDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Guardar (.json)</span>
          </button>

          <button
            onClick={handleResetToPilpisDefaults}
            title="Restaurar recipientes oficiales del anteproyecto"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600 mx-1" />

          {/* Exportaciones Oficiales */}
          <button
            onClick={() => handleDownloadFile('excel')}
            title="Descargar Hojas de Especificación de Datos en Excel"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Sheets Excel</span>
          </button>

          <button
            onClick={() => handleDownloadFile('word')}
            title="Descargar Memoria Técnica Justificativa de Recipientes en Word"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Memoria Word</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600 mx-1" />

          {/* Estado del Backend */}
          {backendOnline === true ? (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" title="Servidor Python conectado en localhost:8000">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              API Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" title="Cálculos ejecutados en el motor cliente TypeScript">
              Motor Local
            </span>
          )}

          {/* Toggle Tema Oscuro/Claro */}
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* Subheader: Biblioteca de Recipientes Activos */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-5 py-2 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Recipientes:
          </span>

          {vessels.map((v, idx) => {
            const isActive = activeVesselIndex === idx;
            return (
              <div
                key={`${v.tag}-${idx}`}
                className={`group flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <button
                  onClick={() => setActiveVesselIndex(idx)}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  {v.tipoGeometria === 'esferico' ? (
                    <CircleDot className="w-3.5 h-3.5" />
                  ) : (
                    <Cylinder className="w-3.5 h-3.5" />
                  )}
                  <span>{v.tag || `Equipo ${idx + 1}`}</span>
                </button>

                {vessels.length > 1 && (
                  <button
                    onClick={e => handleDeleteVessel(idx, e)}
                    title={`Eliminar ${v.tag}`}
                    className={`ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white ${
                      isActive ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={handleAddVessel}
            title="Añadir nuevo recipiente al proyecto"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>

          <button
            onClick={handleDuplicateVessel}
            title="Duplicar el recipiente actual"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Duplicar</span>
          </button>
        </div>

        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar Resumen'}
        </button>
      </div>

      {/* Cuerpo Principal Dividido en Dos Columnas */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMNA IZQUIERDA: Formulario de Parámetros */}
        <div className="w-96 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto p-5 space-y-6">
          {/* 1. Datos de Identificación */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Settings2 className="w-3.5 h-3.5 text-blue-600" />
              1. Identificación y Servicio
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    TAG Equipo
                  </label>
                  <input
                    type="text"
                    value={vessel.tag}
                    onChange={e => updateVessel('tag', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Geometría
                  </label>
                  <select
                    value={vessel.tipoGeometria}
                    onChange={e => updateVessel('tipoGeometria', e.target.value as VesselGeometry)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="esferico">Esfera Horton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Denominación
                </label>
                <input
                  type="text"
                  value={vessel.nombre}
                  onChange={e => updateVessel('nombre', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {vessel.tipoGeometria !== 'esferico' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Tipo de Cabezales (Fondos)
                  </label>
                  <select
                    value={vessel.tipoCabezal}
                    onChange={e => updateVessel('tipoCabezal', e.target.value as HeadType)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="eliptico_2_1">Elípticos 2:1 ASME (Estándar)</option>
                    <option value="toriesferico">Toriesféricos ASME (Klopper)</option>
                    <option value="semiesferico">Semiesféricos</option>
                    <option value="plano">Planos soldados</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 2. Parámetros de Proceso y Retención */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              2. Proceso y Tiempo de Retención
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Caudal (m³/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vessel.caudalM3h}
                    onChange={e => updateVessel('caudalM3h', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Densidad (kg/m³)
                  </label>
                  <input
                    type="number"
                    value={vessel.densidadKgm3}
                    onChange={e => updateVessel('densidadKgm3', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Retención a NLL (min)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vessel.tiempoRetencionMin}
                    onChange={e => updateVessel('tiempoRetencionMin', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    NLL (% Llenado)
                  </label>
                  <input
                    type="number"
                    value={vessel.nllPct}
                    onChange={e => updateVessel('nllPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Dimensiones Geométricas */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              3. Geometría y Dimensiones
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Diámetro Interior Di (mm)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={vessel.diametroInteriorMm}
                    onChange={e => updateVessel('diametroInteriorMm', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {vessel.tipoGeometria !== 'esferico' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Longitud T-T (mm)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={vessel.longitudTtMm}
                      onChange={e => updateVessel('longitudTtMm', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Radio Interior (mm)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={(vessel.diametroInteriorMm / 2).toFixed(0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500"
                    />
                  </div>
                )}
              </div>

              {vessel.tipoGeometria === 'horizontal' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Bota decantadora de agua (Boot)
                    </label>
                    <input
                      type="checkbox"
                      checked={vessel.tieneBota}
                      onChange={e => updateVessel('tieneBota', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </div>
                  {vessel.tieneBota && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="block text-[11px] text-slate-500 mb-0.5">Ø Bota (mm)</span>
                        <input
                          type="number"
                          value={vessel.botaDiametroMm}
                          onChange={e => updateVessel('botaDiametroMm', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-500 mb-0.5">H Bota (mm)</span>
                        <input
                          type="number"
                          value={vessel.botaAlturaMm}
                          onChange={e => updateVessel('botaAlturaMm', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Parámetros Mecánicos ASME VIII Div 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              4. Mecánica ASME VIII Div. 1
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    P. Operación (barg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vessel.presionOpBar}
                    onChange={e => updateVessel('presionOpBar', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    P. Diseño (barg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vessel.presionDesBar}
                    onChange={e => updateVessel('presionDesBar', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    T. Diseño (ºC)
                  </label>
                  <input
                    type="number"
                    value={vessel.tempDesC}
                    onChange={e => updateVessel('tempDesC', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Corrosión c (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vessel.sobreespesorCorrosionMm}
                    onChange={e => updateVessel('sobreespesorCorrosionMm', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Tensión S (MPa)
                  </label>
                  <input
                    type="number"
                    value={vessel.tensionAdmisibleMpa}
                    onChange={e => updateVessel('tensionAdmisibleMpa', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Eficiencia Junta E
                  </label>
                  <select
                    value={vessel.eficienciaSoldadura}
                    onChange={e => updateVessel('eficienciaSoldadura', parseFloat(e.target.value) || 0.85)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={1.0}>1,00 (100% RT Full)</option>
                    <option value={0.85}>0,85 (Spot UW-12b)</option>
                    <option value={0.70}>0,70 (Sin Radiografía)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Pestañas de Visualización y Resultados */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100/50 dark:bg-slate-900/50">
          {/* Barra de Pestañas de la Vista */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 pt-2 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubTab('esquema')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'esquema'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Croquis Técnico 2D (SVG Paramétrico)
              </button>
              <button
                onClick={() => setActiveSubTab('calculos')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'calculos'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                Memoria y Fórmulas ASME
              </button>
              <button
                onClick={() => setActiveSubTab('comparativa')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'comparativa'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Comparativa Almacenamiento (Esferas vs Cigarros)
              </button>
            </div>

            {/* Botones de Descarga de Documentos */}
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={() => handleDownloadFile('excel')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                title="Descargar Hojas de Especificación Técnica en Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Descargar Excel Data Sheets
              </button>
              <button
                onClick={() => handleDownloadFile('word')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors"
                title="Descargar Memoria Técnica en Word (.docx)"
              >
                <FileText className="w-3.5 h-3.5" />
                Descargar Memoria Word
              </button>
            </div>
          </div>

          {/* Área de Visualización */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* KPI CARDS SUPERIORES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Espesor Virola (Req / Nom)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {resultados.tNomVirMm}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">mm</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                    (Req: {resultados.tReqVirMm.toFixed(2)} mm)
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Cabezal: {resultados.tNomCabMm} mm</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">SA-516 Gr 70</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Volumen Geométrico Total
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {resultados.volGeomTotM3.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">m³</span>
                  <span className="text-xs text-slate-500 ml-auto">
                    Útil: {resultados.volUtilM3.toFixed(2)} m³
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Retención: {resultados.tiempoRetencionRealMin.toFixed(1)} min</span>
                  <span>NLL: {vessel.nllPct}%</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  MAWP / Prueba Hidrostática
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {resultados.mawpBar.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">barg</span>
                  <span className="text-xs text-slate-500 ml-auto">
                    Prueba: {resultados.pPruebaBar.toFixed(2)} barg
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>P. Diseño: {vessel.presionDesBar.toFixed(2)} barg</span>
                  <span className="text-blue-600 font-medium">1,3 × MAWP</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Peso de Acero en Vacío
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {resultados.pesoAceroKg.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">kg</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Op: {resultados.pesoOperacionKg.toLocaleString()} kg</span>
                  <span>Agua: {resultados.pesoPruebaAguaKg.toLocaleString()} kg</span>
                </div>
              </div>
            </div>

            {/* CONTENIDO SEGÚN SUBTAB */}
            {activeSubTab === 'esquema' && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Croquis Paramétrico 2D con Cotas de Ingeniería
                    </h3>
                    <p className="text-xs text-slate-500">
                      Geometría escalada según dimensiones reales | Nivel de líquido: {vessel.nllPct}% | Espesor: {resultados.tNomVirMm} mm
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500"></span> Nivel Líquido
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-slate-400"></span> Acero SA-516-70
                    </span>
                  </div>
                </div>

                {/* LIENZO SVG */}
                <div className="w-full h-80 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4 overflow-hidden relative">
                  {vessel.tipoGeometria === 'horizontal' && (
                    <svg viewBox="0 0 600 240" className="w-full h-full max-h-72">
                      <defs>
                        <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.75" />
                        </linearGradient>
                      </defs>

                      {/* Cunas de soporte (Saddles) */}
                      <rect x="200" y="170" width="24" height="28" fill="#475569" rx="2" />
                      <rect x="376" y="170" width="24" height="28" fill="#475569" rx="2" />
                      <line x1="170" y1="198" x2="254" y2="198" stroke="#334155" strokeWidth="4" />
                      <line x1="346" y1="198" x2="430" y2="198" stroke="#334155" strokeWidth="4" />

                      {/* Bota decantadora inferior (si tiene) */}
                      {vessel.tieneBota && (
                        <g>
                          <rect x="288" y="170" width="24" height="34" fill="#64748B" stroke="#1E293B" strokeWidth="2" />
                          <line x1="288" y1="204" x2="312" y2="204" stroke="#1E293B" strokeWidth="3" />
                          <text x="300" y="218" fontSize="9" textAnchor="middle" fill="#64748B">Bota Ø400</text>
                        </g>
                      )}

                      {/* Cabezal izquierdo 2:1 */}
                      <path
                        d="M 170 50 C 130 50, 130 170, 170 170 Z"
                        fill="#CBD5E1"
                        stroke="#1E293B"
                        strokeWidth="3"
                        className="dark:fill-slate-700"
                      />

                      {/* Cabezal derecho 2:1 */}
                      <path
                        d="M 430 50 C 470 50, 470 170, 430 170 Z"
                        fill="#CBD5E1"
                        stroke="#1E293B"
                        strokeWidth="3"
                        className="dark:fill-slate-700"
                      />

                      {/* Virola Cilíndrica */}
                      <rect
                        x="170"
                        y="50"
                        width="260"
                        height="120"
                        fill="#E2E8F0"
                        stroke="#1E293B"
                        strokeWidth="3"
                        className="dark:fill-slate-600"
                      />

                      {/* Nivel de Líquido dentro del cilindro */}
                      <rect
                        x="170"
                        y={50 + 120 * (1 - vessel.nllPct / 100)}
                        width="260"
                        height={120 * (vessel.nllPct / 100)}
                        fill="url(#liquidGrad)"
                      />

                      {/* Boquilla Superior N1 (Alimentación) */}
                      <rect x="210" y="32" width="18" height="18" fill="#64748B" stroke="#1E293B" strokeWidth="2" />
                      <line x1="204" y1="32" x2="234" y2="32" stroke="#1E293B" strokeWidth="4" />
                      <text x="219" y="26" fontSize="9" textAnchor="middle" fill="#475569" fontWeight="bold">N1 (Carga)</text>

                      {/* Boquilla Superior N3 (PSV / Venteo) */}
                      <rect x="360" y="32" width="14" height="18" fill="#64748B" stroke="#1E293B" strokeWidth="2" />
                      <line x1="352" y1="32" x2="382" y2="32" stroke="#1E293B" strokeWidth="4" />
                      <text x="367" y="26" fontSize="9" textAnchor="middle" fill="#DC2626" fontWeight="bold">PSV</text>

                      {/* Boca de hombre N4 */}
                      <ellipse cx="452" cy="110" rx="6" ry="16" fill="#475569" stroke="#1E293B" strokeWidth="2" />
                      <text x="466" y="113" fontSize="8" fill="#475569">MH 24"</text>

                      {/* Cotas Dimensionales */}
                      {/* Cota Diámetro Di */}
                      <line x1="150" y1="50" x2="150" y2="170" stroke="#2563EB" strokeWidth="1.5" />
                      <line x1="144" y1="50" x2="156" y2="50" stroke="#2563EB" strokeWidth="1.5" />
                      <line x1="144" y1="170" x2="156" y2="170" stroke="#2563EB" strokeWidth="1.5" />
                      <text x="140" y="114" fontSize="10" textAnchor="end" fill="#2563EB" fontWeight="bold">
                        Di = {vessel.diametroInteriorMm} mm
                      </text>

                      {/* Cota Longitud T-T */}
                      <line x1="170" y1="184" x2="430" y2="184" stroke="#2563EB" strokeWidth="1.5" />
                      <line x1="170" y1="178" x2="170" y2="190" stroke="#2563EB" strokeWidth="1.5" />
                      <line x1="430" y1="178" x2="430" y2="190" stroke="#2563EB" strokeWidth="1.5" />
                      <text x="300" y="196" fontSize="10" textAnchor="middle" fill="#2563EB" fontWeight="bold">
                        L(T-T) = {vessel.longitudTtMm} mm
                      </text>

                      {/* Llamada de Espesor */}
                      <circle cx="340" cy="50" r="3" fill="#DC2626" />
                      <line x1="340" y1="50" x2="380" y2="80" stroke="#DC2626" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="385" y="84" fontSize="10" fill="#DC2626" fontWeight="bold">
                        t_nom = {resultados.tNomVirMm} mm
                      </text>
                    </svg>
                  )}

                  {vessel.tipoGeometria === 'esferico' && (
                    <svg viewBox="0 0 600 240" className="w-full h-full max-h-72">
                      <defs>
                        <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                          <stop offset="0%" stopColor="#F1F5F9" />
                          <stop offset="60%" stopColor="#CBD5E1" />
                          <stop offset="100%" stopColor="#475569" />
                        </radialGradient>
                      </defs>

                      {/* Patas de soporte tubulares */}
                      <line x1="240" y1="160" x2="220" y2="215" stroke="#334155" strokeWidth="6" />
                      <line x1="360" y1="160" x2="380" y2="215" stroke="#334155" strokeWidth="6" />
                      <line x1="280" y1="185" x2="270" y2="215" stroke="#475569" strokeWidth="5" />
                      <line x1="320" y1="185" x2="330" y2="215" stroke="#475569" strokeWidth="5" />
                      <line x1="200" y1="215" x2="400" y2="215" stroke="#1E293B" strokeWidth="4" />

                      {/* Esfera Completa */}
                      <circle cx="300" cy="115" r="75" fill="url(#sphereGrad)" stroke="#1E293B" strokeWidth="3" />

                      {/* Nivel de Líquido dentro de la esfera */}
                      <path
                        d="M 233 145 A 75 75 0 0 0 367 145 Z"
                        fill="#3B82F6"
                        fillOpacity="0.4"
                      />

                      {/* Boquilla de Carga Superior y PSV */}
                      <rect x="294" y="32" width="12" height="10" fill="#64748B" stroke="#1E293B" strokeWidth="2" />
                      <line x1="288" y1="32" x2="312" y2="32" stroke="#1E293B" strokeWidth="3" />
                      <text x="300" y="26" fontSize="9" textAnchor="middle" fill="#DC2626" fontWeight="bold">Doble PSV</text>

                      {/* Cotas */}
                      <line x1="225" y1="115" x2="375" y2="115" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3,3" />
                      <text x="300" y="110" fontSize="11" textAnchor="middle" fill="#2563EB" fontWeight="bold">
                        Di = {vessel.diametroInteriorMm} mm (20,30 m)
                      </text>
                      <text x="300" y="130" fontSize="9" textAnchor="middle" fill="#1E293B">
                        Vol = {resultados.volGeomTotM3.toFixed(0)} m³ | Chapa = {resultados.tNomVirMm} mm
                      </text>
                    </svg>
                  )}

                  {vessel.tipoGeometria === 'vertical' && (
                    <svg viewBox="0 0 600 240" className="w-full h-full max-h-72">
                      {/* Faldón soporte */}
                      <rect x="270" y="170" width="60" height="30" fill="#475569" stroke="#1E293B" strokeWidth="2" />
                      <line x1="260" y1="200" x2="340" y2="200" stroke="#1E293B" strokeWidth="4" />

                      {/* Cuerpo cilíndrico vertical con fondos */}
                      <path d="M 270 60 C 270 40, 330 40, 330 60 Z" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2" />
                      <rect x="270" y="60" width="60" height="110" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2" />
                      <path d="M 270 170 C 270 190, 330 190, 330 170 Z" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2" />

                      {/* Nivel */}
                      <rect x="270" y={60 + 110 * (1 - vessel.nllPct / 100)} width="60" height={110 * (vessel.nllPct / 100)} fill="#3B82F6" fillOpacity="0.5" />

                      <text x="350" y="120" fontSize="10" fill="#2563EB" fontWeight="bold">
                        Di = {vessel.diametroInteriorMm} mm
                      </text>
                      <text x="350" y="135" fontSize="10" fill="#475569">
                        L = {vessel.longitudTtMm} mm
                      </text>
                    </svg>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'calculos' && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Desglose de Fórmulas y Cálculos Mecánicos ASME VIII Div. 1
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Sustitución paso a paso de los valores para verificación técnica y académica
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Virola */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">
                      1. Envolvente Cilíndrica (Virola) — Tensión Circunferencial (UG-27 c-1)
                    </span>
                    <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 my-2">
                      t = (P · R_i) / (S · E - 0.6 · P) + c
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p>• P_des = {(vessel.presionDesBar / 10).toFixed(3)} MPa ({vessel.presionDesBar} barg)</p>
                      <p>• R_i = {(vessel.diametroInteriorMm / 2).toFixed(0)} mm | S = {vessel.tensionAdmisibleMpa} MPa</p>
                      <p>• E = {vessel.eficienciaSoldadura} | c = {vessel.sobreespesorCorrosionMm} mm</p>
                      <p className="font-semibold text-slate-900 dark:text-white pt-1">
                        → t_req = {resultados.tReqVirMm.toFixed(2)} mm → <span className="text-blue-600">t_nom = {resultados.tNomVirMm} mm</span>
                      </p>
                    </div>
                  </div>

                  {/* Cabezales */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">
                      2. Fondos / Cabezales Elípticos 2:1 (UG-32 d)
                    </span>
                    <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 my-2">
                      t = (P · D_i) / (2 · S · E - 0.2 · P) + c
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p>• D_i = {vessel.diametroInteriorMm} mm</p>
                      <p>• Profundidad del cabezal h = Di / 4 = {(vessel.diametroInteriorMm / 4).toFixed(0)} mm</p>
                      <p>• Volumen 2 cabezales = {((Math.PI / 12) * Math.pow(vessel.diametroInteriorMm / 1000, 3)).toFixed(2)} m³</p>
                      <p className="font-semibold text-slate-900 dark:text-white pt-1">
                        → t_req = {resultados.tReqCabMm.toFixed(2)} mm → <span className="text-blue-600">t_nom = {resultados.tNomCabMm} mm</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* MAWP y Prueba */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Presión Máxima Admisible de Trabajo (MAWP) y Prueba Hidrostática (UG-99)
                  </div>
                  <p>
                    Con el espesor nominal comercial adoptado ({resultados.tNomVirMm} mm) y restando el sobreespesor de corrosión ({vessel.sobreespesorCorrosionMm} mm),
                    la <strong>MAWP</strong> resultante es de <strong>{resultados.mawpBar.toFixed(2)} barg</strong>, lo que otorga un margen de seguridad de +{(resultados.mawpBar - vessel.presionDesBar).toFixed(2)} bar respecto a la presión de diseño.
                  </p>
                  <p className="mt-1">
                    La presión mínima de prueba hidrostática en taller conforme a UG-99(b) es: <strong>P_test = 1,3 · MAWP = {resultados.pPruebaBar.toFixed(2)} barg</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeSubTab === 'comparativa' && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Estudio Comparativo: Batería de Esferas Presurizadas vs Cigarros Horizontales
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluación técnico-económica para el almacenamiento exterior de n-butano producto en la refinería
                    </p>
                  </div>

                  {/* Slider de Días */}
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Autonomía:</span>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={diasAlmacenamiento}
                      onChange={e => setDiasAlmacenamiento(parseInt(e.target.value))}
                      className="w-24 accent-blue-600"
                    />
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-12 text-right">
                      {diasAlmacenamiento} días
                    </span>
                  </div>
                </div>

                {/* TABLA COMPARATIVA */}
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-white font-semibold">
                      <tr>
                        <th className="p-3">Criterio de Evaluación</th>
                        <th className="p-3 text-center">Unidad</th>
                        <th className="p-3 text-center bg-blue-900/80">Opción 1: Esferas Horton (Adoptada)</th>
                        <th className="p-3 text-center">Opción 2: Cigarros Horizontales</th>
                        <th className="p-3 text-center">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-medium">Masa total a almacenar</td>
                        <td className="p-3 text-center text-slate-500">Tm</td>
                        <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">{comparativaAlmacenamiento.masaTotalTm.toFixed(1)}</td>
                        <td className="p-3 text-center">{comparativaAlmacenamiento.masaTotalTm.toFixed(1)}</td>
                        <td className="p-3 text-center text-slate-500">0 %</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-medium">Volumen geométrico total (85%)</td>
                        <td className="p-3 text-center text-slate-500">m³</td>
                        <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">{comparativaAlmacenamiento.volGeomTotM3.toFixed(0)}</td>
                        <td className="p-3 text-center">{comparativaAlmacenamiento.volGeomTotM3.toFixed(0)}</td>
                        <td className="p-3 text-center text-slate-500">0 %</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 bg-blue-50/40 dark:bg-blue-950/20">
                        <td className="p-3 font-medium">Número de recipientes</td>
                        <td className="p-3 text-center text-slate-500">unidades</td>
                        <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {comparativaAlmacenamiento.esferas.n} esferas
                        </td>
                        <td className="p-3 text-center font-bold text-red-600 dark:text-red-400 text-sm">
                          {comparativaAlmacenamiento.cigarros.n} cigarros
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-600">-88 % equipos</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-medium">Dimensiones unitarias</td>
                        <td className="p-3 text-center text-slate-500">m</td>
                        <td className="p-3 text-center font-semibold">Ø {comparativaAlmacenamiento.esferas.di.toFixed(1)} m</td>
                        <td className="p-3 text-center font-semibold">Ø 4,0 m x 40,0 m</td>
                        <td className="p-3 text-center text-slate-500">Límite transporte</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 bg-emerald-50/50 dark:bg-emerald-950/30">
                        <td className="p-3 font-medium">Consumo total de acero</td>
                        <td className="p-3 text-center text-slate-500">Tm</td>
                        <td className="p-3 text-center font-bold text-emerald-600 text-sm">
                          {comparativaAlmacenamiento.esferas.pesoAceroTm.toFixed(0)} Tm
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          {comparativaAlmacenamiento.cigarros.pesoAceroTm.toFixed(0)} Tm
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          -{(100 * (1 - comparativaAlmacenamiento.esferas.pesoAceroTm / comparativaAlmacenamiento.cigarros.pesoAceroTm)).toFixed(0)} % Acero
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-medium">Ocupación de terreno (Footprint)</td>
                        <td className="p-3 text-center text-slate-500">m²</td>
                        <td className="p-3 text-center font-bold text-blue-600">{comparativaAlmacenamiento.esferas.areaM2.toFixed(0)} m²</td>
                        <td className="p-3 text-center">{comparativaAlmacenamiento.cigarros.areaM2.toFixed(0)} m²</td>
                        <td className="p-3 text-center font-bold text-emerald-600">-62 % Superficie</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-medium">Inversión estimada (CAPEX)</td>
                        <td className="p-3 text-center text-slate-500">M€</td>
                        <td className="p-3 text-center font-bold text-emerald-600 text-sm">
                          {comparativaAlmacenamiento.esferas.capexM.toFixed(2)} M€
                        </td>
                        <td className="p-3 text-center text-slate-600 dark:text-slate-300">
                          {comparativaAlmacenamiento.cigarros.capexM.toFixed(2)} M€
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          -{(comparativaAlmacenamiento.cigarros.capexM - comparativaAlmacenamiento.esferas.capexM).toFixed(2)} M€
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                  <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Conclusión de Ingeniería Básica
                  </div>
                  Para volúmenes superiores a 5.000 m³ en gases licuados del petróleo a presión, la <strong>Esfera Horton</strong> es indiscutiblemente la solución más eficiente:
                  soporta el doble de presión que un cilindro a igual espesor y radio ($\sigma = P\cdot R / 2t$), ahorrando <strong>más de 880 toneladas de acero</strong>, ocupando <strong>un 62% menos de suelo en refinería</strong> y reduciendo el CAPEX en <strong>1,76 M€</strong>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
