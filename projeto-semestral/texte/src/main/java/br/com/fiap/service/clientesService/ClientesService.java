package br.com.fiap.service.clientesService;



import br.com.fiap.exceptions.clientesException.ClientesNotFoundException;
import br.com.fiap.exceptions.clientesException.ClientesNotSavedException;
import br.com.fiap.exceptions.clientesException.ClientesUnsupportedServiceOperationExcept;
import br.com.fiap.model.Clientes;

import java.sql.SQLException;
import java.util.List;

public interface ClientesService {

    Clientes create(Clientes clientes) throws ClientesUnsupportedServiceOperationExcept, SQLException, ClientesNotSavedException;

    List<Clientes> findAll();

    Clientes update(Clientes clientes) throws ClientesNotFoundException, SQLException;

    void deleteById(Long id) throws ClientesNotFoundException, SQLException;
}
