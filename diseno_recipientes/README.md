# Departamento de Gestión de Proyectos y Diseño de Recipientes (DPTO 2)
## Proyecto: Planta de Fraccionamiento de C4 (PILPIS - QUIMISUR)
**Emplazamiento:** Refinería de San Roque (Cádiz)  
**Normativa de Diseño Mecánico:** ASME Boiler and Pressure Vessel Code, Sección VIII, División 1 (Ed. 2023)  
**Material de Construcción:** Acero al Carbono Normalizado SA-516 Grado 70  

---

## 1. Resumen Ejecutivo de Equipos Diseñados

| TAG | Denominación del Equipo | Tipología Geométrica | Vol. Geom. ($m^3$) | Dimensiones ($mm$) | $P_{des}$ ($barg$) | $T_{des}$ ($^\circ C$) | Espesor Nominal ($mm$) | Peso Vacío / Op. ($kg$) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **V-100** | Tanque Pulmón de Alimentación C4 | Cilíndrico horizontal + Elípticos 2:1 | 22,83 | $\varnothing 2.000 \times 6.600$ | 12,75 | 65 | 14,0 (SA-516-70) | 6.102 / 12.437 |
| **V-101** | Acumulador de Reflujo y Destilado | Cilíndrico horizontal + Bota $\varnothing 400 \times 600$ | 20,51 | $\varnothing 1.900 \times 6.600$ | 8,34 | 70 | 10,0 (SA-516-70) | 4.111 / 9.700 |
| **V-102** | Tanque Pulmón de Fondos (n-Butano) | Cilíndrico horizontal + Elípticos 2:1 | 12,33 | $\varnothing 1.600 \times 5.600$ | 9,32 | 85 | 10,0 (SA-516-70) | 2.935 / 6.449 |
| **TK-100 A/B/C** | Batería Almacenamiento n-Butano (15 d) | 3 Esferas Presurizadas (Horton Spheres) | 13.068 tot (4.380 c/u) | $3 \times \varnothing 20.300$ | 5,88 | 55 | 25,0 (SA-516-70) | 284.500 c/u (854 Tm tot) |

---

## 2. Estudio Comparativo de Almacenamiento (15 Días de Operación)

Para almacenar **6.275,7 toneladas** de n-butano ($11.107,5\text{ m}^3$ útiles, $13.067,6\text{ m}^3$ geométricos con 85% de llenado máximo según ITC-ICG 03 / API 2510):

| Criterio de Comparación | Opción 1: Esferas Presurizadas (Adoptada) | Opción 2: Batería de Cigarros Horizontales | Justificación y Ventaja |
| :--- | :---: | :---: | :--- |
| **Número de recipientes** | **3 esferas Horton** | **26 depósitos horizontales** | Reducción drástica de complejidad de conexionado (-88%) |
| **Dimensiones unitarias** | $\varnothing 20,30\text{ m}$ | $\varnothing 4,00\text{ m} \times 40,00\text{ m}$ (L) | Los cigarros están al límite de transporte terrestre |
| **Tensión de membrana** | $\sigma = \frac{P \cdot R}{2t}$ | $\sigma = \frac{P \cdot R}{t}$ | La esfera resiste el doble a igual espesor y radio |
| **Peso total de acero** | **854 Tm** | **1.741 Tm** | **¡Ahorro de 887 toneladas de acero (-51%)!** |
| **Ocupación de terreno** | **7.500 m²** | **19.500 m²** | Ahorro del 62% de superficie crítica en refinería |
| **Instrumentación y PSV** | 3 lazos dobles | 26 lazos dobles | Menor coste de mantenimiento, calibración y SIL |
| **Inversión estimada (CAPEX)** | **4,35 M€** | **6,11 M€** | **Ahorro neto de ~1,76 M€ (-29%)** |
| **Decisión Técnica** | **SELECCIÓN OFICIAL** | **DESCARTADA** | Superioridad técnica, económica y de seguridad |

---

## 3. Estructura de Entregables

```
diseno_recipientes/
├── scripts/
│   ├── calculo_recipientes.py        # Algoritmo matemático y dimensionamiento ASME VIII Div 1
│   ├── generar_datasheets_excel.py   # Generador del libro Excel con 5 pestañas
│   └── generar_memoria_word.py       # Generador de la Memoria Técnica en formato Word
├── documentos/
│   ├── Hojas_Especificacion_Recipientes_PILPIS.xlsx
│   └── Memoria_Diseno_Recipientes_PILPIS.docx
└── README.md
```

---

## 4. Ejecución de los Scripts

```bash
# Cálculo riguroso y salida por consola:
uv run python diseno_recipientes/scripts/calculo_recipientes.py

# Regenerar el libro de Hojas de Especificación (Data Sheets):
uv run --with openpyxl python diseno_recipientes/scripts/generar_datasheets_excel.py

# Regenerar la Memoria Técnica en Word:
uv run --with python-docx python diseno_recipientes/scripts/generar_memoria_word.py
```
