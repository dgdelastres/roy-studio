"""
Generador de Memoria Técnica de Diseño de Recipientes en Word (.docx)
Proyecto: Fraccionamiento de C4 (PILPIS - QUIMISUR)
Departamento: DPTO 2 - Gestión de Proyectos y Diseño de Recipientes
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

from calculo_recipientes import calcular_recipientes

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_header_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    for run in h.runs:
        run.font.name = "Calibri"
        if level == 1:
            run.font.size = Pt(16)
            run.font.bold = True
            run.font.color.rgb = RGBColor(26, 54, 93)  # Navy Blue #1A365D
        elif level == 2:
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(43, 108, 176)  # Blue #2B6CB0
        elif level == 3:
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(45, 55, 72)
    return h

def main():
    datos = calcular_recipientes()
    v100 = datos["v100"]
    v101 = datos["v101"]
    v102 = datos["v102"]
    esf = datos["tk100_esferas"]
    cig = datos["tk100_cigarros"]

    doc = docx.Document()
    
    # Configuración de márgenes estándar A4
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # -------------------------------------------------------------
    # PORTADA FORMAL
    # -------------------------------------------------------------
    p_empresa = doc.add_paragraph()
    p_empresa.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_emp = p_empresa.add_run("PILPIS, S.A.\nPROYECTOS DE INGENIERÍA LÍDER PARA INFINITAS SOLUCIONES")
    r_emp.font.name = "Calibri"
    r_emp.font.size = Pt(16)
    r_emp.font.bold = True
    r_emp.font.color.rgb = RGBColor(26, 54, 93)

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_div = p_div.add_run("OFICINA TÉCNICA — DEPARTAMENTO 2: GESTIÓN DE PROYECTOS Y DISEÑO DE RECIPIENTES")
    r_div.font.name = "Calibri"
    r_div.font.size = Pt(10)
    r_div.font.bold = True
    r_div.font.color.rgb = RGBColor(74, 85, 104)

    doc.add_paragraph("\n" * 2)

    p_tit = doc.add_paragraph()
    p_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tit = p_tit.add_run("LIBRO DE INGENIERÍA DE PROCESO\nDOCUMENTO DE INGENIERÍA BÁSICA Y DISEÑO MECÁNICO DE RECIPIENTES")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(20)
    r_tit.font.bold = True
    r_tit.font.color.rgb = RGBColor(26, 54, 93)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Planta de Fraccionamiento de Fracción C4 para Separación de Isobutano y n-Butano (200.000 Tm/año)\nRefinería de San Roque (Cádiz)")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(43, 108, 176)

    doc.add_paragraph("\n" * 3)

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_m = p_meta.add_run(
        "CONTRATANTE: Química del Sur especializada en olefinas, S.A. (QUIMISUR)\n"
        "CONTRATISTA: Proyectos de Ingeniería Líder Para Infinitas Soluciones, S.A. (PILPIS)\n"
        "NORMATIVA APLICABLE: Código ASME Sección VIII División 1 (Ed. 2023) / ITC-ICG 03 / API 2510\n"
        "EQUIPO REDACTOR (DPTO 2):\n"
        "  • ABURTO SILVA, SOFÍA ANTONIA\n"
        "  • CABALLERO RODRÍGUEZ, PAULA\n"
        "  • GARCÍA DE LASTRES, DANIEL\n"
        "  • QUIJANO FERNÁNDEZ, SARA\n"
        "FECHA: Noviembre 2026 | VERSIÓN: Rev. 0 (Emisión para Aprobación)"
    )
    r_m.font.name = "Calibri"
    r_m.font.size = Pt(10)
    r_m.font.color.rgb = RGBColor(45, 55, 72)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 1. INTRODUCCIÓN Y OBJETO
    # -------------------------------------------------------------
    add_header_styled(doc, "1. INTRODUCCIÓN Y OBJETO DEL DOCUMENTO", 1)
    
    doc.add_paragraph(
        "El presente documento forma parte integral del Libro de Ingeniería de Proceso correspondiente al Anteproyecto "
        "de la unidad de fraccionamiento de fracción C4 de refinería (capacidad nominal de 200.000 Tm/año), contratado por "
        "la sociedad mercantil QUIMISUR, S.A. a la empresa de ingeniería PILPIS, S.A. El emplazamiento de la nueva instalación "
        "se ubica dentro de la Refinería de San Roque (Cádiz), integrándose plenamente con las redes de proceso y servicios auxiliares del complejo industrial."
    )
    doc.add_paragraph(
        "Dentro de la organización de la Oficina Técnica de PILPIS, el Departamento 2 (Gestión de Proyectos y Diseño de Recipientes) "
        "asume la responsabilidad de la ingeniería básica, dimensionamiento volumétrico y diseño mecánico conforme al código "
        "internacional ASME Sección VIII División 1 de todos los recipientes a presión del sistema. Específicamente, este documento aborda:"
    )
    bullet1 = doc.add_paragraph(style='List Bullet')
    bullet1.add_run("V-100 (Tanque Pulmón de Alimentación C4): ").bold = True
    bullet1.add_run("Amortiguamiento de oscilaciones de caudal de materia prima y suministro de NPSH requerido a la bomba de carga B-1.")
    
    bullet2 = doc.add_paragraph(style='List Bullet')
    bullet2.add_run("V-101 (Acumulador de Reflujo y Destilado): ").bold = True
    bullet2.add_run("Separación de fases gas/líquido, retención de condensado para el circuito de reflujo (B-2), producto destilado de i-butano (B-3) y purga de trazas de agua mediante bota decantadora.")
    
    bullet3 = doc.add_paragraph(style='List Bullet')
    bullet3.add_run("V-102 (Tanque Pulmón de Fondos / n-Butano): ").bold = True
    bullet3.add_run("Amortiguamiento del producto de fondo de columna previo a su impulsión con B-4 a través de la línea de 400 m a cota +20 m hacia el parque exterior.")

    bullet4 = doc.add_paragraph(style='List Bullet')
    bullet4.add_run("TK-100 (Parque de Almacenamiento Exterior de n-Butano para 15 días): ").bold = True
    bullet4.add_run("Estudio comparativo riguroso, selección y dimensionamiento entre batería de esferas presurizadas (Horton Spheres) y batería de depósitos cilíndricos horizontales (cigarros).")

    # -------------------------------------------------------------
    # 2. BASES Y CRITERIOS DE DISEÑO
    # -------------------------------------------------------------
    add_header_styled(doc, "2. BASES Y CRITERIOS DE DISEÑO", 1)
    
    doc.add_paragraph(
        "Los parámetros operativos y condiciones en límite de batería proceden del documento contractual de Bases y Criterios "
        "de Diseño (Caso B) y de la Hoja de Encargo de Anteproyecto:"
    )
    
    table_bases = doc.add_table(rows=7, cols=3)
    table_bases.alignment = WD_TABLE_ALIGNMENT.CENTER
    bases_data = [
        ("Parámetro", "Valor Contractual", "Observaciones / Criterio"),
        ("Capacidad de planta", "200.000 Tm/año C4", "Factor de operación = 8.000 h/año (Caudal = 25.000 kg/h)"),
        ("Recuperación de Isobutano", "≥ 95,0 % en peso", "Mínimo 5.863,9 kg/h en corriente de destilado"),
        ("Pureza de Isobutano", "≥ 97,0 % peso ref. C4", "Propano sale 100% por cabeza; butenos repartidos"),
        ("Autonomía Almacenamiento n-Butano", "15 días continuos (360 h)", "Situado a 400 m de planta, a cota de +20 m"),
        ("Sobrediseño de equipos", "110 % en bombas y cambiadores", "120 % en bombas de reflujo e hidráulica de columna"),
        ("Materiales de construcción", "Acero al Carbono (SA-516 Gr. 70)", "Ausencia de agentes corrosivos ácidos/clorados")
    ]
    for i, row in enumerate(table_bases.rows):
        for j, text in enumerate(bases_data[i]):
            cell = row.cells[j]
            cell.text = text
            if i == 0:
                set_cell_background(cell, "1A365D")
                p = cell.paragraphs[0]
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
            else:
                if i % 2 == 1:
                    set_cell_background(cell, "F7FAFC")
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)

    doc.add_paragraph()

    # -------------------------------------------------------------
    # 3. METODOLOGÍA Y FORMULACIÓN ASME SECCIÓN VIII DIVISIÓN 1
    # -------------------------------------------------------------
    add_header_styled(doc, "3. METODOLOGÍA Y FORMULACIÓN DE CÁLCULO MECÁNICO", 1)
    
    doc.add_paragraph(
        "El dimensionamiento mecánico de los recipientes sometidos a presión interna se realiza siguiendo estrictamente "
        "los preceptos del Código ASME Boiler and Pressure Vessel Code, Sección VIII, División 1 (Edición 2023):"
    )
    
    add_header_styled(doc, "3.1. Envolvente Cilíndrica (Virola) — Tensión Circunferencial (UG-27 c-1)", 2)
    doc.add_paragraph(
        "El espesor mínimo requerido por presión interior para virolas cilíndricas se calcula mediante la ecuación de tensión circunferencial longitudinal:\n"
        "t_vir = (P · R_i) / (S · E - 0,6 · P) + c\n"
        "Donde:\n"
        "• P = Presión de diseño calculada o estipulada (MPa o barg).\n"
        "• R_i = Radio interior del cuerpo cilíndrico (mm).\n"
        "• S = Tensión admisible del material a la temperatura de diseño (138 MPa para SA-516 Gr. 70 a T ≤ 100 ºC).\n"
        "• E = Eficiencia de junta soldada longitudinal (E = 0,85 para radiografiado por puntos / Spot UW-12b; E = 1,00 para radiografiado total 100%).\n"
        "• c = Sobreespesor de corrosión admisible (c = 2,0 mm en todo el proyecto)."
    )

    add_header_styled(doc, "3.2. Cabezales Elípticos 2:1 ASME (UG-32 d)", 2)
    doc.add_paragraph(
        "Los fondos convexos elípticos con relación de semiejes 2:1 (profundidad h = Di / 4) se calculan mediante:\n"
        "t_cab = (P · D_i) / (2 · S · E - 0,2 · P) + c\n"
        "Donde D_i es el diámetro interior del cabezal."
    )

    add_header_styled(doc, "3.3. Envolvente Esférica (UG-27 d)", 2)
    doc.add_paragraph(
        "Para esferas completas sometidas a presión interna uniforme, la tensión de membrana es idéntica en todas direcciones e igual a la mitad que en una virola cilíndrica de igual radio:\n"
        "t_esf = (P · R_i) / (2 · S · E - 0,2 · P) + c\n"
        "Con E = 1,00 obligatorio según código para recipientes esféricos de gas licuado presurizado con radiografiado 100% de soldaduras."
    )

    add_header_styled(doc, "3.4. Presión de Prueba Hidrostática (UG-99)", 2)
    doc.add_paragraph(
        "Conforme al párrafo UG-99(b), todo recipiente a presión finalizado debe superar en taller una prueba hidrostática de estanqueidad y resistencia a una presión mínima de:\n"
        "P_test = 1,3 · P_des · (S_test / S_des) ≈ 1,3 · P_des (al ser S idéntica a temperatura ambiente)."
    )

    # -------------------------------------------------------------
    # 4. DISEÑO DE LOS RECIPIENTES DE PROCESO (P&ID)
    # -------------------------------------------------------------
    add_header_styled(doc, "4. DISEÑO Y ESPECIFICACIÓN DE LOS RECIPIENTES DE PROCESO", 1)

    # 4.1 V-100
    add_header_styled(doc, "4.1. V-100: Tanque Pulmón de Alimentación C4", 2)
    doc.add_paragraph(
        f"El recipiente V-100 recibe la corriente líquida de fracción C4 hidrotratada procedente de batería de refinería a 40 ºC y 11,0 kg/cm²g. "
        f"Con un caudal másico de 25.000 kg/h y densidad de 555 kg/m³, el caudal volumétrico es de {v100['Q_m3h']:.2f} m³/h. "
        f"Adoptando un tiempo de retención de diseño de {v100['t_ret_min']:.0f} minutos a nivel normal de líquido (NLL = 50%), "
        f"el volumen geométrico total necesario es de {v100['V_geom_m3']:.2f} m³."
    )
    doc.add_paragraph(
        f"Se adopta una geometría cilíndrica horizontal con cabezales elípticos 2:1 normalizados:\n"
        f"• Diámetro interior: Di = {v100['Di_mm']:.0f} mm (2,00 m).\n"
        f"• Longitud entre líneas de tangencia: L = {v100['L_tt_mm']:.0f} mm (Relación L/D = 3,30).\n"
        f"• Longitud total entre vértices: L_tot = {v100['L_tot_mm']:.0f} mm (7,60 m).\n"
        f"• Presión y Temperatura de diseño: P_des = {v100['P_des_bar']:.2f} barg (13,0 kg/cm²g), T_des = {v100['T_des_C']:.0f} ºC.\n"
        f"• Espesores mecánicos calculados ASME: virola = {v100['t_vir_req_mm']:.2f} mm; cabezales = {v100['t_cab_req_mm']:.2f} mm.\n"
        f"• Espesor comercial normalizado adoptado: t_nom = {v100['t_nom_mm']:.0f} mm en SA-516 Gr. 70.\n"
        f"• Peso en vacío: {v100['peso_acero_kg']:.0f} kg | Peso en operación normal: {v100['peso_op_kg']:.0f} kg."
    )

    # 4.2 V-101
    add_header_styled(doc, "4.2. V-101: Acumulador de Reflujo y Destilado (Reflux Drum)", 2)
    doc.add_paragraph(
        f"El acumulador V-101 opera en la cabeza de la columna de destilación T-100, recogiendo el hidrocarburo condensado en E-101/E-102 a 42 ºC y 5,88 barg. "
        f"El caudal total de líquido condensado que entra al recipiente es de {v101['Q_m3h']:.2f} m³/h (suma del reflujo impulsado por B-2 de 62,48 m³/h "
        f"y del destilado producto de i-butano impulsado por B-3 de 13,88 m³/h). "
        f"Para garantizar un control suave de nivel y evitar paradas por fluctuaciones, se fija un tiempo de holdup de {v101['t_ret_min']:.0f} minutos a medio nivel, "
        f"resultando un volumen geométrico de {v101['V_geom_m3']:.2f} m³."
    )
    doc.add_paragraph(
        f"El equipo incorpora una bota inferior de decantación (boot) de Ø 400 mm x 600 mm para purga periódica de trazas de agua condensada:\n"
        f"• Diámetro interior: Di = {v101['Di_mm']:.0f} mm (1,90 m).\n"
        f"• Longitud entre tangentes: L = {v101['L_tt_mm']:.0f} mm (Relación L/D = 3,47).\n"
        f"• Longitud total: L_tot = {v101['L_tot_mm']:.0f} mm.\n"
        f"• Presión y Temperatura de diseño: P_des = {v101['P_des_bar']:.2f} barg (8,5 kg/cm²g), T_des = {v101['T_des_C']:.0f} ºC.\n"
        f"• Espesores mecánicos calculados ASME: virola = {v101['t_vir_req_mm']:.2f} mm; cabezales = {v101['t_cab_req_mm']:.2f} mm.\n"
        f"• Espesor comercial normalizado adoptado: t_nom = {v101['t_nom_mm']:.0f} mm en SA-516 Gr. 70.\n"
        f"• Peso en vacío: {v101['peso_acero_kg']:.0f} kg | Peso en operación: {v101['peso_op_kg']:.0f} kg."
    )

    # 4.3 V-102
    add_header_styled(doc, "4.3. V-102: Tanque Pulmón de Fondos / n-Butano", 2)
    doc.add_paragraph(
        f"El recipiente V-102 actúa como colchón de aspiración para las bombas de fondo B-4, las cuales impulsan 17.433 kg/h ({v102['Q_m3h']:.2f} m³/h) "
        f"de n-butano a través de la tubería de envío hasta el parque de almacenamiento situado a 400 m de distancia y 20 m de elevación. "
        f"Con un tiempo de retención de {v102['t_ret_min']:.0f} minutos a medio nivel, el volumen geométrico total es de {v102['V_geom_m3']:.2f} m³."
    )
    doc.add_paragraph(
        f"• Diámetro interior: Di = {v102['Di_mm']:.0f} mm (1,60 m).\n"
        f"• Longitud entre tangentes: L = {v102['L_tt_mm']:.0f} mm (Relación L/D = 3,50).\n"
        f"• Longitud total: L_tot = {v102['L_tot_mm']:.0f} mm (6,40 m).\n"
        f"• Presión y Temperatura de diseño: P_des = {v102['P_des_bar']:.2f} barg (9,5 kg/cm²g), T_des = {v102['T_des_C']:.0f} ºC.\n"
        f"• Espesores mecánicos calculados ASME: virola = {v102['t_vir_req_mm']:.2f} mm; cabezales = {v102['t_cab_req_mm']:.2f} mm.\n"
        f"• Espesor comercial normalizado adoptado: t_nom = {v102['t_nom_mm']:.0f} mm en SA-516 Gr. 70.\n"
        f"• Peso en vacío: {v102['peso_acero_kg']:.0f} kg | Peso en operación: {v102['peso_op_kg']:.0f} kg."
    )

    # -------------------------------------------------------------
    # 5. ESTUDIO COMPARATIVO ALMACENAMIENTO (15 DÍAS)
    # -------------------------------------------------------------
    add_header_styled(doc, "5. ESTUDIO COMPARATIVO DE ALMACENAMIENTO DE N-BUTANO (15 DÍAS)", 1)
    
    doc.add_paragraph(
        f"La Hoja de Encargo de Anteproyecto exige prever almacenamiento de n-butano producto para 15 días continuos de operación "
        f"(360 horas) a una distancia de 400 m y +20 m de cota. Con una producción horaria de 17.432,6 kg/h, la masa total acumulada en 15 días "
        f"asciende a {esf['masa_tot_Tm']:.1f} toneladas de hidrocarburo líquido. "
        f"Considerando una densidad media en parque de 565 kg/m³, el volumen neto de líquido almacenado es de {esf['V_util_tot_m3']:.1f} m³. "
        f"Aplicando el límite reglamentario de llenado del 85% para Gases Licuados del Petróleo a presión (ITC-ICG 03 y API 2510), "
        f"la capacidad volumétrica geométrica requerida es de {esf['V_geom_tot_m3']:.1f} m³."
    )
    doc.add_paragraph(
        "A petición de la Dirección Técnica, se ha realizado una exhaustiva evaluación comparativa entre las dos tecnologías viables "
        "en almacenamiento a presión: la Batería de Esferas Presurizadas (Horton Spheres) y la Batería de Depósitos Cilíndricos Horizontales (Cigarros):"
    )

    # Tabla comparativa en Word
    table_comp = doc.add_table(rows=14, cols=5)
    table_comp.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_c = ["Criterio de Evaluación", "Unidad", "Opción 1: Esferas (Adoptada)", "Opción 2: Cigarros", "Ventaja / Conclusión"]
    for j, h in enumerate(headers_c):
        cell = table_comp.rows[0].cells[j]
        cell.text = h
        set_cell_background(cell, "1A365D")
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)

    rows_comp_data = [
        ("Masa total almacenada (15 días)", "Tm", f"{esf['masa_tot_Tm']:.1f}", f"{cig['masa_tot_Tm']:.1f}", "Requisito contractual idéntico"),
        ("Volumen geométrico total", "m³", f"{esf['V_geom_tot_m3']:.1f}", f"{cig['V_geom_tot_m3']:.1f}", "Factor de llenado 85% en ambas"),
        ("Número de recipientes", "unidades", f"{esf['n_unidades']} esferas", f"{cig['n_unidades']} cigarros", "88% menos equipos en esferas"),
        ("Dimensiones unitarias", "mm", f"Ø {esf['Di_mm']:.0f} (Di)", f"Ø {cig['Di_mm']:.0f} x {cig['L_tt_mm']:.0f} (L)", "Cigarros al límite de transporte"),
        ("Volumen unitario", "m³", f"{esf['V_geom_unit_m3']:.1f}", f"{cig['V_geom_unit_m3']:.1f}", "Esfera optimiza volumen por unidad"),
        ("Tensión de membrana teórica", "-", "σ = P·R / (2·t)", "σ = P·R / t", "Esfera resiste 2 veces más a = radio"),
        ("Espesor nominal chapa", "mm", f"{esf['t_nom_mm']:.0f} mm", f"{cig['t_nom_mm']:.0f} mm", "Espesor estándar comercial SA-516"),
        ("Peso total de acero envolvente", "Tm", f"{esf['peso_acero_tot_Tm']:.1f} Tm", f"{cig['peso_acero_tot_Tm']:.1f} Tm", "¡Ahorro de 887 Tm de acero en esferas!"),
        ("Ocupación de terreno (Footprint)", "m²", f"{esf['area_terreno_m2']:.0f} m²", f"{cig['area_terreno_m2']:.0f} m²", "62% menor parcela requerida"),
        ("Lazos de instrumentación y PSV", "lazos", "3 dobles", "26 dobles", "Enorme reducción de coste O&M"),
        ("Coste de inversión estimado (CAPEX)", "M€", f"{esf['coste_tot_M_eur']:.2f} M€", f"{cig['coste_tot_M_eur']:.2f} M€", "Ahorro directo de 1,76 M€ (-29%)"),
        ("Riesgo de fuga / juntas embridadas", "-", "Mínimo (3 conexiones)", "Muy alto (26 colectores)", "Mayor seguridad intrínseca"),
        ("Decisión Final de Diseño", "-", "SELECCIÓN OFICIAL", "DESCARTADA", "Superioridad técnica y económica")
    ]

    for i, data_r in enumerate(rows_comp_data):
        row = table_comp.rows[i + 1]
        for j, text in enumerate(data_r):
            cell = row.cells[j]
            cell.text = text
            if i % 2 == 1:
                set_cell_background(cell, "F7FAFC")
            if i == len(rows_comp_data) - 1:
                set_cell_background(cell, "C6F6D5")
                p = cell.paragraphs[0]
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(26, 54, 93)
            set_cell_margins(cell, top=70, bottom=70, left=100, right=100)

    doc.add_paragraph()
    doc.add_paragraph(
        "JUSTIFICACIÓN DE LA SELECCIÓN DE LAS ESFERAS PRESURIZADAS:\n"
        "1. Ahorro de Material y Peso: La geometría esférica presenta la menor relación superficie/volumen de todos los sólidos geométricos "
        "y soporta las tensiones por presión con la mitad de esfuerzo tangencial que una virola cilíndrica. Esto reduce el consumo total "
        "de chapa de acero de 1.741 Tm (en cigarros) a solo 854 Tm (en esferas), representando un ahorro superior al 50% en material.\n"
        "2. Huella en Planta y Terreno: En una refinería consolidada como San Roque, el terreno disponible es un recurso crítico. La batería "
        "de 26 cigarros requeriría una superficie de parque de 19.500 m² con viales y distancias de seguridad entre ejes según ITC-ICG 03, "
        "mientras que las 3 esferas presurizadas se integran holgadamente en 7.500 m².\n"
        "3. Coste de Inversión (CAPEX) y Mantenimiento (OPEX): La instalación de 26 depósitos horizontales multiplica por nueve el número "
        "de válvulas de seguridad, líneas colectoras de carga/descarga, sistemas de rociadores contra incendios, cunas de hormigón y lazos "
        "de instrumentación (SIL), elevando el coste total estimado a 6,11 M€ frente a los 4,35 M€ de las 3 esferas (ahorro neto de 1,76 M€).\n"
        "Por todo ello, se concluye formalmente que la BATERÍA DE 3 ESFERAS PRESURIZADAS HORTON (TK-100 A/B/C) es la opción técnicamente "
        "óptima e indiscutible para el proyecto."
    )

    # -------------------------------------------------------------
    # 6. TABLA RESUMEN GENERAL DE EQUIPOS
    # -------------------------------------------------------------
    add_header_styled(doc, "6. TABLA RESUMEN GENERAL DE RECIPIENTES (LIBRO DE PROCESO)", 1)
    
    table_resumen = doc.add_table(rows=5, cols=7)
    table_resumen.alignment = WD_TABLE_ALIGNMENT.CENTER
    resumen_h = ["TAG", "Descripción del Equipo", "Tipo Geométrico", "Vol. (m³)", "Dimensiones (mm)", "P des (barg)", "Espesor (mm)"]
    for j, h in enumerate(resumen_h):
        cell = table_resumen.rows[0].cells[j]
        cell.text = h
        set_cell_background(cell, "1A365D")
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(cell, top=90, bottom=90, left=90, right=90)

    resumen_data = [
        ("V-100", "Pulmón Alimentación C4", "Horizontal elíptico 2:1", f"{v100['V_geom_m3']:.1f}", f"Ø {v100['Di_mm']:.0f} x {v100['L_tt_mm']:.0f}", f"{v100['P_des_bar']:.2f}", f"{v100['t_nom_mm']:.0f} (SA-516-70)"),
        ("V-101", "Acumulador Reflujo/Dest.", "Horizontal elíp. + bota", f"{v101['V_geom_m3']:.1f}", f"Ø {v101['Di_mm']:.0f} x {v101['L_tt_mm']:.0f}", f"{v101['P_des_bar']:.2f}", f"{v101['t_nom_mm']:.0f} (SA-516-70)"),
        ("V-102", "Pulmón Fondos (n-Butano)", "Horizontal elíptico 2:1", f"{v102['V_geom_m3']:.1f}", f"Ø {v102['Di_mm']:.0f} x {v102['L_tt_mm']:.0f}", f"{v102['P_des_bar']:.2f}", f"{v102['t_nom_mm']:.0f} (SA-516-70)"),
        ("TK-100 A/B/C", "Esferas Almacenamiento (15 d)", "3 Esferas Horton", f"{esf['V_geom_tot_m3']:.0f} tot", f"3 x Ø {esf['Di_mm']:.0f}", f"{esf['P_des_bar']:.2f}", f"{esf['t_nom_mm']:.0f} (SA-516-70)")
    ]

    for i, data_r in enumerate(resumen_data):
        row = table_resumen.rows[i + 1]
        for j, text in enumerate(data_r):
            cell = row.cells[j]
            cell.text = text
            if i % 2 == 1:
                set_cell_background(cell, "F7FAFC")
            set_cell_margins(cell, top=70, bottom=70, left=90, right=90)

    doc.add_paragraph()
    doc.add_paragraph(
        "Aprobado y emitido por el Departamento de Gestión de Proyectos y Diseño de Recipientes (PILPIS, S.A.)."
    )

    out_dir = os.path.abspath("diseno_recipientes/documentos")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "Memoria_Diseno_Recipientes_PILPIS.docx")
    doc.save(out_path)
    print(f"Documento Word generado con éxito en: {out_path}")

if __name__ == "__main__":
    main()
