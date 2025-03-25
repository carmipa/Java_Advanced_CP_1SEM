package br.com.fiap.DAO.oficinaDAO;

public class OficinaDaoFactory {

    public static OficinaDao create(){
        return new OficinaDAOImpl();
    }
}
