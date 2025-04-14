package br.com.fiap.service.clientesService;

public class ClientesServiceFactory {

    private ClientesServiceFactory() {
    }

    public static ClientesService create() {
        return new ClientesServiceImpl();
    }
}