import os
import shutil

# Caminho original do projeto
projeto_java = r'D:\FIAP-2025\1_semestre_fiap-2025\CP2025_primeiro_semestre\Java_Advanced_CP_1SEM\projeto-semestral\projeto-semestral'

# Caminho onde o script está sendo executado
pasta_script = os.path.dirname(os.path.abspath(__file__))

# Pasta de destino onde os arquivos .txt serão salvos
destino_txt = os.path.join(pasta_script, 'convertidos_txt')

# Função para converter arquivos .java em .txt e manter estrutura
def converter_java_para_txt(origem, destino_base):
    for raiz, subdirs, arquivos in os.walk(origem):
        for arquivo in arquivos:
            if arquivo.endswith('.java'):
                caminho_original = os.path.join(raiz, arquivo)

                # Subcaminho relativo a partir da pasta base do projeto
                subcaminho_relativo = os.path.relpath(raiz, origem)

                # Caminho de destino mantendo estrutura
                nova_pasta = os.path.join(destino_base, subcaminho_relativo)
                os.makedirs(nova_pasta, exist_ok=True)

                novo_arquivo_txt = os.path.join(nova_pasta, arquivo.replace('.java', '.txt'))

                try:
                    shutil.copyfile(caminho_original, novo_arquivo_txt)
                    print(f'✔️ {caminho_original} -> {novo_arquivo_txt}')
                except Exception as e:
                    print(f'❌ Erro ao converter {caminho_original}: {e}')

# Executar a conversão
converter_java_para_txt(projeto_java, destino_txt)
