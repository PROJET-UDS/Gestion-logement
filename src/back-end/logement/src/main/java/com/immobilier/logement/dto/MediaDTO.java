package com.immobilier.logement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaDTO {
    private String fileUrl;
    private String mediaType;
    private boolean is360View;
}
