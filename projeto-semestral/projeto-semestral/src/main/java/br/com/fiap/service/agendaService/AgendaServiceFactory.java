package br.com.fiap.service.agendaService;

public class AgendaServiceFactory {

    private AgendaServiceFactory() {
    }

    public static AgendaService create() {
        return new AgendaServiceImpl();
    }
}
