package br.com.fiap.DAO.orcarmentoDAO;

import br.com.fiap.exceptions.orcamentoException.OrcamentoNotFoundException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotSavedException;
import br.com.fiap.model.Orcamento;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface OrcamentoDao {

    List<Orcamento> findAll();

    void deleteById(Long id, Connection connection) throws OrcamentoNotFoundException, SQLException;

    Orcamento save(Orcamento orcamento, Connection connection) throws SQLException, OrcamentoNotSavedException;

    Orcamento update(Orcamento orcamento, Connection connection) throws OrcamentoNotFoundException, SQLException;
}
