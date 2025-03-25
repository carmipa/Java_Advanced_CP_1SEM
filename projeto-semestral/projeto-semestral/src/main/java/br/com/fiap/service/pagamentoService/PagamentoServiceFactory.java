package br.com.fiap.service.pagamentoService;

public class PagamentoServiceFactory {

    public static PagamentoService create(){
        return new PagamentoServiceImpl();
    }
}
