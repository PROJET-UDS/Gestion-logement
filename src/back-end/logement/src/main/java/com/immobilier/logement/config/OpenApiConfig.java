package com.immobilier.logement.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Microservice de Gestion des Logements - API")
                        .version("1.0")
                        .description("Documentation des endpoints pour la publication, la recherche et la modération des logements.")
                        .contact(new Contact()
                                .name("Support Technique")
                                .email("tech@immobilier.com")));
    }
}