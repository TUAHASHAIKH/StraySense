-- Reduced & Normalized StraySense Schema (3NF)
CREATE SCHEMA IF NOT EXISTS StraySense;
USE StraySense;

-- 1. Core User & Auth Tables

-- Users: stores credentials and basic profile
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- UserProfiles: extended user data (1:1 with Users)
CREATE TABLE IF NOT EXISTS UserProfiles (
    profile_id INT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(15),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Sessions: track active login sessions
CREATE TABLE IF NOT EXISTS Sessions (
    session_id CHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    session_token CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- User_Roles: assign roles (volunteer, adopter, admin, shelter_manager)
CREATE TABLE IF NOT EXISTS User_Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_type ENUM('volunteer','adopter','admin','shelter_manager') NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, role_type)
);

-- 2. Shelter & Animal Tables

-- Shelters: where animals are housed
CREATE TABLE IF NOT EXISTS Shelters (
    shelter_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255)
);

-- Animals: animal profiles
CREATE TABLE IF NOT EXISTS Animals (
    animal_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    species ENUM('dog','cat','other') NOT NULL,
    breed VARCHAR(50),
    age INT,
    gender ENUM('male','female','unknown') NOT NULL,
    health_status TEXT,
    neutered BOOLEAN DEFAULT FALSE,
    shelter_id INT,
    status ENUM('available','adopted','fostered') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shelter_id) REFERENCES Shelters(shelter_id) ON DELETE SET NULL
);

-- 3. Adoption & Fostering

-- Adoptions: both adopt & foster requests
CREATE TABLE IF NOT EXISTS Adoptions (
    adoption_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    animal_id INT NOT NULL,
    adoption_type ENUM('adopt','foster') NOT NULL,
    status ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES Animals(animal_id) ON DELETE CASCADE
);

-- 4. Vaccination Scheduling & Reminders

-- Vaccine_Types: catalog of valid vaccines
CREATE TABLE IF NOT EXISTS Vaccine_Types (
    vaccine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Vaccinations: scheduled and completed records
CREATE TABLE IF NOT EXISTS Vaccinations (
    vaccination_id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    vaccine_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES Animals(animal_id) ON DELETE CASCADE,
    FOREIGN KEY (vaccine_id) REFERENCES Vaccine_Types(vaccine_id) ON DELETE RESTRICT
);

-- 5. Stray Reporting & Processing

-- Stray_Reports: user-submitted reports
CREATE TABLE IF NOT EXISTS Stray_Reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    accepted_date TIMESTAMP,
    processed_animal_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (processed_animal_id) REFERENCES Animals(animal_id) ON DELETE SET NULL
);


-- Modification to the existing schema

-- Remove the original combined Adoptions table
DROP TABLE IF EXISTS Adoptions;

-- Create separate Adoptions table
CREATE TABLE IF NOT EXISTS Adoptions (
    adoption_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    animal_id INT NOT NULL,
    status ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    completion_date TIMESTAMP,
    home_check_passed BOOLEAN,
    fee_paid BOOLEAN DEFAULT FALSE,
    contract_signed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES Animals(animal_id) ON DELETE CASCADE
);

-- Create separate Fosterings table
CREATE TABLE IF NOT EXISTS Fosterings (
    fostering_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    animal_id INT NOT NULL,
    status ENUM('pending','approved','rejected','active','completed') DEFAULT 'pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    start_date TIMESTAMP,
    expected_end_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    home_check_passed BOOLEAN,
    foster_agreement_signed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES Animals(animal_id) ON DELETE CASCADE
);

-- You may also want to modify the Animals table to update the status enum
ALTER TABLE Animals 
MODIFY COLUMN status ENUM('available','pending_adoption','adopted','pending_foster','fostered','medical_hold') DEFAULT 'available';

ALTER TABLE Stray_Reports
  DROP COLUMN location,
  ADD COLUMN animal_type   ENUM('Dog','Cat','Cow','Donkey','Other'),
  ADD COLUMN animal_size   ENUM('Small','Medium','Large'),
  ADD COLUMN visible_injuries TEXT,
  ADD COLUMN province      VARCHAR(100),
  ADD COLUMN city          VARCHAR(100);

ALTER TABLE animals
  ADD COLUMN image_path VARCHAR(255);

-- Users: Index email for login (already UNIQUE)
CREATE INDEX idx_users_email ON Users(email);

-- Sessions: Index session_token for authentication
CREATE INDEX idx_sessions_token ON Sessions(session_token);
CREATE INDEX idx_sessions_user_id ON Sessions(user_id);

-- UserProfiles: FK user_id
CREATE INDEX idx_userprofiles_user_id ON UserProfiles(user_id);

-- User_Roles: FK + Composite Index for user-role lookup
CREATE INDEX idx_user_roles_user_id ON User_Roles(user_id);
CREATE INDEX idx_user_roles_composite ON User_Roles(user_id, role_type);

-- Shelters: commonly filtered by city
CREATE INDEX idx_shelters_city ON Shelters(city);

-- Animals: Optimize filtering by status and shelter
CREATE INDEX idx_animals_status ON Animals(status);
CREATE INDEX idx_animals_shelter_id ON Animals(shelter_id);
CREATE INDEX idx_animals_species ON Animals(species);

-- Adoptions: Queries by user, animal, and status
CREATE INDEX idx_adoptions_user_id ON Adoptions(user_id);
CREATE INDEX idx_adoptions_animal_id ON Adoptions(animal_id);
CREATE INDEX idx_adoptions_status ON Adoptions(status);

-- Fosterings: Similar to adoptions
CREATE INDEX idx_fosterings_user_id ON Fosterings(user_id);
CREATE INDEX idx_fosterings_animal_id ON Fosterings(animal_id);
CREATE INDEX idx_fosterings_status ON Fosterings(status);

-- Stray Reports: Filter by user, status, date
CREATE INDEX idx_stray_reports_user_id ON Stray_Reports(user_id);
CREATE INDEX idx_stray_reports_status ON Stray_Reports(status);
CREATE INDEX idx_stray_reports_report_date ON Stray_Reports(report_date);

-- Vaccinations: FK + status queries
CREATE INDEX idx_vaccinations_animal_id ON Vaccinations(animal_id);
CREATE INDEX idx_vaccinations_vaccine_id ON Vaccinations(vaccine_id);
CREATE INDEX idx_vaccinations_scheduled_date ON Vaccinations(scheduled_date);

ALTER TABLE Stray_Reports
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

DELIMITER //

CREATE DEFINER=`root`@`localhost`
PROCEDURE `GetVaccinationSchedule`(
    IN `uid` INT
)
BEGIN
    SELECT
        v.vaccination_id,
        a.animal_id,
        a.name           AS animal_name,
        a.image_path,
        vt.name          AS vaccine_name,
        v.scheduled_date,
        v.completed_date
    FROM `Vaccinations` AS v
    JOIN `Animals`      AS a  ON v.animal_id  = a.animal_id
    JOIN `Vaccine_Types` AS vt ON v.vaccine_id = vt.vaccine_id
    WHERE a.animal_id IN (
        SELECT animal_id
          FROM `Adoptions`
         WHERE user_id = uid
           AND status  IN ('approved','completed')
        UNION
        SELECT animal_id
          FROM `Fosterings`
         WHERE user_id = uid
           AND status  IN ('approved','active','completed')
    )
    ORDER BY v.scheduled_date ASC;
END //

DELIMITER ;
