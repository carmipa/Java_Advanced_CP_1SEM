import os

# Caminho original do projeto
projeto_java = r'D:\FIAP-2025\1_semestre_fiap-2025\CP2025_primeiro_semestre\Java_Advanced_CP_1SEM\projeto-semestral\projeto-semestral'

# Caminho da pasta do script
pasta_script = os.path.dirname(os.path.abspath(__file__))

# Caminho onde o arquivo final será salvo
pasta_saida = os.path.join(pasta_script, 'arquivoCompleto')
os.makedirs(pasta_saida, exist_ok=True)
arquivo_final = os.path.join(pasta_saida, 'projeto-semestral.txt')

# Função para juntar todos os arquivos .java em um .txt único
def juntar_java_em_txt_unico(raiz_projeto, arquivo_destino):
    with open(arquivo_destino, 'w', encoding='utf-8') as saida:
        for raiz, subdirs, arquivos in os.walk(raiz_projeto):
            for arquivo in arquivos:
                if arquivo.endswith('.java'):
                    caminho_completo = os.path.join(raiz, arquivo)
                    caminho_relativo = os.path.relpath(caminho_completo, raiz_projeto)

                    try:
                        with open(caminho_completo, 'r', encoding='utf-8') as f:
                            conteudo = f.read()

                        # Escreve separador com o nome do arquivo
                        saida.write(f'\n/* --- {caminho_relativo} --- */\n')
                        saida.write(conteudo)
                        saida.write('\n' + '='*80 + '\n')  # linha visual opcional

                        print(f'✔️ Adicionado: {caminho_relativo}')
                    except Exception as e:
                        print(f'❌ Erro ao ler {caminho_completo}: {e}')

# Executar
juntar_java_em_txt_unico(projeto_java, arquivo_final)
