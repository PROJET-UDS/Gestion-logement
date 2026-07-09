package com.immobilier.paiement.client;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.dto.TokenValidationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth", path = "/auth")
public interface AuthServiceClient {

    @PostMapping("/validate")
    JwtClaims validate(@RequestBody TokenValidationRequest request);
}
