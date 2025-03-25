package br.com.fiap.DAO.clientesDAO;

public class ClientesDaoFactory {

    public static ClientesDao create(){
        return new ClientesDaoImpl();
    }
}
