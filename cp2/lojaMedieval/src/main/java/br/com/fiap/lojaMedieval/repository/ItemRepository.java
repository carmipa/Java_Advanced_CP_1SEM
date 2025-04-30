package br.com.fiap.lojaMedieval.repository;

import br.com.fiap.lojaMedieval.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByNomeContainingIgnoreCase(String nome);

    List<Item> findByTipoIgnoreCase(String tipo);

    List<Item> findByPrecoBetween(double precoMin, double precoMax);

    List<Item> findByRaridadeIgnoreCase(String raridade);

}