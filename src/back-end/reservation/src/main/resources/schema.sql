-- Migration: Fix column names in reservation table
-- Renames columns created by ddl-auto:update to match @Column annotations

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'datepayment')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'date_payment')
    THEN
        ALTER TABLE reservation RENAME COLUMN datepayment TO date_payment;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'methodepayment')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'methode_payment')
    THEN
        ALTER TABLE reservation RENAME COLUMN methodepayment TO methode_payment;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'paymentstatut')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'payment_statut')
    THEN
        ALTER TABLE reservation RENAME COLUMN paymentstatut TO payment_statut;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'phonenumber')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'phone_number')
    THEN
        ALTER TABLE reservation RENAME COLUMN phonenumber TO phone_number;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'datecreation')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'date_creation')
    THEN
        ALTER TABLE reservation RENAME COLUMN datecreation TO date_creation;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'logementid')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'logement_id')
    THEN
        ALTER TABLE reservation RENAME COLUMN logementid TO logement_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'proprietaireid')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'proprietaire_id')
    THEN
        ALTER TABLE reservation RENAME COLUMN proprietaireid TO proprietaire_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'clientid')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'client_id')
    THEN
        ALTER TABLE reservation RENAME COLUMN clientid TO client_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'datedebut')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'date_debut')
    THEN
        ALTER TABLE reservation RENAME COLUMN datedebut TO date_debut;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'datefin')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'date_fin')
    THEN
        ALTER TABLE reservation RENAME COLUMN datefin TO date_fin;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'prixlogement')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'prix_logement')
    THEN
        ALTER TABLE reservation RENAME COLUMN prixlogement TO prix_logement;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'prixtotal')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'prix_total')
    THEN
        ALTER TABLE reservation RENAME COLUMN prixtotal TO prix_total;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'montantreservation')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'montant_reservation')
    THEN
        ALTER TABLE reservation RENAME COLUMN montantreservation TO montant_reservation;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'montantrestant')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'montant_restant')
    THEN
        ALTER TABLE reservation RENAME COLUMN montantrestant TO montant_restant;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'prix_logement')
    THEN
        ALTER TABLE reservation ADD COLUMN prix_logement numeric(38,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'montant_reservation')
    THEN
        ALTER TABLE reservation ADD COLUMN montant_reservation numeric(38,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservation' AND column_name = 'montant_restant')
    THEN
        ALTER TABLE reservation ADD COLUMN montant_restant numeric(38,2) DEFAULT 0;
    END IF;
END $$;
