package br.com.fiap.lojaMedieval.controller;

import br.com.fiap.lojaMedieval.model.Item;
import br.com.fiap.lojaMedieval.repository.ItemRepository;
import br.com.fiap.lojaMedieval.repository.PersonagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/itens")
public class ItemController {

    @Autowired
    ItemRepository itemRepository;

    @Autowired
    PersonagemRepository personagemRepository;

    @GetMapping
    public List<Item> listar() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> buscarPorId(@PathVariable Long id) {
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nome")
    public List<Item> buscarPorNome(@RequestParam String nome) {
        return itemRepository.findByNomeContainingIgnoreCase(nome);
    }

    @GetMapping("/tipo")
    public List<Item> buscarPorTipo(@RequestParam String tipo) {
        return itemRepository.findByTipoIgnoreCase(tipo);
    }

    @GetMapping("/preco")
    public List<Item> buscarPorPreco(@RequestParam double min, @RequestParam double max) {
        if (min > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preço mínimo não pode ser maior que o preço máximo");
        }
        return itemRepository.findByPrecoBetween(min, max);
    }

    @GetMapping("/raridade")
    public List<Item> buscarPorRaridade(@RequestParam String raridade) {
        return itemRepository.findByRaridadeIgnoreCase(raridade);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item cadastrar(@RequestBody Item item) {
        if (item.getDono() != null && item.getDono().getId() != null) {
            personagemRepository.findById(item.getDono().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem (dono) não encontrado"));
        } else {
            item.setDono(null);
        }
        return itemRepository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> atualizar(@PathVariable Long id, @RequestBody Item itemAtualizado) {
        if (itemAtualizado.getDono() != null && itemAtualizado.getDono().getId() != null) {
            personagemRepository.findById(itemAtualizado.getDono().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem (dono) não encontrado para atualização"));
        } else {
            itemAtualizado.setDono(null);
        }

        return itemRepository.findById(id)
                .map(itemExistente -> {
                    itemAtualizado.setId(id);
                    itemRepository.save(itemAtualizado);
                    return ResponseEntity.ok(itemAtualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        itemRepository.findById(id)
                .map(item -> {
                    itemRepository.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado"));
    }
}