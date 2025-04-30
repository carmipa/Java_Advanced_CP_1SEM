package br.com.fiap.lojaMedieval.controller;

import br.com.fiap.lojaMedieval.model.Personagem;
import br.com.fiap.lojaMedieval.repository.PersonagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/personagens")
public class PersonagemController {

    @Autowired
    PersonagemRepository repository;

    @GetMapping
    public List<Personagem> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Personagem> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/nome")
    public List<Personagem> buscarPorNome(@RequestParam String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    @GetMapping("/classe")
    public List<Personagem> buscarPorClasse(@RequestParam String classe) {
        return repository.findByClasseIgnoreCase(classe);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Personagem cadastrar(@RequestBody Personagem p) {
        return repository.save(p);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Personagem> atualizar(@PathVariable Long id, @RequestBody Personagem personagemAtualizado) {
        return repository.findById(id)
                .map(personagemExistente -> {
                    personagemAtualizado.setId(id);
                    repository.save(personagemAtualizado);
                    return ResponseEntity.ok(personagemAtualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        repository.findById(id)
                .map(personagem -> {
                    repository.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));
    }
}