"""
FastAPI Backend para PILPIS Vessel Studio
Cálculo Mecánico ASME VIII Div 1 y Generación de Data Sheets (Excel/Word)
"""

import os
import math
from typing import Optional, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# Importar motores de cálculo existentes
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts")))
from calculo_recipientes import calcular_recipientes

app = FastAPI(
    title="PILPIS Vessel Studio API",
    description="Servidor de cálculo riguroso ASME VIII Div 1 y exportación técnica para recipientes a presión",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VesselInput(BaseModel):
    tag: str = Field(default="V-100", description="TAG del equipo")
    nombre: str = Field(default="Tanque Pulmón de Alimentación", description="Descripción del equipo")
    servicio: str = Field(default="Alimentación a deisobutanizadora", description="Servicio del proceso")
    tipo_geometria: Literal["horizontal", "vertical", "esferico"] = Field(default="horizontal")
    tipo_cabezal: Literal["eliptico_2_1", "toriesferico", "semiesferico", "plano"] = Field(default="eliptico_2_1")
    
    # Proceso
    caudal_m3h: float = Field(default=45.0, description="Caudal volumétrico (m3/h)")
    densidad_kgm3: float = Field(default=555.0, description="Densidad del líquido (kg/m3)")
    tiempo_retencion_min: float = Field(default=15.0, description="Tiempo de retención a NLL (min)")
    nll_pct: float = Field(default=50.0, description="Nivel Normal de Líquido (%)")
    
    # Geometría
    diametro_interior_mm: float = Field(default=2000.0, description="Diámetro interior (mm)")
    longitud_tt_mm: float = Field(default=6600.0, description="Longitud entre tangentes (mm)")
    tiene_bota: bool = Field(default=False, description="Incluye bota de decantación")
    bota_diametro_mm: float = Field(default=400.0)
    bota_altura_mm: float = Field(default=600.0)

    # Mecánica ASME
    presion_op_bar: float = Field(default=10.79, description="Presión de operación (barg)")
    presion_des_bar: float = Field(default=12.75, description="Presión de diseño (barg)")
    temp_des_c: float = Field(default=65.0, description="Temperatura de diseño (ºC)")
    material: str = Field(default="SA-516 Gr. 70")
    tension_admisible_mpa: float = Field(default=138.0, description="Tensión admisible S (MPa)")
    eficiencia_soldadura: float = Field(default=0.85, description="Eficiencia de junta E")
    sobreespesor_corrosion_mm: float = Field(default=2.0, description="Corrosión c (mm)")

def redondear_espesor_comercial(t_mm: float) -> float:
    espesores = [6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 25.0, 28.0, 30.0, 32.0, 35.0, 40.0, 45.0, 50.0]
    for e in espesores:
        if e >= t_mm:
            return e
    return math.ceil(t_mm)

@app.get("/health")
def health():
    return {"status": "ok", "app": "PILPIS Vessel Studio", "version": "1.0.0"}

@app.get("/api/presets")
def get_presets():
    """Devuelve los equipos estándar del anteproyecto PILPIS"""
    data = calcular_recipientes()
    return {
        "v100": {
            "tag": "V-100",
            "nombre": "Tanque Pulmón de Carga C4",
            "servicio": "Alimentación a deisobutanizadora T-100",
            "tipo_geometria": "horizontal",
            "tipo_cabezal": "eliptico_2_1",
            "caudal_m3h": 45.05,
            "densidad_kgm3": 555.0,
            "tiempo_retencion_min": 15.0,
            "nll_pct": 50.0,
            "diametro_interior_mm": 2000.0,
            "longitud_tt_mm": 6600.0,
            "tiene_bota": False,
            "presion_op_bar": 10.79,
            "presion_des_bar": 12.75,
            "temp_des_c": 65.0,
            "material": "SA-516 Gr. 70",
            "tension_admisible_mpa": 138.0,
            "eficiencia_soldadura": 0.85,
            "sobreespesor_corrosion_mm": 2.0
        },
        "v101": {
            "tag": "V-101",
            "nombre": "Acumulador de Reflujo y Destilado",
            "servicio": "Circuito de reflujo y envío i-butano",
            "tipo_geometria": "horizontal",
            "tipo_cabezal": "eliptico_2_1",
            "caudal_m3h": 76.37,
            "densidad_kgm3": 545.0,
            "tiempo_retencion_min": 8.0,
            "nll_pct": 50.0,
            "diametro_interior_mm": 1900.0,
            "longitud_tt_mm": 6600.0,
            "tiene_bota": True,
            "bota_diametro_mm": 400.0,
            "bota_altura_mm": 600.0,
            "presion_op_bar": 5.88,
            "presion_des_bar": 8.34,
            "temp_des_c": 70.0,
            "material": "SA-516 Gr. 70",
            "tension_admisible_mpa": 138.0,
            "eficiencia_soldadura": 0.85,
            "sobreespesor_corrosion_mm": 2.0
        },
        "v102": {
            "tag": "V-102",
            "nombre": "Tanque Pulmón de Fondos (n-Butano)",
            "servicio": "Aspiración bomba de envío B-4 (400 m, cota +20 m)",
            "tipo_geometria": "horizontal",
            "tipo_cabezal": "eliptico_2_1",
            "caudal_m3h": 30.58,
            "densidad_kgm3": 570.0,
            "tiempo_retencion_min": 12.0,
            "nll_pct": 50.0,
            "diametro_interior_mm": 1600.0,
            "longitud_tt_mm": 5600.0,
            "tiene_bota": False,
            "presion_op_bar": 6.86,
            "presion_des_bar": 9.32,
            "temp_des_c": 85.0,
            "material": "SA-516 Gr. 70",
            "tension_admisible_mpa": 138.0,
            "eficiencia_soldadura": 0.85,
            "sobreespesor_corrosion_mm": 2.0
        },
        "tk100_esfera": {
            "tag": "TK-100 A/B/C",
            "nombre": "Esfera Almacenamiento n-Butano (15 días)",
            "servicio": "Parque Off-sites de n-butano presurizado",
            "tipo_geometria": "esferico",
            "tipo_cabezal": "semiesferico",
            "caudal_m3h": 30.58,
            "densidad_kgm3": 565.0,
            "tiempo_retencion_min": 360.0 * 60.0,
            "nll_pct": 85.0,
            "diametro_interior_mm": 20300.0,
            "longitud_tt_mm": 0.0,
            "tiene_bota": False,
            "presion_op_bar": 3.73,
            "presion_des_bar": 5.88,
            "temp_des_c": 55.0,
            "material": "SA-516 Gr. 70",
            "tension_admisible_mpa": 138.0,
            "eficiencia_soldadura": 1.00,
            "sobreespesor_corrosion_mm": 2.0
        }
    }

@app.post("/api/calcular")
def calcular_recipiente(inp: VesselInput):
    Di_m = inp.diametro_interior_mm / 1000.0
    Ri_m = Di_m / 2.0
    L_m = inp.longitud_tt_mm / 1000.0
    
    P_des_mpa = inp.presion_des_bar / 10.0
    S_mpa = inp.tension_admisible_mpa
    E = inp.eficiencia_soldadura
    c_mm = inp.sobreespesor_corrosion_mm
    
    # 1. Volumen geométrico
    if inp.tipo_geometria == "esferico":
        vol_cil_m3 = 0.0
        vol_cab_m3 = (4.0 / 3.0) * math.pi * (Ri_m ** 3)
        vol_geom_tot_m3 = vol_cab_m3
        L_total_m = Di_m
        relacion_ld = 1.0
    else:
        vol_cil_m3 = math.pi * (Ri_m ** 2) * L_m
        if inp.tipo_cabezal == "eliptico_2_1":
            vol_cab_m3 = (math.pi / 12.0) * (Di_m ** 3)
            h_cab = Di_m / 4.0
        elif inp.tipo_cabezal == "semiesferico":
            vol_cab_m3 = (4.0 / 3.0) * math.pi * (Ri_m ** 3)
            h_cab = Ri_m
        elif inp.tipo_cabezal == "toriesferico":
            vol_cab_m3 = 0.0847 * (Di_m ** 3)
            h_cab = 0.169 * Di_m
        else: # plano
            vol_cab_m3 = 0.0
            h_cab = 0.0
        
        vol_geom_tot_m3 = vol_cil_m3 + vol_cab_m3
        L_total_m = L_m + 2.0 * h_cab
        relacion_ld = L_m / Di_m if Di_m > 0 else 0

    vol_util_nll_m3 = vol_geom_tot_m3 * (inp.nll_pct / 100.0)
    tiempo_retencion_real_min = (vol_util_nll_m3 / (inp.caudal_m3h / 60.0)) if inp.caudal_m3h > 0 else 0.0

    # 2. Espesores ASME VIII Div 1
    if inp.tipo_geometria == "esferico":
        # UG-27(d)
        den = 2.0 * S_mpa * E - 0.2 * P_des_mpa
        t_req_vir = (P_des_mpa * (Ri_m * 1000.0)) / den + c_mm if den > 0 else 0.0
        t_req_cab = t_req_vir
    else:
        # Virola cilíndrica UG-27(c)(1)
        den_vir = S_mpa * E - 0.6 * P_des_mpa
        t_req_vir = (P_des_mpa * (Ri_m * 1000.0)) / den_vir + c_mm if den_vir > 0 else 0.0
        
        # Cabezales
        if inp.tipo_cabezal == "eliptico_2_1":
            # UG-32(d)
            den_cab = 2.0 * S_mpa * E - 0.2 * P_des_mpa
            t_req_cab = (P_des_mpa * inp.diametro_interior_mm) / den_cab + c_mm if den_cab > 0 else 0.0
        elif inp.tipo_cabezal == "semiesferico":
            # UG-32(f)
            den_cab = 2.0 * S_mpa * E - 0.2 * P_des_mpa
            t_req_cab = (P_des_mpa * (Ri_m * 1000.0)) / den_cab + c_mm if den_cab > 0 else 0.0
        elif inp.tipo_cabezal == "toriesferico":
            # UG-32(e) Rc = Di
            den_cab = S_mpa * E - 0.1 * P_des_mpa
            t_req_cab = (0.885 * P_des_mpa * inp.diametro_interior_mm) / den_cab + c_mm if den_cab > 0 else 0.0
        else: # plano
            t_req_cab = inp.diametro_interior_mm * math.sqrt((0.33 * P_des_mpa) / (S_mpa * E)) + c_mm

    t_nom_vir = redondear_espesor_comercial(t_req_vir)
    t_nom_cab = redondear_espesor_comercial(t_req_cab)

    # 3. MAWP y Presión de prueba
    t_corroido_vir = t_nom_vir - c_mm
    if inp.tipo_geometria == "esferico":
        mawp_mpa = (2.0 * S_mpa * E * t_corroido_vir) / ((Ri_m * 1000.0) + 0.2 * t_corroido_vir)
    else:
        mawp_mpa = (S_mpa * E * t_corroido_vir) / ((Ri_m * 1000.0) + 0.6 * t_corroido_vir)
    
    mawp_bar = mawp_mpa * 10.0
    p_prueba_bar = 1.3 * mawp_bar

    # 4. Pesos aproximados
    rho_acero = 7850.0
    if inp.tipo_geometria == "esferico":
        area_esf = 4.0 * math.pi * (Ri_m ** 2)
        peso_acero_kg = area_esf * (t_nom_vir / 1000.0) * rho_acero * 1.12
    else:
        area_cil = math.pi * Di_m * L_m
        area_cab = 2.0 * (1.084 * math.pi * (Ri_m ** 2))
        peso_acero_kg = (area_cil * (t_nom_vir / 1000.0) + area_cab * (t_nom_cab / 1000.0)) * rho_acero * 1.15

    peso_op_kg = peso_acero_kg + (vol_util_nll_m3 * inp.densidad_kgm3)
    peso_hidro_kg = peso_acero_kg + (vol_geom_tot_m3 * 1000.0)

    return {
        "tag": inp.tag,
        "nombre": inp.nombre,
        "servicio": inp.servicio,
        "tipo_geometria": inp.tipo_geometria,
        "tipo_cabezal": inp.tipo_cabezal,
        "volumen_geom_total_m3": round(vol_geom_tot_m3, 2),
        "volumen_util_m3": round(vol_util_nll_m3, 2),
        "tiempo_retencion_real_min": round(tiempo_retencion_real_min, 1),
        "relacion_ld": round(relacion_ld, 2),
        "longitud_total_mm": round(L_total_m * 1000.0, 0),
        "espesor_virola_req_mm": round(t_req_vir, 2),
        "espesor_virola_nom_mm": t_nom_vir,
        "espesor_cabezal_req_mm": round(t_req_cab, 2),
        "espesor_cabezal_nom_mm": t_nom_cab,
        "mawp_bar": round(mawp_bar, 2),
        "presion_prueba_bar": round(p_prueba_bar, 2),
        "peso_acero_vacio_kg": round(peso_acero_kg, 0),
        "peso_operacion_kg": round(peso_op_kg, 0),
        "peso_prueba_hidro_kg": round(peso_hidro_kg, 0)
    }

@app.get("/api/descargar/excel-oficial")
def descargar_excel_oficial():
    doc_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "documentos", "Hojas_Especificacion_Recipientes_PILPIS.xlsx"))
    if not os.path.exists(doc_path):
        raise HTTPException(status_code=404, detail="Archivo oficial no encontrado")
    return FileResponse(doc_path, filename="Hojas_Especificacion_Recipientes_PILPIS.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.get("/api/descargar/word-oficial")
def descargar_word_oficial():
    doc_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "documentos", "Memoria_Diseno_Recipientes_PILPIS.docx"))
    if not os.path.exists(doc_path):
        raise HTTPException(status_code=404, detail="Archivo oficial no encontrado")
    return FileResponse(doc_path, filename="Memoria_Diseno_Recipientes_PILPIS.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
