import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

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
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = RGBColor(26, 54, 93)  # #1A365D
        elif level == 2:
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(43, 108, 176)  # #2B6CB0
        elif level == 3:
            run.font.size = Pt(10.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(45, 55, 72)
    return h

def main():
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)

    # PORTADA
    p_emp = doc.add_paragraph()
    p_emp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_emp.add_run("PILPIS, S.A.\nPROYECTOS DE INGENIERÍA LÍDER PARA INFINITAS SOLUCIONES")
    r.font.name = "Calibri"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(26, 54, 93)

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_div.add_run("OFICINA TÉCNICA — DEPARTAMENTO 2: GESTIÓN DE PROYECTOS Y DISEÑO DE RECIPIENTES")
    r.font.name = "Calibri"
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = RGBColor(74, 85, 104)

    doc.add_paragraph("\n" * 2)

    p_tit = doc.add_paragraph()
    p_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_tit.add_run("DOCUMENTO DE BASES NORMATIVAS Y PROCEDIMIENTO DE CÁLCULO MECÁNICO\nCÓDIGO ASME SECCIÓN VIII DIVISIÓN 1 (EDICIÓN 2023)")
    r.font.name = "Calibri"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor(26, 54, 93)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_sub.add_run("Reglas Oficiales para el Dimensionamiento, Resistencia Mecánica, Soldaduras y Ensayos de Recipientes a Presión y Almacenamiento de GLP\nProyecto: Planta de Fraccionamiento de Fracción C4 (San Roque, Cádiz) | Cliente: QUIMISUR, S.A.")
    r.font.name = "Calibri"
    r.font.size = Pt(11)
    r.font.italic = True
    r.font.color.rgb = RGBColor(43, 108, 176)

    doc.add_paragraph("\n" * 3)

    p_meta = doc.add_paragraph()
    r = p_meta.add_run(
        "CÓDIGO BASE: ASME Boiler and Pressure Vessel Code (BPVC) Section VIII, Division 1\n"
        "NORMATIVA COMPLEMENTARIA: ITC-ICG 03 (Almacenamiento de GLP) / API 2510 / ASME B31.3 / UNE-EN 13445\n"
        "EQUIPO REDACTOR: DPTO 2 — Gestión de Proyectos y Diseño de Recipientes\n"
        "AUTORES: ABURTO SILVA, S.A. | CABALLERO RODRÍGUEZ, P. | GARCÍA DE LASTRES, D. | QUIJANO FERNÁNDEZ, S.\n"
        "FECHA: Noviembre 2026 | DOCUMENTO TÉCNICO INTERNO REV. 0"
    )
    r.font.name = "Calibri"
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(45, 55, 72)

    doc.add_page_break()

    # 1. INTRODUCCIÓN Y ALCANCE
    add_header_styled(doc, "1. INTRODUCCIÓN Y OBJETO DE LA NORMA", 1)
    doc.add_paragraph(
        "El presente documento recopila de manera sistemática y rigurosa el conjunto de preceptos, criterios de diseño, "
        "fórmulas analíticas y requisitos de aseguramiento de calidad del Código ASME Boiler and Pressure Vessel Code (BPVC), "
        "Sección VIII, División 1 («Rules for Construction of Pressure Vessels», Edición 2023). Este marco normativo constituye "
        "la base técnica obligatoria sobre la cual se fundamenta el diseño mecánico de todos los recipientes a presión "
        "(V-100, V-101, V-102) y del parque de almacenamiento presurizado de n-butano (TK-100 A/B/C) de la Planta de Fraccionamiento "
        "de Fracción C4 para QUIMISUR, S.A. en San Roque (Cádiz)."
    )

    # 2. ESTRUCTURA DEL CÓDIGO ASME VIII DIV. 1
    add_header_styled(doc, "2. ESTRUCTURA Y ARTICULADO DEL CÓDIGO ASME VIII DIVISIÓN 1", 1)
    doc.add_paragraph(
        "La División 1 se organiza en tres subsecciones principales complementadas con apéndices mandatorios y no mandatorios:"
    )
    doc.add_paragraph("• Subsección A — Requisitos Generales (Parte UG): Aplicables a todos los recipientes sin importar material ni método de unión.")
    doc.add_paragraph("• Subsección B — Requisitos según Método de Fabricación: Especialmente la Parte UW para recipientes ensamblados por soldadura por fusión.")
    doc.add_paragraph("• Subsección C — Requisitos según Clases de Materiales: Especialmente la Parte UCS para aceros al carbono y de baja aleación (como el SA-516 Gr. 70 seleccionado).")
    doc.add_paragraph("• Apéndice G: Sugerencias para el diseño de soportes y apoyos (método de Zick para cunas en depósitos horizontales).")

    # 3. CRITERIOS DE DISEÑO: PRESIÓN, TEMPERATURA Y CARGAS
    add_header_styled(doc, "3. CRITERIOS DE DISEÑO: PRESIÓN, TEMPERATURA Y TENSIONES ADMISIBLES", 1)
    
    add_header_styled(doc, "3.1. Presión de Diseño (Párrafo UG-21)", 2)
    doc.add_paragraph(
        "La presión de diseño (P_des) es la presión interna en la parte superior del recipiente en su posición de operación, "
        "empleada junto con la temperatura de diseño para determinar el espesor mínimo de pared. En ingeniería petroquímica "
        "y conforme a las bases contractuales de QUIMISUR, se define como:\n"
        "• Para presiones de operación inferiores a 10 barg: P_des = P_op + 1,5 bar a 2,0 bar.\n"
        "• Para presiones de operación superiores a 10 barg: P_des = 1,10 · P_op (mínimo 1,5 bar por encima).\n"
        "• Además, a cualquier nivel vertical del recipiente, la presión hidrostática del líquido se suma a la presión de vapor."
    )

    add_header_styled(doc, "3.2. Temperatura de Diseño y Mínima Admisible MDMT (Párrafo UG-20)", 2)
    doc.add_paragraph(
        "La temperatura máxima de diseño se establece al menos 10 ºC a 15 ºC por encima de la temperatura máxima de operación "
        "para absorber transitorios y fluctuaciones de verano. Asimismo, debe definirse la Temperatura Mínima de Diseño del Metal "
        "(MDMT) para prevenir la rotura frágil conforme a las curvas de impacto Charpy del párrafo UCS-66."
    )

    add_header_styled(doc, "3.3. Tensiones Admisibles del Material (Párrafo UG-23 y ASME Sección II Parte D)", 2)
    doc.add_paragraph(
        "El código establece los valores máximos de tensión admisible a tracción (S) dividiendo el límite elástico y la resistencia "
        "última por factores de seguridad conservadores (típicamente factor 3,5 sobre Rm). Para el acero al carbono normalizado "
        "SA-516 Grado 70 (especificación ASTM A516 / ASME SA-516):\n"
        "• Límite de fluencia mínimo especificado: Sy = 260 MPa (38.000 psi).\n"
        "• Resistencia última a tracción mínima: Su = 485 MPa (70.000 psi).\n"
        "• Tensión máxima admisible de cálculo a T ≤ 100 ºC: S = 138 MPa (20.000 psi)."
    )

    add_header_styled(doc, "3.4. Sobreespesor por Corrosión (Párrafo UG-16)", 2)
    doc.add_paragraph(
        "Todo espesor calculado mediante las fórmulas resistentes debe incrementarse con un sobreespesor de corrosión admisible (c). "
        "Para fracciones de hidrocarburos no ácidas (fracción C4, isobutano y n-butano desulfurados y libres de H2S), se establece "
        "un margen estándar de seguridad de c = 2,0 mm en virola y fondos."
    )

    # 4. FORMULACIÓN ANALÍTICA DE ESPESORES RESISTENTES
    add_header_styled(doc, "4. FORMULACIÓN ANALÍTICA ASME VIII DIVISIÓN 1", 1)

    add_header_styled(doc, "4.1. Virolas Cilíndricas (Párrafo UG-27)", 2)
    doc.add_paragraph(
        "En un cilindro cerrado sometido a presión interna, el estado tensional de membrana se descompone en dos direcciones principales ortogonales:\n\n"
        "A) Tensión Circunferencial / Tangencial / Angular (Ecuación UG-27 c-1):\n"
        "Esta tensión actúa en el plano transversal e induce esfuerzos de tracción en las juntas soldadas longitudinales. "
        "Es la tensión más desfavorable (el doble que la axial) y fija el espesor de la envolvente cilíndrica:\n"
        "t_vir = (P · R_i) / (S · E - 0,6 · P) + c\n\n"
        "B) Tensión Longitudinal en el Eje z (Ecuación UG-27 c-2):\n"
        "Esta tensión actúa paralela al eje geométrico z del cilindro, provocada por la fuerza de presión que empuja los cabezales "
        "en los extremos, induciendo esfuerzos sobre las soldaduras circunferenciales:\n"
        "t_z = (P · R_i) / (2 · S · E + 0,4 · P) + c\n\n"
        "Donde:\n"
        "• P = Presión de diseño (MPa o barg).\n"
        "• R_i = Radio interior de la virola en estado corroído (mm).\n"
        "• S = Tensión admisible del material a temperatura de diseño (MPa).\n"
        "• E = Eficiencia de junta soldada longitudinal.\n"
        "• c = Sobreespesor de corrosión admisible (mm).\n"
        "• El término -0,6·P representa la corrección de pared gruesa de Lamé referenciada al radio interior."
    )

    add_header_styled(doc, "4.2. Cabezales Elípticos 2:1 ASME (Párrafo UG-32 d)", 2)
    doc.add_paragraph(
        "Los fondos bombeados elípticos normalizados cuya relación entre el semieje mayor (diámetro interior Di) y el semieje menor "
        "(profundidad interior h) es 2:1 (h = Di / 4), presentan una transición óptima de esfuerzos de flexión en el borde de junta. "
        "Su espesor mínimo se calcula mediante:\n"
        "t_cab = (P · D_i) / (2 · S · E - 0,2 · P) + c\n\n"
        "Donde Di es el diámetro interior del cabezal en mm."
    )

    add_header_styled(doc, "4.3. Envolventes Esféricas y Cabezales Semiesféricos (Párrafos UG-27 d y UG-32 f)", 2)
    doc.add_paragraph(
        "En recipientes esféricos completos (como las esferas de almacenamiento TK-100) y en fondos semiesféricos puros (h = Ri), "
        "la tensión de membrana es exactamente idéntica en cualquier dirección tangente y equivale a la mitad de la tensión "
        "circunferencial de un cilindro equivalente:\n"
        "t_esf = (P · R_i) / (2 · S · E - 0,2 · P) + c\n\n"
        "Por esta razón fundamental de la resistencia de materiales, a igual presión, diámetro y material, una esfera requiere "
        "aproximadamente el 50% del espesor de acero que una virola cilíndrica."
    )

    add_header_styled(doc, "4.4. Presión Máxima de Trabajo Admisible (MAWP)", 2)
    doc.add_paragraph(
        "Una vez seleccionado el espesor comercial normalizado adoptado (t_nom), la chapa posee un espesor resistente corroído tn = t_nom - c. "
        "La Presión Máxima de Trabajo Admisible (MAWP, Maximum Allowable Working Pressure) representa la presión interior máxima "
        "que el equipo puede soportar con la chapa totalmente corroída a la temperatura de cálculo:\n"
        "MAWP = (S · E · t_n) / (R_i + 0,6 · t_n)\n"
        "Por requisito de código, siempre se debe verificar que MAWP ≥ P_des."
    )

    # 5. SOLDADURAS Y EFICIENCIA DE JUNTA (PARTE UW)
    add_header_styled(doc, "5. TIPOS DE SOLDADURA Y EFICIENCIA DE JUNTA (PARTE UW)", 1)
    doc.add_paragraph(
        "El párrafo UW-12 del código ASME asigna la eficiencia de junta soldada (E) en función del tipo de junta y del nivel de control "
        "no destructivo por radiografía (RT) o ultrasonidos (UT) ejecutado durante la fabricación:"
    )

    t_uw = doc.add_table(rows=4, cols=4)
    t_uw.alignment = WD_TABLE_ALIGNMENT.CENTER
    uw_data = [
        ("Grado de Inspección Radiográfica", "Eficiencia (E)", "Párrafo ASME", "Criterio de Aplicación en el Proyecto PILPIS"),
        ("100% Radiografiado (Full RT)", "1,00", "UW-11(a) / UW-12(a)", "Obligatorio en Esferas TK-100 de almacenamiento de GLP presurizado y servicios críticos."),
        ("Radiografiado por Puntos (Spot RT)", "0,85", "UW-11(b) / UW-12(b)", "Estándar adoptado para virolas cilíndricas y cabezales elípticos de V-100, V-101 y V-102."),
        ("Inspección Visual (Sin RT)", "0,70", "UW-12(c)", "No admitido en este proyecto para hidrocarburos licuados a presión por razones de seguridad.")
    ]
    for i, row in enumerate(t_uw.rows):
        for j, val in enumerate(uw_data[i]):
            c = row.cells[j]
            c.text = val
            if i == 0:
                set_cell_background(c, "1A365D")
                p = c.paragraphs[0]
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
            else:
                if i % 2 == 1:
                    set_cell_background(c, "F7FAFC")
            set_cell_margins(c, 80, 80, 100, 100)

    doc.add_paragraph()

    # 6. ABERTURAS Y BOQUILLAS (UG-36 A UG-45)
    add_header_styled(doc, "6. REFUERZO DE ABERTURAS Y BOQUILLAS (PÁRRAFOS UG-36 A UG-45)", 1)
    doc.add_paragraph(
        "Al practicar orificios en la envolvente para las boquillas de conexión de tuberías (alimentación, salida, venteos, "
        "drenajes, instrumentación o bocas de hombre manhole Ø 24\"), se interrumpe la continuidad tensional de la chapa. "
        "El código ASME impone la regla del área de compensación (Párrafo UG-37):\n\n"
        "A_req = d · t_r · F\n\n"
        "Donde d es el diámetro del orificio terminado en estado corroído, t_r es el espesor requerido sin corrosión y F = 1,0. "
        "Esta área transversal de metal retirada debe compensarse mediante:\n"
        "1. El exceso de espesor disponible en la virola por encima del mínimo requerido (t_nom - t_req).\n"
        "2. El exceso de espesor disponible en el cuello de la propia boquilla.\n"
        "3. La adición de anillos o placas de refuerzo soldados (reinforcement pads o cuellos forjados de cuerpo grueso tipo Heavy Barrel)."
    )

    # 7. APOYOS EN CUNAS (MÉTODO DE ZICK - APÉNDICE G)
    add_header_styled(doc, "7. APOYOS EN CUNAS Y CARGAS ESTRUCTURALES EN EJE Z (MÉTODO DE L.P. ZICK)", 1)
    doc.add_paragraph(
        "Los recipientes horizontales V-100, V-101 y V-102 se montan sobre dos cunas de hormigón/acero (saddles) para permitir "
        "la libre dilatación térmica (una cuna fija y una deslizante con colisos). En esta configuración, el peso propio del acero "
        "y el contenido líquido hacen que el cilindro trabaje como una viga continua con voladizos.\n\n"
        "El análisis analítico de L.P. Zick (reconocido en el Apéndice G de ASME VIII Div. 1) exige verificar:\n"
        "• Momento flector en el centro del vano y sobre las cunas: Genera tensiones axiales de flexión en el eje z (σ_z = M / W) "
        "que se superponen a la tracción longitudinal por presión (P·R / 2t).\n"
        "• Ángulo de contacto de la cuna: Debe ser θ ≥ 120º para evitar concentración excesiva de esfuerzos cortantes.\n"
        "• Distancia del extremo a la cuna: Se recomienda a ≤ 0,20 · L_tt para aprovechar la rigidez de los cabezales elípticos.\n"
        "• Tensión circunferencial de compresión en el cuerno de la cuna (horn stress): Debe ser inferior a la tensión admisible "
        "de compresión del material para evitar el pandeo local (wrinkling)."
    )

    # 8. PRUEBA HIDROSTÁTICA EN TALLER (UG-99)
    add_header_styled(doc, "8. PRUEBA HIDROSTÁTICA OBLIGATORIA EN TALLER (PÁRRAFO UG-99)", 1)
    doc.add_paragraph(
        "Antes de su expedición y pintado final, todo recipiente a presión construido bajo sello ASME debe someterse a una prueba "
        "hidrostática de estanqueidad y resistencia estructural conforme a UG-99(b):\n\n"
        "P_test = 1,3 · MAWP · (S_test / S_des)\n\n"
        "Dado que para el acero SA-516 Gr. 70 la tensión admisible a temperatura ambiente (S_test) y a la temperatura de cálculo "
        "(S_des ≤ 100 ºC) es idéntica (138 MPa), la relación de tensiones es unitaria, resultando:\n"
        "P_test = 1,30 · MAWP ≈ 1,30 · P_des\n\n"
        "El recipiente se llena completamente de agua dulce (con venteo superior abierto para eliminar bolsas de aire), "
        "se presuriza gradualmente mediante bomba hidráulica de émbolo hasta P_test, se mantiene durante un mínimo de 30 minutos "
        "y se reduce a la MAWP para la inspección visual exhaustiva de todas las costuras soldadas sin que se admita fuga ni deformación permanente."
    )

    # 9. RESUMEN DE APLICACIÓN
    add_header_styled(doc, "9. RESUMEN DE PARÁMETROS NORMATIVOS APLICADOS A LOS RECIPIENTES DE PILPIS", 1)

    t_res = doc.add_table(rows=5, cols=6)
    t_res.alignment = WD_TABLE_ALIGNMENT.CENTER
    res_data = [
        ("TAG Equipo", "Geometría", "P_des (barg)", "T_des (ºC)", "Ecuación ASME Mando", "Espesor Adoptado"),
        ("V-100", "Horizontal (Ø 2,0 m x 6,6 m)", "12,75", "65", "UG-27(c)(1) y UG-32(d)", "14 mm (SA-516 Gr 70)"),
        ("V-101", "Horizontal (Ø 1,9 m x 6,6 m + Boot)", "8,34", "70", "UG-27(c)(1) y UG-32(d)", "10 mm (SA-516 Gr 70)"),
        ("V-102", "Horizontal (Ø 1,6 m x 5,6 m)", "9,32", "85", "UG-27(c)(1) y UG-32(d)", "10 mm (SA-516 Gr 70)"),
        ("TK-100 A/B/C", "3 Esferas (Ø 20,3 m)", "5,88", "55", "UG-27(d) con E = 1,00", "25 mm (SA-516 Gr 70)")
    ]
    for i, row in enumerate(t_res.rows):
        for j, val in enumerate(res_data[i]):
            c = row.cells[j]
            c.text = val
            if i == 0:
                set_cell_background(c, "1A365D")
                p = c.paragraphs[0]
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
            else:
                if i % 2 == 1:
                    set_cell_background(c, "F7FAFC")
            set_cell_margins(c, 80, 80, 80, 80)

    doc.add_paragraph("\n")
    p_fin = doc.add_paragraph()
    r = p_fin.add_run("Este documento normativo se emite como Especificación de Ingeniería Mecánica y Guía Oficial de Auditoría de Recipientes a Presión para el Proyecto PILPIS - QUIMISUR.")
    r.font.italic = True
    r.font.color.rgb = RGBColor(113, 128, 150)

    # Guardar en Desktop y en proyecto
    out_desktop = r"C:\Users\s\Desktop\Documento_Normativo_ASME_VIII_Div1_PILPIS.docx"
    out_project = r"diseno_recipientes\Documento_Normativo_ASME_VIII_Div1_PILPIS.docx"
    doc.save(out_desktop)
    doc.save(out_project)
    print("Documento guardado con exito en:", out_desktop)

if __name__ == "__main__":
    main()
