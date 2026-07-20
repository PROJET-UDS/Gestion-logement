package com.immobilier.logement.service;

import com.immobilier.logement.entity.NewsletterSubscription;

import java.util.List;

public interface NewsletterService {

    void subscribe(String email);

    void unsubscribe(String email);

    boolean isSubscribed(String email);

    List<NewsletterSubscription> getAllActiveSubscribers();

    void sendNotificationToSubscribers(String subject, String content);
}
