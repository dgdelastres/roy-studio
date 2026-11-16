"""
Generador de Hojas de Especificación Técnica (Data Sheets) en Excel
Proyecto: Fraccionamiento de C4 (PILPIS - QUIMISUR)
Departamento: DPTO 2 - Gestión de Proyectos y Diseño de Recipientes
"""

import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from calculo_recipientes import calcular_recipientes

def crear_estilos():
    f_titulo = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    f_subtitulo = Font(name="Segoe UI", size=10, italic=True, color="E2E8F0")
    f_sec = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    f_label_bold = Font(name="Segoe UI", size=9, bold=True, color="1A202C")
    f_label = Font(name="Segoe UI", size=9, color="2D3748")
    f_valor = Font(name="Segoe UI", size=9, bold=True, color="1A365D")
    f_unit = Font(name="Segoe UI", size=9, italic=True, color="718096")
    
    fill_header = PatternFill(start_color="1A365D", end_color="1A365D", fill_type="solid")
    fill_sec = PatternFill(start_color="2B6CB0", end_color="2B6CB0", fill_type="solid")
    fill_zebra = PatternFill(start_color="F7FAFC", end_color="F7FAFC", fill_type="solid")
    fill_highlight = PatternFill(start_color="EBF8FF", end_color="EBF8FF", fill_type="solid")
    fill_win = PatternFill(start_color="C6F6D5", end_color="C6F6D5", fill_type="solid")

    thin_border_side = Side(style='thin', color="CBD5E0")
    border_cell = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    
    return {
        "f_titulo": f_titulo, "f_subtitulo": f_subtitulo, "f_sec": f_sec,
        "f_label_bold": f_label_bold, "f_label": f_label, "f_valor": f_valor, "f_unit": f_unit,
        "fill_header": fill_header, "fill_sec": fill_sec, "fill_zebra": fill_zebra,
        "fill_highlight": fill_highlight, "fill_win": fill_win, "border_cell": border_cell
    }

def aplicar_cabecera_datasheet(ws, st, tag, nombre_equipo, servicio):
    ws.merge_cells('A1:G1')
    c1 = ws['A1']
    c1.value = "PILPIS, S.A. | HOJA DE ESPECIFICACIÓN TÉCNICA DE EQUIPO (DATA SHEET)"
    c1.font = st["f_titulo"]
    c1.fill = st["fill_header"]
    c1.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 28

    ws.merge_cells('A2:G2')
    c2 = ws['A2']
    c2.value = f"PROYECTO: Fraccionamiento de C4 (Refinería San Roque) | CLIENTE: QUIMISUR | DPTO 2: Recipientes"
    c2.font = st["f_subtitulo"]
    c2.fill = st["fill_header"]
    c2.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    ws.merge_cells('A3:G3')
    c3 = ws['A3']
    c3.value = f"EQUIPO: {tag} — {nombre_equipo.upper()} | SERVICIO: {servicio.upper()}"
    c3.font = Font(name="Segoe UI", size=11, bold=True, color="FFD700")
    c3.fill = PatternFill(start_color="102A43", end_color="102A43", fill_type="solid")
    c3.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[3].height = 22

def agregar_seccion(ws, row, titulo, st):
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=7)
    c = ws.cell(row=row, column=1)
    c.value = titulo
    c.font = st["f_sec"]
    c.fill = st["fill_sec"]
    c.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    ws.row_dimensions[row].height = 22
    return row + 1

