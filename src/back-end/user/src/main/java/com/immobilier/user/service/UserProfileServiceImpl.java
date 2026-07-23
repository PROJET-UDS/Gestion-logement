package com.immobilier.user.service;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.enums.UserRole;
import com.immobilier.shared.events.UserRegisteredEvent;
import com.immobilier.shared.events.UserRoleChangedEvent;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private static final String ADMIN_ROLE = "ADMIN";

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;

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
        profile.setNomComplet(request.getNomComplet());
        profile.setTelephone(request.getTelephone());
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

    private UserProfile getOrCreateFromClaims(JwtClaims claims) {
        UserRole currentRole = parseRole(claims.getRole());
        UserProfile profile = userProfileRepository.findById(claims.getUserId())
                .orElseGet(() -> UserProfile.builder()
                        .id(claims.getUserId())
                        .build());

        profile.setEmail(claims.getEmail());
        profile.setRole(currentRole);
        profile.setActif(true);
        return userProfileRepository.save(profile);
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new UserException("Role utilisateur invalide : " + role);
        }
    }
}
