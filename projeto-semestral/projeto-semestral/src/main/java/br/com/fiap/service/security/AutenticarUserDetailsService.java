package br.com.fiap.service.security;

import br.com.fiap.model.autenticar.Autenticar;
import br.com.fiap.repository.AutenticarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList; // Usaremos uma lista vazia para authorities por enquanto

@Service // Marca esta classe como um serviço gerenciado pelo Spring
public class AutenticarUserDetailsService implements UserDetailsService {

    @Autowired
    private AutenticarRepository autenticarRepository; // Injete seu repositório

    // Método que o Spring Security chama para carregar os detalhes do usuário
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Busca o usuário no seu banco de dados usando o repositório
        // Você precisará adicionar um método findByUsuario(String usuario) no seu AutenticarRepository
        Autenticar autenticar = autenticarRepository.findByUsuario(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));

        // Constrói um objeto UserDetails com os dados do usuário encontrado
        // Por enquanto, não temos papéis/autoridades no seu modelo Autenticar, então usaremos uma lista vazia
        return new User(
                autenticar.getUsuario(), // Nome de usuário
                autenticar.getSenha(),   // Senha (já hashed)
                new ArrayList<>()        // Lista de Authorities/Papéis (vazia por enquanto)
        );
    }
}