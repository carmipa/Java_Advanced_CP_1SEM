import os

# ------------------------------------------------------------
# 1) Ajuste este caminho para a raiz do seu projeto Next.js,
#    onde estão as pastas “pages”, “components” etc.
# ------------------------------------------------------------
projeto_nextjs = r'D:\FIAP-2025\1_semestre_fiap-2025\CP2025_primeiro_semestre\Java_Advanced_CP_1SEM\projeto-semestral\projeto-semestral-web\src'

# ------------------------------------------------------------
# 2) Determina onde está este script e cria a pasta de saída
# ------------------------------------------------------------
pasta_script = os.path.dirname(os.path.abspath(__file__))
pasta_saida = os.path.join(pasta_script, 'arquivoCompleto')
os.makedirs(pasta_saida, exist_ok=True)

# ------------------------------------------------------------
# 3) Nome do arquivo final que conterá todos os .tsx
# ------------------------------------------------------------
arquivo_final = os.path.join(pasta_saida, 'convertidoTSX.txt')


def juntar_tsx_em_txt_unico(raiz_projeto, arquivo_destino):
    """
    Percorre recursivamente todas as pastas em `raiz_projeto`,
    encontra arquivos *.tsx* e escreve num único arquivo de saída.
    """
    with open(arquivo_destino, 'w', encoding='utf-8') as saida:
        for raiz, subdirs, arquivos in os.walk(raiz_projeto):
            print(f'🔍 Escaneando: {raiz}')
            for nome in arquivos:
                if nome.lower().endswith('.tsx'):
                    caminho_completo = os.path.join(raiz, nome)
                    print(f'  ✔️ Encontrado: {caminho_completo}')
                    try:
                        with open(caminho_completo, 'r', encoding='utf-8') as f:
                            conteudo = f.read()
                        # Escreve um separador com o caminho relativo do arquivo
                        separador = f'\n/* --- {os.path.relpath(caminho_completo, raiz_projeto)} --- */\n'
                        saida.write(separador)
                        saida.write(conteudo)
                        saida.write('\n' + '=' * 80 + '\n')
                    except Exception as e:
                        print(f'❌ Erro ao ler {caminho_completo}: {e}')


if __name__ == '__main__':
    print('🚀 Iniciando concatenação de arquivos .tsx...')
    juntar_tsx_em_txt_unico(projeto_nextjs, arquivo_final)
    print('✅ Concluído!')
    print('📄 Arquivo gerado em:', os.path.abspath(arquivo_final))
