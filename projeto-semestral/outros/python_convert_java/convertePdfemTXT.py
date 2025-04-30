#!/usr/bin/env python
"""
convertePdfEmTxt.py – Converte TODOS os PDFs de uma pasta em .txt
• Se nenhum argumento for passado, pergunta o caminho na hora.

Dependência:
    pip install pdfminer.six
"""

import argparse
import pathlib
import sys
from pdfminer.high_level import extract_text

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent


def converter(pdf_path: pathlib.Path,
              out_dir: pathlib.Path,
              nome_destino: str) -> None:
    texto = extract_text(str(pdf_path))
    out_dir.mkdir(exist_ok=True, parents=True)
    destino = out_dir / nome_destino
    destino.write_text(texto or "", encoding="utf-8")
    print(f"[✓] {pdf_path.name}  →  {destino}")


def processar_diretorio(pasta_pdfs: pathlib.Path,
                        out_dir: pathlib.Path,
                        seq: bool,
                        ext: str) -> None:
    pdfs = sorted(pasta_pdfs.glob("*.pdf"))
    if not pdfs:
        print("⚠️  Nenhum PDF encontrado no diretório.")
        return

    for idx, pdf in enumerate(pdfs, start=1):
        nome = f"arquivo{idx}{ext}" if seq else f"{pdf.stem}{ext}"
        converter(pdf, out_dir, nome)


def main() -> None:
    ap = argparse.ArgumentParser(
        description=("Converte todos os PDFs de um diretório para TXT. "
                     "Se nenhum argumento for dado, será solicitado o caminho da pasta."))
    ap.add_argument("pasta", nargs="?",  # ← torna opcional
                    help="diretório contendo arquivos .pdf")
    ap.add_argument("--seq", action="store_true",
                    help="usa numeração sequencial (arquivo1.txt, arquivo2.txt …)")
    ap.add_argument("--dir", default="pdfConvertidoTxt",
                    help="pasta de destino (default: pdfConvertidoTxt)")
    ap.add_argument("--ext", default=".txt",
                    help="extensão do arquivo de saída (default: .txt)")
    args = ap.parse_args()

    # Se o argumento 'pasta' não foi passado, perguntar ao usuário
    if not args.pasta:
        args.pasta = input("Digite o caminho da pasta com os PDFs: ").strip('"').strip()

    pasta_pdfs = pathlib.Path(args.pasta).expanduser()
    if not pasta_pdfs.is_dir():
        raise NotADirectoryError(f"Diretório não encontrado: {pasta_pdfs}")

    out_dir = (SCRIPT_DIR / args.dir).resolve()
    processar_diretorio(pasta_pdfs, out_dir, args.seq, args.ext)


if __name__ == "__main__":
    main()