def escribir_fila_ds(ws, row, col_a, val_a, unit_a, col_b, val_b, unit_b, st, zebra=False):
    fill = st["fill_zebra"] if zebra else PatternFill(fill_type=None)
    
    # Campo 1
    c1 = ws.cell(row=row, column=1, value=col_a)
    c1.font = st["f_label_bold"]
    c1.fill = fill
    c1.border = st["border_cell"]

    c2 = ws.cell(row=row, column=2, value=val_a)
    c2.font = st["f_valor"]
    c2.fill = fill
    c2.border = st["border_cell"]
    c2.alignment = Alignment(horizontal="right")

    c3 = ws.cell(row=row, column=3, value=unit_a)
    c3.font = st["f_unit"]
    c3.fill = fill
    c3.border = st["border_cell"]

    # Separador vacío col 4
    c4 = ws.cell(row=row, column=4, value="")
    c4.border = Border(top=st["border_cell"].top, bottom=st["border_cell"].bottom)

    # Campo 2
    c5 = ws.cell(row=row, column=5, value=col_b)
    c5.font = st["f_label_bold"]
    c5.fill = fill
    c5.border = st["border_cell"]

    c6 = ws.cell(row=row, column=6, value=val_b)
    c6.font = st["f_valor"]
    c6.fill = fill
    c6.border = st["border_cell"]
    c6.alignment = Alignment(horizontal="right")

    c7 = ws.cell(row=row, column=7, value=unit_b)
    c7.font = st["f_unit"]
    c7.fill = fill
    c7.border = st["border_cell"]

    ws.row_dimensions[row].height = 19
    return row + 1

def crear_datasheet_v100(ws, data, st):
    d = data["v100"]
    aplicar_cabecera_datasheet(ws, st, d["tag"], d["desc"], "Pulmón de carga a deisobutanizadora T-100")
    
    r = 5
    r = agregar_seccion(ws, r, "1. CONDICIONES DE PROCESO Y FLUIDO", st)
    r = escribir_fila_ds(ws, r, "Fluido contenido", "Fracción C4 hidrotratada", "", "Caudal de diseño (110%)", f"{d['Q_m3h']*1.1:.2f}", "m³/h", st, False)
    r = escribir_fila_ds(ws, r, "Caudal másico nominal", "25.000", "kg/h", "Caudal volumétrico nom.", f"{d['Q_m3h']:.2f}", "m³/h", st, True)
    r = escribir_fila_ds(ws, r, "Densidad del líquido", "555,0", "kg/m³", "Tiempo retención a NLL (50%)", f"{d['t_ret_min']:.1f}", "minutos", st, False)
    r = escribir_fila_ds(ws, r, "Presión de operación", f"{d['P_op_bar']:.2f}", "barg", "Temperatura de operación", "40,0", "ºC", st, True)
    r = escribir_fila_ds(ws, r, "Nivel normal líquido (NLL)", "50 %", "", "Volumen útil de líquido", f"{d['V_geom_m3']*0.5:.2f}", "m³", st, False)
    
    r += 1
    r = agregar_seccion(ws, r, "2. CONDICIONES Y PARÁMETROS DE DISEÑO MECÁNICO", st)
    r = escribir_fila_ds(ws, r, "Código de diseño", "ASME VIII Div 1 (Ed. 2023)", "", "Presión de diseño", f"{d['P_des_bar']:.2f}", "barg", st, False)
    r = escribir_fila_ds(ws, r, "Temperatura de diseño", f"{d['T_des_C']:.1f}", "ºC", "Material envolvente y fondos", "SA-516 Gr. 70", "", st, True)
    r = escribir_fila_ds(ws, r, "Tensión admisible (S)", "138,0", "MPa", "Eficiencia soldadura (E)", "0,85 (Spot)", "", st, False)
    r = escribir_fila_ds(ws, r, "Sobreespesor corrosión (c)", "2,0", "mm", "Presión prueba hidrostática", f"{d['P_des_bar']*1.3:.2f}", "barg", st, True)
    r = escribir_fila_ds(ws, r, "Radiografiado", "Spot (UW-12 b)", "", "Tratamiento térmico (PWHT)", "No requerido (t < 32 mm)", "", st, False)

    r += 1
    r = agregar_seccion(ws, r, "3. DIMENSIONES GEOMÉTRICAS Y ESPESORES", st)
    r = escribir_fila_ds(ws, r, "Tipo de recipiente", "Cilíndrico horizontal", "", "Volumen geométrico total", f"{d['V_geom_m3']:.2f}", "m³", st, False)
    r = escribir_fila_ds(ws, r, "Diámetro interior (Di)", f"{d['Di_mm']:.0f}", "mm", "Longitud entre tangentes (L)", f"{d['L_tt_mm']:.0f}", "mm", st, True)
    r = escribir_fila_ds(ws, r, "Relación L/D", f"{d['L_tt_mm']/d['Di_mm']:.2f}", "-", "Longitud total con cabezales", f"{d['L_tot_mm']:.0f}", "mm", st, False)
    r = escribir_fila_ds(ws, r, "Tipo de cabezales", "Elípticos 2:1 ASME", "", "Espesor req. virola", f"{d['t_vir_req_mm']:.2f}", "mm", st, True)
    r = escribir_fila_ds(ws, r, "Espesor req. cabezales", f"{d['t_cab_req_mm']:.2f}", "mm", "Espesor nominal adoptado", f"{d['t_nom_mm']:.1f}", "mm", st, False)

    r += 1
    r = agregar_seccion(ws, r, "4. CONEXIONES, BOQUILLAS Y PESOS ESTIMADOS", st)
    r = escribir_fila_ds(ws, r, "N1 (Entrada de Carga)", "4\" ANSI 300# RFWN", "", "N2 (Salida a Bomba B-1)", "4\" ANSI 300# RFWN", "", st, False)
    r = escribir_fila_ds(ws, r, "N3 (Válvula Seguridad PSV)", "3\" x 4\" ANSI 300#", "", "N4 (Boca de hombre Manway)", "24\" ANSI 300#", "", st, True)
    r = escribir_fila_ds(ws, r, "Tipo de soportes", "2 Cunas de apoyo (Saddles)", "", "Peso acero en vacío", f"{d['peso_acero_kg']:.0f}", "kg", st, False)
    r = escribir_fila_ds(ws, r, "Peso de operación normal", f"{d['peso_op_kg']:.0f}", "kg", "Peso en prueba hidrostática", f"{d['peso_acero_kg'] + d['V_geom_m3']*1000:.0f}", "kg", st, True)

