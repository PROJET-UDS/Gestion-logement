package com.immobilier.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void envoyerCodeRecuperation(String destinataire, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@immobilier.cm");
            helper.setTo(destinataire);
            helper.setSubject("Code de recuperation de mot de passe");

            String html = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #059669, #047857); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0;">Immobilier Cameroun</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
                        <h2 style="color: #1f2937;">Code de recuperation</h2>
                        <p style="color: #4b5563;">Vous avez demande la reinitialisation de votre mot de passe.</p>
                        <p style="color: #4b5563;">Voici votre code de verification :</p>
                        <div style="background: white; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px;">%s</span>
                        </div>
                        <p style="color: #dc2626; font-weight: bold;">Ce code expire dans 3 minutes.</p>
                        <p style="color: #6b7280; font-size: 13px;">Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
                    </div>
                    <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                        <p>Immobilier Cameroun &copy; 2025</p>
                    </div>
                </body>
                </html>
                """.formatted(code);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Code de recuperation envoye a {}", destinataire);
        } catch (MessagingException e) {
            log.error("Erreur lors de l'envoi du code a {} : {}", destinataire, e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }
}
