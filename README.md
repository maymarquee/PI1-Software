# PI1 - Software

Esse repositório é destinado a armazenar os códigos produzidos pelo time de **Software** na matéria **Projeto Integrador de Engenharia 1**, da Universidade de Brasília (UnB - campus Gama), ministrada pelo professor **Bruno Luiz Pereira**. 

O projeto se dá pela produção de um **carrinho autônomo** que deve ser realizado pelos alunos de graduação que use conhecimentos obtidos nos cursos de **Engenharia Automotiva, Engenharia Aeroespacial, Engenharia de Energia, Engenharia de Software e Engenharia Eletrônica** de forma integrada. 

Funcionalidades do **carrinho**:
- Deve depositar de forma autônoma um objeto com dimensões e fragilidade de um ovo médio.
- Deve seguir três trajetórias desconhecidas de antemão:
    - A 1ª indicada por fita isolante no piso do local;
    - A 2ª indicada por fita isolante intermitente;
    - A 3ª indicada pelas intruções dos professores.  

A função da área de Software no projeto é a de realizar uma **interface gráfica** que controlará o carrinho (envio de comandos).

Funcionalidades da **interface gráfica**:
- Controle e execução dos comandos;
- Monitoramento em tempo real;
- Análise e cálculo de parâmetros;
- Diagnóstico e gestão de dados.


## Equipe de Software

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/andrehsb.png?size=100" width=100><br>
      <b><a href="https://github.com/andrehsb">André Henrqiue</a></b><br>
    </td>
    <td align="center">
      <img src="https://github.com/artmendess.png?size=100" width=100><br>
      <b><a href="https://github.com/artmendess">Arthur Mendes</a></b><br>
    </td>
    <td align="center">
      <img src="https://github.com/giovannafg.png?size=100" width=100><br>
      <b><a href="https://github.com/giovannafg">Giovanna Felipe</a></b><br>
    </td>
    <td align="center">
      <img src="https://github.com/joaofmoreiraa.png?size=100" width=100><br>
      <b><a href="https://github.com/joaofmoreiraa">João Moreira</a></b><br>
    </td>
    <td align="center">
      <img src="https://github.com/jsalless.png?size=100" width=100><br>
      <b><a href="https://github.com/jsalless">Johnnatan Salles</a></b><br>
    </td>
    <td align="center">
      <img src="https://github.com/maymarquee.png?size=100" width=100><br>
      <b><a href="https://github.com/maymarquee">Mayara Marques</a></b><br>
    </td>
  </tr>
</table>

## Tecnologias
As tecnologias escolhidas pelo grupo foram:  

- **Front-end**:  
    - Next.js;
    - Tailwind CSS;
    - React.
- **Back-end**:
    - NestJS;
    - Prisma;
    - Jest para testes.

### Como rodar o projeto

1. Clone o repositório:
```
git clone https://github.com/maymarquee/PI1-Software.git
```

2. Acesse o diretório que deseja rodar:
```
cd backend
```
ou
```
cd frontend
```

3. Rodando o **back-end**:  
```
npm run start:dev
```
4. Rodando o **front-end**:
```
npm run dev
```

### Como rodar os testes

#### Testes do Backend

Para rodar todos os testes, acesse a pasta `backend` do projeto e digite no terminal:

```
npm test
```

Para rodar os testes com cobertura, digite no terminal, dentro da pasta `backend`:

```
npm run test:cov
```

Para ler mais sobre os testes realizados, leia o documento: `testes.md` na pasta backend.

#### Testes E2E (Frontend)

Os testes end-to-end (E2E) testam o fluxo completo da aplicação usando o Playwright.

**Pré-requisitos:**
1. Backend rodando em `http://localhost:3001`:
```bash
cd backend
npm run start:dev
```

2. Frontend rodando em `http://localhost:3000`:
```bash
cd frontend
npm run dev
```

**Rodar todos os testes E2E:**
```bash
cd frontend
npx playwright test e2e/spec/
```

**Rodar testes com interface gráfica (UI Mode):**
```bash
cd frontend
npx playwright test e2e/spec/ --ui
```

**Gerar relatório HTML dos testes:**
```bash
cd frontend
npx playwright test e2e/spec/
npx playwright show-report
```
