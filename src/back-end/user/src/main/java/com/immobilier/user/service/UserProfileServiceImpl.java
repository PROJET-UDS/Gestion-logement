package com.immobilier.user.service;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.enums.UserRole;
import com.immobilier.shared.events.UserRegisteredEvent;
import com.immobilier.shared.events.UserRoleChangedEvent;
import com.immobilier.user.client.AuthServiceClient;
import com.immobilier.user.dto.CreateUserRequestDTO;
import com.immobilier.user.dto.UpdateUserProfileRequestDTO;
import com.immobilier.user.dto.UserProfileResponseDTO;
import com.immobilier.user.entity.UserProfile;
import com.immobilier.user.exception.ForbiddenException;
import com.immobilier.user.exception.UserException;
import com.immobilier.user.exception.UserNotFoundException;
import com.immobilier.user.mapper.UserProfileMapper;
import com.immobilier.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private static final String ADMIN_ROLE = "ADMIN";

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;
    private final AuthServiceClient authServiceClient;

    @Value("${internal.api-key:immobilier-internal-secret-2024}")
    private String internalApiKey;

    @Override
    @Transactional
    public UserProfileResponseDTO getCurrentUser(JwtClaims claims) {
        UserProfile profile = getOrCreateFromClaims(claims);
        return userProfileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updateCurrentUser(JwtClaims claims, UpdateUserProfileRequestDTO request) {
        UserProfile profile = getOrCreateFromClaims(claims);
        if (request.getNomComplet() != null) {
            profile.setNomComplet(request.getNomComplet());
        }
        if (request.getTelephone() != null) {
            profile.setTelephone(request.getTelephone());
        }
        return userProfileMapper.toResponse(userProfileRepository.save(profile));
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updatePhoto(JwtClaims claims, String photoUrl) {
        UserProfile profile = getOrCreateFromClaims(claims);
        profile.setPhotoUrl(photoUrl);
        return userProfileMapper.toResponse(userProfileRepository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserById(String requesterId, String requesterRole, String userId) {
        if (!userId.equals(requesterId) && !ADMIN_ROLE.equals(requesterRole)) {
            throw new ForbiddenException("Vous ne pouvez pas consulter ce profil");
        }

        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return userProfileMapper.toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileResponseDTO> getAllUsers(String requesterRole) {
        if (!ADMIN_ROLE.equals(requesterRole)) {
            throw new ForbiddenException("Acces reserve aux administrateurs");
        }

        return userProfileRepository.findAll().stream()
                .map(userProfileMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void createOrUpdateFromRegistration(UserRegisteredEvent event) {
        UserProfile profile = userProfileRepository.findById(event.getUserId())
                .orElseGet(() -> UserProfile.builder()
                        .id(event.getUserId())
                        .actif(true)
                        .build());

        profile.setEmail(event.getEmail());
        if (event.getNom() != null && !event.getNom().isBlank()) {
            profile.setNomComplet(event.getNom());
        }
        profile.setRole(parseRole(event.getRole()));
        profile.setActif(true);

        userProfileRepository.save(profile);
        log.info("Profil utilisateur synchronise depuis auth : {}", event.getEmail());
    }

    @Override
    @Transactional
    public void updateRoleFromEvent(UserRoleChangedEvent event) {
        UserProfile profile = userProfileRepository.findById(event.getUserId()).orElse(null);
        if (profile == null) {
            log.warn("Changement de role ignore, profil introuvable : {}", event.getUserId());
            return;
        }

        profile.setRole(parseRole(event.getNouveauRole()));
        userProfileRepository.save(profile);
        log.info("Role utilisateur synchronise depuis auth : {}", event.getUserId());
    }

    @Override
    @Transactional
    public UserProfileResponseDTO changeUserRole(String requesterRole, String requesterId, String userId, UserRole newRole) {
        if (!ADMIN_ROLE.equals(requesterRole)) {
            throw new ForbiddenException("Seul un administrateur peut modifier le role d'un utilisateur");
        }

        if (requesterId.equals(userId)) {
            throw new ForbiddenException("Vous ne pouvez pas modifier votre propre role");
        }

        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (ADMIN_ROLE.equals(profile.getRole().name()) && !ADMIN_ROLE.equals(newRole.name())) {
            throw new ForbiddenException("Vous ne pouvez pas retirer le role administrateur d'un administrateur");
        }

        String ancienRole = profile.getRole().name();
        profile.setRole(newRole);
        userProfileRepository.save(profile);

        try {
            Map<String, String> body = new HashMap<>();
            body.put("role", newRole.name());
            authServiceClient.syncUserRole(internalApiKey, userId, body);
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation du role avec auth : {}", e.getMessage());
        }

        log.info("Role change pour userId={} : {} -> {}", userId, ancienRole, newRole.name());
        return userProfileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO createUserByAdmin(String requesterRole, CreateUserRequestDTO request) {
        if (!ADMIN_ROLE.equals(requesterRole)) {
            throw new ForbiddenException("Seul un administrateur peut creer un utilisateur");
        }

        if (userProfileRepository.existsByEmail(request.getEmail())) {
            throw new UserException("Un utilisateur avec cet email existe deja");
        }

        try {
            Map<String, Object> authRequest = new HashMap<>();
            authRequest.put("email", request.getEmail());
            authRequest.put("nom", request.getNom());
            authRequest.put("password", request.getPassword());
            authRequest.put("role", request.getRole().name());
            authServiceClient.registerByAdmin(internalApiKey, authRequest);
        } catch (Exception e) {
            log.error("Erreur lors de la creation de l'utilisateur via auth : {}", e.getMessage());
            throw new UserException("Impossible de creer l'utilisateur : " + e.getMessage());
        }

        UserProfile profile = UserProfile.builder()
                .email(request.getEmail())
                .nomComplet(request.getNom())
                .role(request.getRole())
                .actif(true)
                .build();

        UserProfile saved = userProfileRepository.save(profile);
        log.info("Utilisateur cree par admin : {}", request.getEmail());
        return userProfileMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO toggleBanUser(String requesterRole, String requesterId, String userId) {
        if (!ADMIN_ROLE.equals(requesterRole)) {
            throw new ForbiddenException("Seul un administrateur peut bannir un utilisateur");
        }

        if (requesterId.equals(userId)) {
            throw new ForbiddenException("Vous ne pouvez pas vous bannir vous-meme");
        }

        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (ADMIN_ROLE.equals(profile.getRole().name())) {
            throw new ForbiddenException("Vous ne pouvez pas bannir un administrateur");
        }

        profile.setActif(!profile.isActif());
        userProfileRepository.save(profile);

        try {
            Map<String, Boolean> body = new HashMap<>();
            body.put("actif", profile.isActif());
            authServiceClient.syncUserBan(internalApiKey, userId, body);
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation du ban avec auth : {}", e.getMessage());
        }

        String action = profile.isActif() ? "debanni" : "banni";
        log.info("Utilisateur {} : userId={}", action, userId);
        return userProfileMapper.toResponse(profile);
    }

    private UserProfile getOrCreateFromClaims(JwtClaims claims) {
        return userProfileRepository.findById(claims.getUserId())
                .orElseGet(() -> userProfileRepository.save(UserProfile.builder()
                        .id(claims.getUserId())
                        .email(claims.getEmail())
                        .role(parseRole(claims.getRole()))
                        .actif(true)
                        .build()));
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new UserException("Role utilisateur invalide : " + role);
        }
    }
}
