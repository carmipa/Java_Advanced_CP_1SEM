// --- Arquivo: src/main/java/br/com/fiap/service/relatorio/cliente/RelatorioClienteService.java ---
package br.com.fiap.service.relatorio.cliente;

import br.com.fiap.dto.relatorio.ClienteRelatorioCompletoDTO;

/**
 * Interface para serviços de geração de relatórios específicos de clientes.
 */
public interface RelatorioClienteService {

    /**
     * Busca e compila um relatório completo com todos os dados associados
     * a um cliente, encontrado por ID ou Documento.
     *
     * @param tipoBusca "id" ou "documento"
     * @param valorBusca O valor correspondente (ID_CLI ou CPF/CNPJ)
     * @return Um DTO contendo todas as informações agregadas do cliente.
     * @throws br.com.fiap.exception.ClientesNotFoundException Se o cliente não for encontrado.
     * @throws IllegalArgumentException Se o tipoBusca for inválido ou o valorBusca não for compatível.
     */
    ClienteRelatorioCompletoDTO getRelatorioCompletoCliente(String tipoBusca, String valorBusca);

}