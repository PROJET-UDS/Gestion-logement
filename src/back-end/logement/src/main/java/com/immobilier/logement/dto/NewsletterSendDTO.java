package com.immobilier.logement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NewsletterSendDTO {

    @NotBlank(message = "Le sujet est obligatoire")
    private String subject;

    @NotBlank(message = "Le contenu est obligatoire")
    private String content;
}
