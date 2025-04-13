package br.com.fiap.DAO.orcarmentoDAO;

import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotFoundException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotSavedException;
import br.com.fiap.model.Orcamento;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class OrcamentoDAOImpl implements OrcamentoDao {

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    @Override
    public List<Orcamento> findAll() {
        final List<Orcamento> all = new ArrayList<>();
        final String sql = "SELECT * FROM ORCAMENTOS";
        try (Connection conn = DatabaseConnectionFactory.create().get();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet resultSet = stmt.executeQuery()) {

            while (resultSet.next()) {
                String dataOrcamentoStr = null;
                Date dataOrcamento = resultSet.getDate("DATA_ORCAMENTO");
                if (dataOrcamento != null) {
                    dataOrcamentoStr = new SimpleDateFormat("yyyy-MM-dd").format(dataOrcamento);
                }

                Orcamento orcamento = new Orcamento(
                        resultSet.getLong("ID_ORC"),
                        resultSet.getDouble("VALOR_TOTAL"),
                        resultSet.getInt("QUANTIDADE_HORAS"),
                        resultSet.getDouble("VALOR_HORA"),
                        resultSet.getDouble("VALOR_MAODEOBRA"),
                        dataOrcamentoStr);
                all.add(orcamento);
            }
        } catch (SQLException e) {
            logger.warning("Não foi possível localizar nenhum registro de orçamentos: " + e.getMessage());
        }
        return all;
    }

    @Override
    public void deleteById(Long id, Connection connection) throws OrcamentoNotFoundException, SQLException {
        final String sql = "DELETE FROM ORCAMENTOS WHERE ID_ORC = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new OrcamentoNotFoundException("Orçamento com ID " + id + " não encontrado para exclusão.");
            }
        }
    }

    @Override
    public Orcamento save(Orcamento orcamento, Connection connection) throws SQLException, OrcamentoNotSavedException {
        final String sql = "INSERT INTO ORCAMENTOS (DATA_ORCAMENTO, VALOR_MAODEOBRA, VALOR_HORA, QUANTIDADE_HORAS, VALOR_TOTAL) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            // Converter dataOrcamento de String para java.sql.Date
            if (orcamento.getDataOrcamento() != null && !orcamento.getDataOrcamento().isEmpty()) {
                try {
                    Date dataOrcamento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(orcamento.getDataOrcamento()).getTime());
                    stmt.setDate(1, dataOrcamento);
                } catch (ParseException e) {
                    throw new OrcamentoNotSavedException("Formato de data de orçamento inválido. Use 'yyyy-MM-dd'.");
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setDouble(2, orcamento.getMaoDeObra());
            stmt.setDouble(3, orcamento.getValorHora());
            stmt.setInt(4, orcamento.getQuantidadeHoras());
            stmt.setDouble(5, orcamento.getValorTotal());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new OrcamentoNotSavedException("Não foi possível salvar o orçamento.");
            }

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    orcamento.setCodigo(id);
                } else {
                    throw new OrcamentoNotSavedException("Falha ao obter o ID do orçamento gerado.");
                }
            }
            return orcamento;
        }
    }

    @Override
    public Orcamento update(Orcamento orcamento, Connection connection) throws OrcamentoNotFoundException, SQLException {
        final String sql = "UPDATE ORCAMENTOS SET DATA_ORCAMENTO = ?, VALOR_MAODEOBRA = ?, VALOR_HORA = ?, QUANTIDADE_HORAS = ?, VALOR_TOTAL = ? WHERE ID_ORC = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {

            // Converter dataOrcamento de String para java.sql.Date
            if (orcamento.getDataOrcamento() != null && !orcamento.getDataOrcamento().isEmpty()) {
                try {
                    Date dataOrcamento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(orcamento.getDataOrcamento()).getTime());
                    stmt.setDate(1, dataOrcamento);
                } catch (ParseException e) {
                    throw new OrcamentoNotFoundException("Formato de data de orçamento inválido. Use 'yyyy-MM-dd'.");
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setDouble(2, orcamento.getMaoDeObra());
            stmt.setDouble(3, orcamento.getValorHora());
            stmt.setInt(4, orcamento.getQuantidadeHoras());
            stmt.setDouble(5, orcamento.getValorTotal());
            stmt.setLong(6, orcamento.getCodigo());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new OrcamentoNotFoundException("Orçamento com ID " + orcamento.getCodigo() + " não encontrado para atualização.");
            }
            return orcamento;
        }
    }
}
