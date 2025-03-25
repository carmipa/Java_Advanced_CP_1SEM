package br.com.fiap.service.orcamentoService;

import br.com.fiap.exceptions.orcamentoException.OrcamentoNotFoundException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotSavedException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoUnsupportedServiceOperationException;
import br.com.fiap.model.Orcamento;

import java.sql.SQLException;
import java.util.List;

public interface OrcamentoService {
    Orcamento create(Orcamento orcamento) throws OrcamentoUnsupportedServiceOperationException, SQLException, OrcamentoNotSavedException;

    List<Orcamento> findAll();

    Orcamento update(Orcamento orcamento) throws OrcamentoNotFoundException, SQLException;

    void deleteById(Long id) throws OrcamentoNotFoundException, SQLException;
}
