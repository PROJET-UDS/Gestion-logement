package com.immobilier.logement.controller;

import com.immobilier.logement.dto.MediaDTO;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.entity.MediaLogement;
import com.immobilier.logement.exception.ResourceNotFoundException;
import com.immobilier.logement.repository.LogementRepository;
import com.immobilier.logement.security.AuthenticatedUser;
import com.immobilier.logement.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLConnection;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/logements")
@RequiredArgsConstructor
public class MediaController {

    private final FileStorageService fileStorageService;
    private final LogementRepository logementRepository;

    @PostMapping("/{id}/photos")
    public ResponseEntity<List<MediaDTO>> uploadPhotos(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal AuthenticatedUser user) {

        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (!logement.getProprietaireId().equals(user.userId())) {
            return ResponseEntity.status(403).build();
        }

        List<MediaDTO> uploaded = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = fileStorageService.storeFile(file);
            String fileUrl = "/api/v1/logements/files/" + filename;

            MediaLogement media = MediaLogement.builder()
                    .fileUrl(fileUrl)
                    .mediaType(file.getContentType())
                    .is360View(false)
                    .logement(logement)
                    .build();

            logement.getMedias().add(media);
            uploaded.add(new MediaDTO(fileUrl, file.getContentType(), false));
        }

        logementRepository.save(logement);
        return ResponseEntity.ok(uploaded);
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        Path filePath = fileStorageService.getUploadPath(filename);
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = URLConnection.guessContentTypeFromName(filename);
                if (contentType == null) {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/photos/{mediaId}")
    public ResponseEntity<Map<String, String>> deletePhoto(
            @PathVariable Long id,
            @PathVariable Long mediaId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (!logement.getProprietaireId().equals(user.userId())) {
            return ResponseEntity.status(403).build();
        }

        logement.getMedias().removeIf(m -> m.getId().equals(mediaId));
        logementRepository.save(logement);

        return ResponseEntity.ok(Map.of("message", "Photo supprimée"));
    }
}
