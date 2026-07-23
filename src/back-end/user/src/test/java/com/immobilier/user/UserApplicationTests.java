package com.immobilier.user;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = UserApplication.class,
		properties = {
		"spring.cloud.config.enabled=false",
		"spring.config.import=optional:configserver:",
		"spring.datasource.url=jdbc:h2:mem:user_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
		"spring.rabbitmq.listener.simple.auto-startup=false",
		"eureka.client.enabled=false"
})
class UserApplicationTests {

	@Test
	void contextLoads() {
	}

}
