package com.immobilier.messagerie.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailTemplateService {

    private static final String PLATFORM_NAME = "Gestion Logement";

    public String generateHtml(String emailType, Map<String, Object> data) {
        return switch (emailType) {
            case "welcome" -> buildWelcomeEmail(data);
            case "password_reset" -> buildPasswordResetEmail(data);
            case "logement_submitted" -> buildLogementSubmittedEmail(data);
            case "logement_approved" -> buildLogementApprovedEmail(data);
            case "logement_rejected" -> buildLogementRejectedEmail(data);
            case "reservation_created" -> buildReservationCreatedEmail(data);
            case "reservation_confirmed" -> buildReservationConfirmedEmail(data);
            case "payment_succeeded" -> buildPaymentSucceededEmail(data);
            case "payment_failed" -> buildPaymentFailedEmail(data);
            case "review_created" -> buildReviewCreatedEmail(data);
            case "contact_owner" -> buildContactOwnerEmail(data);
            case "newsletter" -> buildNewsletterEmail(data);
            default -> buildGenericEmail(data);
        };
    }

    public String getSubject(String emailType, Map<String, Object> data) {
        return switch (emailType) {
            case "welcome" -> "Bienvenue sur " + PLATFORM_NAME;
            case "password_reset" -> "Reinitialisation de votre mot de passe - " + PLATFORM_NAME;
            case "logement_submitted" -> "Votre logement a ete soumis pour validation";
            case "logement_approved" -> "Votre logement a ete approuve";
            case "logement_rejected" -> "Votre logement n'a pas ete approuve";
            case "reservation_created" -> "Nouvelle reservation recue";
            case "reservation_confirmed" -> "Votre reservation est confirmee";
            case "payment_succeeded" -> "Paiement recu avec succes";
            case "payment_failed" -> "Echec du paiement";
            case "review_created" -> "Nouvel avis recu sur votre logement";
            case "contact_owner" -> "Nouveau message d'un locataire potentiel";
            case "newsletter" -> "Actualites " + PLATFORM_NAME;
            default -> "Notification - " + PLATFORM_NAME;
        };
    }

    private String buildWelcomeEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Utilisateur");
        return wrapInLayout(
                "<h2>Bienvenue sur " + PLATFORM_NAME + " !</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Nous sommes ravis de vous accueillir sur notre plateforme de gestion de logements.</p>"
                + "<p>Vous pouvez desormais :</p>"
                + "<ul>"
                + "<li>Publier vos annonces de logement</li>"
                + "<li>Rechercher des logements disponibles</li>"
                + "<li>Effectuer des reservations en ligne</li>"
                + "</ul>"
                + "<p>N'hesitez pas a completer votre profil pour une meilleure experience.</p>"
        );
    }

    private String buildPasswordResetEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Utilisateur");
        String code = getStringValue(data, "code", "------");
        return wrapInLayout(
                "<h2>Code de recuperation</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Vous avez demande la reinitialisation de votre mot de passe.</p>"
                + "<p>Voici votre code de verification :</p>"
                + "<div style=\"background:white;border:2px dashed #4CAF50;border-radius:12px;"
                + "padding:20px;text-align:center;margin:20px 0;\">"
                + "<span style=\"font-size:36px;font-weight:bold;color:#4CAF50;letter-spacing:8px;\">"
                + escapeHtml(code) + "</span></div>"
                + "<p style=\"color:#dc2626;font-weight:bold;\">Ce code expire dans 3 minutes.</p>"
                + "<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>"
        );
    }

    private String buildLogementSubmittedEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Proprietaire");
        String logementTitle = getStringValue(data, "logementTitle", "votre logement");
        return wrapInLayout(
                "<h2>Logement soumis pour validation</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Votre logement <strong>" + escapeHtml(logementTitle) + "</strong> a ete soumis avec succes.</p>"
                + "<p>Notre equipe va examiner votre annonce. Vous recevrez une notification "
                + "lorsque votre logement sera approuve ou si des modifications sont necessaires.</p>"
                + "<p>Delai moyen de validation : 24 a 48 heures.</p>"
        );
    }

    private String buildLogementApprovedEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Proprietaire");
        String logementTitle = getStringValue(data, "logementTitle", "votre logement");
        return wrapInLayout(
                "<h2>Logement approuve</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Felicitations ! Votre logement <strong>" + escapeHtml(logementTitle)
                + "</strong> a ete approuve et est maintenant visible sur la plateforme.</p>"
                + "<p>Les locataires potentiels peuvent desormais le consulter et effectuer des reservations.</p>"
        );
    }

    private String buildLogementRejectedEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Proprietaire");
        String logementTitle = getStringValue(data, "logementTitle", "votre logement");
        String reason = getStringValue(data, "reason", "Non conforme aux criteres de la plateforme");
        return wrapInLayout(
                "<h2>Logement non approuve</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Nous sommes desoles, votre logement <strong>" + escapeHtml(logementTitle)
                + "</strong> n'a pas pu etre approuve.</p>"
                + "<p><strong>Motif :</strong> " + escapeHtml(reason) + "</p>"
                + "<p>Vous pouvez modifier votre annonce et la soumettre a nouveau.</p>"
        );
    }

    private String buildReservationCreatedEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Proprietaire");
        String logementTitle = getStringValue(data, "logementTitle", "votre logement");
        String guestName = getStringValue(data, "guestName", "Un locataire");
        String dateDebut = getStringValue(data, "dateDebut", "");
        String dateFin = getStringValue(data, "dateFin", "");
        return wrapInLayout(
                "<h2>Nouvelle reservation</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Une nouvelle reservation a ete effectuee pour votre logement "
                + "<strong>" + escapeHtml(logementTitle) + "</strong>.</p>"
                + "<p><strong>Locataire :</strong> " + escapeHtml(guestName) + "</p>"
                + (dateDebut.isEmpty() ? "" : "<p><strong>Du :</strong> " + escapeHtml(dateDebut)
                + " <strong>au :</strong> " + escapeHtml(dateFin) + "</p>")
                + "<p>Veuillez confirmer ou refuser cette reservation depuis votre espace.</p>"
        );
    }

    private String buildReservationConfirmedEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Locataire");
        String logementTitle = getStringValue(data, "logementTitle", "le logement");
        String dateDebut = getStringValue(data, "dateDebut", "");
        String dateFin = getStringValue(data, "dateFin", "");
        return wrapInLayout(
                "<h2>Reservation confirmee</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Votre reservation pour <strong>" + escapeHtml(logementTitle)
                + "</strong> est confirmee.</p>"
                + (dateDebut.isEmpty() ? "" : "<p><strong>Du :</strong> " + escapeHtml(dateDebut)
                + " <strong>au :</strong> " + escapeHtml(dateFin) + "</p>")
                + "<p>Vous recevrez les informations d'acces prochainement.</p>"
        );
    }

    private String buildPaymentSucceededEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Utilisateur");
        String amount = getStringValue(data, "amount", "");
        String reference = getStringValue(data, "reference", "");
        return wrapInLayout(
                "<h2>Paiement recu</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Votre paiement a ete traite avec succes.</p>"
                + (amount.isEmpty() ? "" : "<p><strong>Montant :</strong> " + escapeHtml(amount) + "</p>")
                + (reference.isEmpty() ? "" : "<p><strong>Reference :</strong> " + escapeHtml(reference) + "</p>")
                + "<p>Merci pour votre confiance.</p>"
        );
    }

    private String buildPaymentFailedEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Utilisateur");
        String amount = getStringValue(data, "amount", "");
        String reason = getStringValue(data, "reason", "Une erreur est survenue lors du traitement");
        return wrapInLayout(
                "<h2>Echec du paiement</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Votre paiement n'a pas pu etre traite.</p>"
                + (amount.isEmpty() ? "" : "<p><strong>Montant :</strong> " + escapeHtml(amount) + "</p>")
                + "<p><strong>Motif :</strong> " + escapeHtml(reason) + "</p>"
                + "<p>Veuillez reessayer ou utiliser un autre moyen de paiement.</p>"
        );
    }

    private String buildReviewCreatedEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Proprietaire");
        String logementTitle = getStringValue(data, "logementTitle", "votre logement");
        String reviewerName = getStringValue(data, "reviewerName", "Un utilisateur");
        String rating = getStringValue(data, "rating", "");
        return wrapInLayout(
                "<h2>Nouvel avis</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>" + escapeHtml(reviewerName) + " a laisse un avis sur votre logement "
                + "<strong>" + escapeHtml(logementTitle) + "</strong>.</p>"
                + (rating.isEmpty() ? "" : "<p><strong>Note :</strong> " + escapeHtml(rating) + "/5</p>")
                + "<p>Consultez l'avis complet depuis votre espace proprietaire.</p>"
        );
    }

    private String buildContactOwnerEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Proprietaire");
        String senderName = getStringValue(data, "senderName", "Un utilisateur");
        String message = getStringValue(data, "message", "");
        String logementTitle = getStringValue(data, "logementTitle", "votre logement");
        return wrapInLayout(
                "<h2>Nouveau message</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>Vous avez recu un message de <strong>" + escapeHtml(senderName)
                + "</strong> concernant votre logement <strong>" + escapeHtml(logementTitle) + "</strong>.</p>"
                + (message.isEmpty() ? "" : "<div style=\"background-color:#f5f5f5;padding:16px;"
                + "border-left:4px solid #4CAF50;margin:16px 0;\">"
                + "<p style=\"margin:0;\">" + escapeHtml(message) + "</p></div>")
                + "<p>Vous pouvez repondre directement depuis votre espace.</p>"
        );
    }

    private String buildNewsletterEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Abonne");
        String content = getStringValue(data, "content", "");
        return wrapInLayout(
                "<h2>Actualites " + PLATFORM_NAME + "</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + (content.isEmpty()
                    ? "<p>Decouvrez les dernieres nouveautes sur notre plateforme.</p>"
                    : "<div>" + content + "</div>")
                + "<p style=\"font-size:12px;color:#666;\">Vous recevez cet email car vous etes inscrit "
                + "a notre newsletter. Pour vous desabonner, rendez-vous dans les parametres de votre compte.</p>"
        );
    }

    private String buildGenericEmail(Map<String, Object> data) {
        String name = getStringValue(data, "name", "Utilisateur");
        String message = getStringValue(data, "message", "Vous avez une nouvelle notification.");
        return wrapInLayout(
                "<h2>Notification</h2>"
                + "<p>Bonjour " + escapeHtml(name) + ",</p>"
                + "<p>" + escapeHtml(message) + "</p>"
        );
    }

    private String wrapInLayout(String bodyContent) {
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
                    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:0;">
                        <!-- Header -->
                        <div style="background-color:#2196F3;color:#ffffff;padding:20px;text-align:center;">
                            <h1 style="margin:0;font-size:24px;">%s</h1>
                        </div>
                        <!-- Body -->
                        <div style="padding:30px 20px;">
                            %s
                        </div>
                        <!-- Footer -->
                        <div style="background-color:#f9f9f9;padding:20px;text-align:center;font-size:12px;color:#666;">
                            <p style="margin:0;">%s - Plateforme de gestion de logements</p>
                            <p style="margin:5px 0 0 0;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(PLATFORM_NAME, bodyContent, PLATFORM_NAME);
    }

    private String getStringValue(Map<String, Object> data, String key, String defaultValue) {
        if (data == null || !data.containsKey(key) || data.get(key) == null) {
            return defaultValue;
        }
        return data.get(key).toString();
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
