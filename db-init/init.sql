CREATE TYPE status_intencao AS ENUM ('pendente', 'aprovada', 'rejeitada');
CREATE TYPE status_indicacao AS ENUM ('enviada', 'em_andamento', 'fechada', 'rejeitada');
CREATE TYPE status_fatura AS ENUM ('pendente', 'paga', 'vencida');
CREATE TYPE tipo_usuario AS ENUM ('membro', 'admin');

CREATE TABLE intencoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    empresa VARCHAR(255),
    motivo TEXT,
    status status_intencao DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    empresa VARCHAR(255),
    tipo tipo_usuario DEFAULT 'membro',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    intencao_id UUID REFERENCES intencoes(id),
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    usado_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reunioes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    topico VARCHAR(255),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE presencas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reuniao_id UUID NOT NULL REFERENCES reunioes(id) ON DELETE CASCADE,
    checkin BOOLEAN DEFAULT false,
    UNIQUE(usuario_id, reuniao_id)
);

CREATE TABLE indicacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_indicador UUID NOT NULL REFERENCES usuarios(id),
    id_indicado UUID NOT NULL REFERENCES usuarios(id),
    contato_nome VARCHAR(255) NOT NULL,
    descricao_oportunidade TEXT,
    status status_indicacao DEFAULT 'enviada',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agradecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_agradecedor UUID NOT NULL REFERENCES usuarios(id),
    id_agradecido UUID NOT NULL REFERENCES usuarios(id),
    mensagem TEXT,
    indicacao_id UUID REFERENCES indicacoes(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE encontros_1a1 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro1_id UUID NOT NULL REFERENCES usuarios(id),
    membro2_id UUID NOT NULL REFERENCES usuarios(id),
    data_encontro DATE NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE faturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    valor DECIMAL(10, 2) NOT NULL,
    vencimento DATE NOT NULL,
    status status_fatura DEFAULT 'pendente',
    pago_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);