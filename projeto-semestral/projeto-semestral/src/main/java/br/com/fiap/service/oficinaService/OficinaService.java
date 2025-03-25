package br.com.fiap.service.oficinaService;

import br.com.fiap.DAO.oficinaDAO.OficinaDao;
import br.com.fiap.exceptions.oficinaException.OficinaNotFoundException;
import br.com.fiap.exceptions.oficinaException.OficinaNotSavedException;
import br.com.fiap.exceptions.oficinaException.OficinaUnsupportedServiceOperationExcept;
import br.com.fiap.model.Oficina;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface OficinaService {

    Oficina create(Oficina oficina) throws OficinaUnsupportedServiceOperationExcept, SQLException, OficinaNotSavedException;

    List<Oficina> findall();

    Oficina update (Oficina oficina) throws OficinaNotFoundException, SQLException;

    void deleteById(Long id) throws OficinaNotFoundException, SQLException;


}
