create sequence AGENDAR_ID_AGE_SEQ
    order
    nocache
/

create sequence AO_ID_AO_SEQ
    order
    nocache
/

create sequence AUTENTICAR_ID_AUT_SEQ
    order
    nocache
/

create sequence AV_ID_AV_SEQ
    order
    nocache
/

create sequence CLIENTES_ID_CLI_SEQ
    order
    nocache
/

create sequence CO_ID_CO_SEQ
    order
    nocache
/

create sequence CONTATOS_ID_CONT_SEQ
    order
    nocache
/

create sequence CP_ID_CP_SEQ
    order
    nocache
/

create sequence CV_ID_CV_SEQ
    order
    nocache
/

create sequence ENDERECOS_ID_END_SEQ
    order
    nocache
/

create sequence OFICINAS_ID_OFIC_SEQ
    order
    nocache
/

create sequence OFO_ID_OFO_SEQ
    order
    nocache
/

create sequence OFP_ID_OPE_SEQ
    order
    nocache
/

create sequence ORCAMENTOS_ID_ORC_SEQ
    order
    nocache
/

create sequence OV_ID_OV_SEQ
    order
    nocache
/

create sequence PAGAMENTOS_ID_PAG_SEQ
    order
    nocache
/

create sequence PAO_ID_PAO_SEQ
    order
    nocache
/

create sequence PECAS_ID_PEC_SEQ
    order
    nocache
/

create sequence PV_ID_PV_SEQ
    order
    nocache
/

create sequence VEICULOS_ID_VEI_SEQ
    order
    nocache
/

create table AGENDAR
(
    ID_AGE           NUMBER not null
        constraint AGENDAR_PK
            primary key,
    DATA_AGENDAMENTO DATE   not null,
    OBS_AGENDAMENTO  VARCHAR2(400)
)
    /

create trigger AGENDAR_ID_AGE_TRG
    before insert
    on AGENDAR
    for each row
    when (new.id_age IS NULL)
BEGIN
    :new.id_age := agendar_id_age_seq.nextval;
END;
/

create table AUTENTICAR
(
    ID_AUT  NUMBER        not null
        constraint AUTENTICAR_PK
            primary key,
    USUARIO VARCHAR2(100) not null
        constraint AUTENTICAR_USUARIO_UN
            unique,
    SENHA   VARCHAR2(100) not null
)
    /

create trigger AUTENTICAR_ID_AUT_TRG
    before insert
    on AUTENTICAR
    for each row
    when (new.id_aut IS NULL)
BEGIN
    :new.id_aut := autenticar_id_aut_seq.nextval;
END;
/

create table CONTATOS
(
    ID_CONT NUMBER        not null
        constraint CONTATOS_PK
            primary key,
    CELULAR VARCHAR2(20)  not null,
    EMAIL   VARCHAR2(50)  not null,
    CONTATO VARCHAR2(100) not null
)
    /

create trigger CONTATOS_ID_CONT_TRG
    before insert
    on CONTATOS
    for each row
    when (new.id_cont IS NULL)
BEGIN
    :new.id_cont := contatos_id_cont_seq.nextval;
END;
/

create table ENDERECOS
(
    ID_END      NUMBER        not null
        constraint ENDERECOS_PK
            primary key,
    NUMERO      NUMBER        not null,
    CEP         VARCHAR2(10)  not null,
    LOGRADOURO  VARCHAR2(100) not null,
    BAIRRO      VARCHAR2(100) not null,
    CIDADE      VARCHAR2(100) not null,
    ESTADO      VARCHAR2(50)  not null,
    COMPLEMENTO VARCHAR2(100)
)
    /

create table CLIENTES
(
    ID_CLI                 NUMBER       not null,
    TIPO_CLIENTE           VARCHAR2(2)  not null,
    NOME                   VARCHAR2(50) not null,
    SOBRENOME              VARCHAR2(50) not null,
    SEXO                   VARCHAR2(2)  not null,
    TIPO_DOCUMENTO         VARCHAR2(10) not null,
    NUMERO_DOCUMENTO       VARCHAR2(20) not null,
    DATA_NASCIMENTO        DATE         not null,
    ATIVIDADE_PROFISSIONAL VARCHAR2(50) not null,
    AUTENTICAR_ID_AUT      NUMBER
        constraint CLIENTES_AUTENTICAR_FK
            references AUTENTICAR,
    CONTATOS_ID_CONT       NUMBER
        constraint CLIENTES_CONTATOS_FK
            references CONTATOS,
    ENDERECOS_ID_END       NUMBER       not null
        constraint CLIENTES_ENDERECOS_FK
            references ENDERECOS,
    constraint CLIENTES_PK
        primary key (ID_CLI, ENDERECOS_ID_END)
)
    /

