package br.edu.unifio.conectaevent.configuracoes;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.Customizer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.edu.unifio.conectaevent.repositorios.UsuarioRepositorio;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SegurancaConfiguracao {

    private static final String ORGANIZADOR = "ORGANIZADOR";
    private static final String PARTICIPANTE = "PARTICIPANTE";

    @Bean
    public SecurityFilterChain filtroSeguranca(HttpSecurity http) throws Exception {
        http
                // API REST sem formulários nem sessão: CSRF desligado e cada requisição se autentica.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // CORS: deixa o front-end (outro endereço/porta) chamar a API pelo navegador.
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(regras -> regras
                        .requestMatchers("/error").permitAll()

                        // Rotas públicas do site: criar conta e ver a vitrine de eventos sem login
                        .requestMatchers(HttpMethod.POST, "/usuarios/cadastro").permitAll()
                        .requestMatchers(HttpMethod.GET, "/eventos/futuros", "/eventos/{id}", "/eventos/{id}/vagas")
                        .permitAll()

                        // Consultas: qualquer usuário autenticado
                        .requestMatchers(HttpMethod.GET, "/**").authenticated()

                        // Check-in na entrada e decisão de reembolso: só o organizador
                        .requestMatchers(HttpMethod.POST, "/ingressos/check-in/**").hasRole(ORGANIZADOR)
                        .requestMatchers(HttpMethod.POST, "/reembolsos/*/aprovar", "/reembolsos/*/recusar")
                        .hasRole(ORGANIZADOR)

                        // Comprar ingresso e pedir reembolso: só o participante
                        .requestMatchers("/ingressos/**", "/reembolsos/**").hasRole(PARTICIPANTE)

                        // Cadastro de categorias, eventos e usuários: só o organizador
                        .anyRequest().hasRole(ORGANIZADOR))

                // HTTP Basic, com respostas JSON para 401 e 403
                .httpBasic(basic -> basic.authenticationEntryPoint((requisicao, resposta, e) -> escreverErro(
                        requisicao, resposta, HttpStatus.UNAUTHORIZED,
                        "Autenticação necessária: informe usuário e senha válidos (HTTP Basic).")))
                .exceptionHandling(excecoes -> excecoes
                        .authenticationEntryPoint((requisicao, resposta, e) -> escreverErro(requisicao, resposta,
                                HttpStatus.UNAUTHORIZED,
                                "Autenticação necessária: informe usuário e senha válidos (HTTP Basic)."))
                        .accessDeniedHandler((requisicao, resposta, e) -> escreverErro(requisicao, resposta,
                                HttpStatus.FORBIDDEN, "Acesso negado: seu perfil não tem permissão para esta operação.")));

        return http.build();
    }

    // Login com os usuários do banco: o nome de usuário do HTTP Basic é o e-mail,
    // a senha é conferida com o hash BCrypt e o perfil (ORGANIZADOR/PARTICIPANTE) vira a role.
    @Bean
    public UserDetailsService usuarios(UsuarioRepositorio usuarioRepositorio) {
        return email -> usuarioRepositorio.findByEmailIgnoreCase(email)
                .filter(usuario -> usuario.getSenha() != null) // sem senha cadastrada, não entra
                .map(usuario -> User.withUsername(usuario.getEmail())
                        .password(usuario.getSenha())
                        .roles(usuario.getPerfil().name())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    }

    // Origens (endereços do front-end) que podem chamar a API pelo navegador.
    // O nome do método (corsConfigurationSource) é o que o Spring Security procura.
    // "*" aceita qualquer uma: simples para o projeto; num sistema real, liste só o domínio do site.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOriginPatterns(List.of("*"));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
        fonte.registerCorsConfiguration("/**", cors);
        return fonte;
    }

    @Bean
    public PasswordEncoder codificadorSenha() {
        return new BCryptPasswordEncoder();
    }

    // Monta o mesmo formato de ErroResposta usado pelo TratadorExcecoes.
    private static void escreverErro(HttpServletRequest requisicao, HttpServletResponse resposta, HttpStatus status,
            String mensagem) throws IOException {
        // O cabeçalho WWW-Authenticate faz o navegador abrir a janela de login dele.
        // O front-end avisa que é uma chamada JavaScript (X-Requested-With) e trata o 401 na própria tela.
        boolean chamadaDoFront = requisicao.getHeader("X-Requested-With") != null;
        if (status == HttpStatus.UNAUTHORIZED && !chamadaDoFront) {
            resposta.setHeader("WWW-Authenticate", "Basic realm=\"conectaevent\"");
        }
        resposta.setStatus(status.value());
        resposta.setContentType("application/json;charset=UTF-8");
        resposta.getWriter().write("""
                {"momento":"%s","status":%d,"erro":"%s","mensagem":"%s","caminho":"%s","campos":null}"""
                .formatted(LocalDateTime.now(), status.value(), status.getReasonPhrase(), mensagem,
                        requisicao.getRequestURI()));
    }
}
