#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: converte-classes-java-em-txt-unico (versão 3)
Descrição:
  Percorre recursivamente um projeto Java, concatena todos os .java
  num único .txt e separa cada arquivo por blocos-comentário contendo
  caminho relativo, pacote e nome do arquivo.

Uso:
  python converte_java_em_txt.py [caminho/do/projeto]
"""

import os
import sys
import argparse
import re
from datetime import datetime
from typing import List, Optional


# ───────────────────────── Funções utilitárias ────────────────────────── #

def gerar_arvore_diretorios(startpath: str) -> str:
    linhas = []
    for root, dirs, _ in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * level
        linhas.append(f"{indent}{os.path.basename(root)}/")
        dirs.sort()
    return "\n".join(linhas)


def extrair_nome_classe(txt: str) -> Optional[str]:
    m = re.search(r'\bclass\s+(\w+)', txt)
    return m.group(1) if m else None


def extrair_pacote(txt: str) -> Optional[str]:
    m = re.search(r'^\s*package\s+([\w\.]+)\s*;', txt, re.MULTILINE)
    return m.group(1) if m else None


def listar_arquivos_java(pasta: str) -> List[str]:
    arquivos = []
    for root, _, files in os.walk(pasta):
        for f in files:
            if f.endswith(".java"):
                arquivos.append(os.path.join(root, f))
    return sorted(arquivos)


# ──────────────────────────── Programa principal ───────────────────────── #

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Concatena todas as classes .java em um único .txt com anotações."
    )
    parser.add_argument("project_path", nargs="?",
                        help="(Opcional) Caminho da pasta raiz do projeto Java")
    args = parser.parse_args()

    projeto = args.project_path or input(
        "Informe o caminho da pasta do projeto Java: ").strip()

    if not os.path.isdir(projeto):
        print(f"Erro: '{projeto}' não é um diretório válido.")
        sys.exit(1)

    saida = "convertidoJavaEmTxt.txt"
    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    arquivos_java = listar_arquivos_java(projeto)

    linha_sep = "//" + "―" * 100 + "\n"          # linha longa de separação

    with open(saida, "w", encoding="utf-8") as out:

        # ── Cabeçalho global ─────────────────────────────────────────── #
        out.write("// Script: converte-classes-java-em-txt-unico (v3)\n")
        out.write(f"// Data de criação do arquivo de saída: {agora}\n\n")

        out.write("// Estrutura de diretórios do projeto:\n")
        out.write(gerar_arvore_diretorios(projeto))
        out.write("\n\n")

        out.write("// Arquivos encontrados (FQN => caminho relativo):\n")
        for arq in arquivos_java:
            rel = os.path.relpath(arq, projeto)
            txt = open(arq, encoding="utf-8").read()
            classe = extrair_nome_classe(txt) or os.path.splitext(os.path.basename(arq))[0]
            pacote = extrair_pacote(txt)
            fqn = f"{pacote}.{classe}" if pacote else classe
            out.write(f"// {fqn} => {rel}\n")
        out.write("\n")

        # ── Conteúdo de cada classe ─────────────────────────────────── #
        for arq in arquivos_java:
            rel = os.path.relpath(arq, projeto)
            conteudo = open(arq, encoding="utf-8").read()

            classe = extrair_nome_classe(conteudo) or os.path.splitext(os.path.basename(arq))[0]
            pacote = extrair_pacote(conteudo) or "(default package)"

            # bloco-comentário de separação
            out.write(linha_sep)
            out.write(f"// {rel}   |   package {pacote}   |   class {classe}\n")
            out.write(linha_sep + "\n")

            out.write(conteudo.rstrip())  # remove última quebra extra
            out.write("\n\n")             # espaço entre arquivos

    print(f"Concluído! Arquivo de saída gerado: {saida}")


if __name__ == "__main__":
    main()
