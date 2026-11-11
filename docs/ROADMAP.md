# ROADMAP & Especificaciones Futuras — ROY Studio

Documento de referencia técnica para la evolución funcional y extensión académica de **ROY Studio** para proyectos de ingeniería industrial.

---

## 1. Módulos Planificados

### Hito 1: Histogramas y Nivelación de Recursos (Resource Leveling)
- **Objetivo**: Visualizar y optimizar la asignación de mano de obra y recursos técnicos por departamento a lo largo del cronograma de 24 meses.
- **Componentes**:
  - Imputación de recursos por tarea (ej. técnicos por departamento, horas/mes o equipos especializados).
  - Gráfica de barras de carga acumulada mensual por departamento (D1 a D5).
  - Línea de capacidad máxima disponible (límite técnico).
  - Algoritmo de nivelación heurística aprovechando las holguras ($HT, HL$) sin retrasar el camino crítico.

### Hito 2: Curva S de Inversiones y Presupuesto Temporal
- **Objetivo**: Planificación financiera del proyecto industrial PILPIS.
- **Componentes**:
  - Presupuesto asociado a cada paquete de trabajo ($CAPEX$).
  - Distribución del coste (lineal por duración o curva de campana).
  - Curva de desembolso mensual y curva S acumulada ($PV$ - Valor Planificado).
  - Exportación del flujo de caja a Excel.

### Hito 3: Simulación Probabilística PERT
- **Objetivo**: Incorporar la incertidumbre en duraciones de tareas químicas y de montaje.
- **Componentes**:
  - Entrada a tres duraciones por tarea: $a$ (optimista), $m$ (más probable), $b$ (pesimista).
  - Duración esperada de Roy/PERT: $\mu_i = \frac{a_i + 4m_i + b_i}{6}$.
  - Varianza: $\sigma_i^2 = \left(\frac{b_i - a_i}{6}\right)^2$.
  - Cálculo de la probabilidad de cumplir el hito de entrega de 24 meses mediante distribución normal:
    $$Z = \frac{T_{objetivo} - \mu_{proyecto}}{\sqrt{\sum_{i \in Crítico} \sigma_i^2}}$$

### Hito 4: Control de Proyecto y Gestión del Valor Ganado (EVM)
- **Objetivo**: Seguimiento de obra y desvíos durante la fase de ejecución.
- **Métricas Clave**:
  - $PV$ (*Planned Value*): Valor planificado en el mes de corte.
  - $EV$ (*Earned Value*): Valor ganado real según el porcentaje de avance físico completado.
  - $AC$ (*Actual Cost*): Coste real incurrido.
  - Índices de rendimiento: $CPI = \frac{EV}{AC}$ (Coste), $SPI = \frac{EV}{PV}$ (Plazo).
  - Estimación al cierre ($EAC$) y variación final ($VAC$).

### Hito 5: Comparativa de Escenarios y Optimización (Caso A vs Caso B)
- **Objetivo**: Comparar el caso base de PILPIS (24 meses) con un escenario de compresión temporal (*fast-tracking* y *crashing* a 20 meses).
- **Componentes**:
  - Vista en paralelo o superpuesta de grafos ROY.
  - Detección de variaciones en el camino crítico.
  - Resumen ejecutivo de sobrecostes por aceleración.

---

## 2. Invariantes de Calidad para Futuros Módulos
1. **Separación Estricta del Motor**: Todo algoritmo matemático nuevo (nivelación, PERT, EVM) debe implementarse en `src/core/` sin dependencias de React ni del DOM.
2. **Pruebas Unitarias Obligatorias**: Cada nuevo cálculo debe contar con su correspondiente suite en `vitest` con cobertura total de casos límite.
3. **Alto Contraste y Accesibilidad**: Mantener coherencia cromática con los departamentos existentes y el camino crítico en rojo carmesí `#DC2626`.