def crear_datasheet_v101(ws, data, st):
    d = data["v101"]
    aplicar_cabecera_datasheet(ws, st, d["tag"], d["desc"], "Acumulador de reflujo y destilado i-butano con bota")
    
    r = 5
    r = agregar_seccion(ws, r, "1. CONDICIONES DE PROCESO Y FLUIDO", st)
    r = escribir_fila_ds(ws, r, "Fluido contenido", "i-Butano condensado", "", "Caudal total condensado", f"{d['Q_m3h']:.2f}", "m³/h", st, False)
    r = escribir_fila_ds(ws, r, "Caudal de reflujo (B-2)", "62,48", "m³/h", "Caudal de destilado (B-3)", "13,88", "m³/h", st, True)
    r = escribir_fila_ds(ws, r, "Densidad del líquido", "545,0", "kg/m³", "Tiempo retención a NLL", f"{d['t_ret_min']:.1f}", "minutos", st, False)
    r = escribir_fila_ds(ws, r, "Presión de operación", f"{d['P_op_bar']:.2f}", "barg", "Temperatura de operación", "42,0", "ºC", st, True)
    r = escribir_fila_ds(ws, r, "Nivel normal líquido (NLL)", "50 %", "", "Bota decantadora de agua", "Ø 400 mm x 600 mm", "", st, False)
    
    r += 1
    r = agregar_seccion(ws, r, "2. CONDICIONES Y PARÁMETROS DE DISEÑO MECÁNICO", st)
    r = escribir_fila_ds(ws, r, "Código de diseño", "ASME VIII Div 1 (Ed. 2023)", "", "Presión de diseño", f"{d['P_des_bar']:.2f}", "barg", st, False)
    r = escribir_fila_ds(ws, r, "Temperatura de diseño", f"{d['T_des_C']:.1f}", "ºC", "Material envolvente y fondos", "SA-516 Gr. 70", "", st, True)
    r = escribir_fila_ds(ws, r, "Tensión admisible (S)", "138,0", "MPa", "Eficiencia soldadura (E)", "0,85 (Spot)", "", st, False)
    r = escribir_fila_ds(ws, r, "Sobreespesor corrosión (c)", "2,0", "mm", "Presión prueba hidrostática", f"{d['P_des_bar']*1.3:.2f}", "barg", st, True)

    r += 1
    r = agregar_seccion(ws, r, "3. DIMENSIONES GEOMÉTRICAS Y ESPESORES", st)
    r = escribir_fila_ds(ws, r, "Tipo de recipiente", "Cilíndrico horizontal + Bota", "", "Volumen geométrico total", f"{d['V_geom_m3']:.2f}", "m³", st, False)
    r = escribir_fila_ds(ws, r, "Diámetro interior (Di)", f"{d['Di_mm']:.0f}", "mm", "Longitud entre tangentes (L)", f"{d['L_tt_mm']:.0f}", "mm", st, True)
    r = escribir_fila_ds(ws, r, "Relación L/D", f"{d['L_tt_mm']/d['Di_mm']:.2f}", "-", "Longitud total con cabezales", f"{d['L_tot_mm']:.0f}", "mm", st, False)
    r = escribir_fila_ds(ws, r, "Tipo de cabezales", "Elípticos 2:1 ASME", "", "Espesor req. virola", f"{d['t_vir_req_mm']:.2f}", "mm", st, True)
    r = escribir_fila_ds(ws, r, "Espesor req. cabezales", f"{d['t_cab_req_mm']:.2f}", "mm", "Espesor nominal adoptado", f"{d['t_nom_mm']:.1f}", "mm", st, False)

    r += 1
    r = agregar_seccion(ws, r, "4. CONEXIONES, BOQUILLAS Y PESOS ESTIMADOS", st)
    r = escribir_fila_ds(ws, r, "N1 (Entrada desde E-102)", "6\" ANSI 150# RFWN", "", "N2 (Salida Reflujo B-2)", "4\" ANSI 150# RFWN", "", st, False)
    r = escribir_fila_ds(ws, r, "N3 (Salida Destilado B-3)", "3\" ANSI 150# RFWN", "", "N4 (Venteo incondensables/PC)", "2\" ANSI 150# RFWN", "", st, True)
    r = escribir_fila_ds(ws, r, "N5 (Purga bota decantadora)", "2\" ANSI 150#", "", "N6 (Válvula de seguridad PSV)", "3\" x 4\" ANSI 150#", "", st, False)
    r = escribir_fila_ds(ws, r, "Peso acero en vacío", f"{d['peso_acero_kg']:.0f}", "kg", "Peso en operación normal", f"{d['peso_op_kg']:.0f}", "kg", st, True)

