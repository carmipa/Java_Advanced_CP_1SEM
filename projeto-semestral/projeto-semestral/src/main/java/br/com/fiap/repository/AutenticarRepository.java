package br.com.fiap.repository;

import br.com.fiap.model.autenticar.Autenticar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // Importe Optional

public interface AutenticarRepository extends JpaRepository<Autenticar, Long> {

    // Adicionar este método para buscar um usuário pelo nome de usuário
    Optional<Autenticar> findByUsuario(String usuario);
}