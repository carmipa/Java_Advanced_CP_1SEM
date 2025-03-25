package br.com.fiap.service.orcamentoService;


public class OrcamentoServiceFactory {

    public static OrcamentoService create(){
        return new OrcamentoServiceImpl();
    }



}
