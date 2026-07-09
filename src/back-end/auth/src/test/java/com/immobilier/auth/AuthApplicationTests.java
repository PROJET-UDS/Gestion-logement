package com.immobilier.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.cloud.config.enabled=false",
		"spring.config.import=optional:configserver:",
		"eureka.client.enabled=false",
		"spring.datasource.url=jdbc:h2:mem:auth_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
		"spring.rabbitmq.listener.simple.auto-startup=false",
		"jwt.secret=01234567890123456789012345678901",
		"jwt.access-expiration-ms=900000",
		"jwt.refresh-expiration-ms=604800000"
})
class AuthApplicationTests {

	@Test
	void contextLoads() {
	}

}
