#!/usr/bin/env python
"""
converteXLS.py – Consolida planilhas de classes processuais (.xls)
e grava em ./doctxt/classesProcessuaisTbr.json

• Se nenhum argumento for passado, pergunta o diretório no console.

Dependências:
    pip install pandas tqdm lxml
"""

import argparse
import io
import json
import pathlib
import pandas as pd
from tqdm.auto import tqdm
import warnings

warnings.filterwarnings("ignore", category=FutureWarning, module="pandas.io.html")

# ---------- função que trata uma planilha ----------
def extrair_planilha(path: pathlib.Path) -> pd.DataFrame:
    html_text = path.read_bytes().decode("latin-1", errors="ignore")
    # usar StringIO p/ evitar FutureWarning
    tbl = pd.read_html(io.StringIO(html_text), flavor="lxml")[0]

    header = tbl.iloc[0]
    dados = tbl.iloc[6:].copy()
    dados.columns = header

    col_map = {str(c).strip().lower(): c for c in dados.columns if isinstance(c, str)}
    cod_col = next((col_map[k] for k in col_map if "código" in k or "codigo" in k), None)
    if cod_col is None:
        return pd.DataFrame()

    desejo = [
        cod_col,
        *(col_map[k] for k in col_map if "cód. pai" in k or "cod. pai" in k),
        *(col_map[k] for k in col_map if "sigla" in k),
        *(col_map[k] for k in col_map if "descrição" in k or "descricao" in k
          or "glossário" in k or "glossario" in k),
    ]

    dados = dados[desejo]
    dados = dados[dados[cod_col].notna()]
    dados = dados.rename(columns={cod_col: "codigo"})      # minúsculo para JSON
    dados["fonte"] = path.stem.replace("65_Tabela_Classes_", "")
    return dados


# ---------- função principal ----------
def main() -> None:
    ap = argparse.ArgumentParser(description="Consolida planilhas TPU em JSON único")
    ap.add_argument("diretorio", nargs="?", help="pasta contendo arquivos .xls")
    args = ap.parse_args()

    if not args.diretorio:
        args.diretorio = input("Digite o caminho da pasta com os .xls: ").strip('"').strip()

    dir_xls = pathlib.Path(args.diretorio).expanduser()
    if not dir_xls.is_dir():
        raise NotADirectoryError(f"Diretório não encontrado: {dir_xls}")

    arquivos = sorted(dir_xls.glob("*.xls"))
    if not arquivos:
        print("⚠️  Nenhum .xls encontrado nesse diretório.")
        return

    print(f"Lendo {len(arquivos)} planilhas …")
    frames = [extrair_planilha(p) for p in tqdm(arquivos)]
    combinado = pd.concat([f for f in frames if not f.empty], ignore_index=True)

    # ----- salvar resultado em JSON -----
    out_dir = pathlib.Path(__file__).resolve().parent / "doctxt"
    out_dir.mkdir(exist_ok=True)
    destino = out_dir / "classesProcessuaisTbr.json"

    combinado.to_json(destino, orient="records", force_ascii=False, indent=2)
    # orient="records" → lista de objetos JSON
    # indent=2 → bonito/legível

    print(f"\n✅  Gerado {destino} com {len(combinado):,} registros.")


if __name__ == "__main__":
    main()
