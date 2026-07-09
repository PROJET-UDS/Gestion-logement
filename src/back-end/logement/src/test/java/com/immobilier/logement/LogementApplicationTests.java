package com.immobilier.logement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.cloud.config.enabled=false",
		"spring.config.import=optional:configserver:",
		"eureka.client.enabled=false",
		"spring.datasource.url=jdbc:h2:mem:logement_db;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.rabbitmq.listener.simple.auto-startup=false"
})
class LogementApplicationTests {

	@Test
	void contextLoads() {
		// Test de chargement du contexte applicatif sécurisé et isolé
	}
}
