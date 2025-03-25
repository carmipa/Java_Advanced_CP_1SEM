package br.com.fiap.DAO.oficinaDAO;

import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.oficinaException.OficinaNotFoundException;
import br.com.fiap.exceptions.oficinaException.OficinaNotSavedException;
import br.com.fiap.model.Oficina;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class OficinaDAOImpl implements OficinaDao {

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    @Override
    public List<Oficina> findAll() {

        final List<Oficina> all = new ArrayList<>();
        final String sql = "SELECT * FROM OFICINAS";
        try (Connection conn = DatabaseConnectionFactory.create().get();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet resultSet = stmt.executeQuery()) {

            while (resultSet.next()) {
                String dataOficinaStr = null;
                Date dataOficina = resultSet.getDate("DATA_OFICINA");
                if (dataOficina != null) {
                    dataOficinaStr = new SimpleDateFormat("yyyy-MM-dd").format(dataOficina);
                }

                Oficina oficina = new Oficina(
                        dataOficinaStr,
                        resultSet.getString("DESCRICAO_PROBLEMA"),
                        resultSet.getLong("ID_OFIC"),
                        resultSet.getString("DIAGNOSTICO"),
                        resultSet.getString("PARTES_AFETADAS"),
                        resultSet.getInt("HORAS_TRABALHADAS"));
                all.add(oficina);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao buscar oficinas: " + e.getMessage());
            throw new RuntimeException("Erro ao buscar oficinas", e);
        }
        return all;
    }

    @Override
    public void deleteById(Long id, Connection connection) throws OficinaNotFoundException {
        final String sql = "DELETE FROM OFICINAS WHERE ID_OFIC = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new OficinaNotFoundException("Oficina com ID " + id + " não encontrada para exclusão.");
            }
        } catch (SQLException e) {
            logger.severe("Erro ao deletar a oficina: " + e.getMessage());
            throw new OficinaNotFoundException("Erro ao deletar a oficina: " + e.getMessage(), e);
        }
    }

    @Override
    public Oficina save(Oficina oficina, Connection connection) throws OficinaNotSavedException {
        final String sql = "INSERT INTO OFICINAS (DATA_OFICINA, DESCRICAO_PROBLEMA, DIAGNOSTICO, PARTES_AFETADAS, HORAS_TRABALHADAS) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            // Converter dataOficina de String para java.sql.Date
            if (oficina.getDataOficina() != null && !oficina.getDataOficina().isEmpty()) {
                try {
                    Date dataOficina = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(oficina.getDataOficina()).getTime());
                    stmt.setDate(1, dataOficina);
                } catch (ParseException e) {
                    throw new OficinaNotSavedException("Formato de data de oficina inválido. Use 'yyyy-MM-dd'.");
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setString(2, oficina.getDescricaoProblema());
            stmt.setString(3, oficina.getDiagnostico());
            stmt.setString(4, oficina.getPartesAfetadas());
            stmt.setInt(5, oficina.getHorasTrabalhadas());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new OficinaNotSavedException("Não foi possível salvar a oficina.");
            }

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    oficina.setCodigo(id);
                } else {
                    throw new OficinaNotSavedException("Falha ao obter o ID da oficina gerada.");
                }
            }

            return oficina;
        } catch (SQLException e) {
            throw new OficinaNotSavedException("Erro ao salvar a oficina: " + e.getMessage(), e);
        }
    }

    @Override
    public Oficina update(Oficina oficina, Connection connection) throws OficinaNotFoundException {
        final String sql = "UPDATE OFICINAS SET DATA_OFICINA = ?, DESCRICAO_PROBLEMA = ?, DIAGNOSTICO = ?, PARTES_AFETADAS = ?, HORAS_TRABALHADAS = ? WHERE ID_OFIC = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {

            // Converter dataOficina de String para java.sql.Date
            if (oficina.getDataOficina() != null && !oficina.getDataOficina().isEmpty()) {
                try {
                    Date dataOficina = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(oficina.getDataOficina()).getTime());
                    stmt.setDate(1, dataOficina);
                } catch (ParseException e) {
                    throw new OficinaNotFoundException("Formato de data de oficina inválido. Use 'yyyy-MM-dd'.");
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setString(2, oficina.getDescricaoProblema());
            stmt.setString(3, oficina.getDiagnostico());
            stmt.setString(4, oficina.getPartesAfetadas());
            stmt.setInt(5, oficina.getHorasTrabalhadas());
            stmt.setLong(6, oficina.getCodigo());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new OficinaNotFoundException("Oficina com ID " + oficina.getCodigo() + " não encontrada para atualização.");
            }
            return oficina;
        } catch (SQLException e) {
            throw new OficinaNotFoundException("Erro ao atualizar a oficina: " + e.getMessage(), e);
        }
    }
}
