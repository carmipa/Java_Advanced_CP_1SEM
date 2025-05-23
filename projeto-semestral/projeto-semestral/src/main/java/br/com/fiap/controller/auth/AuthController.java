package br.com.fiap.controller.auth;

import br.com.fiap.config.security.jwt.TokenService;
import br.com.fiap.dto.security.RegistroUsuarioDto;
import br.com.fiap.dto.security.LoginRequestDto;
import br.com.fiap.dto.security.LoginResponseDto;
import br.com.fiap.model.autenticar.Autenticar;
import br.com.fiap.repository.AutenticarRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.web.bind.annotation.CrossOrigin; // Comentado ou Removido
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/auth") // Prefixo para endpoints de autenticação
@Tag(name = "Autenticação", description = "Gerenciamento de usuários e login com JWT") // Atualize a descrição
// @CrossOrigin(origins = "http://localhost:3000") // REMOVIDO: A configuração global de CORS em SecurityConfig será usada
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // Injete o repositório Autenticar (para registro, se mantido)
    private final AutenticarRepository autenticarRepository;
    // Injete o PasswordEncoder (para registro e verificação no login)
    private final PasswordEncoder passwordEncoder;
    // Injete o TokenService para gerar o JWT
    private final TokenService tokenService;
    // Injete o AuthenticationManager para autenticar o usuário
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(AutenticarRepository autenticarRepository,
                          PasswordEncoder passwordEncoder,
                          TokenService tokenService,
                          AuthenticationManager authenticationManager) {
        this.autenticarRepository = autenticarRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.authenticationManager = authenticationManager;
    }

    // --- Endpoint de Registro (Mantido se necessário) ---
    // Se você já tem um endpoint de registro em outro lugar ou não precisa mais dele aqui, pode remover.
    // Este é o mesmo endpoint que tínhamos antes, mas agora a senha será criptografada.
    @PostMapping("/register")
    @Operation(summary = "Registrar Novo Usuário", description = "Cria um novo registro na tabela AUTENTICAR.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário registrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de registro inválidos"),
            @ApiResponse(responseCode = "409", description = "Nome de usuário já existente"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistroUsuarioDto registroDto) {
        log.info("Tentativa de registro de novo usuário: {}", registroDto.getUsuario());
        Optional<Autenticar> existingUser = autenticarRepository.findByUsuario(registroDto.getUsuario());
        if (existingUser.isPresent()) {
            log.warn("Tentativa de registro com usuário existente: {}", registroDto.getUsuario());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Nome de usuário já existe.");
        }

        try {
            Autenticar novoUsuario = new Autenticar();
            novoUsuario.setUsuario(registroDto.getUsuario());
            // !! Criptografa a senha antes de salvar !!
            novoUsuario.setSenha(passwordEncoder.encode(registroDto.getSenha()));

            Autenticar usuarioSalvo = autenticarRepository.save(novoUsuario);
            log.info("Usuário {} registrado com sucesso com ID: {}", usuarioSalvo.getUsuario(), usuarioSalvo.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso! ID: " + usuarioSalvo.getId());
        } catch (Exception e) {
            log.error("Erro ao registrar usuário {}: {}", registroDto.getUsuario(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao registrar usuário.");
        }
    }

    // --- NOVO Endpoint de Login para JWT ---
    @PostMapping("/login")
    @Operation(summary = "Autenticar Usuário e Gerar Token JWT", description = "Recebe credenciais, autentica o usuário e retorna um token JWT em caso de sucesso.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Autenticação bem-sucedida, token JWT retornado"),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor durante a autenticação")
    })
    public ResponseEntity<LoginResponseDto> authenticateUser(@Valid @RequestBody LoginRequestDto loginRequest) {
        log.info("Tentativa de autenticação para usuário: {}", loginRequest.getUsuario());
        try {
            // Autentica o usuário usando o AuthenticationManager
            // Ele usará o AuthenticationProvider configurado (com seu UserDetailsService e PasswordEncoder)
            // para verificar as credenciais. Se inválidas, lança AuthenticationException.
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsuario(),
                            loginRequest.getSenha()
                    )
            );

            // Se a autenticação for bem-sucedida, obtém os detalhes do usuário autenticado
            // O objeto 'principal' geralmente é o UserDetails retornado pelo UserDetailsService
            var userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();

            // Gera o token JWT para o usuário autenticado
            String jwtToken = tokenService.generateToken(userDetails);
            log.info("Token JWT gerado com sucesso para usuário: {}", userDetails.getUsername());

            // Retorna o token na resposta
            return ResponseEntity.ok(new LoginResponseDto(jwtToken));

        } catch (org.springframework.security.core.AuthenticationException e) {
            // Captura exceções de autenticação (ex: BadCredentialsException)
            log.warn("Falha na autenticação para usuário {}: {}", loginRequest.getUsuario(), e.getMessage());
            // Retorna 401 com uma mensagem no corpo (o frontend espera JSON)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponseDto("Credenciais inválidas"));
        } catch (Exception e) {
            // Captura outros erros inesperados durante o processo
            log.error("Erro interno durante a autenticação para usuário {}: {}", loginRequest.getUsuario(), e.getMessage(), e);
            // Retorna 500 com uma mensagem no corpo (o frontend espera JSON)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new LoginResponseDto("Erro interno no servidor"));
        }
    }
    // --- Fim do NOVO Endpoint de Login ---
}