def crear_datasheet_v102(ws, data, st):
    d = data["v102"]
    aplicar_cabecera_datasheet(ws, st, d["tag"], d["desc"], "Pulmón de fondos y aspiración bomba de envío B-4")
    
    r = 5
    r = agregar_seccion(ws, r, "1. CONDICIONES DE PROCESO Y FLUIDO", st)
    r = escribir_fila_ds(ws, r, "Fluido contenido", "n-Butano producto fondos", "", "Caudal de fondos nominal", f"{d['Q_m3h']:.2f}", "m³/h", st, False)
    r = escribir_fila_ds(ws, r, "Caudal másico de fondos", "17.433", "kg/h", "Densidad del líquido", "570,0", "kg/m³", st, True)
    r = escribir_fila_ds(ws, r, "Presión de operación", f"{d['P_op_bar']:.2f}", "barg", "Temperatura de operación", "40,0", "ºC", st, False)
    r = escribir_fila_ds(ws, r, "Tiempo retención a NLL", f"{d['t_ret_min']:.1f}", "minutos", "Nivel normal líquido (NLL)", "50 %", "", st, True)

    r += 1
    r = agregar_seccion(ws, r, "2. CONDICIONES Y PARÁMETROS DE DISEÑO MECÁNICO", st)
    r = escribir_fila_ds(ws, r, "Código de diseño", "ASME VIII Div 1 (Ed. 2023)", "", "Presión de diseño", f"{d['P_des_bar']:.2f}", "barg", st, False)
    r = escribir_fila_ds(ws, r, "Temperatura de diseño", f"{d['T_des_C']:.1f}", "ºC", "Material envolvente y fondos", "SA-516 Gr. 70", "", st, True)
    r = escribir_fila_ds(ws, r, "Tensión admisible (S)", "138,0", "MPa", "Eficiencia soldadura (E)", "0,85 (Spot)", "", st, False)
    r = escribir_fila_ds(ws, r, "Sobreespesor corrosión (c)", "2,0", "mm", "Presión prueba hidrostática", f"{d['P_des_bar']*1.3:.2f}", "barg", st, True)

    r += 1
    r = agregar_seccion(ws, r, "3. DIMENSIONES GEOMÉTRICAS Y ESPESORES", st)
    r = escribir_fila_ds(ws, r, "Tipo de recipiente", "Cilíndrico horizontal", "", "Volumen geométrico total", f"{d['V_geom_m3']:.2f}", "m³", st, False)
    r = escribir_fila_ds(ws, r, "Diámetro interior (Di)", f"{d['Di_mm']:.0f}", "mm", "Longitud entre tangentes (L)", f"{d['L_tt_mm']:.0f}", "mm", st, True)
    r = escribir_fila_ds(ws, r, "Relación L/D", f"{d['L_tt_mm']/d['Di_mm']:.2f}", "-", "Longitud total con cabezales", f"{d['L_tot_mm']:.0f}", "mm", st, False)
    r = escribir_fila_ds(ws, r, "Tipo de cabezales", "Elípticos 2:1 ASME", "", "Espesor req. virola", f"{d['t_vir_req_mm']:.2f}", "mm", st, True)
    r = escribir_fila_ds(ws, r, "Espesor req. cabezales", f"{d['t_cab_req_mm']:.2f}", "mm", "Espesor nominal adoptado", f"{d['t_nom_mm']:.1f}", "mm", st, False)

    r += 1
    r = agregar_seccion(ws, r, "4. CONEXIONES, BOQUILLAS Y PESOS ESTIMADOS", st)
    r = escribir_fila_ds(ws, r, "N1 (Entrada desde E-103)", "4\" ANSI 150# RFWN", "", "N2 (Salida a Bomba B-4)", "4\" ANSI 150# RFWN", "", st, False)
    r = escribir_fila_ds(ws, r, "N3 (Válvula de seguridad PSV)", "3\" x 4\" ANSI 150#", "", "N4 (Boca de hombre Manway)", "20\" ANSI 150#", "", st, True)
    r = escribir_fila_ds(ws, r, "Peso acero en vacío", f"{d['peso_acero_kg']:.0f}", "kg", "Peso en operación normal", f"{d['peso_op_kg']:.0f}", "kg", st, False)

