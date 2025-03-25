package br.com.fiap.DAO.veiculoDAO;

public class VeiculoDaoFactory {

    public static VeiculoDao create(){
        return new VeiculoDAOImpl();
    }
}
