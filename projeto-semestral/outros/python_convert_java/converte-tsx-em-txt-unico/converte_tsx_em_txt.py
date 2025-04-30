#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: converte-tsx-em-txt-unico
Descrição:
  Percorre recursivamente a pasta de um projeto Next.js,
  encontra todos os arquivos .tsx e os concatena em um único
  arquivo de saída com anotações de caminho, nome do componente
  e data de execução, além da árvore de diretórios.

Uso:
  python converte_tsx_em_txt.py [caminho/do/projeto]
  Se não passar o caminho, o script solicitará interativamente.
"""

import os
import sys
import argparse
from datetime import datetime
import re

def gerar_arvore_diretorios(startpath):
    """Gera uma string contendo a árvore de diretórios a partir de startpath."""
    tree_lines = []
    for root, dirs, _ in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * level
        tree_lines.append(f"{indent}{os.path.basename(root)}/")
    return "\n".join(tree_lines)

def extrair_nome_componente(conteudo, nome_arquivo):
    """
    Tenta extrair nome do componente em TSX:
    - export default function Nome(...)
    - function Nome(...)
    - const Nome = (...) => ...
    Se falhar, usa nome_arquivo (sem extensão).
    """
    patterns = [
        r'\bexport\s+default\s+function\s+(\w+)',    # export default function Componente
        r'\bfunction\s+(\w+)\s*\(',                  # function Componente(
        r'\bconst\s+(\w+)\s*=\s*\(?\s*.*?\)\s*=>',   # const Componente = (...) =>
        r'\bexport\s+default\s+(\w+)'                # export default Componente
    ]
    for pat in patterns:
        m = re.search(pat, conteudo)
        if m:
            return m.group(1)
    # fallback: nome do arquivo sem extensão
    return os.path.splitext(nome_arquivo)[0]

def main():
    parser = argparse.ArgumentParser(
        description="Converte todos os arquivos .tsx em um único .txt com anotações."
    )
    parser.add_argument(
        "project_path",
        nargs="?",
        help="(Opcional) Caminho da pasta raiz do projeto Next.js"
    )
    args = parser.parse_args()

    project_path = args.project_path or input("Informe o caminho da pasta do projeto Next.js: ").strip()
    if not os.path.isdir(project_path):
        print(f"Erro: '{project_path}' não é um diretório válido.")
        sys.exit(1)

    output_filename = "ConverteTsxEmTxt.txt"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(output_filename, 'w', encoding='utf-8') as out:
        # Cabeçalho
        out.write("Script: converte-tsx-em-txt-unico\n")
        out.write(f"Data de execução: {now}\n\n")

        # Árvore de diretórios
        out.write("Estrutura de diretórios do projeto:\n")
        out.write(gerar_arvore_diretorios(project_path))
        out.write("\n\n")

        # Processa cada .tsx
        for root, _, files in os.walk(project_path):
            for nome_arquivo in files:
                if nome_arquivo.endswith(".tsx"):
                    caminho_completo = os.path.join(root, nome_arquivo)
                    caminho_rel = os.path.relpath(caminho_completo, project_path)
                    with open(caminho_completo, 'r', encoding='utf-8') as f:
                        conteudo = f.read()

                    nome_comp = extrair_nome_componente(conteudo, nome_arquivo)

                    # Anotações e conteúdo
                    out.write(f"// --- Arquivo: {caminho_rel}\n")
                    out.write(f"// --- Componente: {nome_comp}\n")
                    out.write(conteudo)
                    out.write("\n\n")

    print(f"Concluído! Arquivo de saída gerado: {output_filename}")

if __name__ == "__main__":
    main()
