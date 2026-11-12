package br.edu.unifio.conectaevent.configuracoes;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

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
                .authorizeHttpRequests(regras -> regras
                        .requestMatchers("/error").permitAll()

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

    // Usuários de teste em memória (permitido pelo enunciado; não usar senhas reais).
    @Bean
    public UserDetailsService usuarios(PasswordEncoder codificador) {
        return new InMemoryUserDetailsManager(
                User.withUsername("organizador")
                        .password(codificador.encode("organizador123"))
                        .roles(ORGANIZADOR)
                        .build(),
                User.withUsername("participante")
                        .password(codificador.encode("participante123"))
                        .roles(PARTICIPANTE)
                        .build());
    }

    @Bean
    public PasswordEncoder codificadorSenha() {
        return new BCryptPasswordEncoder();
    }

    // Monta o mesmo formato de ErroResposta usado pelo TratadorExcecoes.
    private static void escreverErro(HttpServletRequest requisicao, HttpServletResponse resposta, HttpStatus status,
            String mensagem) throws IOException {
        if (status == HttpStatus.UNAUTHORIZED) {
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
