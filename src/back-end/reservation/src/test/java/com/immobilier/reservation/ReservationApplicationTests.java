package com.immobilier.reservation;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.cloud.config.enabled=false",
		"spring.config.import=optional:configserver:",
		"eureka.client.enabled=false",
		"spring.datasource.url=jdbc:h2:mem:reservation_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
		"spring.liquibase.enabled=false",
		"spring.rabbitmq.listener.simple.auto-startup=false"
})
class ReservationApplicationTests {

	@Test
	void contextLoads() {
	}

}
