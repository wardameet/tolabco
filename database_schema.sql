-- Complete tolabco database schema (generated on Sun May 10 15:23:01 UTC 2026)
\restrict 1r9aFPFnZ7X2LpEatcvPCGJcGx7umLCzgmm95aHwpzDKba9e7RgMIvnef4vvjFK
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
CREATE TYPE public."Role" AS ENUM (
    'student',
    'employer',
    'admin',
    'outlet'
);
SET default_tablespace = '';
SET default_table_access_method = heap;
CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    student_id uuid,
    status character varying(20) DEFAULT 'pending'::character varying,
    applied_at timestamp without time zone DEFAULT now(),
    employer_contacted_at timestamp without time zone,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'viewed'::character varying, 'contacted'::character varying, 'rejected'::character varying])::text[])))
);
CREATE TABLE public.employers (
    user_id uuid NOT NULL,
    company_name text NOT NULL,
    company_city text
);
CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employer_id uuid,
    title character varying(255) NOT NULL,
    description text,
    job_type character varying(50),
    location_city character varying(100),
    is_remote boolean DEFAULT false,
    salary_range character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.redemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    voucher_id uuid,
    student_id uuid,
    redeemed_at timestamp without time zone DEFAULT now(),
    outlet_verified_by uuid
);
CREATE TABLE public.students (
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    date_of_birth timestamp(3) without time zone,
    city text,
    profession_category text,
    skills text[] DEFAULT ARRAY[]::text[],
    video_cv_url text,
    cv_text text,
    unique_link text,
    verified boolean DEFAULT false NOT NULL
);
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text,
    role public."Role" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.verification_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid,
    id_photo_url character varying(500),
    selfie_url character varying(500),
    status character varying(20) DEFAULT 'pending'::character varying,
    reviewed_by uuid,
    reviewed_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT verification_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);
CREATE TABLE public.vouchers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    outlet_id uuid,
    title character varying(255) NOT NULL,
    description text,
    discount_percent integer,
    qr_code_url character varying(500),
    start_date date,
    end_date date,
    max_redemptions integer,
    redemption_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_student_id_key UNIQUE (job_id, student_id);
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.employers
    ADD CONSTRAINT employers_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.verification_queue
    ADD CONSTRAINT verification_queue_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX students_unique_link_key ON public.students USING btree (unique_link);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;
ALTER TABLE ONLY public.employers
    ADD CONSTRAINT employers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_outlet_verified_by_fkey FOREIGN KEY (outlet_verified_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(user_id);
ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id);
ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.verification_queue
    ADD CONSTRAINT verification_queue_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.verification_queue
    ADD CONSTRAINT verification_queue_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(user_id);
ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.users(id);
\unrestrict 1r9aFPFnZ7X2LpEatcvPCGJcGx7umLCzgmm95aHwpzDKba9e7RgMIvnef4vvjFK
