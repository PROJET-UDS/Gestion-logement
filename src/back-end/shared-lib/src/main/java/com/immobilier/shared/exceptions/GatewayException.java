package com.immobilier.shared.exceptions;

import lombok.Getter;

@Getter
public class GatewayException extends RuntimeException {

    private final int status;
    private final String code;

    public GatewayException(String message, int status, String code) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static GatewayException notFound(String resource) {
        return new GatewayException(resource + " introuvable", 404, "NOT_FOUND");
    }

    public static GatewayException forbidden() {
        return new GatewayException("AccÃ¨s refusÃ©", 403, "FORBIDDEN");
    }

    public static GatewayException badRequest(String msg) {
        return new GatewayException(msg, 400, "BAD_REQUEST");
    }
}