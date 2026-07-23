package com.immobilier.auth;

import com.immobilier.auth.entity.AuthUser;
import com.immobilier.auth.rabbitmq.AuthEventPublisher;
import com.immobilier.auth.repository.AuthUserRepository;
import com.immobilier.auth.security.JwtService;
import com.immobilier.shared.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
@AutoConfigureMockMvc
class AuthApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AuthUserRepository authUserRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtService jwtService;

	@MockBean
	private AuthEventPublisher authEventPublisher;

	@Test
	void contextLoads() {
		assertThat(authUserRepository
				.findByEmailIgnoreCase("client@gestion-logement.local")
				.orElseThrow()
				.getRole()).isEqualTo(UserRole.CLIENT);
		assertThat(authUserRepository
				.findByEmailIgnoreCase("proprietaire@gestion-logement.local")
				.orElseThrow()
				.getRole()).isEqualTo(UserRole.PROPRIETAIRE);
	}

	@Test
	void publicRegistrationAlwaysCreatesClientEvenWhenAnotherRoleIsSent() throws Exception {
		mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "nom": "Compte Test",
								  "email": "  ROLE.TEST@EXAMPLE.COM ",
								  "password": "MotDePasse123",
								  "role": "ADMIN"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.role").value("CLIENT"));

		AuthUser createdUser = authUserRepository
				.findByEmailIgnoreCase("role.test@example.com")
				.orElseThrow();

		assertThat(createdUser.getEmail()).isEqualTo("role.test@example.com");
		assertThat(createdUser.getRole()).isEqualTo(UserRole.CLIENT);
	}

	@Test
	void onlyAdminCanChangeAnotherUsersRole() throws Exception {
		AuthUser admin = authUserRepository.findByEmailIgnoreCase("admin@gestion-logement.local")
				.orElseThrow();
		AuthUser client = authUserRepository.saveAndFlush(AuthUser.builder()
				.email("client.role@example.com")
				.passwordHash(passwordEncoder.encode("MotDePasse123"))
				.role(UserRole.CLIENT)
				.actif(true)
				.build());

		String adminToken = jwtService.generateAccessToken(
				admin.getId(),
				admin.getEmail(),
				admin.getRole().name()
		);

		mockMvc.perform(patch("/auth/users/{userId}/role", client.getId())
						.header("Authorization", "Bearer " + adminToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"role\":\"PROPRIETAIRE\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.role").value("PROPRIETAIRE"));

		assertThat(authUserRepository.findById(client.getId()).orElseThrow().getRole())
				.isEqualTo(UserRole.PROPRIETAIRE);
	}

	@Test
	void clientCannotChangeAUsersRole() throws Exception {
		AuthUser client = authUserRepository.saveAndFlush(AuthUser.builder()
				.email("client.denied@example.com")
				.passwordHash(passwordEncoder.encode("MotDePasse123"))
				.role(UserRole.CLIENT)
				.actif(true)
				.build());
		AuthUser target = authUserRepository.saveAndFlush(AuthUser.builder()
				.email("target.role@example.com")
				.passwordHash(passwordEncoder.encode("MotDePasse123"))
				.role(UserRole.CLIENT)
				.actif(true)
				.build());

		String clientToken = jwtService.generateAccessToken(
				client.getId(),
				client.getEmail(),
				client.getRole().name()
		);

		mockMvc.perform(patch("/auth/users/{userId}/role", target.getId())
						.header("Authorization", "Bearer " + clientToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"role\":\"ADMIN\"}"))
				.andExpect(status().isForbidden());

		assertThat(authUserRepository.findById(target.getId()).orElseThrow().getRole())
				.isEqualTo(UserRole.CLIENT);
	}
}