create index IDX_CLIENTES_AUTENTICAR_ID_AUT
    on CLIENTES (AUTENTICAR_ID_AUT)
    /

create index IDX_CLIENTES_CONTATOS_ID_CONT
    on CLIENTES (CONTATOS_ID_CONT)
    /

create index IDX_CLIENTES_ENDERECOS_ID_END
    on CLIENTES (ENDERECOS_ID_END)
    /

create trigger CLIENTES_ID_CLI_TRG
    before insert
    on CLIENTES
    for each row
    when (new.id_cli IS NULL)
BEGIN
    :new.id_cli := clientes_id_cli_seq.nextval;
END;
/

create trigger ENDERECOS_ID_END_TRG
    before insert
    on ENDERECOS
    for each row
    when (new.id_end IS NULL)
BEGIN
    :new.id_end := enderecos_id_end_seq.nextval;
END;
/

create table OFICINAS
(
    ID_OFIC            NUMBER              not null
        constraint OFICINAS_PK
            primary key,
    DATA_OFICINA       DATE                not null,
    DESCRICAO_PROBLEMA VARCHAR2(500)       not null,
    DIAGNOSTICO        VARCHAR2(4000 char) not null,
    PARTES_AFETADAS    VARCHAR2(500)       not null,
    HORAS_TRABALHADAS  VARCHAR2(5)         not null
)
    /

create table AO
(
    ID_AO            NUMBER not null,
    AGENDAR_ID_AGE   NUMBER not null
        constraint AO_AGENDAR_FK
            references AGENDAR,
    OFICINAS_ID_OFIC NUMBER not null
        constraint AO_OFICINAS_FK
            references OFICINAS,
    constraint AO_PK
        primary key (ID_AO, AGENDAR_ID_AGE, OFICINAS_ID_OFIC)
)
    /

create index IDX_AO_AGENDAR_ID_AGE
    on AO (AGENDAR_ID_AGE)
    /

create index IDX_AO_OFICINAS_ID_OFIC
    on AO (OFICINAS_ID_OFIC)
    /

create trigger AO_ID_AO_TRG
    before insert
    on AO
    for each row
    when (new.id_ao IS NULL)
BEGIN
    :new.id_ao := ao_id_ao_seq.nextval;
END;
/

create trigger OFICINAS_ID_OFIC_TRG
    before insert
    on OFICINAS
    for each row
    when (new.id_ofic IS NULL)
BEGIN
    :new.id_ofic := oficinas_id_ofic_seq.nextval;
END;
/

create table ORCAMENTOS
(
    ID_ORC           NUMBER not null
        constraint ORCAMENTOS_PK
            primary key,
    DATA_ORCAMENTO   DATE   not null,
    VALOR_MAODEOBRA  NUMBER not null,
    VALOR_HORA       NUMBER not null,
    QUANTIDADE_HORAS NUMBER not null,
    VALOR_TOTAL      NUMBER not null
)
    /

create table CO
(
    ID_CO                     NUMBER not null,
    CLIENTES_ID_CLI           NUMBER not null,
    ORCAMENTOS_ID_ORC         NUMBER not null
        constraint CO_ORCAMENTOS_FK
            references ORCAMENTOS,
    CLIENTES_ENDERECOS_ID_END NUMBER not null,
    constraint CO_PK
        primary key (ID_CO, CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END, ORCAMENTOS_ID_ORC),
    constraint CO_CLIENTES_FK
        foreign key (CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END) references CLIENTES
)
    /

create index IDX_CO_CLIENTES_ENDERECOS_ID_END
    on CO (CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END)
    /

create index IDX_CO_ORCAMENTOS_ID_ORC
    on CO (ORCAMENTOS_ID_ORC)
    /

create trigger CO_ID_CO_TRG
    before insert
    on CO
    for each row
    when (new.id_co IS NULL)
BEGIN
    :new.id_co := co_id_co_seq.nextval;
END;
/

create table OFO
(
    ID_OFO            NUMBER not null,
    OFICINAS_ID_OFIC  NUMBER not null
        constraint OFO_OFICINAS_FK
            references OFICINAS,
    ORCAMENTOS_ID_ORC NUMBER not null
        constraint OFO_ORCAMENTOS_FK
            references ORCAMENTOS,
    constraint OFO_PK
        primary key (ID_OFO, OFICINAS_ID_OFIC, ORCAMENTOS_ID_ORC)
)
    /

create index IDX_OFO_OFICINAS_ID_OFIC
    on OFO (OFICINAS_ID_OFIC)
    /

create index IDX_OFO_ORCAMENTOS_ID_ORC
    on OFO (ORCAMENTOS_ID_ORC)
    /

create trigger OFO_ID_OFO_TRG
    before insert
    on OFO
    for each row
    when (new.id_ofo IS NULL)