def crear_datasheet_tk100(ws, data, st):
    d = data["tk100_esferas"]
    aplicar_cabecera_datasheet(ws, st, d["tag"], d["desc"], "Almacenamiento presurizado de n-butano para 15 días (Parque Off-sites)")
    
    r = 5
    r = agregar_seccion(ws, r, "1. CONDICIONES DE CAPACIDAD Y PROCESO DEL PARQUE", st)
    r = escribir_fila_ds(ws, r, "Producto almacenado", "n-Butano producto comercial", "", "Autonomía de almacenamiento", "15 días (360 horas)", "", st, False)
    r = escribir_fila_ds(ws, r, "Producción nominal de n-butano", "17.433", "kg/h", "Masa total almacenada", f"{d['masa_tot_Tm']:.1f}", "Tm", st, True)
    r = escribir_fila_ds(ws, r, "Volumen neto de líquido", f"{d['V_util_tot_m3']:.1f}", "m³", "Factor máx. llenado (ITC-ICG)", "85 %", "", st, False)
    r = escribir_fila_ds(ws, r, "Volumen geométrico total", f"{d['V_geom_tot_m3']:.1f}", "m³", "Número de esferas", f"{d['n_unidades']} unidades", "", st, True)
    r = escribir_fila_ds(ws, r, "Volumen geom. por esfera", f"{d['V_geom_unit_m3']:.1f}", "m³", "Ubicación del parque", "400 m de planta, cota +20 m", "", st, False)

    r += 1
    r = agregar_seccion(ws, r, "2. CONDICIONES Y PARÁMETROS DE DISEÑO MECÁNICO", st)
    r = escribir_fila_ds(ws, r, "Código de diseño", "ASME VIII Div 1 / API 620", "", "Presión de diseño", f"{d['P_des_bar']:.2f}", "barg", st, False)
    r = escribir_fila_ds(ws, r, "Temperatura de diseño", f"{d['T_des_C']:.1f}", "ºC", "Presión normal de operación", f"{d['P_op_bar']:.2f}", "barg", st, True)
    r = escribir_fila_ds(ws, r, "Material chapa esférica", "SA-516 Gr. 70 Normalizado", "", "Tensión admisible (S)", "138,0", "MPa", st, False)
    r = escribir_fila_ds(ws, r, "Eficiencia soldadura (E)", "1,00 (Full 100% RT)", "", "Sobreespesor corrosión (c)", "2,0", "mm", st, True)
    r = escribir_fila_ds(ws, r, "Presión prueba hidrostática", f"{d['P_des_bar']*1.3:.2f}", "barg", "Tratamiento térmico (PWHT)", "Según código / Requerido", "", st, False)

    r += 1
    r = agregar_seccion(ws, r, "3. DIMENSIONES GEOMÉTRICAS Y ESPESORES (POR ESFERA)", st)
    r = escribir_fila_ds(ws, r, "Geometría del recipiente", "Esfera completa (Horton Sphere)", "", "Diámetro interior (Di)", f"{d['Di_mm']:.0f}", "mm", st, False)
    r = escribir_fila_ds(ws, r, "Radio interior (Ri)", f"{d['Di_mm']/2:.0f}", "mm", "Superficie chapa por esfera", "1.295", "m²", st, True)
    r = escribir_fila_ds(ws, r, "Espesor requerido de chapa", f"{d['t_req_mm']:.2f}", "mm", "Espesor nominal adoptado", f"{d['t_nom_mm']:.1f}", "mm", st, False)

    r += 1
    r = agregar_seccion(ws, r, "4. SOPORTES, SEGURIDAD, PESOS Y PARQUE", st)
    r = escribir_fila_ds(ws, r, "Sistema de soporte", "11 Columnas tubulares de acero", "", "Protección pasiva fuego", "Ignifugado ignífugo en patas", "", st, False)
    r = escribir_fila_ds(ws, r, "Sistemas contra incendios", "Corona rociadores agua + cortina", "", "Válvulas de seguridad (PSV)", "2 x 100% piloto asistidas", "", st, True)
    r = escribir_fila_ds(ws, r, "Peso acero por esfera", f"{d['peso_acero_unit_Tm']:.1f}", "Tm", "Peso total acero (3 esferas)", f"{d['peso_acero_tot_Tm']:.1f}", "Tm", st, False)
    r = escribir_fila_ds(ws, r, "Superficie de parque requerida", f"{d['area_terreno_m2']:.0f}", "m²", "Coste estimado total batería", f"{d['coste_tot_M_eur']:.2f}", "M€", st, True)

