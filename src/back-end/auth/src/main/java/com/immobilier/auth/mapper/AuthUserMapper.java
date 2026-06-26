package com.immobilier.auth.mapper;

import com.immobilier.auth.dto.TokenResponseDTO;
import com.immobilier.auth.entity.AuthUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthUserMapper {
    @Mapping(target = "accessToken",  ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    @Mapping(target = "tokenType",    constant = "Bearer")
    @Mapping(target = "expiresIn",    constant = "900L")
    @Mapping(target = "role",         expression = "java(user.getRole().name())")
    TokenResponseDTO toTokenResponse(AuthUser user);
}
