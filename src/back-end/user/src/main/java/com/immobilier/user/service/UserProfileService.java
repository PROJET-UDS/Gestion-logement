package com.immobilier.user.service;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.events.UserRegisteredEvent;
import com.immobilier.shared.events.UserRoleChangedEvent;
import com.immobilier.user.dto.UpdateUserProfileRequestDTO;
import com.immobilier.user.dto.UserProfileResponseDTO;

import java.util.List;

public interface UserProfileService {
    UserProfileResponseDTO getCurrentUser(JwtClaims claims);
    UserProfileResponseDTO updateCurrentUser(JwtClaims claims, UpdateUserProfileRequestDTO request);
    UserProfileResponseDTO getUserById(String requesterId, String requesterRole, String userId);
    List<UserProfileResponseDTO> getAllUsers(String requesterRole);
    void createOrUpdateFromRegistration(UserRegisteredEvent event);
    void updateRoleFromEvent(UserRoleChangedEvent event);
}
