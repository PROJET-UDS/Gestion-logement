package com.immobilier.user.client;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.dto.TokenValidationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "auth", path = "/auth")
public interface AuthServiceClient {

    @PostMapping("/validate")
    JwtClaims validate(@RequestBody TokenValidationRequest request);

    @PostMapping("/register")
    Map<String, Object> register(@RequestBody Map<String, Object> request);

    @PostMapping("/admin/register")
    Map<String, Object> registerByAdmin(
            @RequestHeader("X-Internal-Key") String internalKey,
            @RequestBody Map<String, Object> request);

    @PutMapping("/admin/users/{userId}/role")
    Map<String, String> syncUserRole(
            @RequestHeader("X-Internal-Key") String internalKey,
            @PathVariable("userId") String userId,
            @RequestBody Map<String, String> body);

    @PatchMapping("/admin/users/{userId}/ban")
    Map<String, String> syncUserBan(
            @RequestHeader("X-Internal-Key") String internalKey,
            @PathVariable("userId") String userId,
            @RequestBody Map<String, Boolean> body);
}
