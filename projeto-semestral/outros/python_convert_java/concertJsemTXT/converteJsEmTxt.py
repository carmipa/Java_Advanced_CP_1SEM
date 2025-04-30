#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import argparse

def coletar_js(root_dir: str, output_file: str) -> int:
    """
    Percorre recursivamente root_dir e concatena todo conteúdo de arquivos .js em output_file.
    Cada arquivo é precedido por um comentário com seu caminho relativo.
    Retorna o número de arquivos processados.
    """
    contador = 0
    with open(output_file, 'w', encoding='utf-8') as out_f:
        for dirpath, _, filenames in os.walk(root_dir):
            for filename in sorted(filenames):
                if filename.lower().endswith('.js'):
                    contador += 1
                    file_path = os.path.join(dirpath, filename)
                    rel_path = os.path.relpath(file_path, root_dir)
                    print(f"Processando: {rel_path}")
                    out_f.write(f"// ====== ARQUIVO: {rel_path} ======\n")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as in_f:
                            out_f.writelines(in_f.readlines())
                    except Exception as e:
                        out_f.write(f"// Erro ao ler o arquivo: {e}\n")
                    out_f.write("\n")  # separa arquivos por linha em branco
    return contador

def main():
    parser = argparse.ArgumentParser(
        description="Concatena todo o conteúdo de arquivos .js de um projeto em um único .txt"
    )
    parser.add_argument(
        'pasta',
        nargs='?',
        help='Caminho da pasta raiz do projeto (se não informado, será solicitado em tempo de execução)'
    )
    parser.add_argument(
        '-o', '--output',
        default='jstxt.txt',
        help="Nome do arquivo de saída (padrão: 'jstxt.txt' no diretório atual)"
    )

    args = parser.parse_args()

    # Se não passou pasta via CLI, pede interativamente
    if not args.pasta:
        args.pasta = input("Digite o caminho da pasta onde começam os arquivos .js: ").strip()
        if not args.pasta:
            print("Nenhum caminho informado. Encerrando.")
            return

    raiz = os.path.abspath(args.pasta)
    saida = os.path.abspath(args.output)

    if not os.path.isdir(raiz):
        print(f"Erro: '{raiz}' não é uma pasta válida.")
        return

    total = coletar_js(raiz, saida)
    if total == 0:
        print(f"\n⚠️  Nenhum .js encontrado em '{raiz}'. Verifique o caminho e tente novamente.")
    else:
        print(f"\n✅  Concluído! {total} arquivo(s) .js concatenado(s) em '{saida}'.")

if __name__ == '__main__':
    main()
