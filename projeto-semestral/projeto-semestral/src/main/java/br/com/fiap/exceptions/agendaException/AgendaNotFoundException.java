package br.com.fiap.exceptions.agendaException;

public class AgendaNotFoundException extends Exception{

    public AgendaNotFoundException(String message) {
        super(message);
    }

    public AgendaNotFoundException(String message, Throwable cause){
        super(message, cause);
    }
}
