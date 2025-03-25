package br.com.fiap.externalInterface;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson;
import br.com.fiap.model.Endereco;

public class CepService {

    private static final String VIACEP_URL = "https://viacep.com.br/ws/";

    // Método para buscar o endereço com base no CEP informado
    public static Endereco buscarEnderecoPorCep(String cep) throws IOException, InterruptedException {
        // Cria a URL da API ViaCEP
        String url = VIACEP_URL + cep + "/json/";

        // Cria o cliente HTTP
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        // Faz a requisição e obtém a resposta
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        // Converte a resposta JSON para um objeto de Endereço
        return parseEndereco(response.body());
    }

    // Método para converter a resposta JSON para um objeto de Endereço usando Gson
    private static Endereco parseEndereco(String responseBody) {
        Gson gson = new Gson();
        Endereco endereco = gson.fromJson(responseBody, Endereco.class);

        // Verifica se o CEP retornou erro
        if (endereco.getLogradouro() == null) {
            System.out.println("CEP não encontrado.");
            return null;
        }

        return endereco;
    }
}
