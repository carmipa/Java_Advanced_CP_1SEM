package br.com.fiap.service.pecasService;

public class PecasServiceFactory {

    public static PecasService create(){
        return new PecasServiceImpl();
    }
}
