package br.com.fiap.DAO.agendaDAO;


public class AgendaDaoFactory {

    public static AgendaDao create(){
        return new AgendaDAOImpl();
    }
}
