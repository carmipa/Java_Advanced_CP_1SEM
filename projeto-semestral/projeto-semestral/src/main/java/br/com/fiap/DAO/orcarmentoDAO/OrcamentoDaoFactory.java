package br.com.fiap.DAO.orcarmentoDAO;

public class OrcamentoDaoFactory {

    public static OrcamentoDao create(){
        return new OrcamentoDAOImpl();
    }
}
