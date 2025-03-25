package br.com.fiap.service.oficinaService;

import br.com.fiap.model.Oficina;

public class OficinaServiceFactory {

    public static OficinaService create(){
        return new OficinaServiceImpl();
    }
}
