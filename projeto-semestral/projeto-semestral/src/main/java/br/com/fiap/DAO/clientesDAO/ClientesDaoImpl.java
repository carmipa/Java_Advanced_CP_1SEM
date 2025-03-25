package br.com.fiap.DAO.clientesDAO;

import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.clientesException.ClientesNotFoundException;
import br.com.fiap.exceptions.clientesException.ClientesNotSavedException;
import br.com.fiap.model.Clientes;
import br.com.fiap.model.Contato;
import br.com.fiap.model.Endereco;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class ClientesDaoImpl implements ClientesDao {

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    @Override
    public List<Clientes> findAll() {

        final List<Clientes> all = new ArrayList<>();
        final String sql = "SELECT c.*, e.*, co.* FROM CLIENTES c " +
                "INNER JOIN ENDERECOS e ON c.ENDERECOS_ID_END = e.ID_END " +
                "INNER JOIN CONTATOS co ON c.CONTATOS_ID_CONT = co.ID_CONT";
        try (Connection conn = DatabaseConnectionFactory.create().get();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet resultSet = stmt.executeQuery()) {

            while (resultSet.next()) {
                Endereco endereco = new Endereco(
                        resultSet.getLong("ID_END"),
                        resultSet.getInt("NUMERO"),
                        resultSet.getString("CEP"),
                        resultSet.getString("LOGRADOURO"),
                        resultSet.getString("CIDADE"),
                        resultSet.getString("ESTADO"),
                        resultSet.getString("BAIRRO"),
                        resultSet.getString("COMPLEMENTO"));

                Contato contato = new Contato(
                        resultSet.getLong("ID_CONT"),
                        resultSet.getString("CELULAR"),
                        resultSet.getString("EMAIL"),
                        resultSet.getString("CONTATO"));

                String dataNascimentoStr = null;
                Date dataNascimento = resultSet.getDate("DATA_NASCIMENTO");
                if (dataNascimento != null) {
                    dataNascimentoStr = new SimpleDateFormat("yyyy-MM-dd").format(dataNascimento);
                }

                Clientes cliente = new Clientes(
                        resultSet.getLong("ID_CLI"),
                        contato,
                        endereco,
                        resultSet.getString("ATIVIDADE_PROFISSIONAL"),
                        dataNascimentoStr,
                        resultSet.getString("NUMERO_DOCUMENTO"),
                        resultSet.getString("TIPO_DOCUMENTO"),
                        resultSet.getString("SEXO"),
                        resultSet.getString("SOBRENOME"),
                        resultSet.getString("NOME"),
                        resultSet.getString("TIPO_CLIENTE"));
                all.add(cliente);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao buscar clientes: " + e.getMessage());
            throw new RuntimeException("Erro ao buscar clientes", e);
        }
        return all;
    }

    @Override
    public void deleteById(Long id, Connection connection) throws ClientesNotFoundException {
        final String sql = "DELETE FROM CLIENTES WHERE ID_CLI = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new ClientesNotFoundException("Cliente não encontrado com ID: " + id);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao deletar o cliente: " + e.getMessage());
            throw new ClientesNotFoundException("Erro ao deletar o cliente: " + e.getMessage());
        }
    }

    @Override
    public Clientes save(Clientes clientes, Connection connection) throws ClientesNotSavedException {
        try {
            // Salvando Endereco
            final String sqlEndereco = "INSERT INTO ENDERECOS (NUMERO, CEP, LOGRADOURO, CIDADE, ESTADO, BAIRRO, COMPLEMENTO) VALUES (?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmtEndereco = connection.prepareStatement(sqlEndereco, Statement.RETURN_GENERATED_KEYS)) {
                stmtEndereco.setInt(1, clientes.getEndereco().getNumero());
                stmtEndereco.setString(2, clientes.getEndereco().getCep());
                stmtEndereco.setString(3, clientes.getEndereco().getLogradouro());
                stmtEndereco.setString(4, clientes.getEndereco().getCidade());
                stmtEndereco.setString(5, clientes.getEndereco().getEstado());
                stmtEndereco.setString(6, clientes.getEndereco().getBairro());
                stmtEndereco.setString(7, clientes.getEndereco().getComplemento());
                int rows = stmtEndereco.executeUpdate();
                if (rows == 0) {
                    throw new ClientesNotSavedException("Falha ao salvar o Endereço.");
                }
                try (ResultSet rs = stmtEndereco.getGeneratedKeys()) {
                    if (rs.next()) {
                        long enderecoId = rs.getLong(1);
                        clientes.getEndereco().setCodigo(enderecoId);
                    } else {
                        throw new ClientesNotSavedException("Falha ao obter o ID do Endereço gerado.");
                    }
                }
            }

            // Salvando Contato
            final String sqlContato = "INSERT INTO CONTATOS (CELULAR, EMAIL, CONTATO) VALUES (?, ?, ?)";
            try (PreparedStatement stmtContato = connection.prepareStatement(sqlContato, Statement.RETURN_GENERATED_KEYS)) {
                stmtContato.setString(1, clientes.getContato().getCelular());
                stmtContato.setString(2, clientes.getContato().getEmail());
                stmtContato.setString(3, clientes.getContato().getContato());
                int rows = stmtContato.executeUpdate();
                if (rows == 0) {
                    throw new ClientesNotSavedException("Falha ao salvar o Contato.");
                }
                try (ResultSet rs = stmtContato.getGeneratedKeys()) {
                    if (rs.next()) {
                        long contatoId = rs.getLong(1);
                        clientes.getContato().setCodigo(contatoId);
                    } else {
                        throw new ClientesNotSavedException("Falha ao obter o ID do Contato gerado.");
                    }
                }
            }

            // Salvando Cliente
            final String sqlCliente = "INSERT INTO CLIENTES (TIPO_CLIENTE, NOME, SOBRENOME, SEXO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, DATA_NASCIMENTO, ATIVIDADE_PROFISSIONAL, ENDERECOS_ID_END, CONTATOS_ID_CONT) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmtCliente = connection.prepareStatement(sqlCliente, Statement.RETURN_GENERATED_KEYS)) {
                stmtCliente.setString(1, clientes.getTipoCliente());
                stmtCliente.setString(2, clientes.getNome());
                stmtCliente.setString(3, clientes.getSobrenome());
                stmtCliente.setString(4, clientes.getSexo());
                stmtCliente.setString(5, clientes.getTipoDocumento());
                stmtCliente.setString(6, clientes.getNumeroDocumento());

                // Converter dataNascimento de String para java.sql.Date
                if (clientes.getDataNascimento() != null && !clientes.getDataNascimento().isEmpty()) {
                    try {
                        Date dataNascimento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(clientes.getDataNascimento()).getTime());
                        stmtCliente.setDate(7, dataNascimento);
                    } catch (ParseException e) {
                        throw new ClientesNotSavedException("Formato de data de nascimento inválido. Use 'yyyy-MM-dd'.");
                    }
                } else {
                    stmtCliente.setNull(7, Types.DATE);
                }

                stmtCliente.setString(8, clientes.getAtividadeProfissional());
                stmtCliente.setLong(9, clientes.getEndereco().getCodigo());
                stmtCliente.setLong(10, clientes.getContato().getCodigo());
                int rows = stmtCliente.executeUpdate();
                if (rows == 0) {
                    throw new ClientesNotSavedException("Falha ao salvar o Cliente.");
                }
                try (ResultSet rs = stmtCliente.getGeneratedKeys()) {
                    if (rs.next()) {
                        long clienteId = rs.getLong(1);
                        clientes.setCodigo(clienteId);
                    } else {
                        throw new ClientesNotSavedException("Falha ao obter o ID do Cliente gerado.");
                    }
                }
            }

            return clientes;
        } catch (SQLException e) {
            throw new ClientesNotSavedException("Erro ao salvar cliente, endereço ou contato: " + e.getMessage());
        }
    }

    @Override
    public Clientes update(Clientes clientes, Connection connection) throws ClientesNotFoundException {
        try {
            // Atualizando Endereco
            final String sqlEndereco = "UPDATE ENDERECOS SET NUMERO = ?, CEP = ?, LOGRADOURO = ?, CIDADE = ?, ESTADO = ?, BAIRRO = ?, COMPLEMENTO = ? WHERE ID_END = ?";
            try (PreparedStatement stmtEndereco = connection.prepareStatement(sqlEndereco)) {
                stmtEndereco.setInt(1, clientes.getEndereco().getNumero());
                stmtEndereco.setString(2, clientes.getEndereco().getCep());
                stmtEndereco.setString(3, clientes.getEndereco().getLogradouro());
                stmtEndereco.setString(4, clientes.getEndereco().getCidade());
                stmtEndereco.setString(5, clientes.getEndereco().getEstado());
                stmtEndereco.setString(6, clientes.getEndereco().getBairro());
                stmtEndereco.setString(7, clientes.getEndereco().getComplemento());
                stmtEndereco.setLong(8, clientes.getEndereco().getCodigo());
                int rows = stmtEndereco.executeUpdate();
                if (rows == 0) {
                    throw new ClientesNotFoundException("Endereço não encontrado com ID: " + clientes.getEndereco().getCodigo());
                }
            }

            // Atualizando Contato
            final String sqlContato = "UPDATE CONTATOS SET CELULAR = ?, EMAIL = ?, CONTATO = ? WHERE ID_CONT = ?";
            try (PreparedStatement stmtContato = connection.prepareStatement(sqlContato)) {
                stmtContato.setString(1, clientes.getContato().getCelular());
                stmtContato.setString(2, clientes.getContato().getEmail());
                stmtContato.setString(3, clientes.getContato().getContato());
                stmtContato.setLong(4, clientes.getContato().getCodigo());
                int rows = stmtContato.executeUpdate();
                if (rows == 0) {
                    throw new ClientesNotFoundException("Contato não encontrado com ID: " + clientes.getContato().getCodigo());
                }
            }

            // Atualizando Cliente
            final String sqlCliente = "UPDATE CLIENTES SET TIPO_CLIENTE = ?, NOME = ?, SOBRENOME = ?, SEXO = ?, TIPO_DOCUMENTO = ?, NUMERO_DOCUMENTO = ?, DATA_NASCIMENTO = ?, ATIVIDADE_PROFISSIONAL = ?, ENDERECOS_ID_END = ?, CONTATOS_ID_CONT = ? WHERE ID_CLI = ?";
            try (PreparedStatement stmtCliente = connection.prepareStatement(sqlCliente)) {
                stmtCliente.setString(1, clientes.getTipoCliente());
                stmtCliente.setString(2, clientes.getNome());
                stmtCliente.setString(3, clientes.getSobrenome());
                stmtCliente.setString(4, clientes.getSexo());
                stmtCliente.setString(5, clientes.getTipoDocumento());
                stmtCliente.setString(6, clientes.getNumeroDocumento());

                // Converter dataNascimento de String para java.sql.Date
                if (clientes.getDataNascimento() != null && !clientes.getDataNascimento().isEmpty()) {
                    try {
                        Date dataNascimento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(clientes.getDataNascimento()).getTime());
                        stmtCliente.setDate(7, dataNascimento);
                    } catch (ParseException e) {
                        throw new ClientesNotFoundException("Formato de data de nascimento inválido. Use 'yyyy-MM-dd'.");
                    }
                } else {
                    stmtCliente.setNull(7, Types.DATE);
                }

                stmtCliente.setString(8, clientes.getAtividadeProfissional());
                stmtCliente.setLong(9, clientes.getEndereco().getCodigo());
                stmtCliente.setLong(10, clientes.getContato().getCodigo());
                stmtCliente.setLong(11, clientes.getCodigo());
                int rows = stmtCliente.executeUpdate();
                if (rows == 0) {
                    throw new ClientesNotFoundException("Cliente não encontrado com ID: " + clientes.getCodigo());
                }
            }

            return clientes;
        } catch (SQLException e) {
            throw new ClientesNotFoundException("Erro ao atualizar cliente, endereço ou contato: " + e.getMessage());
        }
    }
}
