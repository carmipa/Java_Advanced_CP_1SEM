package br.com.fiap.DAO.veiculoDAO;

import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.veiculoException.VeiculoNotFoundException;
import br.com.fiap.exceptions.veiculoException.VeiculoNotSavedException;
import br.com.fiap.model.Veiculo;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class VeiculoDAOImpl implements VeiculoDao {

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    @Override
    public List<Veiculo> findAll() {
        final List<Veiculo> all = new ArrayList<>();
        final String sql = "SELECT * FROM VEICULOS";
        try (Connection conn = DatabaseConnectionFactory.create().get();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet resultSet = stmt.executeQuery()) {

            while (resultSet.next()) {
                String anoFabricacaoStr = null;
                Date anoFabricacao = resultSet.getDate("ANO_FABRICACAO");
                if (anoFabricacao != null) {
                    anoFabricacaoStr = new SimpleDateFormat("yyyy-MM-dd").format(anoFabricacao);
                }

                Veiculo veiculo = new Veiculo(
                        resultSet.getLong("ID_VEI"),
                        resultSet.getString("TIPO_VEICULO"),
                        resultSet.getString("RENAVAM"),
                        resultSet.getString("PLACA"),
                        resultSet.getString("PROPRIETARIO"),
                        resultSet.getString("MODELO"),
                        resultSet.getString("COR"),
                        resultSet.getString("MONTADORA"),
                        resultSet.getString("MOTOR"),
                        anoFabricacaoStr);
                all.add(veiculo);
            }
        } catch (SQLException e) {
            logger.warning("Não foi possível localizar nenhum registro de veículos: " + e.getMessage());
        }
        return all;
    }

    @Override
    public void deleteById(Long id, Connection connection) throws VeiculoNotFoundException, SQLException {
        final String sql = "DELETE FROM VEICULOS WHERE ID_VEI = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new VeiculoNotFoundException("Veículo com ID " + id + " não encontrado para exclusão.");
            }
        }
    }

    @Override
    public Veiculo save(Veiculo veiculo, Connection connection) throws SQLException, VeiculoNotSavedException {
        final String sql = "INSERT INTO VEICULOS (TIPO_VEICULO, RENAVAM, PLACA, PROPRIETARIO, MODELO, COR, MONTADORA, MOTOR, ANO_FABRICACAO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, veiculo.getTipoVeiculo());
            stmt.setString(2, veiculo.getRenavam());
            stmt.setString(3, veiculo.getPlaca());
            stmt.setString(4, veiculo.getProprietario());
            stmt.setString(5, veiculo.getModelo());
            stmt.setString(6, veiculo.getCor());
            stmt.setString(7, veiculo.getMontadora());
            stmt.setString(8, veiculo.getMotor());

            // Converter anoFabricacao de String para java.sql.Date
            if (veiculo.getAnofabricacao() != null && !veiculo.getAnofabricacao().isEmpty()) {
                try {
                    Date anoFabricacao = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(veiculo.getAnofabricacao()).getTime());
                    stmt.setDate(9, anoFabricacao);
                } catch (ParseException e) {
                    throw new VeiculoNotSavedException("Formato de data de fabricação inválido. Use 'yyyy-MM-dd'.", e);
                }
            } else {
                stmt.setNull(9, Types.DATE);
            }

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new VeiculoNotSavedException("Não foi possível salvar o veículo.");
            }

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    veiculo.setCodigo(id);
                } else {
                    throw new VeiculoNotSavedException("Falha ao obter o ID do veículo gerado.");
                }
            }
            return veiculo;
        }
    }

    @Override
    public Veiculo update(Veiculo veiculo, Connection connection) throws VeiculoNotFoundException, SQLException {
        final String sql = "UPDATE VEICULOS SET TIPO_VEICULO = ?, RENAVAM = ?, PLACA = ?, PROPRIETARIO = ?, MODELO = ?, COR = ?, MONTADORA = ?, MOTOR = ?, ANO_FABRICACAO = ? WHERE ID_VEI = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, veiculo.getTipoVeiculo());
            stmt.setString(2, veiculo.getRenavam());
            stmt.setString(3, veiculo.getPlaca());
            stmt.setString(4, veiculo.getProprietario());
            stmt.setString(5, veiculo.getModelo());
            stmt.setString(6, veiculo.getCor());
            stmt.setString(7, veiculo.getMontadora());
            stmt.setString(8, veiculo.getMotor());

            // Converter anoFabricacao de String para java.sql.Date
            if (veiculo.getAnofabricacao() != null && !veiculo.getAnofabricacao().isEmpty()) {
                try {
                    Date anoFabricacao = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(veiculo.getAnofabricacao()).getTime());
                    stmt.setDate(9, anoFabricacao);
                } catch (ParseException e) {
                    throw new VeiculoNotFoundException("Formato de data de fabricação inválido. Use 'yyyy-MM-dd'.", e);
                }
            } else {
                stmt.setNull(9, Types.DATE);
            }

            stmt.setLong(10, veiculo.getCodigo());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new VeiculoNotFoundException("Veículo com ID " + veiculo.getCodigo() + " não encontrado para atualização.");
            }
            return veiculo;
        }
    }
}
