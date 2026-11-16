import os
import sys
import json
import urllib.request
import urllib.parse

TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN", "")
REPO = "dgdelastres/roy-studio"
TAG = "v1.0.0-recipientes"
BRANCH = "recipientes"
NAME = "PILPIS Vessel Studio v1.0.0 (ASME VIII Div. 1)"

BODY = """# 🛢️ PILPIS Vessel Studio v1.0.0
### Suite de Ingeniería Mecánica y Dimensionamiento ASME Sección VIII División 1
**Planta de Fraccionamiento de Fracción C4 (San Roque, Cádiz)**  
**Cliente:** QUIMISUR, S.A. | **Contratista:** PILPIS, S.A. (Oficina Técnica — DPTO 2)

---

> [!NOTE]
> Esta release corresponde a la aplicación independiente **PILPIS Vessel Studio**, desarrollada exclusivamente para el **Departamento 2 (Diseño de Recipientes y Gestión de Proyectos)**, completamente desacoplada del módulo de planificación ROY Studio.

---

### 📦 Novedades y Capacidades del Módulo

1. **Motor de Cálculo ASME Sección VIII División 1 (Ed. 2023)**:
   - Cálculo estricto de virolas cilíndricas bajo tensión circunferencial angular (UG-27 c-1) y axial (eje z, UG-27 c-2).
   - Fondos convexos elípticos normalizados 2:1 (UG-32 d) y semiesféricos (UG-32 f).
   - Envolventes esféricas para almacenamiento de GLP presurizado (UG-27 d).
   - Cálculo analítico de MAWP (*Maximum Allowable Working Pressure*) y Presión de Prueba Hidrostática en taller (UG-99).

2. **Equipos Preconfigurados de la Planta**:
   - **V-100**: Tanque Pulmón de Alimentación C4 (Ø 2.000 mm x 6.600 mm, t = 14 mm SA-516 Gr. 70).
   - **V-101**: Acumulador de Reflujo y Destilado (Ø 1.900 mm x 6.600 mm, t = 10 mm + bota de agua Ø 400 mm).
   - **V-102**: Tanque Pulmón de Fondos n-Butano (Ø 1.600 mm x 5.600 mm, t = 10 mm).
   - **TK-100**: Parque de almacenamiento exterior de n-butano para 15 días continuos (3 esferas Horton Ø 20,3 m adoptadas frente a 26 cigarros).

3. **Biblioteca de Proyectos Dinámica (.json)**:
   - Pestañas interactivas para gestionar múltiples recipientes en un solo proyecto.
   - Guardar y cargar proyectos completos en formato JSON.
   - Creación, duplicación y eliminación de equipos personalizados.

4. **Planos Paramétricos 2D Interactivos**:
   - Esquemas acotados en SVG con niveles de líquido (NLL, HLL, LLL) y boquillas de proceso.
   - Exportación de resúmenes de especificación técnica.

5. **Generador Oficial de Entregables**:
   - Generación de **Hojas de Especificación de Datos (Data Sheets)** en Excel con formato corporativo.
   - Generación de **Memoria Técnica Justificativa** en Word (.docx).
   - Documento de Bases Normativas ASME VIII Div. 1.

---

### 💻 Binario Portable Adjunto
- **`Vessel Studio 1.0.0.exe`**: Ejecutable nativo para Windows (80 MB), 100% portable sin necesidad de instalación.
"""

def create_release():
    # 1. Crear el release
    url = f"https://api.github.com/repos/{REPO}/releases"
    headers = {
        "Authorization": f"token {TOKEN}",
        "User-Agent": "VesselStudio-Release-Agent",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }
    payload = {
        "tag_name": TAG,
        "target_commitish": BRANCH,
        "name": NAME,
        "body": BODY,
        "draft": False,
        "prerelease": False
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            release_id = data["id"]
            upload_url = data["upload_url"].split("{")[0]
            html_url = data["html_url"]
            print(f"RELEASE CREADA: ID {release_id} | URL: {html_url}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"Error creando release ({e.code}): {err_msg}")
        # Si ya existe, buscarla
        req_get = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}", headers=headers)
        with urllib.request.urlopen(req_get) as resp_get:
            data = json.loads(resp_get.read().decode("utf-8"))
            release_id = data["id"]
            upload_url = data["upload_url"].split("{")[0]
            html_url = data["html_url"]
            print(f"RELEASE EXISTENTE: ID {release_id} | URL: {html_url}")

    # 2. Subir el archivo exe adjunto
    exe_path = r"dist-win\Vessel Studio 1.0.0.exe"
    if not os.path.exists(exe_path):
        print(f"ERROR: No se encontró {exe_path}")
        return

    asset_name = "Vessel Studio.exe"
    file_size = os.path.getsize(exe_path)
    print(f"Subiendo binario: {asset_name} ({round(file_size / (1024*1024), 2)} MB)...")

    upload_full_url = f"{upload_url}?name={urllib.parse.quote(asset_name)}"
    upload_headers = {
        "Authorization": f"token {TOKEN}",
        "User-Agent": "VesselStudio-Release-Agent",
        "Content-Type": "application/vnd.microsoft.portable-executable"
    }

    with open(exe_path, "rb") as f:
        file_data = f.read()

    req_upload = urllib.request.Request(upload_full_url, data=file_data, headers=upload_headers, method="POST")
    try:
        with urllib.request.urlopen(req_upload) as resp:
            data_upload = json.loads(resp.read().decode("utf-8"))
            print(f"ASSET SUBIDO CON ÉXITO: {data_upload['browser_download_url']}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"Respuesta subida asset ({e.code}): {err_msg}")

if __name__ == "__main__":
    create_release()
