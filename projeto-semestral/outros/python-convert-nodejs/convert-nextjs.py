import os

# Caminho do projeto Next.js
caminho_projeto = r'D:\FIAP-2025\CP-2025\Java_Advanced_CP_1SEM\projeto-semestral\projeto-semestral-web'

# Nome da pasta de saída
pasta_saida = 'nextjs'
arquivo_saida = 'nextjs.txt'

# Garante que a pasta de saída exista no mesmo local do script
caminho_saida = os.path.join(os.path.dirname(__file__), pasta_saida)
os.makedirs(caminho_saida, exist_ok=True)

# Caminho completo do arquivo final
caminho_arquivo_saida = os.path.join(caminho_saida, arquivo_saida)

# Caminhos a ignorar
pastas_ignoradas = {'node_modules', '.next', '.git'}

# Lista todos os arquivos .tsx e escreve no arquivo final
with open(caminho_arquivo_saida, 'w', encoding='utf-8') as saida:
    for root, dirs, files in os.walk(caminho_projeto):
        # Remove pastas indesejadas da recursão
        dirs[:] = [d for d in dirs if d not in pastas_ignoradas]

        for file in files:
            if file.endswith('.tsx'):
                caminho_completo = os.path.join(root, file)
                caminho_relativo = os.path.relpath(caminho_completo, caminho_projeto)

                try:
                    # Comentário delimitador
                    saida.write(f"\n\n# --- {caminho_relativo} ---\n\n")

                    with open(caminho_completo, 'r', encoding='utf-8') as f:
                        conteudo = f.read()
                        saida.write(conteudo)
                except Exception as e:
                    print(f"Erro ao ler {caminho_relativo}: {e}")

print(f"\n✅ Todos os arquivos .tsx foram salvos em: {caminho_arquivo_saida}")
