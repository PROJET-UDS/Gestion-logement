package com.immobilier.user.mapper;

import com.immobilier.user.dto.UserProfileResponseDTO;
import com.immobilier.user.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {

    @Mapping(target = "role", expression = "java(userProfile.getRole().name())")
    UserProfileResponseDTO toResponse(UserProfile userProfile);
}
