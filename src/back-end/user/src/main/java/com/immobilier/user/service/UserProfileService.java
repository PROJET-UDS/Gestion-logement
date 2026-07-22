package com.immobilier.user.service;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.enums.UserRole;
import com.immobilier.shared.events.UserRegisteredEvent;
import com.immobilier.shared.events.UserRoleChangedEvent;
import com.immobilier.user.dto.CreateUserRequestDTO;
import com.immobilier.user.dto.UpdateUserProfileRequestDTO;
import com.immobilier.user.dto.UserProfileResponseDTO;

import java.util.List;

public interface UserProfileService {
    UserProfileResponseDTO getCurrentUser(JwtClaims claims);
    UserProfileResponseDTO updateCurrentUser(JwtClaims claims, UpdateUserProfileRequestDTO request);
    UserProfileResponseDTO updatePhoto(JwtClaims claims, String photoUrl);
    UserProfileResponseDTO getUserById(String requesterId, String requesterRole, String userId);
    List<UserProfileResponseDTO> getAllUsers(String requesterRole);
    void createOrUpdateFromRegistration(UserRegisteredEvent event);
    void updateRoleFromEvent(UserRoleChangedEvent event);
    UserProfileResponseDTO changeUserRole(String requesterRole, String requesterId, String userId, UserRole newRole);
    UserProfileResponseDTO createUserByAdmin(String requesterRole, CreateUserRequestDTO request);
    UserProfileResponseDTO toggleBanUser(String requesterRole, String requesterId, String userId);
}
