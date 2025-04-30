# 🚀 Projeto Mercado CP2

# PAULO ANDRÉ CARMINATI - RM557881

**📝 Disciplina:** Java Advanced  
**✍️ Autor:** João Carlos Lima

---

## 🎯 Introdução
Você é responsável por criar uma API que simula um mercado medieval, onde personagens podem cadastrar, vender, comprar e trocar itens mágicos, como espadas encantadas 🗡️, elixires 🧪, grimórios 📜, mantos de invisibilidade 🕊️, etc.

---

## 🔧 Funcionalidades Principais

### 1. Personagem (20%) 🧙‍♂️
Implemente o CRUD completo para a entidade **Personagem**, com os endpoints básicos para manipulação e persistência em banco de dados.

- **Campos obrigatórios:**
  - `nome` 🏷️ (String, obrigatório)
  - `classe` ⚔️ (String, valores: guerreiro, mago, arqueiro)
  - `nivel` ⭐ (Integer, mínimo 1, máximo 99)
  - `moedas` 💰 (Integer ou BigDecimal, saldo disponível para compras)

### 2. Item (20%) 🗡️🛡️
Implemente o CRUD completo para a entidade **Item**, representando unidades que podem ser compradas no mercado.

- **Campos obrigatórios:**
  - `nome` 🏷️ (String, obrigatório)
  - `tipo` 🔰 (String, valores: arma, armadura, poção, acessório)
  - `raridade` 🏅 (String, valores: comum, raro, épico, lendário)
  - `preco` 💎 (BigDecimal, valor de venda no mercado)
  - `dono` 👤 (Relacionamento com **Personagem**)

### 3. Filtros e Busca (10% cada) 🔍
Implemente endpoints de pesquisa seguindo boas práticas de API REST. Cada filtro vale 10% nesta seção.

- 🔎 Buscar personagem por **nome**  
- 🛡️ Buscar personagem por **classe**  
- 🔠 Buscar itens por **nome parcial**  
- 🎲 Buscar itens por **tipo**  
- 💲 Buscar itens por **preço mínimo e máximo**  
- 🌟 Buscar itens por **raridade**  

> **Observação:** Utilize **paginação** 📑 em endpoints que retornem grandes conjuntos de dados.

---

## 🏆 Critérios de Avaliação e Entrega

- 📦 A entrega deve ser realizada via **link público do GitHub**, com o código do projeto na raiz do repositório.  
- ⏰ O link deve ser entregue até o término do prazo estipulado pelo professor Gemini.  
- 📐 Serão avaliadas boas práticas de **POO** e **API REST**.  
- 🗂️ Endpoints que retornam muitos dados devem ser paginados.  
- ⚠️ Cada ocorrência de má prática acarretará penalidade de **5%**.  
- 🤝 O projeto pode ser realizado em **dupla** ou **individual**.

---

**🎉 Boa codificação e sucesso no projeto!**

