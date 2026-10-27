package com.Chinmay.Hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import jakarta.servlet.http.HttpServletResponse;


@Configuration
@EnableWebSecurity  // Required for preauthorize
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())

        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/test/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        // THE FIX: This replaces the old .httpBasic(Customizer.withDefaults())
            // and it MUST go before the return statement!
            .httpBasic(basic -> basic.authenticationEntryPoint(
                (request, response, authException) -> 
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Credentials")
            ));

        return http.build();

        
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource(){

        org.springframework.web.cors.CorsConfiguration config = 
            new org.springframework.web.cors.CorsConfiguration();

        config.setAllowedOrigins(java.util.List.of("http://localhost:5173"));
        config.setAllowedMethods(java.util.List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(java.util.List.of("*"));
        config.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = 
            new org.springframework.web.cors.UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;

    }

    @Bean
        public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    

    
}
