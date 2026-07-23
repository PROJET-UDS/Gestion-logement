package com.immobilier.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.server.WebFilter;

@Configuration
public class CorsGlobalConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 10)
    public WebFilter corsPrivateNetworkFilter() {
        return (exchange, chain) -> {
            exchange.getResponse().getHeaders()
                .add("Access-Control-Allow-Private-Network", "true");
            return chain.filter(exchange);
        };
    }
}
