# Datasets — Curso SESP/MT · Dia 3
"Da Planilha Caótica ao Painel de Inteligência Profissional"
Módulos 4 (Organização e Visualização) e 5 (Ferramentas e Linguagens / ETL)

--------------------------------------------------------------------------------
## bruto/   —  laboratório "Pré-ETL" (a base como sai do sistema legado)
- ocorrencias_CIOSP_jan2026_BRUTO.csv
  * GRAVADO EM WINDOWS-1252 (ANSI) DE PROPÓSITO. Abra no Excel e veja "Cuiabá".
    "Óbito". "Coxipó" quebrarem. Exercício: salvar como "CSV UTF-8 (delimitado
    por vírgulas)".
  * delimitador ; (ponto e vírgula)
  * 1ª linha = título de lixo; 2ª linha em branco; cabeçalho só na 3ª linha
  * cabeçalhos com espaços/acentos/pontuação ("Núm. B.O.". "Data / Hora ...")
  * coluna "Data / Hora da Ocorrência" combinada (data + hora no mesmo campo).
    com formatos misturados: 05/01/2026 14:32 · 2026-01-07 08:10 · 06-01-2026 22h04
  * "Tipo de Ocorrência" sem padrão: Roubo / roubo / ROUBO / " Roubo" / "Roub."
  * "Bairro / Região" sem padrão: Centro / centro / CENTRO / Ctr
  * "Valor Apreendido (R$)" em formatos diferentes: 15000 · 1.500.00 · R$ 2000 · "" · -
  * "Idade da Vítima" com valores impossíveis: 0. 999. -3. em branco
  * ~5 B.O. duplicados (3 linhas idênticas + 2 só com o número repetido)
  * 1 data impossível: 31/02/2026
  * ~4 linhas totalmente em branco no meio
  * 1 linha "TOTAL GERAL" no fim (lixo que o sistema exporta)

  RESUMO DO QUE ESTÁ ERRADO: 130 ocorrências reais
  + 5 duplicatas + 4 linhas em branco + 1 linha "TOTAL GERAL" + 1 data impossível.

## limpo/   —  o "depois" do laboratório (meta do exercício)
- ocorrencias_jan2026_LIMPO.csv  (130 registros)
  UTF-8 com BOM · 1 cabeçalho sem acento/espaço · Data e Hora em colunas separadas ·
  Tipo_Ocorrencia e Bairro padronizados · Idade_Vitima inválida -> vazio ·
  Valor numérico · sem duplicatas · sem linha de total · sem linhas em branco.

## consolidacao_pasta/   —  Power Query > Obter Dados > "De uma Pasta"
- efetivo_<unidade>_<mes>.csv  (6 unidades x 2 meses = 12 arquivos. mesmo layout)
  Colunas: Matricula; Nome; Posto_Graduacao; Situacao; Dias_Afastado; Unidade; Mes_Referencia
  * PEGADINHA PLANTADA: efetivo_rotam_2026-02.csv tem uma coluna a mais ("Obs").
    O Power Query avisa a diferença de schema — bom momento para ensinar o passo
    "Cabeçalhos Promovidos" + seleção explícita de colunas.

## painel/   —  agregado mensal LIMPO (gráficos e mini-painel do comandante)
- ocorrencias_mensais.csv
  576 linhas · 12 meses (fev/2025–jan/2026) · 8 bairros · 6 tipos
  Colunas: Ano_Mes; Bairro; Regional; Tipo_Ocorrencia; Ocorrencias; Vitimas;
           Valor_Apreendido_RS; Tempo_Resposta_Medio_Min
  Total de ocorrências no período: 11.399

--------------------------------------------------------------------------------
Sugestão de uso em aula
- Manhã (Módulo 4): abrir o BRUTO. aplicar validação/limpeza no Excel. remover
  duplicatas (sempre em cópia!). chegar perto do LIMPO. Depois usar o painel/
  para escolher o gráfico certo e montar o mini-painel.
- Tarde (Módulo 5): repetir a limpeza do BRUTO no Power Query (passos gravados).
  consolidar a pasta consolidacao_pasta/. discutir Excel vs Power BI.
