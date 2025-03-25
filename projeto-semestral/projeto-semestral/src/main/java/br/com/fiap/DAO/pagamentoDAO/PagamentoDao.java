package br.com.fiap.DAO.pagamentoDAO;

import br.com.fiap.exceptions.pagamentoException.PagamentoNotFoundException;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotSavedException;
import br.com.fiap.model.Pagamento;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface PagamentoDao {

    List<Pagamento> findAll();

    void deleteById(Long id, Connection connection) throws PagamentoNotFoundException, SQLException;

    Pagamento save(Pagamento pagamento, Connection connection) throws SQLException, PagamentoNotSavedException;

    Pagamento update(Pagamento pagamento, Connection connection) throws PagamentoNotFoundException, SQLException;


}
