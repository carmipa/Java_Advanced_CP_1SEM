package br.com.fiap.service.agendaService;


import br.com.fiap.exceptions.agendaException.AgendaNotFoundException;
import br.com.fiap.exceptions.agendaException.AgendaNotSavedException;
import br.com.fiap.exceptions.agendaException.AgendaUnsupportedServiceOperationExcept;
import br.com.fiap.model.Agenda;

import java.sql.SQLException;
import java.util.List;

public interface AgendaService {

    Agenda create(Agenda agenda) throws AgendaUnsupportedServiceOperationExcept, SQLException, AgendaNotSavedException;

    List<Agenda> findAll();

    Agenda update(Agenda agenda) throws AgendaNotFoundException, SQLException;

    void deleteById(Long id) throws AgendaNotFoundException, SQLException;

}
