#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: converte-classes-java-em-txt-unico
Descrição:
  Concatena todos os arquivos .java de um projeto em um único .txt,
  anotando caminho, nome da classe e data de execução, e mostrando
  também a árvore de diretórios do projeto.

Uso:
  python converte_java_em_txt.py [caminho/do/projeto]
  Se não passar o caminho, o script perguntará interativamente.
"""

import os
import sys
import argparse
from datetime import datetime
import re

def gerar_arvore_diretorios(startpath):
    """Gera a árvore de diretórios a partir de startpath."""
    tree_lines = []
    for root, dirs, _ in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * level
        tree_lines.append(f"{indent}{os.path.basename(root)}/")
    return "\n".join(tree_lines)

def extrair_nome_classe(conteudo):
    """Tenta extrair o nome da classe pelo padrão 'class Nome'."""
    match = re.search(r'\bclass\s+(\w+)', conteudo)
    return match.group(1) if match else None

def main():
    parser = argparse.ArgumentParser(
        description="Converte todas as classes .java em um único .txt com anotações."
    )
    parser.add_argument(
        "project_path",
        nargs="?",
        help="(Opcional) Caminho da pasta raiz do projeto Java"
    )
    args = parser.parse_args()

    # Se não passou como argumento, pede interativamente
    project_path = args.project_path
    if not project_path:
        project_path = input("Informe o caminho da pasta do projeto Java: ").strip()

    if not os.path.isdir(project_path):
        print(f"Erro: '{project_path}' não é um diretório válido.")
        sys.exit(1)

    output_filename = "converttidoJavaEmTxt.txt"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(output_filename, 'w', encoding='utf-8') as out:
        # Cabeçalho
        out.write("Script: converte-classes-java-em-txt-unico\n")
        out.write(f"Data de criação do arquivo de saída: {now}\n\n")

        # Árvore de diretórios
        out.write("Estrutura de diretórios do projeto:\n")
        out.write(gerar_arvore_diretorios(project_path))
        out.write("\n\n")

        # Processa cada .java
        for root, _, files in os.walk(project_path):
            for nome_arquivo in files:
                if nome_arquivo.endswith(".java"):
                    caminho_completo = os.path.join(root, nome_arquivo)
                    caminho_rel = os.path.relpath(caminho_completo, project_path)
                    with open(caminho_completo, 'r', encoding='utf-8') as f:
                        conteudo = f.read()

                    nome_classe = extrair_nome_classe(conteudo) or os.path.splitext(nome_arquivo)[0]

                    # Escreve anotação e conteúdo
                    out.write(f"// --- Arquivo: {caminho_rel}\n")
                    out.write(f"// --- Classe: {nome_classe}\n")
                    out.write(conteudo)
                    out.write("\n\n")

    print(f"Concluído! Arquivo de saída gerado: {output_filename}")

if __name__ == "__main__":
    main()
