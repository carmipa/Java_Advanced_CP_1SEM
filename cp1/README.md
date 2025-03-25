# 🚀 CP1 2025 - FIAP - java advanced - bank

**Paulo André carminati RM557881**  
**Gabielly Campos Macedo RM558962**

---

## Introdução

Nesta missão, o objetivo é desenvolver uma API para a gestão de um banco digital, aplicando as melhores práticas na construção de APIs REST. O projeto pode ser realizado individualmente ou em dupla e deverá ser entregue por meio de um repositório no GitHub, conforme orientações no sistema Gemini Dev. A avaliação considerará a qualidade do código, a implementação das funcionalidades e a aplicação correta dos conceitos propostos.

**Pontuação Máxima:** 100%

---

## Requisitos do Projeto

### 1. Criação do Projeto (20%)

- Utilize o [Spring Initializr](https://start.spring.io/) ou a extensão do Spring no VSCode para criar um projeto **Spring Web** com suporte a **live reload**.
- Crie um endpoint para o path `/` que retorne uma _String_ contendo:
  - O nome do projeto.
  - Os nomes dos integrantes da equipe.

### 2. Cadastro de Conta (20%)

- Crie um endpoint para cadastrar uma conta digital.
- A conta deverá conter os seguintes atributos:
  - **Número**
  - **Agência**
  - **Nome do Titular**
  - **CPF do Titular**
  - **Data de Abertura**
  - **Saldo Inicial**
  - **Ativa** (sim/não)
  - **Tipo** (corrente, poupança ou salário)
- Os dados devem ser armazenados em memória.

### 3. Validação (20%)

Implemente as seguintes validações para o cadastro da conta:

- **Nome do Titular:** obrigatório.
- **CPF do Titular:** obrigatório.
- **Data de Abertura:** não pode ser uma data futura.
- **Saldo Inicial:** não pode ser negativo.
- **Tipo:** deve ser um dos tipos válidos (corrente, poupança ou salário).

Caso algum dado inválido seja enviado, retorne um erro **400** com uma mensagem descritiva do problema.

### 4. Buscas (10%)

Desenvolva os seguintes endpoints de consulta:

- Retornar **todas** as contas cadastradas.
- Retornar uma conta por **ID**.
- Retornar uma conta pelo **CPF do Titular**.

### 5. Encerrar Conta (10%)

- Crie um endpoint que receba o **ID** de uma conta e encerre essa conta.
- A conta encerrada deve ser marcada como inativa na base de dados (armazenamento em memória).

### 6. Depósito (10%)

- Crie um endpoint para realizar um depósito na conta.
- Os dados do depósito devem ser enviados no corpo da requisição (ID da conta e valor do depósito).
- Se o valor for válido, ele deverá ser somado ao saldo da conta e os dados atualizados deverão ser retornados.

### 7. Saque (10%)

- Crie um endpoint para realizar um saque na conta.
- Os dados do saque devem ser enviados no corpo da requisição (ID da conta e valor do saque).
- Se o valor for válido, ele deverá ser subtraído do saldo da conta e os dados atualizados deverão ser retornados.

### 8. PIX (20%)

- Crie um endpoint para realizar uma transferência via PIX.
- Os dados do PIX devem ser enviados no corpo da requisição, contendo:
  - **ID da conta de origem**
  - **ID da conta de destino**
  - **Valor do PIX**
- Se o valor for válido, ele deverá ser transferido da conta de origem para a conta de destino.
- Retorne os dados atualizados da conta de origem.

---

## Considerações Finais

- **Boas práticas:** Certifique-se de seguir as melhores práticas no desenvolvimento da API, incluindo tratamento de erros, organização do código e uso de padrões de projeto.
- **Testes:** Sempre que possível, inclua testes unitários para garantir a robustez da aplicação.
- **Documentação:** Mantenha este README atualizado e inclua instruções para a execução e testes da aplicação.

Boa sorte e mãos à obra!

**Repositório no GitHub**: [CP1 - bank](https://github.com/carmipa/CP2025_primeiro_semestre/tree/main/Java_Advanced/cp1)

