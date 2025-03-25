package br.com.fiap.DAO.pecasDAO;

public class PecasDaoFactory {

    public static PecasDao create(){
        return new PecasDAOImpl();
    }
}
