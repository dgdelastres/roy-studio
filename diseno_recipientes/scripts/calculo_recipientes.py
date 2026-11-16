"""
Cálculo de Dimensionamiento y Resistencia Mecánica de Recipientes a Presión
Proyecto: Fraccionamiento de C4 (PILPIS - QUIMISUR)
Departamento: DPTO 2 - Gestión de Proyectos y Diseño de Recipientes
Normativa de Diseño Mecánico: ASME Sección VIII, División 1
Material: Acero al Carbono SA-516 Grado 70
"""

import math

def calcular_recipientes():
    # -------------------------------------------------------------
    # 1. PARÁMETROS GLOBALES Y PROPIEDADES DE MATERIAL
    # -------------------------------------------------------------
    S_adm = 138.0  # MPa (Tensión admisible SA-516 Gr 70 a T <= 100 ºC, 20.000 psi)
    rho_acero = 7850.0  # kg/m3

    # Balance global
    F_total = 25000.0  # kg/h
    D_total = 7567.4   # kg/h (Destilado, i-butano rico)
    B_total = 17432.6  # kg/h (Fondos, n-butano rico)
    L_total = 4.5 * D_total  # kg/h (Reflujo, R=4.5)
    V_overhead = L_total + D_total  # 41620.7 kg/h

    rho_F = 555.0  # kg/m3 (Carga a 40 ºC)
    rho_D = 545.0  # kg/m3 (Destilado/Reflujo a 40 ºC)
    rho_B = 570.0  # kg/m3 (Fondos a 40 ºC enfriado)
    rho_B_alm = 565.0  # kg/m3 (n-butano en parque a 25 ºC)

    Q_F_m3h = F_total / rho_F  # 45.05 m3/h
    Q_cond_m3h = V_overhead / rho_D  # 76.37 m3/h
    Q_B_m3h = B_total / rho_B  # 30.58 m3/h

    # -------------------------------------------------------------
    # 2. V-100: TANQUE PULMÓN DE ALIMENTACIÓN C4 (FEED SURGE DRUM)
    # -------------------------------------------------------------
    t_ret_v100_min = 15.0  # min a medio nivel (50%)
    V_liq_v100 = (Q_F_m3h / 60.0) * t_ret_v100_min  # m3
    V_geom_v100 = V_liq_v100 / 0.50  # 22.52 m3

    D_i_v100 = 2.0  # m
    R_i_v100 = D_i_v100 / 2.0  # 1.0 m
    # Volumen cabezales elípticos 2:1: V_2cab = 2 * (pi/24 * D^3) = pi/12 * D^3
    V_cab_v100 = (math.pi / 12.0) * (D_i_v100 ** 3)
    V_cil_v100 = V_geom_v100 - V_cab_v100
    L_tt_v100 = V_cil_v100 / (math.pi * (R_i_v100 ** 2))
    # Adoptamos dimensiones comerciales normalizadas
    L_tt_v100_nom = 6.60  # m
    V_real_v100 = (math.pi * (R_i_v100 ** 2) * L_tt_v100_nom) + V_cab_v100
    L_total_v100 = L_tt_v100_nom + 2.0 * (D_i_v100 / 4.0)  # profundidad cabezal 2:1 = D/4

    P_op_v100 = 1.079  # MPa (11.0 kg/cm2g)
    P_des_v100 = 1.275  # MPa (13.0 kg/cm2g)
    T_des_v100 = 65.0   # ºC
    E_v100 = 0.85
    c_v100 = 0.002  # m (2.0 mm)

    # Espesor virola cilíndrica (ASME VIII Div 1 UG-27(c)(1))
    t_vir_req_v100 = (P_des_v100 * (R_i_v100 * 1000.0)) / (S_adm * E_v100 - 0.6 * P_des_v100) + (c_v100 * 1000.0)
    # Espesor cabezal elíptico 2:1 (ASME VIII Div 1 UG-32(d))
    t_cab_req_v100 = (P_des_v100 * (D_i_v100 * 1000.0)) / (2.0 * S_adm * E_v100 - 0.2 * P_des_v100) + (c_v100 * 1000.0)
    t_nom_v100 = 14.0  # mm comercial

    # Pesos
    A_cil_v100 = math.pi * D_i_v100 * L_tt_v100_nom
    # Superficie aproximada 2 cabezales elípticos 2:1: A_cab = 2 * (1.084 * pi * R^2)
    A_cab_v100 = 2.0 * (1.084 * math.pi * (R_i_v100 ** 2))
    A_tot_v100 = A_cil_v100 + A_cab_v100
    peso_acero_v100 = A_tot_v100 * (t_nom_v100 / 1000.0) * rho_acero * 1.15  # +15% accesorios/bocas/cunas
    peso_agua_lleno_v100 = V_real_v100 * 1000.0
    peso_op_v100 = peso_acero_v100 + (V_real_v100 * 0.50 * rho_F)

    # -------------------------------------------------------------
    # 3. V-101: ACUMULADOR DE REFLUJO DE CABEZA (REFLUX DRUM)
    # -------------------------------------------------------------
    t_ret_v101_min = 8.0  # min a medio nivel para caudal total (L+D)
    V_liq_v101 = (Q_cond_m3h / 60.0) * t_ret_v101_min  # m3
    V_geom_v101 = V_liq_v101 / 0.50  # 20.37 m3

    D_i_v101 = 1.90  # m
    R_i_v101 = D_i_v101 / 2.0  # 0.95 m
    V_cab_v101 = (math.pi / 12.0) * (D_i_v101 ** 3)
    L_tt_v101_nom = 6.60  # m
    V_real_v101 = (math.pi * (R_i_v101 ** 2) * L_tt_v101_nom) + V_cab_v101
    L_total_v101 = L_tt_v101_nom + 2.0 * (D_i_v101 / 4.0)

    P_op_v101 = 0.588  # MPa (6.0 kg/cm2g)
    P_des_v101 = 0.834  # MPa (8.5 kg/cm2g)
    T_des_v101 = 70.0   # ºC
    E_v101 = 0.85
    c_v101 = 0.002  # m (2.0 mm)

    t_vir_req_v101 = (P_des_v101 * (R_i_v101 * 1000.0)) / (S_adm * E_v101 - 0.6 * P_des_v101) + (c_v101 * 1000.0)
    t_cab_req_v101 = (P_des_v101 * (D_i_v101 * 1000.0)) / (2.0 * S_adm * E_v101 - 0.2 * P_des_v101) + (c_v101 * 1000.0)
    t_nom_v101 = 10.0  # mm comercial

    A_cil_v101 = math.pi * D_i_v101 * L_tt_v101_nom
    A_cab_v101 = 2.0 * (1.084 * math.pi * (R_i_v101 ** 2))
    A_tot_v101 = A_cil_v101 + A_cab_v101
    peso_acero_v101 = A_tot_v101 * (t_nom_v101 / 1000.0) * rho_acero * 1.15
    peso_op_v101 = peso_acero_v101 + (V_real_v101 * 0.50 * rho_D)

    # -------------------------------------------------------------
    # 4. V-102: TANQUE PULMÓN DE FONDOS / N-BUTANO (BOTTOMS SURGE DRUM)
    # -------------------------------------------------------------
    t_ret_v102_min = 12.0  # min a medio nivel
    V_liq_v102 = (Q_B_m3h / 60.0) * t_ret_v102_min
    V_geom_v102 = V_liq_v102 / 0.50  # 12.23 m3

    D_i_v102 = 1.60  # m
    R_i_v102 = D_i_v102 / 2.0  # 0.80 m
    V_cab_v102 = (math.pi / 12.0) * (D_i_v102 ** 3)
    L_tt_v102_nom = 5.60  # m
    V_real_v102 = (math.pi * (R_i_v102 ** 2) * L_tt_v102_nom) + V_cab_v102
    L_total_v102 = L_tt_v102_nom + 2.0 * (D_i_v102 / 4.0)

    P_op_v102 = 0.686  # MPa (7.0 kg/cm2g)
    P_des_v102 = 0.932  # MPa (9.5 kg/cm2g)
    T_des_v102 = 85.0   # ºC
    E_v102 = 0.85
    c_v102 = 0.002

    t_vir_req_v102 = (P_des_v102 * (R_i_v102 * 1000.0)) / (S_adm * E_v102 - 0.6 * P_des_v102) + (c_v102 * 1000.0)
    t_cab_req_v102 = (P_des_v102 * (D_i_v102 * 1000.0)) / (2.0 * S_adm * E_v102 - 0.2 * P_des_v102) + (c_v102 * 1000.0)
    t_nom_v102 = 10.0  # mm comercial

    A_cil_v102 = math.pi * D_i_v102 * L_tt_v102_nom
    A_cab_v102 = 2.0 * (1.084 * math.pi * (R_i_v102 ** 2))
    A_tot_v102 = A_cil_v102 + A_cab_v102
    peso_acero_v102 = A_tot_v102 * (t_nom_v102 / 1000.0) * rho_acero * 1.15
    peso_op_v102 = peso_acero_v102 + (V_real_v102 * 0.50 * rho_B)

    # -------------------------------------------------------------
    # 5. TK-100: ALMACENAMIENTO DE N-BUTANO (15 DÍAS DE OPERACIÓN)
    # -------------------------------------------------------------
    horas_alm = 15.0 * 24.0  # 360 h
    masa_total_alm = B_total * horas_alm  # 6.275.736 kg = 6.275,7 Tm
    vol_liq_alm = masa_total_alm / rho_B_alm  # 11.107,5 m3
    llenado_max = 0.85  # 85% según ITC-ICG 03 / API 2510
    vol_geom_tot_alm = vol_liq_alm / llenado_max  # 13.067,6 m3

    P_op_alm = 0.373  # MPa (3.8 kg/cm2g)
    P_des_alm = 0.588  # MPa (6.0 kg/cm2g)
    T_des_alm = 55.0   # ºC
    c_alm = 0.002      # 2.0 mm

    # --- OPCIÓN 1: BATERÍA DE ESFERAS PRESURIZADAS ---
    n_esferas = 3
    V_esf_unit = vol_geom_tot_alm / n_esferas  # 4355.9 m3 cada una
    # V = 4/3 * pi * R^3 => R = (3V / 4pi)^(1/3)
    R_i_esf = ((3.0 * V_esf_unit) / (4.0 * math.pi)) ** (1.0 / 3.0)  # 10.13 m
    D_i_esf = 2.0 * R_i_esf  # 20.27 m -> Adoptamos Di = 20.30 m
    D_i_esf_nom = 20.30
    R_i_esf_nom = D_i_esf_nom / 2.0
    V_esf_real = (4.0 / 3.0) * math.pi * (R_i_esf_nom ** 3)  # 4377 m3

    # Espesor esfera ASME VIII Div 1 UG-27(d) con E = 1.0 (100% radiografiado)
    E_esf = 1.0
    t_esf_req = (P_des_alm * (R_i_esf_nom * 1000.0)) / (2.0 * S_adm * E_esf - 0.2 * P_des_alm) + (c_alm * 1000.0)
    t_esf_nom = 25.0  # mm comercial

    A_esf = 4.0 * math.pi * (R_i_esf_nom ** 2)  # 1294.6 m2 por esfera
    peso_acero_esf_unit = A_esf * (t_esf_nom / 1000.0) * rho_acero * 1.12  # +12% patas de soporte faldón/columnas
    peso_acero_esf_tot = peso_acero_esf_unit * n_esferas

    # Coste estimado esfera (Regla de potencias y costes de planta petroquímica, eq. Guthrie adaptado 2026)
    coste_unit_esfera = 1.45e6  # ~1.45 M€ por esfera instalada completa
    coste_tot_esferas = coste_unit_esfera * n_esferas  # ~4.35 M€
    area_terreno_esferas = 7500.0  # m2 (con cubetos y distancias de seguridad)

    # --- OPCIÓN 2: BATERÍA DE RECIPIENTES CILÍNDRICOS HORIZONTALES (CIGARROS) ---
    D_i_cig = 4.0  # m (límite práctico carretera/ferrocarril)
    L_tt_cig = 40.0  # m
    R_i_cig = D_i_cig / 2.0
    V_cab_cig = (math.pi / 12.0) * (D_i_cig ** 3)
    V_cil_cig = math.pi * (R_i_cig ** 2) * L_tt_cig
    V_tot_cig = V_cil_cig + V_cab_cig  # 519.4 m3
    V_util_cig = V_tot_cig * llenado_max  # 441.5 m3
    n_cigarros = math.ceil(vol_liq_alm / V_util_cig)  # 26 cigarros

    E_cig = 0.85
    t_vir_req_cig = (P_des_alm * (R_i_cig * 1000.0)) / (S_adm * E_cig - 0.6 * P_des_alm) + (c_alm * 1000.0)
    t_cab_req_cig = (P_des_alm * (D_i_cig * 1000.0)) / (2.0 * S_adm * E_cig - 0.2 * P_des_alm) + (c_alm * 1000.0)
    t_nom_cig = 14.0  # mm

    A_cil_cig = math.pi * D_i_cig * L_tt_cig
    A_cab_cig = 2.0 * (1.084 * math.pi * (R_i_cig ** 2))
    A_tot_cig = A_cil_cig + A_cab_cig
    peso_acero_cig_unit = A_tot_cig * (t_nom_cig / 1000.0) * rho_acero * 1.15
    peso_acero_cig_tot = peso_acero_cig_unit * n_cigarros

    coste_unit_cigarro = 0.235e6  # ~235.000 € por bala horizontal con cunas, valvulería e instrumentación
    coste_tot_cigarros = coste_unit_cigarro * n_cigarros  # ~6.11 M€
    area_terreno_cigarros = 19500.0  # m2

    res = {
        "v100": {
            "tag": "V-100",
            "desc": "Tanque Pulmón de Alimentación C4",
            "tipo": "Horizontal, cabezales elípticos 2:1",
            "Q_m3h": Q_F_m3h,
            "t_ret_min": t_ret_v100_min,
            "V_geom_m3": V_real_v100,
            "Di_mm": D_i_v100 * 1000,
            "L_tt_mm": L_tt_v100_nom * 1000,
            "L_tot_mm": L_total_v100 * 1000,
            "P_op_bar": P_op_v100 * 10,
            "P_des_bar": P_des_v100 * 10,
            "T_des_C": T_des_v100,
            "t_vir_req_mm": t_vir_req_v100,
            "t_cab_req_mm": t_cab_req_v100,
            "t_nom_mm": t_nom_v100,
            "peso_acero_kg": peso_acero_v100,
            "peso_op_kg": peso_op_v100,
        },
        "v101": {
            "tag": "V-101",
            "desc": "Acumulador de Reflujo y Destilado",
            "tipo": "Horizontal, cabezales elípticos 2:1 + bota",
            "Q_m3h": Q_cond_m3h,
            "t_ret_min": t_ret_v101_min,
            "V_geom_m3": V_real_v101,
            "Di_mm": D_i_v101 * 1000,
            "L_tt_mm": L_tt_v101_nom * 1000,
            "L_tot_mm": L_total_v101 * 1000,
            "P_op_bar": P_op_v101 * 10,
            "P_des_bar": P_des_v101 * 10,
            "T_des_C": T_des_v101,
            "t_vir_req_mm": t_vir_req_v101,
            "t_cab_req_mm": t_cab_req_v101,
            "t_nom_mm": t_nom_v101,
            "peso_acero_kg": peso_acero_v101,
            "peso_op_kg": peso_op_v101,
        },
        "v102": {
            "tag": "V-102",
            "desc": "Tanque Pulmón de Fondos (n-Butano)",
            "tipo": "Horizontal, cabezales elípticos 2:1",
            "Q_m3h": Q_B_m3h,
            "t_ret_min": t_ret_v102_min,
            "V_geom_m3": V_real_v102,
            "Di_mm": D_i_v102 * 1000,
            "L_tt_mm": L_tt_v102_nom * 1000,
            "L_tot_mm": L_total_v102 * 1000,
            "P_op_bar": P_op_v102 * 10,
            "P_des_bar": P_des_v102 * 10,
            "T_des_C": T_des_v102,
            "t_vir_req_mm": t_vir_req_v102,
            "t_cab_req_mm": t_cab_req_v102,
            "t_nom_mm": t_nom_v102,
            "peso_acero_kg": peso_acero_v102,
            "peso_op_kg": peso_op_v102,
        },
        "tk100_esferas": {
            "tag": "TK-100 A/B/C",
            "desc": "Batería de Esferas de Almacenamiento de n-Butano (15 días)",
            "tipo": "Esferas Presurizadas (Horton Spheres)",
            "n_unidades": n_esferas,
            "masa_tot_Tm": masa_total_alm / 1000.0,
            "V_util_tot_m3": vol_liq_alm,
            "V_geom_tot_m3": vol_geom_tot_alm,
            "V_geom_unit_m3": V_esf_real,
            "Di_mm": D_i_esf_nom * 1000,
            "P_op_bar": P_op_alm * 10,
            "P_des_bar": P_des_alm * 10,
            "T_des_C": T_des_alm,
            "t_req_mm": t_esf_req,
            "t_nom_mm": t_esf_nom,
            "peso_acero_unit_Tm": peso_acero_esf_unit / 1000.0,
            "peso_acero_tot_Tm": peso_acero_esf_tot / 1000.0,
            "coste_tot_M_eur": coste_tot_esferas / 1e6,
            "area_terreno_m2": area_terreno_esferas
        },
        "tk100_cigarros": {
            "tag": "TK-100 (Batería Cigarros)",
            "desc": "Batería de Depósitos Cilíndricos Horizontales de n-Butano",
            "tipo": "Cilindros horizontales con cabezales elípticos 2:1",
            "n_unidades": n_cigarros,
            "masa_tot_Tm": masa_total_alm / 1000.0,
            "V_util_tot_m3": vol_liq_alm,
            "V_geom_tot_m3": vol_geom_tot_alm,
            "V_geom_unit_m3": V_tot_cig,
            "Di_mm": D_i_cig * 1000,
            "L_tt_mm": L_tt_cig * 1000,
            "P_op_bar": P_op_alm * 10,
            "P_des_bar": P_des_alm * 10,
            "T_des_C": T_des_alm,
            "t_vir_req_mm": t_vir_req_cig,
            "t_cab_req_mm": t_cab_req_cig,
            "t_nom_mm": t_nom_cig,
            "peso_acero_unit_Tm": peso_acero_cig_unit / 1000.0,
            "peso_acero_tot_Tm": peso_acero_cig_tot / 1000.0,
            "coste_tot_M_eur": coste_tot_cigarros / 1e6,
            "area_terreno_m2": area_terreno_cigarros
        }
    }
    return res

if __name__ == "__main__":
    r = calcular_recipientes()
    for k, v in r.items():
        print(f"=== {k.upper()} ===")
        for prop, val in v.items():
            print(f"  {prop}: {val}")
