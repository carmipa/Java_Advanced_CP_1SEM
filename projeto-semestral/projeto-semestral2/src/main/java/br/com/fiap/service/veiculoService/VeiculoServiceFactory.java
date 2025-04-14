package br.com.fiap.service.veiculoService;

public class VeiculoServiceFactory {

    public static VeiculoService create(){
        return new VeiculoServiceImpl();
    }


}