BEGIN
    :new.id_ofo := ofo_id_ofo_seq.nextval;
END;
/

create trigger ORCAMENTOS_ID_ORC_TRG
    before insert
    on ORCAMENTOS
    for each row
    when (new.id_orc IS NULL)
BEGIN
    :new.id_orc := orcamentos_id_orc_seq.nextval;
END;
/

create table PAGAMENTOS
(
    ID_PAG                   NUMBER       not null
        constraint PAGAMENTOS_PK
            primary key,
    DATA_PAGAMENTO           DATE         not null,
    TIPO_PAGAMENTO           VARCHAR2(20) not null,
    DESCONTO                 NUMBER       not null,
    TOTAL_PARCELAS           VARCHAR2(5)  not null,
    VALOR_PARCELAS           NUMBER       not null,
    TOTAL_PAGAMENTO_DESCONTO NUMBER       not null
)
    /

create table CP
(
    ID_CP                     NUMBER not null,
    CLIENTES_ID_CLI           NUMBER not null,
    PAGAMENTOS_ID_PAG         NUMBER not null
        constraint CP_PAGAMENTOS_FK
            references PAGAMENTOS,
    CLIENTES_ENDERECOS_ID_END NUMBER not null,
    constraint CP_PK
        primary key (ID_CP, CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END, PAGAMENTOS_ID_PAG),
    constraint CP_CLIENTES_FK
        foreign key (CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END) references CLIENTES
)
    /

create index IDX_CP_CLIENTES_ENDERECOS_ID_END
    on CP (CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END)
    /

create index IDX_CP_PAGAMENTOS_ID_PAG
    on CP (PAGAMENTOS_ID_PAG)
    /

create trigger CP_ID_CP_TRG
    before insert
    on CP
    for each row
    when (new.id_cp IS NULL)
BEGIN
    :new.id_cp := cp_id_cp_seq.nextval;
END;
/

create trigger PAGAMENTOS_ID_PAG_TRG
    before insert
    on PAGAMENTOS
    for each row
    when (new.id_pag IS NULL)
BEGIN
    :new.id_pag := pagamentos_id_pag_seq.nextval;
END;
/

create table PAO
(
    ID_PAO            NUMBER not null,
    ORCAMENTOS_ID_ORC NUMBER not null
        constraint PAO_ORCAMENTOS_FK
            references ORCAMENTOS,
    PAGAMENTOS_ID_PAG NUMBER not null
        constraint PAO_PAGAMENTOS_FK
            references PAGAMENTOS,
    constraint PAO_PK
        primary key (ID_PAO, ORCAMENTOS_ID_ORC, PAGAMENTOS_ID_PAG)
)
    /

create index IDX_PAO_ORCAMENTOS_ID_ORC
    on PAO (ORCAMENTOS_ID_ORC)
    /

create index IDX_PAO_PAGAMENTOS_ID_PAG
    on PAO (PAGAMENTOS_ID_PAG)
    /

create trigger PAO_ID_PAO_TRG
    before insert
    on PAO
    for each row
    when (new.id_pao IS NULL)
BEGIN
    :new.id_pao := pao_id_pao_seq.nextval;
END;
/

create table PECAS
(
    ID_PEC         NUMBER       not null
        constraint PECAS_PK
            primary key,
    TIPO_VEICULO   VARCHAR2(10) not null,
    FABRICANTE     VARCHAR2(50) not null,
    DESCRICA_PECA  VARCHAR2(50) not null,
    DATA_COMPRA    DATE         not null,
    PRECO          NUMBER       not null,
    DESCONTO       NUMBER       not null,
    TOTAL_DESCONTO NUMBER       not null
)
    /

create table OFP
(
    ID_OPE           NUMBER not null,
    OFICINAS_ID_OFIC NUMBER not null
        constraint OFP_OFICINAS_FK
            references OFICINAS,
    PECAS_ID_PEC     NUMBER not null
        constraint OFP_PECAS_FK
            references PECAS,
    constraint OFP_PK
        primary key (ID_OPE, OFICINAS_ID_OFIC, PECAS_ID_PEC)
)
    /

create index IDX_OFP_OFICINAS_ID_OFIC
    on OFP (OFICINAS_ID_OFIC)
    /

create index IDX_OFP_PECAS_ID_PEC
    on OFP (PECAS_ID_PEC)
    /

create trigger OFP_ID_OPE_TRG
    before insert
    on OFP
    for each row
    when (new.id_ope IS NULL)
BEGIN
    :new.id_ope := ofp_id_ope_seq.nextval;
END;
/

create trigger PECAS_ID_PEC_TRG
    before insert
    on PECAS
    for each row
    when (new.id_pec IS NULL)
