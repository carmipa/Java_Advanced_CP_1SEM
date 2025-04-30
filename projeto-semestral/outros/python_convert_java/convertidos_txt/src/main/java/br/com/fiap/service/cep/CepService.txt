package br.com.fiap.service.cep;

import br.com.fiap.model.Endereco;
import org.slf4j.Logger; // Usar SLF4J para logging (padrão Spring)
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired; // Para injeção
import org.springframework.stereotype.Service; // Marca como um Service Bean
import org.springframework.web.client.HttpClientErrorException; // Exceção do RestTemplate
import org.springframework.web.client.RestTemplate; // Cliente HTTP do Spring

@Service // 1. Marca esta classe como um Bean de Serviço do Spring
public class CepService {

    private static final Logger log = LoggerFactory.getLogger(CepService.class);
    private static final String VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/"; // Usa placeholder {cep}

    // 2. Injeta o Bean RestTemplate que configuramos anteriormente
    private final RestTemplate restTemplate;

    @Autowired
    public CepService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Busca um endereço na API ViaCEP dado um CEP.
     *
     * @param cep O CEP a ser buscado (apenas números).
     * @return Um objeto Endereco preenchido ou null se não encontrado ou erro.
     */
    public Endereco buscarEnderecoPorCep(String cep) {
        // Remove caracteres não numéricos do CEP, se houver
        String cepNumerico = cep != null ? cep.replaceAll("[^0-9]", "") : "";
        if (cepNumerico.length() != 8) {
            log.warn("CEP inválido fornecido: {}", cep);
            return null; // Retorna null ou lança exceção de CEP inválido
        }

        log.info("Buscando endereço para o CEP: {}", cepNumerico);
        try {
            // 3. Usa restTemplate.getForObject para fazer a chamada GET
            // O Spring (com Jackson) automaticamente converte o JSON de resposta para o objeto Endereco
            Endereco endereco = restTemplate.getForObject(VIACEP_URL, Endereco.class, cepNumerico);

            // ViaCEP retorna um objeto com campos nulos se o CEP não existe,
            // mas às vezes retorna um {"erro": true}. A verificação do logradouro é uma forma.
            if (endereco != null && endereco.getLogradouro() != null) {
                log.info("Endereço encontrado para CEP {}: {}", cepNumerico, endereco.getLogradouro());
                // Importante: Como este Endereco veio da API, ele NÃO tem um ID do seu banco.
                // Ele precisará ser salvo (persistido) separadamente se for um novo endereço.
                endereco.setCodigo(null); // Garante que não tem ID ao vir da API externa
                return endereco;
            } else {
                log.warn("CEP {} não encontrado na base do ViaCEP.", cepNumerico);
                return null;
            }
        } catch (HttpClientErrorException e) {
            // Erros como 404, 400 etc.
            log.error("Erro HTTP ao buscar CEP {}: {} - {}", cepNumerico, e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            // Outros erros (rede, parsing, etc.)
            log.error("Erro inesperado ao buscar CEP {}: {}", cepNumerico, e.getMessage());
            return null;
        }
    }
}