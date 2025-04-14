package br.com.fiap.exceptions.agendaException;

public class AgendaNotSavedException extends Exception{


    public AgendaNotSavedException(String message) {
        super(message);
    }

    public AgendaNotSavedException(String message, Throwable cause){
        super(message, cause);
    }
}
