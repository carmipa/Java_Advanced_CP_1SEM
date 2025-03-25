package br.com.fiap.service.pagamentoService;

import br.com.fiap.exceptions.pagamentoException.PagamentoNotFoundException;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotSavedException;
import br.com.fiap.exceptions.pagamentoException.PagamentoUnsupportedServiceOperationException;
import br.com.fiap.model.Pagamento;

import java.sql.SQLException;
import java.util.List;

public interface PagamentoService {
    Pagamento create(Pagamento pagamento) throws PagamentoUnsupportedServiceOperationException, SQLException, PagamentoNotSavedException;

    List<Pagamento> findall();

    Pagamento update(Pagamento pagamento) throws PagamentoNotFoundException, SQLException;

    void deleteById(Long id) throws PagamentoNotFoundException, SQLException;






}
