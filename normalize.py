import csv
import datetime
import os

input_path = r'C:\Users\00662398\Downloads\TESTE IA\Aula 3-20260909T140334Z-1-001\Aula 3\datasets\bruto\ocorrencias_CIOSP_jan2026_BRUTO.csv'
output_path = r'C:\Users\00662398\Downloads\TESTE IA\Aula 3-20260909T140334Z-1-001\Aula 3\datasets\processado\ocorrencias_CIOSP_jan2026_NORMALIZADO.csv'

def clean_valor(v):
    if not v:
        return 0.0
    v = str(v).strip().replace('R$', '').replace('.', '').replace(',', '.').replace('-', '')
    try:
        return float(v) if v else 0.0
    except ValueError:
        return 0.0

def parse_date(d):
    d = d.strip()
    if not d:
        return ""
    try:
        return datetime.datetime.strptime(d, "%d/%m/%Y %H:%M").strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            return datetime.datetime.strptime(d, "%d/%m/%Y").strftime("%Y-%m-%d 00:00:00")
        except ValueError:
            return d

os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(input_path, 'r', encoding='latin1') as infile, \
     open(output_path, 'w', encoding='utf-8-sig', newline='') as outfile:
    
    infile.readline()
    infile.readline()
    
    reader = csv.reader(infile, delimiter=';')
    writer = csv.writer(outfile, delimiter=';')
    
    header = next(reader)
    writer.writerow(['Num_BO', 'Data_Hora', 'Bairro_Regiao', 'Tipo_Ocorrencia', 'Qtd_Vitimas', 'Idade_Vitima', 'Valor_Apreendido_R$'])
    
    for row in reader:
        if not row or not any(row):
            continue
        if len(row) < 7:
            row.extend([''] * (7 - len(row)))
            
        num_bo = row[0].strip()
        data_hora = parse_date(row[1])
        
        # Correção de Bairros
        bairro = row[2].strip().upper()
        if bairro in ['CTR', 'CENTRO']: bairro = 'CENTRO'
        elif bairro in ['C.P.A.', 'CPA ']: bairro = 'CPA'
        elif bairro in ['GDE TERCEIRO']: bairro = 'GRANDE TERCEIRO'
        elif bairro in ['PEDRA90']: bairro = 'PEDRA 90'
        elif 'COXIP' in bairro: bairro = 'COXIPO'
            
        # Correção de Ocorrências
        tipo = row[3].strip().upper()
        if tipo in ['ROUB.', 'ROUBO']: tipo = 'ROUBO'
        elif 'LES' in tipo and 'CORP' in tipo: tipo = 'LESAO CORPORAL'
        elif tipo == 'LESÃO' or tipo == 'LESAO' or 'LES' in tipo: tipo = 'LESAO CORPORAL'
        elif 'HOMIC' in tipo: tipo = 'HOMICIDIO'
        elif 'TRAF' in tipo or tipo == 'TRAFICO': tipo = 'TRAFICO DE DROGAS'
        elif 'LATROC' in tipo: tipo = 'LATROCINIO'
        elif 'FURTO' in tipo: tipo = 'FURTO'
        
        try:
            qtd = int(row[4].strip())
        except ValueError:
            qtd = 0
            
        try:
            idade = int(row[5].strip())
            if idade < 0:
                idade = ""
        except ValueError:
            idade = ""
            
        valor = clean_valor(row[6])
        
        # Ignora a linha de TOTAL GERAL
        if 'TOTAL' in num_bo.upper() or 'TOTAL' in tipo.upper():
            continue
            
        writer.writerow([num_bo, data_hora, bairro, tipo, qtd, idade, valor])

print("Normalização concluída. Arquivo salvo em:", output_path)
