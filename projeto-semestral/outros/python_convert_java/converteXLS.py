#!/usr/bin/env python
"""
converteXLS.py – Consolida planilhas de classes processuais (.xls)
e gera um único JSON: ./doctxt/classesProcessuaisTbr.json

Exibe progresso, valida estrutura e detecta colunas automaticamente.

Uso:
    python converteXLS.py "C:\\caminho\\com\\planilhas"
    # ou:
    python converteXLS.py
    # (perguntará o caminho da pasta)

Requisitos:
    pip install pandas lxml tqdm
"""

import argparse
import io
import json
import pathlib
import pandas as pd
from tqdm import tqdm
import warnings

warnings.filterwarnings("ignore", category=FutureWarning, module="pandas.io.html")

# --------- Função de leitura e extração ---------
def extrair_planilha(path: pathlib.Path) -> pd.DataFrame:
    try:
        html_text = path.read_bytes().decode("latin-1", errors="ignore")
        tbl = pd.read_html(io.StringIO(html_text), flavor="lxml")[0]

        header = tbl.iloc[0]
        dados = tbl.iloc[6:].copy()
        dados.columns = header

        col_map = {str(c).strip().lower(): c for c in dados.columns if isinstance(c, str)}
        cod_col = next((col_map[k] for k in col_map if "código" in k or "codigo" in k), None)
        if cod_col is None:
            print(f"⚠️  Ignorado: {path.name} (sem coluna de código)")
            return pd.DataFrame()

        desejo = [cod_col]
        for chave in ['cód. pai', 'cod. pai', 'sigla', 'descrição', 'descricao', 'glossário', 'glossario']:
            for k in col_map:
                if chave in k:
                    desejo.append(col_map[k])
                    break

        df = dados[desejo].copy()
        df = df[df[cod_col].notna()]
        df = df.rename(columns={cod_col: "codigo"})
        df["fonte"] = path.stem.replace("65_Tabela_Classes_", "")
        return df

    except Exception as e:
        print(f"❌ Erro ao ler {path.name}: {e}")
        return pd.DataFrame()


# --------- Função principal ---------
def main() -> None:
    parser = argparse.ArgumentParser(description="Consolida planilhas de classes processuais do CNJ em JSON.")
    parser.add_argument("diretorio", nargs="?", help="Caminho para a pasta com arquivos .xls")
    args = parser.parse_args()

    if not args.diretorio:
        args.diretorio = input("Digite o caminho da pasta com os .xls: ").strip('"').strip()

    pasta = pathlib.Path(args.diretorio).expanduser()
    if not pasta.is_dir():
        raise NotADirectoryError(f"Diretório não encontrado: {pasta}")

    arquivos = sorted(pasta.glob("*.xls"))
    if not arquivos:
        print("⚠️ Nenhum arquivo .xls encontrado na pasta.")
        return

    print(f"📂 Processando {len(arquivos)} arquivos...\n")

    todas_planilhas = []
    total_linhas = 0

    for arq in arquivos:
        df = extrair_planilha(arq)
        if not df.empty:
            print(f"✔️  {arq.name:50} → {len(df)} registros")
            todas_planilhas.append(df)
            total_linhas += len(df)

    if not todas_planilhas:
        print("\n⚠️ Nenhum dado válido encontrado nas planilhas.")
        return

    combinado = pd.concat(todas_planilhas, ignore_index=True)
    destino_dir = pathlib.Path(__file__).resolve().parent / "doctxt"
    destino_dir.mkdir(exist_ok=True)
    destino_arquivo = destino_dir / "classesProcessuaisTbr.json"

    combinado.to_json(destino_arquivo, orient="records", indent=2, force_ascii=False)

    print(f"\n✅ JSON final salvo em: {destino_arquivo}")
    print(f"📊 Total de registros consolidados: {total_linhas:,}")

if __name__ == "__main__":
    main()
