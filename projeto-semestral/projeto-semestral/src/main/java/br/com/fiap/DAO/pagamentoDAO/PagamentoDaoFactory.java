package br.com.fiap.DAO.pagamentoDAO;

public class PagamentoDaoFactory {

    public static PagamentoDao create(){
        return new PagamentoDAOImpl();
    }
}
