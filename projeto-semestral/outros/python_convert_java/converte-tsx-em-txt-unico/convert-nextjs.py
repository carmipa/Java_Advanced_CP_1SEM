#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: converte-arquivos-tsx-em-txt-unico
Descrição:
  Percorre recursivamente a pasta de um projeto React/Next.js,
  concatena todos os arquivos .tsx em um único .txt, inserindo:
    • Cabeçalho com data/hora e árvore de diretórios.
    • Lista de arquivos encontrados (caminho relativo).
    • Blocos separadores antes de cada arquivo contendo
      caminho, suposto nome de componente e tipo de exportação.

Uso:
  python converte_tsx_em_txt.py [caminho/do/projeto]
  (Se não passar o caminho, o script perguntará interativamente.)
"""

import os
import sys
import argparse
import re
from datetime import datetime
from typing import List, Optional

# ───────────────────────── Funções utilitárias ───────────────────────── #

def gerar_arvore_diretorios(startpath: str) -> str:
    """Gera string com a árvore de diretórios do projeto (estilo tree)."""
    linhas: List[str] = []
    for root, dirs, _ in os.walk(startpath):
        level = root.replace(startpath, "").count(os.sep)
        indent = " " * 4 * level
        linhas.append(f"{indent}{os.path.basename(root)}/")
        dirs.sort()
    return "\n".join(linhas)

def extrair_nome_componente(txt: str) -> Optional[str]:
    """
    Tenta descobrir o nome do componente:
      - export default function MeuComponente(
      - function MeuComponente(
      - const MeuComponente = ( ...
      - class MeuComponente extends ...
    """
    padroes = [
        r'export\s+default\s+function\s+(\w+)',
        r'\bfunction\s+(\w+)',
        r'\bconst\s+(\w+)\s*[:=]',
        r'\bclass\s+(\w+)\s+extends'
    ]
    for p in padroes:
        m = re.search(p, txt)
        if m:
            return m.group(1)
    return None

def listar_arquivos_tsx(pasta: str) -> List[str]:
    """Retorna lista ordenada de todos os .tsx encontrados sob pasta."""
    arquivos: List[str] = []
    for root, _, files in os.walk(pasta):
        for f in files:
            if f.endswith(".tsx"):
                arquivos.append(os.path.join(root, f))
    return sorted(arquivos)

# ──────────────────────────── Programa principal ─────────────────────── #

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Concatena todos os .tsx em um único .txt com anotações."
    )
    parser.add_argument(
        "project_path",
        nargs="?",
        help="(Opcional) Caminho da pasta raiz do projeto React/Next.js"
    )
    args = parser.parse_args()

    projeto = args.project_path or input(
        "Informe o caminho da pasta do projeto React/Next.js: "
    ).strip()

    if not os.path.isdir(projeto):
        print(f"Erro: '{projeto}' não é um diretório válido.")
        sys.exit(1)

    saida = "convertidoTsxEmTxt.txt"
    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    arquivos_tsx = listar_arquivos_tsx(projeto)
    linha_sep = "//" + "―" * 100 + "\n"

    with open(saida, "w", encoding="utf-8") as out:

        # ── Cabeçalho global ────────────────────────────────────────── #
        out.write("// Script: converte-arquivos-tsx-em-txt-unico\n")
        out.write(f"// Data de criação do arquivo de saída: {agora}\n\n")

        out.write("// Estrutura de diretórios do projeto:\n")
        out.write(gerar_arvore_diretorios(projeto))
        out.write("\n\n")

        out.write("// Arquivos .tsx encontrados (caminho relativo):\n")
        for arq in arquivos_tsx:
            rel = os.path.relpath(arq, projeto)
            out.write(f"// {rel}\n")
        out.write("\n")

        # ── Conteúdo de cada arquivo .tsx ───────────────────────────── #
        for arq in arquivos_tsx:
            rel = os.path.relpath(arq, projeto)
            conteudo = open(arq, encoding="utf-8").read()

            componente = extrair_nome_componente(conteudo) or "(nome não identificado)"

            out.write(linha_sep)
            out.write(f"// {rel}   |   componente {componente}\n")
            out.write(linha_sep + "\n")

            out.write(conteudo.rstrip())  # evita quebra extra no fim
            out.write("\n\n")

    print(f"Concluído! Arquivo de saída gerado: {saida}")

if __name__ == "__main__":
    main()