def crear_hoja_comparativa(ws, data, st):
    esf = data["tk100_esferas"]
    cig = data["tk100_cigarros"]

    ws.merge_cells('A1:G1')
    c1 = ws['A1']
    c1.value = "ESTUDIO COMPARATIVO DE ALMACENAMIENTO DE N-BUTANO (15 DÍAS DE OPERACIÓN)"
    c1.font = st["f_titulo"]
    c1.fill = st["fill_header"]
    c1.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 28

    ws.merge_cells('A2:G2')
    c2 = ws['A2']
    c2.value = "EVALUACIÓN TÉCNICO-ECONÓMICA: BATERÍA DE ESFERAS PRESURIZADAS VS CIGARROS HORIZONTALES"
    c2.font = st["f_subtitulo"]
    c2.fill = st["fill_header"]
    c2.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    # Tabla de parámetros
    headers = ["Criterio de Evaluación", "Unidad", "Opción 1: Esferas Horton (Adoptada)", "Opción 2: Cigarros Horizontales", "Diferencia Relativa", "Impacto / Justificación Técnica"]
    row = 4
    ws.row_dimensions[row].height = 24
    cols_map = [1, 2, 3, 5, 6, 7]
    
    ws.merge_cells('C4:D4')
    ws.cell(row=row, column=1, value=headers[0]).font = st["f_sec"]
    ws.cell(row=row, column=1).fill = st["fill_sec"]
    ws.cell(row=row, column=2, value=headers[1]).font = st["f_sec"]
    ws.cell(row=row, column=2).fill = st["fill_sec"]
    ws.cell(row=row, column=3, value=headers[2]).font = st["f_sec"]
    ws.cell(row=row, column=3).fill = st["fill_sec"]
    ws.cell(row=row, column=4).fill = st["fill_sec"]
    ws.cell(row=row, column=5, value=headers[3]).font = st["f_sec"]
    ws.cell(row=row, column=5).fill = st["fill_sec"]
    ws.cell(row=row, column=6, value=headers[4]).font = st["f_sec"]
    ws.cell(row=row, column=6).fill = st["fill_sec"]
    ws.cell(row=row, column=7, value=headers[5]).font = st["f_sec"]
    ws.cell(row=row, column=7).fill = st["fill_sec"]

    datos_comp = [
        ("Masa total a almacenar", "Tm", f"{esf['masa_tot_Tm']:.1f}", f"{cig['masa_tot_Tm']:.1f}", "0 %", "Requerimiento contractual de 15 días continuos"),
        ("Volumen útil neto", "m³", f"{esf['V_util_tot_m3']:.1f}", f"{cig['V_util_tot_m3']:.1f}", "0 %", "Base de densidad a 25 ºC (565 kg/m³)"),
        ("Volumen geométrico total (85%)", "m³", f"{esf['V_geom_tot_m3']:.1f}", f"{cig['V_geom_tot_m3']:.1f}", "0 %", "Margen legal de seguridad anti-sobrellenado ITC-ICG"),
        ("Número de recipientes", "unidades", f"{esf['n_unidades']}", f"{cig['n_unidades']}", "-88 % (3 vs 26)", "Gran reducción de complejidad de conexionado y válvulas"),
        ("Dimensiones unitarias", "mm", f"Ø {esf['Di_mm']:.0f} (Esfera)", f"Ø {cig['Di_mm']:.0f} x {cig['L_tt_mm']:.0f} (L)", "-", "Cigarros limitados por transporte terrestre estándar"),
        ("Volumen unitario geométrico", "m³", f"{esf['V_geom_unit_m3']:.1f}", f"{cig['V_geom_unit_m3']:.1f}", "+743 %", "Máxima compacidad volumétrica de la esfera"),
        ("Presión de diseño", "barg", f"{esf['P_des_bar']:.2f}", f"{cig['P_des_bar']:.2f}", "0 %", "Presión de vapor a máxima insolación de verano en Cádiz"),
        ("Tensión de membrana requerida", "-", "σ = P·R / (2·t)", "σ = P·R / t", "-50 %", "La esfera resiste el doble de presión a igual espesor y radio"),
        ("Espesor nominal de chapa", "mm", f"{esf['t_nom_mm']:.1f}", f"{cig['t_nom_mm']:.1f}", "+78 %", "Mayor diámetro en esfera compensado por menor superficie"),
        ("Peso total de acero envolvente", "Tm", f"{esf['peso_acero_tot_Tm']:.1f}", f"{cig['peso_acero_tot_Tm']:.1f}", "-51 %", "¡Ahorro de más de 887 Tm de acero en la esfera!"),
        ("Ocupación de terreno (Footprint)", "m²", f"{esf['area_terreno_m2']:.0f}", f"{cig['area_terreno_m2']:.0f}", "-62 %", "Espacio crítico disponible en parcela de refinería"),
        ("Nº de lazos de control / PSV", "lazos", "3 dobles", "26 dobles", "-88 %", "Mantenimiento, calibración e inspección anual reducida"),
        ("Coste total estimado (CAPEX)", "M€", f"{esf['coste_tot_M_eur']:.2f}", f"{cig['coste_tot_M_eur']:.2f}", "-29 %", "Ahorro de ~1,76 M€ de inversión inicial"),
        ("Evaluación Global Recomendada", "-", "SELECCIÓN FINAL", "DESCARTADA", "-", "Esferas técnica y económicamente superiores")
    ]

    r = 5
    for row_data in datos_comp:
        ws.row_dimensions[r].height = 20
        criterio, un, v_esf, v_cig, dif, just = row_data
        
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=4)
        c_crit = ws.cell(row=r, column=1, value=criterio)
        c_un = ws.cell(row=r, column=2, value=un)
        c_esf = ws.cell(row=r, column=3, value=v_esf)
        c_cig = ws.cell(row=r, column=5, value=v_cig)
        c_dif = ws.cell(row=r, column=6, value=dif)
        c_just = ws.cell(row=r, column=7, value=just)

        is_last = (criterio == "Evaluación Global Recomendada")
        fill_r = st["fill_win"] if is_last else (st["fill_zebra"] if r % 2 == 1 else PatternFill(fill_type=None))
        
        for c in [c_crit, c_un, c_esf, ws.cell(row=r, column=4), c_cig, c_dif, c_just]:
            c.fill = fill_r
            c.border = st["border_cell"]
            c.font = Font(name="Segoe UI", size=9, bold=(is_last or c in [c_esf, c_dif]), color="1A365D" if is_last else "2D3748")

        c_crit.alignment = Alignment(horizontal="left", vertical="center")
        c_un.alignment = Alignment(horizontal="center", vertical="center")
        c_esf.alignment = Alignment(horizontal="center", vertical="center")
        c_cig.alignment = Alignment(horizontal="center", vertical="center")
        c_dif.alignment = Alignment(horizontal="center", vertical="center")
        c_just.alignment = Alignment(horizontal="left", vertical="center")
        r += 1