BEGIN
    :new.id_pec := pecas_id_pec_seq.nextval;
END;
/

create table VEICULOS
(
    ID_VEI         NUMBER        not null
        constraint T_VEICULOS_PK
            primary key,
    TIPO_VEICULO   VARCHAR2(15)  not null,
    RENAVAM        VARCHAR2(13)  not null,
    PLACA          VARCHAR2(7)   not null,
    MODELO         VARCHAR2(100) not null,
    PROPRIETARIO   VARCHAR2(50)  not null,
    MONTADORA      VARCHAR2(100) not null,
    COR            VARCHAR2(50)  not null,
    MOTOR          VARCHAR2(50)  not null,
    ANO_FABRICACAO DATE          not null
)
    /

create table AV
(
    ID_AV             NUMBER not null,
    AGENDAR_ID_AGE    NUMBER not null
        constraint AV_AGENDAR_FK
            references AGENDAR,
    T_VEICULOS_ID_VEI NUMBER not null
        constraint AV_T_VEICULOS_FK
            references VEICULOS,
    constraint AV_PK
        primary key (ID_AV, AGENDAR_ID_AGE, T_VEICULOS_ID_VEI)
)
    /

create index IDX_AV_AGENDAR_ID_AGE
    on AV (AGENDAR_ID_AGE)
    /

create index IDX_AV_T_VEICULOS_ID_VEI
    on AV (T_VEICULOS_ID_VEI)
    /

create trigger AV_ID_AV_TRG
    before insert
    on AV
    for each row
    when (new.id_av IS NULL)
BEGIN
    :new.id_av := av_id_av_seq.nextval;
END;
/

create table CV
(
    ID_CV                     NUMBER not null,
    CLIENTES_ID_CLI           NUMBER not null,
    T_VEICULOS_ID_VEI         NUMBER not null
        constraint CV_T_VEICULOS_FK
            references VEICULOS,
    CLIENTES_ENDERECOS_ID_END NUMBER not null,
    constraint CV_PK
        primary key (ID_CV, CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END, T_VEICULOS_ID_VEI),
    constraint CV_CLIENTES_FK
        foreign key (CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END) references CLIENTES
)
    /

create index IDX_CV_CLIENTES_ENDERECOS_ID_END
    on CV (CLIENTES_ID_CLI, CLIENTES_ENDERECOS_ID_END)
    /

create index IDX_CV_T_VEICULOS_ID_VEI
    on CV (T_VEICULOS_ID_VEI)
    /

create trigger CV_ID_CV_TRG
    before insert
    on CV
    for each row
    when (new.id_cv IS NULL)
BEGIN
    :new.id_cv := cv_id_cv_seq.nextval;
END;
/

create table OV
(
    ID_OV             NUMBER not null,
    T_VEICULOS_ID_VEI NUMBER not null
        constraint OV_T_VEICULOS_FK
            references VEICULOS,
    OFICINAS_ID_OFIC  NUMBER not null
        constraint OV_OFICINAS_FK
            references OFICINAS,
    constraint OV_PK
        primary key (ID_OV, T_VEICULOS_ID_VEI, OFICINAS_ID_OFIC)
)
    /

create index IDX_OV_OFICINAS_ID_OFIC
    on OV (OFICINAS_ID_OFIC)
    /

create index IDX_OV_T_VEICULOS_ID_VEI
    on OV (T_VEICULOS_ID_VEI)
    /

create trigger OV_ID_OV_TRG
    before insert
    on OV
    for each row
    when (new.id_ov IS NULL)
BEGIN
    :new.id_ov := ov_id_ov_seq.nextval;
END;
/

create table PV
(
    ID_PV             NUMBER not null,
    T_VEICULOS_ID_VEI NUMBER not null
        constraint PV_T_VEICULOS_FK
            references VEICULOS,
    PECAS_ID_PEC      NUMBER not null
        constraint PV_PECAS_FK
            references PECAS,
    constraint PV_PK
        primary key (ID_PV, T_VEICULOS_ID_VEI, PECAS_ID_PEC)
)
    /

create index IDX_PV_PECAS_ID_PEC
    on PV (PECAS_ID_PEC)
    /

create index IDX_PV_T_VEICULOS_ID_VEI
    on PV (T_VEICULOS_ID_VEI)
    /

create trigger PV_ID_PV_TRG
    before insert
    on PV
    for each row
    when (new.id_pv IS NULL)
BEGIN
    :new.id_pv := pv_id_pv_seq.nextval;
END;
/

create trigger VEICULOS_ID_VEI_TRG
    before insert
    on VEICULOS
    for each row
    when (new.id_vei IS NULL)
BEGIN
    :new.id_vei := veiculos_id_vei_seq.nextval;
END;
/

