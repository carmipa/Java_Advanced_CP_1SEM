package br.com.fiap.DAO.agendaDAO;

import br.com.fiap.exceptions.agendaException.AgendaNotFoundException;
import br.com.fiap.exceptions.agendaException.AgendaNotSavedException;
import br.com.fiap.model.Agenda;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface AgendaDao {

    List<Agenda> findAll();

    void deleteById(Long id, Connection connection) throws AgendaNotFoundException, SQLException;

    Agenda save(Agenda agenda, Connection connection) throws SQLException, AgendaNotSavedException;

    Agenda update(Agenda agenda, Connection connection) throws AgendaNotFoundException, SQLException;


}