def ajustar_anchos(ws):
    ws.column_dimensions['A'].width = 30
    ws.column_dimensions['B'].width = 18
    ws.column_dimensions['C'].width = 16
    ws.column_dimensions['D'].width = 6
    ws.column_dimensions['E'].width = 28
    ws.column_dimensions['F'].width = 18
    ws.column_dimensions['G'].width = 36

def main():
    datos = calcular_recipientes()
    st = crear_estilos()

    wb = openpyxl.Workbook()
    # Sheet 1: Comparativa Almacenamiento
    ws_comp = wb.active
    ws_comp.title = "Comparativa_Almacenamiento"
    crear_hoja_comparativa(ws_comp, datos, st)
    ws_comp.column_dimensions['A'].width = 32
    ws_comp.column_dimensions['B'].width = 12
    ws_comp.column_dimensions['C'].width = 18
    ws_comp.column_dimensions['D'].width = 18
    ws_comp.column_dimensions['E'].width = 26
    ws_comp.column_dimensions['F'].width = 18
    ws_comp.column_dimensions['G'].width = 46

    # Sheet 2: DS-V-100
    ws_v100 = wb.create_sheet(title="DS-V-100")
    crear_datasheet_v100(ws_v100, datos, st)
    ajustar_anchos(ws_v100)

    # Sheet 3: DS-V-101
    ws_v101 = wb.create_sheet(title="DS-V-101")
    crear_datasheet_v101(ws_v101, datos, st)
    ajustar_anchos(ws_v101)

    # Sheet 4: DS-V-102
    ws_v102 = wb.create_sheet(title="DS-V-102")
    crear_datasheet_v102(ws_v102, datos, st)
    ajustar_anchos(ws_v102)

    # Sheet 5: DS-TK-100
    ws_tk100 = wb.create_sheet(title="DS-TK-100")
    crear_datasheet_tk100(ws_tk100, datos, st)
    ajustar_anchos(ws_tk100)

    out_dir = os.path.abspath("diseno_recipientes/documentos")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "Hojas_Especificacion_Recipientes_PILPIS.xlsx")
    wb.save(out_path)
    print(f"Workbook generado con éxito en: {out_path}")

if __name__ == "__main__":
    main()
