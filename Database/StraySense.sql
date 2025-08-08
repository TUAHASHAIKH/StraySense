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


/*
-- Query: SELECT * FROM StraySense.shelters
-- Date: 2025-05-03 18:38
*/

INSERT INTO `StraySense`.`shelters` (
    `shelter_id`,`name`,`address`,`city`,`country`,`phone`,`email`
) VALUES
    (1,'Hope Animal Shelter','Street 12, Sector F-10','Islamabad','Pakistan','0511234567','contact@hopeisbd.pk'),
    (2,'Paws & Claws Rescue','House 22, DHA Phase 6','Lahore','Pakistan','0421234567','info@pawsclaws.pk'),
    (3,'Safe Haven Shelter','Near Gulshan Chowrangi','Karachi','Pakistan','0217654321','help@safehaven.org.pk'),
    (4,'Animal Aid Center','Street 8, Satellite Town','Rawalpindi','Pakistan','0518765432','aacenter@pk.org'),
    (5,'Companion Rescue Home','Phase 3, Hayatabad','Peshawar','Pakistan','0912345678','rescue@companion.pk'),
    (6,'Stray Friends Shelter','Gulgasht Colony','Multan','Pakistan','0611237890','info@strayfriends.pk'),
    (7,'FurEver Home','Chowk Yadgar, Main Road','Quetta','Pakistan','0814567890','furever@baloch.pk'),
    (8,'Animal Welfare Karachi','Clifton Block 7','Karachi','Pakistan','0211234560','contact@awk.org.pk'),
    (9,'Safe Tails Shelter','Sector H-8','Islamabad','Pakistan','0517654320','shelter@safetails.pk'),
    (10,'Lahore Pet Haven','Johar Town Block H','Lahore','Pakistan','0423344556','haven@lahorepets.pk'),
    (11,'Guardian Shelter','Model Town, C Block','Lahore','Pakistan','0429988776','guardian@pets.pk'),
    (12,'Rescue Nest','Gulberg III, Z Block','Lahore','Pakistan','0423344667','info@rescuenest.pk'),
    (13,'Pet Angels Shelter','Sector G-13/3','Islamabad','Pakistan','0517788996','angels@petcare.pk'),
    (14,'The Pet Refuge','Askari 11','Lahore','Pakistan','0423344677','refuge@pet.pk'),
    (15,'Urban Paws','Gulshan-e-Iqbal Block 2','Karachi','Pakistan','0216677889','urban@paws.pk'),
    (16,'StreetCompanions','F-6 Markaz','Islamabad','Pakistan','0519988776','companions@stray.pk'),
    (17,'Purrfect Shelter','North Karachi, Sector 7D','Karachi','Pakistan','0214455667','purrfect@rescue.pk'),
    (18,'Bark & Purr','Shalimar Town','Lahore','Pakistan','0427788990','barkpurr@shelter.pk'),
    (19,'PetShield','Cantt Area','Rawalpindi','Pakistan','0516655443','support@petshield.pk'),
    (20,'Wagging Tails Shelter','G-11/1','Islamabad','Pakistan','0518877665','waggingtails@pk.org'),
    (21,'Hope Tail Rescue','Phase 4, Bahria Town','Rawalpindi','Pakistan','0515566778','hope@tailrescue.pk'),
    (22,'Animal Safe Spot','Block 13D, Gulshan','Karachi','Pakistan','0217788992','safe@animalspot.pk'),
    (23,'PakPet Aid','University Road','Peshawar','Pakistan','0918877665','aid@pakpet.org'),
    (24,'Pet Guardians Hub','DHA Phase 2','Karachi','Pakistan','0219988775','guardians@pets.pk'),
    (25,'The Rescue Ark','Block 17, Federal B Area','Karachi','Pakistan','0214455778','ark@rescue.pk'),
    (26,'Animal Bridge Shelter','Wapda Town','Lahore','Pakistan','0421122334','bridge@animalrescue.pk'),
    (27,'StrayLife Center','Askari 10','Lahore','Pakistan','0429988990','straylife@pk.org'),
    (28,'Humane Home','Block J, North Nazimabad','Karachi','Pakistan','0218877445','humane@home.pk'),
    (29,'Compassion Paws','E-11/4','Islamabad','Pakistan','0514455999','compassion@paws.pk'),
    (30,'Animal Oasis','Quaid Avenue','Wah Cantt','Pakistan','0571234567','oasis@animalcare.pk'),
    (31,'PawPoint Shelter','Sector 4B','New Karachi','Pakistan','0213344556','pawpoint@pk.org'),
    (32,'Caring Creatures','People’s Colony','Faisalabad','Pakistan','0411234567','caring@creatures.pk'),
    (33,'Safa Shelter','Cantt Road','Sialkot','Pakistan','0529876543','safa@animals.pk'),
    (34,'Rescue Buddies','Gulistan Colony','Bahawalpur','Pakistan','0622345678','buddies@rescue.pk'),
    (35,'Four Paws Place','Green Town','Lahore','Pakistan','0423355778','fourpaws@pk.org'),
    (36,'Shelter Tree','Chowk Fawara','Multan','Pakistan','0614455667','tree@shelter.pk'),
    (37,'PAW (Protect Animal Welfare)','Korangi No.5','Karachi','Pakistan','0215566443','paw@karachi.pk'),
    (38,'Animal Roots Center','Satellite Town Block B','Rawalpindi','Pakistan','0513344667','roots@animals.pk'),
    (39,'The Foster Farm','Valencia Town','Lahore','Pakistan','0425566778','foster@farm.pk'),
    (40,'Animal Allies','Mandian','Abbottabad','Pakistan','0992876543','allies@rescue.pk'),
    (41,'Pet Sanctuary','Old Bara Road','Peshawar','Pakistan','0912233445','sanctuary@pets.pk'),
    (42,'StrayHope Karachi','Block 9 Clifton','Karachi','Pakistan','0212244667','hope@straykarachi.pk'),
    (43,'Rescue Tails','Satellite Town','Sargodha','Pakistan','0481122334','tails@rescue.pk'),
    (44,'Animal Link','Gulshan Ravi','Lahore','Pakistan','0429988775','link@animal.pk'),
    (45,'Faithful Friends Shelter','G-10 Markaz','Islamabad','Pakistan','0517788443','friends@faithful.pk'),
    (46,'Helping Paws','Cantonment','Multan','Pakistan','0614455999','help@paws.pk'),
    (47,'TailHaven','Bahria Town Phase 7','Rawalpindi','Pakistan','0513344550','haven@tail.pk'),
    (48,'Companion Care','Qasimabad','Hyderabad','Pakistan','0224455667','care@companion.pk'),
    (49,'Peaceful Paws','Shah Faisal Town','Karachi','Pakistan','0216677880','peace@paws.pk'),
    (50,'Animal Comfort Zone','Saddar','Quetta','Pakistan','0813344556','comfort@zone.pk'),
    (51,'StrayCare Center','People Colony','Gujranwala','Pakistan','0551122334','care@straycenter.pk'),
    (52,'Furry Friends Home','Daska Road','Sialkot','Pakistan','0522233445','furry@home.pk'),
    (53,'Pet Shelter Aid','Abbaspur Road','Muzaffarabad','Pakistan','0582223344','aid@petshelter.pk'),
    (54,'Karachi Rescue Hub','Gulshan-e-Maymar','Karachi','Pakistan','0217788993','rescuehub@karachi.pk'),
    (55,'Shelter For Souls','Allama Iqbal Town','Lahore','Pakistan','0427788993','souls@shelter.pk'),
    (56,'The Helping Home','H-12','Islamabad','Pakistan','0514455669','helping@home.pk'),
    (57,'Peace Paws Shelter','University Road','Peshawar','Pakistan','0913344557','peace@pawshelter.pk'),
    (58,'PetCare Rescue Center','F-8/3','Islamabad','Pakistan','0514455668','rescue@petcare.pk');


/*
-- Query: SELECT * FROM StraySense.animals
-- Date: 2025-05-03 18:37
*/

INSERT INTO `StraySense`.`animals` (
    `animal_id`,`name`,`species`,`breed`,`age`,`gender`,`health_status`,`neutered`,`shelter_id`,`status`,`created_at`,`updated_at`,`image_path`
) VALUES
    (1,'Riley','dog','Border Collie',3,'female','healthy',1,1,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (2,'Oscar','cat','Russian Blue',2,'male','healthy',0,2,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (3,'Hazel','dog','Corgi',5,'female','sick',1,3,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (4,'Tigger','cat','Calico',1,'male','recovered',0,4,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (5,'Leo','dog','Shiba Inu',4,'male','healthy',1,5,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (6,'Penny','cat','Cornish Rex',2,'female','healthy',1,6,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (7,'Murphy','dog','Newfoundland',6,'male','injured',0,7,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (8,'Loki','cat','Devon Rex',3,'male','sick',0,8,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (9,'Honey','dog','Papillon',1,'female','healthy',1,9,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (10,'Trixie','cat','Balinese',3,'female','recovered',1,10,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (11,'Boomer','dog','Akita',5,'male','healthy',1,1,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (12,'Snickers','cat','LaPerm',2,'female','healthy',1,2,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (13,'Ace','dog','Whippet',3,'male','recovered',0,3,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (14,'Cupcake','cat','Munchkin',1,'female','sick',1,4,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (15,'Tank','dog','Pitbull',6,'male','healthy',0,5,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (16,'Pixie','cat','Ragamuffin',3,'female','injured',1,6,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (17,'Goose','dog','Vizsla',4,'male','healthy',1,7,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (18,'Nina','cat','Turkish Angora',2,'female','healthy',0,8,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (19,'Diesel','dog','Alaskan Malamute',7,'male','sick',1,9,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (20,'Coco','cat','Japanese Bobtail',4,'female','recovered',0,10,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (21,'Scout','dog','Belgian Malinois',3,'male','healthy',1,1,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (22,'Mimi','cat','Ocicat',1,'female','healthy',0,2,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (23,'Hunter','dog','Basenji',5,'male','recovered',1,3,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (24,'Muffin','cat','Selkirk Rex',2,'female','healthy',1,4,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (25,'Bingo','dog','Bull Terrier',4,'male','injured',0,5,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (26,'Lacey','cat','Snowshoe',3,'female','healthy',1,6,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (27,'Bruno','dog','St. Bernard',6,'male','sick',1,7,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (28,'Whiskers','cat','Savannah',4,'female','healthy',0,8,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (29,'Zeke','dog','Greyhound',2,'male','recovered',1,9,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (30,'Fiona','cat','Singapura',3,'female','healthy',1,10,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (31,'Axel','dog','Cane Corso',5,'male','injured',0,1,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (32,'Cali','cat','American Curl',1,'female','healthy',1,2,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (33,'Juno','dog','Irish Setter',4,'female','healthy',1,3,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (34,'Buttons','cat','Havana Brown',3,'female','recovered',0,4,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (35,'Storm','dog','Keeshond',3,'male','sick',1,5,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (36,'Pearl','cat','Burmese',2,'female','healthy',0,6,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (37,'Ranger','dog','Weimaraner',6,'male','healthy',1,7,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (38,'Mango','cat','Lykoi',1,'male','healthy',1,8,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (39,'Oreo','dog','French Bulldog',4,'male','recovered',0,9,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (40,'Lulu','cat','Peterbald',2,'female','healthy',1,10,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (41,'Simba','dog','Labrador Retriever',5,'male','healthy',1,1,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (42,'Nala','cat','Persian',2,'female','sick',0,2,'fostered','2025-04-30 23:57:35','2025-05-03 11:59:26','uploads/cat.webp'),
    (43,'Shadow','dog','German Shepherd',3,'male','recovered',1,3,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (44,'Zelda','cat','Siberian',4,'female','healthy',1,4,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (45,'Rocky','dog','Boxer',6,'male','injured',0,5,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (46,'Ginger','cat','Manx',3,'female','healthy',1,6,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (47,'Thor','dog','Doberman',2,'male','sick',1,7,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (48,'Luna','cat','British Shorthair',1,'female','healthy',1,8,'adopted','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (49,'Max','dog','Golden Retriever',4,'male','healthy',1,9,'fostered','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL),
    (50,'Mochi','cat','Scottish Fold',2,'female','recovered',0,10,'available','2025-04-30 23:57:35','2025-04-30 23:57:35',NULL);
    
    
UPDATE `StraySense`.`animals`
SET `image_path` = 'frontend/public/animal_pictures/animal.jpeg'
WHERE `animal_id` BETWEEN 1 AND 50;

/*
-- Query: SELECT * FROM StraySense.shelters
-- Date: 2025-05-03 18:38
*/
INSERT INTO `StraySense`.`shelters` (
    `shelter_id`,`name`,`address`,`city`,`country`,`phone`,`email`
) VALUES
    (1,'Hope Animal Shelter','Street 12, Sector F-10','Islamabad','Pakistan','0511234567','contact@hopeisbd.pk'),
    (2,'Paws & Claws Rescue','House 22, DHA Phase 6','Lahore','Pakistan','0421234567','info@pawsclaws.pk'),
    (3,'Safe Haven Shelter','Near Gulshan Chowrangi','Karachi','Pakistan','0217654321','help@safehaven.org.pk'),
    (4,'Animal Aid Center','Street 8, Satellite Town','Rawalpindi','Pakistan','0518765432','aacenter@pk.org'),
    (5,'Companion Rescue Home','Phase 3, Hayatabad','Peshawar','Pakistan','0912345678','rescue@companion.pk'),
    (6,'Stray Friends Shelter','Gulgasht Colony','Multan','Pakistan','0611237890','info@strayfriends.pk'),
    (7,'FurEver Home','Chowk Yadgar, Main Road','Quetta','Pakistan','0814567890','furever@baloch.pk'),
    (8,'Animal Welfare Karachi','Clifton Block 7','Karachi','Pakistan','0211234560','contact@awk.org.pk'),
    (9,'Safe Tails Shelter','Sector H-8','Islamabad','Pakistan','0517654320','shelter@safetails.pk'),
    (10,'Lahore Pet Haven','Johar Town Block H','Lahore','Pakistan','0423344556','haven@lahorepets.pk'),
    (11,'Guardian Shelter','Model Town, C Block','Lahore','Pakistan','0429988776','guardian@pets.pk'),
    (12,'Rescue Nest','Gulberg III, Z Block','Lahore','Pakistan','0423344667','info@rescuenest.pk'),
    (13,'Pet Angels Shelter','Sector G-13/3','Islamabad','Pakistan','0517788996','angels@petcare.pk'),
    (14,'The Pet Refuge','Askari 11','Lahore','Pakistan','0423344677','refuge@pet.pk'),
    (15,'Urban Paws','Gulshan-e-Iqbal Block 2','Karachi','Pakistan','0216677889','urban@paws.pk'),
    (16,'StreetCompanions','F-6 Markaz','Islamabad','Pakistan','0519988776','companions@stray.pk'),
    (17,'Purrfect Shelter','North Karachi, Sector 7D','Karachi','Pakistan','0214455667','purrfect@rescue.pk'),
    (18,'Bark & Purr','Shalimar Town','Lahore','Pakistan','0427788990','barkpurr@shelter.pk'),
    (19,'PetShield','Cantt Area','Rawalpindi','Pakistan','0516655443','support@petshield.pk'),
    (20,'Wagging Tails Shelter','G-11/1','Islamabad','Pakistan','0518877665','waggingtails@pk.org'),
    (21,'Hope Tail Rescue','Phase 4, Bahria Town','Rawalpindi','Pakistan','0515566778','hope@tailrescue.pk'),
    (22,'Animal Safe Spot','Block 13D, Gulshan','Karachi','Pakistan','0217788992','safe@animalspot.pk'),
    (23,'PakPet Aid','University Road','Peshawar','Pakistan','0918877665','aid@pakpet.org'),
    (24,'Pet Guardians Hub','DHA Phase 2','Karachi','Pakistan','0219988775','guardians@pets.pk'),
    (25,'The Rescue Ark','Block 17, Federal B Area','Karachi','Pakistan','0214455778','ark@rescue.pk'),
    (26,'Animal Bridge Shelter','Wapda Town','Lahore','Pakistan','0421122334','bridge@animalrescue.pk'),
    (27,'StrayLife Center','Askari 10','Lahore','Pakistan','0429988990','straylife@pk.org'),
    (28,'Humane Home','Block J, North Nazimabad','Karachi','Pakistan','0218877445','humane@home.pk'),
    (29,'Compassion Paws','E-11/4','Islamabad','Pakistan','0514455999','compassion@paws.pk'),
    (30,'Animal Oasis','Quaid Avenue','Wah Cantt','Pakistan','0571234567','oasis@animalcare.pk'),
    (31,'PawPoint Shelter','Sector 4B','New Karachi','Pakistan','0213344556','pawpoint@pk.org'),
    (32,'Caring Creatures','People’s Colony','Faisalabad','Pakistan','0411234567','caring@creatures.pk'),
    (33,'Safa Shelter','Cantt Road','Sialkot','Pakistan','0529876543','safa@animals.pk'),
    (34,'Rescue Buddies','Gulistan Colony','Bahawalpur','Pakistan','0622345678','buddies@rescue.pk'),
    (35,'Four Paws Place','Green Town','Lahore','Pakistan','0423355778','fourpaws@pk.org'),
    (36,'Shelter Tree','Chowk Fawara','Multan','Pakistan','0614455667','tree@shelter.pk'),
    (37,'PAW (Protect Animal Welfare)','Korangi No.5','Karachi','Pakistan','0215566443','paw@karachi.pk'),
    (38,'Animal Roots Center','Satellite Town Block B','Rawalpindi','Pakistan','0513344667','roots@animals.pk'),
    (39,'The Foster Farm','Valencia Town','Lahore','Pakistan','0425566778','foster@farm.pk'),
    (40,'Animal Allies','Mandian','Abbottabad','Pakistan','0992876543','allies@rescue.pk'),
    (41,'Pet Sanctuary','Old Bara Road','Peshawar','Pakistan','0912233445','sanctuary@pets.pk'),
    (42,'StrayHope Karachi','Block 9 Clifton','Karachi','Pakistan','0212244667','hope@straykarachi.pk'),
    (43,'Rescue Tails','Satellite Town','Sargodha','Pakistan','0481122334','tails@rescue.pk'),
    (44,'Animal Link','Gulshan Ravi','Lahore','Pakistan','0429988775','link@animal.pk'),
    (45,'Faithful Friends Shelter','G-10 Markaz','Islamabad','Pakistan','0517788443','friends@faithful.pk'),
    (46,'Helping Paws','Cantonment','Multan','Pakistan','0614455999','help@paws.pk'),
    (47,'TailHaven','Bahria Town Phase 7','Rawalpindi','Pakistan','0513344550','haven@tail.pk'),
    (48,'Companion Care','Qasimabad','Hyderabad','Pakistan','0224455667','care@companion.pk'),
    (49,'Peaceful Paws','Shah Faisal Town','Karachi','Pakistan','0216677880','peace@paws.pk'),
    (50,'Animal Comfort Zone','Saddar','Quetta','Pakistan','0813344556','comfort@zone.pk'),
    (51,'StrayCare Center','People Colony','Gujranwala','Pakistan','0551122334','care@straycenter.pk'),
    (52,'Furry Friends Home','Daska Road','Sialkot','Pakistan','0522233445','furry@home.pk'),
    (53,'Pet Shelter Aid','Abbaspur Road','Muzaffarabad','Pakistan','0582223344','aid@petshelter.pk'),
    (54,'Karachi Rescue Hub','Gulshan-e-Maymar','Karachi','Pakistan','0217788993','rescuehub@karachi.pk'),
    (55,'Shelter For Souls','Allama Iqbal Town','Lahore','Pakistan','0427788993','souls@shelter.pk'),
    (56,'The Helping Home','H-12','Islamabad','Pakistan','0514455669','helping@home.pk'),
    (57,'Peace Paws Shelter','University Road','Peshawar','Pakistan','0913344557','peace@pawshelter.pk'),
    (58,'PetCare Rescue Center','F-8/3','Islamabad','Pakistan','0514455668','rescue@petcare.pk');


INSERT INTO `StraySense`.`stray_reports`
  (`report_id`, `user_id`, `description`, `report_date`, `status`, `accepted_date`, `processed_animal_id`,
   `animal_type`, `animal_size`, `visible_injuries`, `province`, `city`, `latitude`, `longitude`)
VALUES
  (1,  1,  'Stray dog found near the park, looks injured',            '2025-01-01 00:00:00','pending',  NULL, NULL, 'dog', 'medium','yes','Punjab','Lahore',    31.5497, 74.3436),
  (2,  2,  'Cat spotted near a grocery store, seems hungry',          '2025-01-02 00:00:00','accepted','2025-01-03 00:00:00', 3,   'cat', 'small', 'no','Sindh', 'Karachi',   24.8607, 67.0011),
  (3,  3,  'Dog abandoned near a bus stop, seems frightened',         '2025-01-04 00:00:00','rejected', NULL, NULL, 'dog', 'medium','no','ICT',   'Islamabad',33.6844, 73.0479),
  (4,  4,  'Stray dog near university campus, appears sick',          '2025-01-06 00:00:00','pending',  NULL, NULL, 'dog', 'medium','yes','Punjab','Rawalpindi',33.5651, 73.0169),
  (5,  5,  'Cat stuck in a tree near a shopping mall',               '2025-01-08 00:00:00','accepted','2025-01-09 00:00:00', 7,   'cat', 'small', 'no','Khyber Pakhtunkhwa','Peshawar',34.0151, 71.5249),
  (6,  6,  'Found a stray dog near a restaurant, needs attention',   '2025-01-10 00:00:00','pending',  NULL, NULL, 'dog', 'medium','yes','Punjab','Faisalabad',31.4504, 73.1350),
  (7,  7,  'Dog wandering aimlessly near a playground',               '2025-01-12 00:00:00','accepted','2025-01-14 00:00:00', 9,   'dog', 'medium','no','Punjab','Multan',   30.1575, 71.5249),
  (8,  8,  'Stray kitten near the bus terminal, looks weak',         '2025-01-14 00:00:00','rejected', NULL, NULL, 'cat', 'small', 'yes','Balochistan','Quetta',30.1798, 66.9750),
  (9,  9,  'Dog with no collar found on main street',                '2025-01-16 00:00:00','accepted','2025-01-18 00:00:00', 5,   'dog', 'medium','no','Punjab','Lahore',    31.5497, 74.3436),
  (10, 10, 'Cat running on road near a school',                      '2025-01-18 00:00:00','pending',  NULL, NULL, 'cat', 'small', 'no','Sindh', 'Karachi',   24.8607, 67.0011),
  (11, 11, 'Dog barking loudly near a residential area',             '2025-01-20 00:00:00','accepted','2025-01-22 00:00:00',12,   'dog', 'medium','no','ICT',   'Islamabad',33.6844, 73.0479),
  (12, 12, 'Stray cat near a petrol station, seems scared',         '2025-01-22 00:00:00','rejected', NULL, NULL, 'cat', 'small', 'no','Punjab','Rawalpindi',33.5651, 73.0169),
  (13, 13, 'Dog spotted on the highway, possibly lost',             '2025-01-24 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Khyber Pakhtunkhwa','Peshawar',34.0151, 71.5249),
  (14, 14, 'Cat hiding under a bench in the park',                  '2025-01-26 00:00:00','accepted','2025-01-28 00:00:00', 6,   'cat', 'small', 'no','Punjab','Faisalabad',31.4504, 73.1350),
  (15, 15, 'Stray dog near a restaurant, looks malnourished',       '2025-01-28 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Punjab','Multan',   30.1575, 71.5249),
  (16, 16, 'Found injured dog in a shopping mall parking lot',      '2025-01-30 00:00:00','rejected', NULL, NULL, 'dog', 'medium','yes','Balochistan','Quetta',30.1798, 66.9750),
  (17, 17, 'Abandoned kitten near a coffee shop',                   '2025-02-01 00:00:00','accepted','2025-02-03 00:00:00',13,   'cat', 'small', 'no','Punjab','Lahore',    31.5497, 74.3436),
  (18, 18, 'Dog spotted wandering near a hospital',                 '2025-02-03 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Sindh', 'Karachi',   24.8607, 67.0011),
  (19, 19, 'Stray cat near a railway station, looks sick',          '2025-02-05 00:00:00','rejected', NULL, NULL, 'cat', 'small', 'yes','ICT',   'Islamabad',33.6844, 73.0479),
  (20, 20, 'Dog running on road near a market',                     '2025-02-07 00:00:00','accepted','2025-02-09 00:00:00', 4,   'dog', 'medium','no','Punjab','Rawalpindi',33.5651, 73.0169),
  (21, 21, 'Cat caught in a fence near a farm',                     '2025-02-09 00:00:00','pending',  NULL, NULL, 'cat', 'small', 'no','Khyber Pakhtunkhwa','Peshawar',34.0151, 71.5249),
  (22, 22, 'Stray dog by a school, friendly but lost',              '2025-02-11 00:00:00','rejected', NULL, NULL, 'dog', 'medium','no','Punjab','Faisalabad',31.4504, 73.1350),
  (23, 23, 'Dog near a lake, seems to have an injury',              '2025-02-13 00:00:00','pending',  NULL, NULL, 'dog', 'medium','yes','Punjab','Multan',   30.1575, 71.5249),
  (24, 24, 'Found dog near a bus station, it looks abandoned',      '2025-02-15 00:00:00','accepted','2025-02-17 00:00:00',18,   'dog', 'medium','no','Balochistan','Quetta',30.1798, 66.9750),
  (25, 25, 'Cat wandering in a shopping area, appears hungry',      '2025-02-17 00:00:00','rejected', NULL, NULL, 'cat', 'small', 'no','Punjab','Lahore',    31.5497, 74.3436),
  (26, 26, 'Stray dog near an office building, looks healthy',      '2025-02-19 00:00:00','accepted','2025-02-21 00:00:00', 2,   'dog', 'medium','no','Sindh', 'Karachi',   24.8607, 67.0011),
  (27, 27, 'Found stray dog with collar near a mall',              '2025-02-21 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','ICT',   'Islamabad',33.6844, 73.0479),
  (28, 28, 'Cat found under a tree, seemed abandoned',              '2025-02-23 00:00:00','rejected', NULL, NULL, 'cat', 'small', 'no','Punjab','Rawalpindi',33.5651, 73.0169),
  (29, 29, 'Dog running on the highway, needs help',               '2025-02-25 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Khyber Pakhtunkhwa','Peshawar',34.0151, 71.5249),
  (30, 30, 'Stray dog with no collar near a restaurant',            '2025-02-27 00:00:00','accepted','2025-02-28 00:00:00', 8,   'dog', 'medium','no','Punjab','Faisalabad',31.4504, 73.1350),
  (31, 31, 'Abandoned kitten near a playground',                    '2025-03-01 00:00:00','rejected', NULL, NULL, 'cat', 'small', 'no','Punjab','Multan',   30.1575, 71.5249),
  (32, 32, 'Dog on the road near a church, seems lost',             '2025-03-03 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Balochistan','Quetta',30.1798, 66.9750),
  (33, 33, 'Cat found at a bus stop, seems injured',               '2025-03-05 00:00:00','accepted','2025-03-07 00:00:00',10,   'cat', 'small', 'yes','Punjab','Lahore',    31.5497, 74.3436),
  (34, 34, 'Stray dog spotted near a restaurant, looks old',        '2025-03-07 00:00:00','rejected', NULL, NULL, 'dog', 'medium','no','Sindh', 'Karachi',   24.8607, 67.0011),
  (35, 35, 'Dog lost near the university',                          '2025-03-09 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','ICT',   'Islamabad',33.6844, 73.0479),
  (36, 36, 'Cat near a pet shop, looks playful',                    '2025-03-11 00:00:00','accepted','2025-03-13 00:00:00',14,   'cat', 'small', 'no','Punjab','Rawalpindi',33.5651, 73.0169),
  (37, 37, 'Stray dog found near a school gate',                    '2025-03-13 00:00:00','rejected', NULL, NULL, 'dog', 'medium','no','Khyber Pakhtunkhwa','Peshawar',34.0151, 71.5249),
  (38, 38, 'Dog running through the streets, looks healthy',        '2025-03-15 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Punjab','Faisalabad',31.4504, 73.1350),
  (39, 39, 'Cat near a convenience store, seems scared',            '2025-03-17 00:00:00','accepted','2025-03-19 00:00:00',15,   'cat', 'small', 'no','Punjab','Multan',   30.1575, 71.5249),
  (40, 40, 'Stray dog with a collar near a park',                   '2025-03-19 00:00:00','rejected', NULL, NULL, 'dog', 'medium','no','Balochistan','Quetta',30.1798, 66.9750),
  (41, 41, 'Dog spotted near a playground, needs help',             '2025-03-21 00:00:00','accepted','2025-03-23 00:00:00',16,   'dog', 'medium','no','Punjab','Lahore',    31.5497, 74.3436),
  (42, 42, 'Cat wandering near a mall',                             '2025-03-23 00:00:00','pending',  NULL, NULL, 'cat', 'small', 'no','Sindh', 'Karachi',   24.8607, 67.0011),
  (43, 43, 'Stray dog near a bus terminal, appears lost',           '2025-03-25 00:00:00','rejected', NULL, NULL, 'dog', 'medium','no','ICT',   'Islamabad',33.6844, 73.0479),
  (44, 44, 'Dog spotted near a hospital gate',                      '2025-03-27 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Punjab','Rawalpindi',33.5651, 73.0169),
  (45, 45, 'Stray kitten in a garden, looks abandoned',             '2025-03-29 00:00:00','accepted','2025-03-31 00:00:00',17,   'cat', 'small', 'no','Khyber Pakhtunkhwa','Peshawar',34.0151, 71.5249),
  (46, 46, 'Dog spotted near a mall, looks healthy',               '2025-04-01 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Punjab','Faisalabad',31.4504, 73.1350),
  (47, 47, 'Cat on the side of a busy street',                      '2025-04-03 00:00:00','rejected', NULL, NULL, 'cat', 'small', 'no','Punjab','Multan',   30.1575, 71.5249),
  (48, 48, 'Found stray dog near the bus stop',                     '2025-04-05 00:00:00','pending',  NULL, NULL, 'dog', 'medium','no','Balochistan','Quetta',30.1798, 66.9750),
  (49, 49, 'Stray cat near a shopping area, seems hungry',          '2025-04-07 00:00:00','accepted','2025-04-09 00:00:00',20,   'cat', 'small', 'no','Punjab','Lahore',    31.5497, 74.3436),
  (50, 50, 'Dog running along a highway, seems scared',            '2025-04-09 00:00:00','rejected', NULL, NULL, 'dog', 'medium','no','Sindh', 'Karachi',   24.8607, 67.0011);


INSERT INTO `StraySense`.`Users`
  (`user_id`,`email`,`password_hash`,`first_name`,`last_name`,`created_at`,`updated_at`)
VALUES
  
  (2,  'cheryl38@yahoo.com',      'b27b5062c748c25dd2eb04b224c0ef47d19ca86fbdfeb8254f628919f97f75a8', 'Linda',     'West',     '2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (3,  'nancy71@arnold-mann.net', '83751abb73a04e4e7cf2e2c7c2950072a351de1845ce81237515e01bed524763', 'Megan',     'Villanueva','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (4,  'aimee33@hotmail.com',     '8731410d43a1dc268555ac46c6aaae6b0fb1631685037c151efb0844e375b017', 'Laura',     'Cook',     '2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (5,  'loganmelissa@williams.net','1e4fcac570cfdbaa99a098b63858dac752d3201e83f7c88c9dbbbd085f62fb3e','Christine', 'Huff',     '2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (6,  'charlesturner@white-gordon.com','f946a6d923786d526dceae64e2770f8113b87cd88a06a7f47f70e96324a541ed','Elizabeth','Smith','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (7,  'deborah64@gmail.com',     '8b56f731d8251868a3c47ae7ea60125390535bb7106b0b3ce78ce18fd38cfc5e','Christopher','Wheeler','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (8,  'johnwalsh@yahoo.com',      'dd906cd5225bcca44692e8b22799bb5466bec03ff5dac48ff3f9a8e168a3806f','Mary',      'Williams','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (9,  'amymccarty@gmail.com',     '39b0432ce9d4a242187102a477977e6bec6b25aa2104b5da527300df6cadd0f2','Melissa',   'Sanders','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (10, 'hillshawn@callahan.net',   '45e2cff0b76111bcf9d685b7a71ee0550facaff7f27375e507df5c1545d573cb','Nathan',    'Medina','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (11, 'amatthews@hernandez.com',  '3bdf4dec7c81ac55d0cfbfb3b9cb6d6f103ae39c823cfadabfd6fe5b089a9cfc','Richard',   'Murphy','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (12, 'garciaregina@yahoo.com',   'a88564f1f8c90e1abecdd5d6cc43a2fd14cafc92f508b84ec213643518342eae','Alan',      'Long','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (13, 'ymora@hotmail.com',        '15e700d568fc1db926400a1b7dd49f5db34f5de1c54a275d723d5daf1bd762cf','Jared',     'Williams','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (14, 'danielellis@payne-hernandez.org','debfca5ae393259b88850e7dac4f02473bfb165cb29b6441ff3932687c101934','Eddie','Scott','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (15, 'taguilar@roman.com',       '3887b023773a0339eb8943d4f5a38c22035781c11c0b7e72592745c95a997f8c','Ronald',    'Fischer','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (16, 'epetersen@yahoo.com',      'faeee516ac24d3934d5db34952e1ba9b8ee9d3451398f1edb5937f1a5f0da189','Jessica',   'Cook','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (17, 'fbutler@love.com',         'cf9967091982f7395584cda7160b206b311aeb2cf00cb96cc92382d13c8df940','Jaclyn',    'Mendez','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (18, 'montesjennifer@yahoo.com', '928fb053ffa8e34477a97b568b396bf99d3aef87c8a922476e7260eb205263db','Rachel',    'Duffy','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (19, 'claytonweiss@chan.com',    '9afcdabdcbabf6d3b0568d34945a9d8c692c82cd24b117732ac27c030b5a6969','Michael',   'Martinez','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (20, 'michael03@jones-barry.com','29d31c47a25089b5e6a357dcae4beba7fb7b064606b640df34996b463400f2e7','Susan',     'Phillips','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (21, 'brittanymiller@hotmail.com','ead45a1ccff88890663b841e46d73238651a1a77a406122d9958b397fae1e764','Andrea',   'Yang','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (22, 'wevans@wright.com',        'fb76ddb0bb01c3b887517057daf4af400307484b0b397345d6d49f107322ddfe','Katrina',  'Reynolds','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (23, 'hpeterson@kelly.com',      '97faf89b0cbc3d5aa6fd6845ccbdf7d24b0460bcf201697714fbe77ea316985b','Crystal',  'Smith','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (24, 'smithraymond@hotmail.com', '5ecb71609c75eec1fa1d8610580a766ac4bac990421a1438bffa506091d0b4fc','Justin',   'Taylor','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (25, 'jenkinscynthia@figueroa-strong.com','337ef7739eac0e6f5e414710447bd515575372d0d48e67ce85e66bfda034ff96','Scott','Thomas','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (26, 'clayjason@yahoo.com',      '709e8e680e5f47a73f87ebfe195d489f78a70ac1b1c7bd64c0b347922af34498','Jason',    'Clayton','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (27, 'fblackburn@knight-harris.net','f8904bc9d62b774a33fd66cb645e704b703b35aabf7d7809b8b28eabb55b057d','James','Collins','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (28, 'cooleyashley@yahoo.com',   'a83c1084be63ad5f47ff08456ed42831a5da09be5b1b5fe4409cd4218d467b99','Ashley',   'Cooley','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (29, 'claudia07@moore-morales.com','2659d184fc846ff2229a1f663ca1d61b44f3ae63a09e0f46212e5a3c42b22d8d','Claudia','Moore','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (30, 'hilldaniel@keller.com',    'debb0e4519be47f181268518929ba8b9614626b56b861c71229b46bbf3b65a8d','Daniel',   'Hill','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (31, 'ecampos@jones.info',       'c8fd3b79931fa28d2b9223065b45db0b9d0ff7f88b07da9b22cbeb92604f4e52','Erica',    'Campos','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (32, 'rgrayson@garcia.net',      'abdf1bb8a1608d135db23f8c3b93d758b2c8ca1a9c0e7a5769e3ae0a0151ad1c','Renee',    'Grayson','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (33, 'tbradley@wood-cameron.org','12ef2db12d3a0db8b8272d44edb24efae998d577cfeaf2d3456823dbd2c5ff1d','Tina',     'Bradley','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (34, 'corbinclaudia@yahoo.com',  'c9dbb5e7d7f3f30e6f5ad6b98d79a24e5c724a10c6576239fc1e8c9a0428d808','Claudia',  'Corbin','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (35, 'msmith@romero-fernandez.org','48bcdaeeea7a0fe38c8d5e9c38546d906598a12d1e41dfe650a44c64e5b7c7f7','Monica','Smith','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (36, 'lmartin@lambert.com',      '54196e60deff95788560b3647a129978a5ea59f1638b4b599572f842ad22535e','Lisa',     'Martin','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (37, 'rmorales@johnson-ross.com','d7a3b6fc0de2b2492ccdef3f32838f01e2c1a6745ec83a4d93732b2065d32523','Raul',     'Morales','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (38, 'bryanbarbara@kimberly.com','1d6a1bbf3e442c17e6e01732d3477cc993f92063ec994b88e56cf9d07a8bb99e','Bryan',    'Barbara','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (39, 'davisbethany@richards.biz','b4b90e63b13182a206746722c43e51b3d4438d01fa7ac96f02f1b999446458da','Bethany','Davis','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (40, 'davidmatthews@taylor.com','547cb90314eecf264dadd8cc5248f16c2a1618eb9ec602d5925b6b49ab697c75','David',   'Matthews','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (41, 'bradfordvictor@gmail.com','98ab2093c1895bcd34f4fa7a09fd4516d5fe8334a222e7a53b7d074ca231c249','Victor',  'Bradford','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (42, 'reedjacob@reese-martin.com','db8284d980ce1b2d575f5fd2631b8bc1f1e8b979a83a7a04ca1c4d9e4479d616','Jacob',  'Reed','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (43, 'paigelucia@holland.com',   '3bcf772bfed22859e96c6b7109b5773b8197a8a2cc587ea0350b4c7fa8f87b52','Lucia',   'Paige','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (44, 'cheyennegreen@gmail.com',  '2c57cb37956a0ef93e7625fcfe755576cda0a01d1f92e2a7462a6d36bbd9ca40','Cheyenne','Green','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (45, 'alvaradojames@young-williams.com','87d2ffdb1c24a8fe9aef4b1ac7f1609eb559b6f2c5179f8f9c4db272a01b5f88','James','Alvarado','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (46, 'moorematthew@fisher.com',  '060657a9db0e079fb75940f9b2c03338fe39041cc39361c91428357de45fe170','Matthew','Moore','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (47, 'amandawalker@lee.org',     '7f4d772110126f7a4de1b7a11b74eafbb907cc7348e6b8ae9d9c9e4778ac1df1','Amanda',  'Walker','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (48, 'meganpatterson@king.com',  '57cfb5c2a2d3574f773d239f58f73f0b3e62e35d8a11acb11e2a6a276fdf0c4f','Megan',   'Patterson','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (49, 'bennettphillip@jones.biz', '2d5ab1b295db0e68b748b1b71138d8adfe52a40d5f0909fa057195823dfe1687','Phillip', 'Bennett','2025-04-30 23:30:10','2025-04-30 23:30:10'),
  (50, 'lisaallen@henry-ellis.com','e53ca6ff64fdad7de9f122e0c5b441bde4b0be12c395b95d987b79cc42839d4e','Lisa',    'Allen','2025-04-30 23:30:10','2025-04-30 23:30:10');


ALTER TABLE `StraySense`.`Adoptions`
AUTO_INCREMENT = 1;
INSERT INTO `StraySense`.`Adoptions`
  (`user_id`, `animal_id`, `status`,   `application_date`,      `approval_date`,         `completion_date`,        `home_check_passed`, `fee_paid`, `contract_signed`, `notes`)
VALUES
  ( 1, 12, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                'First-time adopter'),
  ( 2,  5, 'approved',  '2025-04-21 00:06:54', '2025-04-26 00:06:54', NULL,                  1,                    1,          1,                'All checks completed'),
  ( 3, 33, 'rejected',  '2025-04-16 00:06:54', '2025-04-18 00:06:54', NULL,                  0,                    0,          0,                'Failed home inspection'),
  ( 4, 42, 'completed', '2025-04-01 00:06:54', '2025-04-06 00:06:54', '2025-04-11 00:06:54', 1,                    1,          1,                'Successful adoption'),
  ( 5,  9, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                'Wants a calm dog'),
  ( 6, 16, 'approved',  '2025-04-24 00:06:54', '2025-04-28 00:06:54', NULL,                  1,                    1,          1,                ''),
  ( 7, 48, 'completed', '2025-04-11 00:06:54', '2025-04-14 00:06:54', '2025-04-19 00:06:54', 1,                    1,          1,                'Great home environment'),
  ( 8, 25, 'rejected',  '2025-04-19 00:06:54', '2025-04-21 00:06:54', NULL,                  0,                    0,          0,                'Apartment too small'),
  ( 9,  1, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                ''),
  (10, 17, 'approved',  '2025-04-26 00:06:54', '2025-04-29 00:06:54', NULL,                  1,                    1,          1,                'Quick process'),
  (11,  3, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                ''),
  (12,  6, 'approved',  '2025-04-22 00:06:54', '2025-04-25 00:06:54', NULL,                  1,                    1,          1,                ''),
  (13, 21, 'rejected',  '2025-04-20 00:06:54', '2025-04-22 00:06:54', NULL,                  0,                    0,          0,                ''),
  (14, 32, 'completed', '2025-04-01 00:06:54', '2025-04-05 00:06:54', '2025-04-10 00:06:54', 1,                    1,          1,                ''),
  (15, 20, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                ''),
  (16,  7, 'approved',  '2025-04-25 00:06:54', '2025-04-28 00:06:54', NULL,                  1,                    1,          1,                ''),
  (17, 50, 'completed', '2025-04-06 00:06:54', '2025-04-11 00:06:54', '2025-04-16 00:06:54', 1,                    1,          1,                ''),
  (18, 13, 'rejected',  '2025-04-17 00:06:54', '2025-04-19 00:06:54', NULL,                  0,                    0,          0,                ''),
  (19, 19, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                ''),
  (20, 22, 'approved',  '2025-04-23 00:06:54', '2025-04-27 00:06:54', NULL,                  1,                    1,          1,                ''),
  (21,  8, 'completed', '2025-04-03 00:06:54', '2025-04-08 00:06:54', '2025-04-13 00:06:54', 1,                    1,          1,                ''),
  (22, 28, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                ''),
  (23, 10, 'approved',  '2025-04-24 00:06:54', '2025-04-29 00:06:54', NULL,                  1,                    1,          1,                ''),
  (24, 14, 'rejected',  '2025-04-16 00:06:54', '2025-04-18 00:06:54', NULL,                  0,                    0,          0,                ''),
  (25, 11, 'completed', '2025-04-05 00:06:54', '2025-04-10 00:06:54', '2025-04-15 00:06:54', 1,                    1,          1,                ''),
  (26, 34, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                ''),
  (27, 27, 'approved',  '2025-04-25 00:06:54', '2025-04-28 00:06:54', NULL,                  1,                    1,          1,                ''),
  (28, 36, 'completed', '2025-04-07 00:06:54', '2025-04-11 00:06:54', '2025-04-16 00:06:54', 1,                    1,          1,                ''),
  (29, 30, 'rejected',  '2025-04-18 00:06:54', '2025-04-20 00:06:54', NULL,                  0,                    0,          0,                ''),
  (30,  4, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                ''),
  (31,  9, 'completed', '2025-03-27 00:06:54', '2025-03-31 00:06:54', '2025-04-05 00:06:54', 1,                    1,          1,                'Happy adoption'),
  (32, 12, 'approved',  '2025-04-27 00:06:54', '2025-04-29 00:06:54', NULL,                  1,                    1,          1,                'Second-time adopter'),
  (33, 18, 'completed', '2025-04-16 00:06:54', '2025-04-21 00:06:54', '2025-04-26 00:06:54', 1,                    1,          1,                'Loved by the family'),
  (34, 24, 'rejected',  '2025-04-11 00:06:54', '2025-04-13 00:06:54', NULL,                  0,                    0,          0,                'Insufficient space for pet'),
  (35,  3, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                'Adopted previously but returned'),
  (36, 13, 'approved',  '2025-04-26 00:06:54', '2025-04-28 00:06:54', NULL,                  1,                    1,          1,                'Great adopter history'),
  (37, 17, 'completed', '2025-04-09 00:06:54', '2025-04-13 00:06:54', '2025-04-17 00:06:54', 1,                    1,          1,                'Ready for a new home'),
  (38,  9, 'rejected',  '2025-04-22 00:06:54', '2025-04-25 00:06:54', NULL,                  0,                    0,          0,                'Didn’t pass home inspection'),
  (39, 16, 'approved',  '2025-04-13 00:06:54', '2025-04-17 00:06:54', NULL,                  1,                    1,          1,                'Experienced adopter'),
  (40, 32, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                'Looking for a specific breed'),
  (41, 50, 'completed', '2025-04-17 00:06:54', '2025-04-20 00:06:54', '2025-04-24 00:06:54', 1,                    1,          1,                'Perfect fit for the family'),
  (42, 12, 'rejected',  '2025-04-10 00:06:54', '2025-04-14 00:06:54', NULL,                  0,                    0,          0,                'Health concerns'),
  (43, 14, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                'Has experience with similar animals'),
  (44, 28, 'completed', '2025-04-21 00:06:54', '2025-04-26 00:06:54', '2025-04-28 00:06:54', 1,                    1,          1,                'Loves animals'),
  (45, 22, 'approved',  '2025-04-01 00:06:54', '2025-04-05 00:06:54', NULL,                  1,                    1,          1,                'Highly recommended by the shelter'),
  (46, 24, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                'Adoption in progress'),
  (47, 18, 'rejected',  '2025-04-14 00:06:54', '2025-04-17 00:06:54', NULL,                  0,                    0,          0,                'Incompatible with household'),
  (48, 27, 'completed', '2025-04-19 00:06:54', '2025-04-22 00:06:54', '2025-04-25 00:06:54', 1,                    1,          1,                'Perfect home environment'),
  (49, 32, 'approved',  '2025-04-18 00:06:54', '2025-04-21 00:06:54', NULL,                  1,                    1,          1,                'Great fit for the dog'),
  (50, 36, 'pending',   '2025-05-01 00:06:54', NULL,                  NULL,                  NULL,                 0,          0,                'Looking for a calm pet');

-- Reset the auto‐increment counter so IDs start at 1
ALTER TABLE `StraySense`.`Vaccinations`
AUTO_INCREMENT = 1;

INSERT INTO `StraySense`.`Vaccine_Types`
  (`vaccine_id`, `name`,               `description`)
VALUES
  (1,  'Rabies',           'A vaccine to protect animals against the rabies virus, which is fatal and transmittable to humans.'),
  (2,  'Distemper',        'A highly contagious viral disease affecting dogs, often fatal if left untreated.'),
  (3,  'Parvovirus',       'A viral disease in dogs that causes severe gastrointestinal illness and can be fatal if not treated promptly.'),
  (4,  'Leptospirosis',    'A bacterial infection that affects both animals and humans, causing liver and kidney damage.'),
  (5,  'Bordetella',       'A vaccine used to prevent kennel cough, a respiratory disease caused by bacteria in dogs.'),
  (6,  'Feline Leukemia',  'A vaccine to protect cats from feline leukemia virus (FeLV), which weakens the immune system.'),
  (7,  'Feline Calicivirus','A viral infection in cats causing respiratory issues, ulcers, and mouth lesions.'),
  (8,  'Canine Influenza', 'A vaccine designed to protect dogs against the canine influenza virus, a contagious respiratory disease.'),
  (9,  'Lyme Disease',     'A vaccine that helps protect dogs from Lyme disease, transmitted through tick bites.'),
  (10, 'Adenovirus',       'A vaccine used to prevent infectious canine hepatitis caused by adenovirus type 1, affecting liver function.');

-- 1) Reset the auto‐increment counter
ALTER TABLE `StraySense`.`Vaccinations`
  AUTO_INCREMENT = 1;
  
  -- 3) Bulk‐insert 50 rows, cycling vaccine_id = ((animal_id-1)%10)+1
INSERT INTO `StraySense`.`Vaccinations`
  (`animal_id`, `vaccine_id`, `scheduled_date`, `completed_date`, `created_at`)
VALUES
  ( 1,  1, '2025-01-10','2025-01-12','2025-05-01 00:14:44'),
  ( 2,  2, '2025-01-12','2025-01-15','2025-05-01 00:14:44'),
  ( 3,  3, '2025-01-15','2025-01-18','2025-05-01 00:14:44'),
  ( 4,  4, '2025-01-17','2025-01-20','2025-05-01 00:14:44'),
  ( 5,  5, '2025-01-20','2025-01-22','2025-05-01 00:14:44'),
  ( 6,  6, '2025-01-22','2025-01-25','2025-05-01 00:14:44'),
  ( 7,  7, '2025-01-25','2025-01-28','2025-05-01 00:14:44'),
  ( 8,  8, '2025-01-28','2025-01-30','2025-05-01 00:14:44'),
  ( 9,  9, '2025-02-01','2025-02-03','2025-05-01 00:14:44'),
  (10, 10,'2025-02-03','2025-02-05','2025-05-01 00:14:44'),
  (11,  1,'2025-02-05','2025-02-08','2025-05-01 00:14:44'),
  (12,  2,'2025-02-08','2025-02-10','2025-05-01 00:14:44'),
  (13,  3,'2025-02-10','2025-02-13','2025-05-01 00:14:44'),
  (14,  4,'2025-02-13','2025-02-15','2025-05-01 00:14:44'),
  (15,  5,'2025-02-15','2025-02-18','2025-05-01 00:14:44'),
  (16,  6,'2025-02-18','2025-02-21','2025-05-01 00:14:44'),
  (17,  7,'2025-02-21','2025-02-23','2025-05-01 00:14:44'),
  (18,  8,'2025-02-23','2025-02-25','2025-05-01 00:14:44'),
  (19,  9,'2025-02-26','2025-02-28','2025-05-01 00:14:44'),
  (20, 10,'2025-02-28','2025-03-02','2025-05-01 00:14:44'),
  (21,  1,'2025-03-03','2025-03-05','2025-05-01 00:14:44'),
  (22,  2,'2025-03-05','2025-03-08','2025-05-01 00:14:44'),
  (23,  3,'2025-03-08','2025-03-10','2025-05-01 00:14:44'),
  (24,  4,'2025-03-10','2025-03-12','2025-05-01 00:14:44'),
  (25,  5,'2025-03-12','2025-03-15','2025-05-01 00:14:44'),
  (26,  6,'2025-03-15','2025-03-17','2025-05-01 00:14:44'),
  (27,  7,'2025-03-17','2025-03-20','2025-05-01 00:14:44'),
  (28,  8,'2025-03-20','2025-03-23','2025-05-01 00:14:44'),
  (29,  9,'2025-03-23','2025-03-25','2025-05-01 00:14:44'),
  (30, 10,'2025-03-25','2025-03-27','2025-05-01 00:14:44'),
  (31,  1,'2025-03-27','2025-03-30','2025-05-01 00:14:44'),
  (32,  2,'2025-03-30','2025-04-02','2025-05-01 00:14:44'),
  (33,  3,'2025-04-02','2025-04-05','2025-05-01 00:14:44'),
  (34,  4,'2025-04-05','2025-04-07','2025-05-01 00:14:44'),
  (35,  5,'2025-04-07','2025-04-09','2025-05-01 00:14:44'),
  (36,  6,'2025-04-09','2025-04-11','2025-05-01 00:14:44'),
  (37,  7,'2025-04-11','2025-04-13','2025-05-01 00:14:44'),
  (38,  8,'2025-04-13','2025-04-15','2025-05-01 00:14:44'),
  (39,  9,'2025-04-15','2025-04-18','2025-05-01 00:14:44'),
  (40, 10,'2025-04-18','2025-04-20','2025-05-01 00:14:44'),
  (41,  1,'2025-04-20','2025-04-23','2025-05-01 00:14:44'),
  (42,  2,'2025-04-23','2025-04-25','2025-05-01 00:14:44'),
  (43,  3,'2025-04-25','2025-04-28','2025-05-01 00:14:44'),
  (44,  4,'2025-04-28','2025-04-30','2025-05-01 00:14:44'),
  (45,  5,'2025-04-30','2025-05-02','2025-05-01 00:14:44'),
  (46,  6,'2025-05-02','2025-05-05','2025-05-01 00:14:44'),
  (47,  7,'2025-05-05','2025-05-07','2025-05-01 00:14:44'),
  (48,  8,'2025-05-07','2025-05-10','2025-05-01 00:14:44'),
  (49,  9,'2025-05-10','2025-05-12','2025-05-01 00:14:44'),
  (50, 10,'2025-05-12','2025-05-14','2025-05-01 00:14:44');
  
  DELIMITER //

CREATE PROCEDURE SubmitAdoptionRequest(
    IN p_user_id INT,
    IN p_animal_id INT,
    OUT p_adoption_id INT,
    OUT p_status VARCHAR(20),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_animal_status VARCHAR(20);
    DECLARE v_existing_request INT;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Check if animal exists and is available
    SELECT status INTO v_animal_status
    FROM Animals
    WHERE animal_id = p_animal_id;
    
    IF v_animal_status IS NULL THEN
        SET p_status = 'error';
        SET p_message = 'Animal not found';
        ROLLBACK;
    ELSEIF v_animal_status != 'available' THEN
        SET p_status = 'error';
        SET p_message = 'Animal is not available for adoption';
        ROLLBACK;
    ELSE
        -- Check for existing pending request
        SELECT COUNT(*) INTO v_existing_request
        FROM Adoptions
        WHERE user_id = p_user_id 
        AND animal_id = p_animal_id 
        AND status = 'pending';
        
        IF v_existing_request > 0 THEN
            SET p_status = 'error';
            SET p_message = 'You already have a pending adoption request for this animal';
            ROLLBACK;
        ELSE
            -- Insert adoption request
            INSERT INTO Adoptions (user_id, animal_id, status)
            VALUES (p_user_id, p_animal_id, 'pending');
            
            -- Update animal status
            UPDATE Animals
            SET status = 'pending_adoption'
            WHERE animal_id = p_animal_id;
            
            SET p_adoption_id = LAST_INSERT_ID();
            SET p_status = 'success';
            SET p_message = 'Adoption request submitted successfully';
            COMMIT;
        END IF;
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE GetUserAdoptions(
    IN p_user_id INT
)
BEGIN
    SELECT 
        a.adoption_id,
        a.status,
        a.application_date,
        a.approval_date,
        a.completion_date,
        a.home_check_passed,
        a.fee_paid,
        a.contract_signed,
        a.notes,
        an.name as animal_name,
        an.species,
        an.breed,
        an.age,
        an.gender,
        an.health_status
    FROM Adoptions a
    JOIN Animals an ON a.animal_id = an.animal_id
    WHERE a.user_id = p_user_id
    ORDER BY a.application_date DESC;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE UpdateAdoptionStatus(
    IN p_adoption_id INT,
    IN p_new_status VARCHAR(20),
    OUT p_status VARCHAR(20),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    DECLARE v_animal_id INT;
    
    START TRANSACTION;
    
    -- Get current status and animal_id
    SELECT status, animal_id 
    INTO v_current_status, v_animal_id
    FROM Adoptions
    WHERE adoption_id = p_adoption_id;
    
    IF v_current_status IS NULL THEN
        SET p_status = 'error';
        SET p_message = 'Adoption request not found';
        ROLLBACK;
    ELSE
        -- Update adoption status
        UPDATE Adoptions
        SET status = p_new_status,
            approval_date = CASE 
                WHEN p_new_status IN ('approved', 'rejected') THEN NOW()
                ELSE approval_date
            END,
            completion_date = CASE 
                WHEN p_new_status = 'completed' THEN NOW()
                ELSE completion_date
            END
        WHERE adoption_id = p_adoption_id;
        
        -- Update animal status if approved
        IF p_new_status = 'approved' THEN
            UPDATE Animals
            SET status = 'adopted'
            WHERE animal_id = v_animal_id;
        ELSEIF p_new_status = 'rejected' THEN
            UPDATE Animals
            SET status = 'available'
            WHERE animal_id = v_animal_id;
        END IF;
        
        SET p_status = 'success';
        SET p_message = 'Adoption status updated successfully';
        COMMIT;
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE SubmitStrayReport(
    IN p_user_id INT,
    IN p_description TEXT,
    IN p_animal_type VARCHAR(50),
    IN p_animal_size VARCHAR(50),
    IN p_visible_injuries TEXT,
    IN p_province VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8)
)
BEGIN
  INSERT INTO Stray_Reports (
    user_id,
    description,
    animal_type,
    animal_size,
    visible_injuries,
    province,
    city,
    latitude,
    longitude
  )
  VALUES (
    p_user_id,
    p_description,
    p_animal_type,
    p_animal_size,
    p_visible_injuries,
    p_province,
    p_city,
    p_latitude,
    p_longitude
  );
END //

DELIMITER ;

DELIMITER //

DROP PROCEDURE IF EXISTS SubmitStrayReport //

CREATE PROCEDURE SubmitStrayReport(
    IN p_user_id INT,
    IN p_description TEXT,
    IN p_animal_type VARCHAR(50),
    IN p_animal_size VARCHAR(50),
    IN p_visible_injuries TEXT,
    IN p_province VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error submitting stray report';
    END;

    START TRANSACTION;
    
    INSERT INTO stray_reports (
        user_id,
        description,
        animal_type,
        animal_size,
        visible_injuries,
        province,
        city,
        latitude,
        longitude,
        status
    ) VALUES (
        p_user_id,
        p_description,
        p_animal_type,
        p_animal_size,
        p_visible_injuries,
        p_province,
        p_city,
        p_latitude,
        p_longitude,
        'pending'
    );
    
    COMMIT;
    
    SELECT LAST_INSERT_ID() as report_id;
END //

DELIMITER ;




DELIMITER $$

DROP PROCEDURE IF EXISTS GetVaccinationSchedule;

DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE GetVaccinationSchedule(
    IN p_animal_id INT
)
BEGIN
    SELECT 
        v.vaccination_id,
        v.animal_id,
        v.vaccine_id,
        v.scheduled_date,
        v.completed_date,
        v.created_at,
        vt.name AS vaccine_type
    FROM Vaccinations v
    JOIN Vaccine_Types vt ON v.vaccine_id = vt.vaccine_id
    WHERE v.animal_id = p_animal_id
    ORDER BY v.scheduled_date ASC;
END$$

DELIMITER ;

ALTER TABLE Animals MODIFY species ENUM('Dog', 'Cat', 'Cow', 'Donkey', 'Other') NOT NULL;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE straysense.animals;

INSERT INTO straysense.animals (animal_id, name, species, breed, age, gender, health_status, neutered, shelter_id, status, created_at, updated_at, image_path) VALUES 
('1', 'Riley', 'Dog', 'Border Collie', '3', 'female', 'healthy', '1', '1', 'pending_adoption', '2025-04-30 23:57:35', '2025-05-12 05:53:56', 'frontend/public/animal_pictures/dog1.jpg'),
('2', 'Oscar', 'Cat', 'Russian Blue', '2', 'male', 'healthy', '0', '2', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat1.jpg'),
('3', 'Hazel', 'Dog', 'Corgi', '5', 'female', 'sick', '1', '3', 'pending_adoption', '2025-04-30 23:57:35', '2025-05-12 05:43:38', 'frontend/public/animal_pictures/dog2.jpg'),
('4', 'Tigger', 'Cat', 'Calico', '1', 'male', 'recovered', '0', '4', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat2.jpg'),
('5', 'Leo', 'Dog', 'Shiba Inu', '4', 'male', 'healthy', '1', '5', 'pending_adoption', '2025-04-30 23:57:35', '2025-05-12 06:03:05', 'frontend/public/animal_pictures/dog3.jpg'),
('6', 'Penny', 'Cat', 'Cornish Rex', '2', 'female', 'healthy', '1', '6', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat3.jpg'),
('7', 'Murphy', 'Dog', 'Newfoundland', '6', 'male', 'injured', '0', '7', 'pending_adoption', '2025-04-30 23:57:35', '2025-05-12 05:30:12', 'frontend/public/animal_pictures/dog4.jpg'),
('8', 'Loki', 'Cat', 'Devon Rex', '3', 'male', 'sick', '0', '8', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat4.jpg'),
('9', 'Honey', 'Dog', 'Papillon', '1', 'female', 'healthy', '1', '9', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog5.jpg'),
('10', 'Trixie', 'Cat', 'Balinese', '3', 'female', 'recovered', '1', '10', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat5.jpg'),
('11', 'Boomer', 'Dog', 'Akita', '5', 'male', 'healthy', '1', '1', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog6.jpg'),
('12', 'Snickers', 'Cat', 'LaPerm', '2', 'female', 'healthy', '1', '2', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat6.jpg'),
('13', 'Ace', 'Dog', 'Whippet', '3', 'male', 'recovered', '0', '3', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog7.jpg'),
('14', 'Cupcake', 'Cat', 'Munchkin', '1', 'female', 'sick', '1', '4', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat7.jpg'),
('15', 'Tank', 'Dog', 'Pitbull', '6', 'male', 'healthy', '0', '5', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog8.jpg'),
('16', 'Pixie', 'Cat', 'Ragamuffin', '3', 'female', 'injured', '1', '6', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat8.jpg'),
('17', 'Goose', 'Dog', 'Vizsla', '4', 'male', 'healthy', '1', '7', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog9.jpg'),
('18', 'Nina', 'Cat', 'Turkish Angora', '2', 'female', 'healthy', '0', '8', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat9.jpg'),
('19', 'Diesel', 'Dog', 'Alaskan Malamute', '7', 'male', 'sick', '1', '9', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog1.jpg'),
('20', 'Coco', 'Cat', 'Japanese Bobtail', '4', 'female', 'recovered', '0', '10', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat10.jpg'),
('21', 'Scout', 'Dog', 'Belgian Malinois', '3', 'male', 'healthy', '1', '1', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog2.jpg'),
('22', 'Mimi', 'Cat', 'Ocicat', '1', 'female', 'healthy', '0', '2', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat1.jpg'),
('23', 'Hunter', 'Dog', 'Basenji', '5', 'male', 'recovered', '1', '3', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog3.jpg'),
('24', 'Muffin', 'Cat', 'Selkirk Rex', '2', 'female', 'healthy', '1', '4', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat2.jpg'),
('25', 'Bingo', 'Dog', 'Bull Terrier', '4', 'male', 'injured', '0', '5', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog4.jpg'),
('26', 'Lacey', 'Cat', 'Snowshoe', '3', 'female', 'healthy', '1', '6', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat3.jpg'),
('27', 'Bruno', 'Dog', 'St. Bernard', '6', 'male', 'sick', '1', '7', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog5.jpg'),
('28', 'Whiskers', 'Cat', 'Savannah', '4', 'female', 'healthy', '0', '8', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat4.jpg'),
('29', 'Zeke', 'Dog', 'Greyhound', '2', 'male', 'recovered', '1', '9', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog6.jpg'),
('30', 'Fiona', 'Cat', 'Singapura', '3', 'female', 'healthy', '1', '10', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat5.jpg'),
('31', 'Axel', 'Dog', 'Cane Corso', '5', 'male', 'injured', '0', '1', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog7.jpg'),
('32', 'Cali', 'Cat', 'American Curl', '1', 'female', 'healthy', '1', '2', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat6.jpg'),
('33', 'Juno', 'Dog', 'Irish Setter', '4', 'female', 'healthy', '1', '3', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog8.jpg'),
('34', 'Buttons', 'Cat', 'Havana Brown', '3', 'female', 'recovered', '0', '4', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat7.jpg'),
('35', 'Storm', 'Dog', 'Keeshond', '3', 'male', 'sick', '1', '5', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog9.jpg'),
('36', 'Pearl', 'Cat', 'Burmese', '2', 'female', 'healthy', '0', '6', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat8.jpg'),
('37', 'Ranger', 'Dog', 'Weimaraner', '6', 'male', 'healthy', '1', '7', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog1.jpg'),
('38', 'Mango', 'Cat', 'Lykoi', '1', 'male', 'healthy', '1', '8', 'available', '2025-04-30 23:57:35', '2025-05-12 05:59:42', 'frontend/public/animal_pictures/cat9.jpg'),
('39', 'Oreo', 'Dog', 'French Bulldog', '4', 'male', 'recovered', '0', '9', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog2.jpg'),
('40', 'Lulu', 'Cat', 'Peterbald', '2', 'female', 'healthy', '1', '10', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat10.jpg'),
('41', 'Simba', 'Dog', 'Labrador Retriever', '5', 'male', 'healthy', '1', '1', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog3.jpg'),
('42', 'Nala', 'Cat', 'Persian', '2', 'female', 'sick', '0', '2', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat1.jpg'),
('43', 'Shadow', 'Dog', 'German Shepherd', '3', 'male', 'recovered', '1', '3', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog4.jpg'),
('44', 'Zelda', 'Cat', 'Siberian', '4', 'female', 'healthy', '1', '4', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat2.jpg'),
('45', 'Rocky', 'Dog', 'Boxer', '6', 'male', 'injured', '0', '5', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog5.jpg'),
('46', 'Ginger', 'Cat', 'Manx', '3', 'female', 'healthy', '1', '6', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat3.jpg'),
('47', 'Thor', 'Dog', 'Doberman', '2', 'male', 'sick', '1', '7', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog6.jpg'),
('48', 'Luna', 'Cat', 'British Shorthair', '1', 'female', 'healthy', '1', '8', 'adopted', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat4.jpg'),
('49', 'Max', 'Dog', 'Golden Retriever', '4', 'male', 'healthy', '1', '9', 'fostered', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/dog7.jpg'),
('50', 'Mochi', 'Cat', 'Scottish Fold', '2', 'female', 'recovered', '0', '10', 'available', '2025-04-30 23:57:35', '2025-05-10 22:19:34', 'frontend/public/animal_pictures/cat5.jpg');
SET FOREIGN_KEY_CHECKS = 1;


-- ============================================
-- ADMIN DASHBOARD STATS PROCEDURE
-- ============================================
DELIMITER //

CREATE PROCEDURE GetAdminDashboardStats()
BEGIN
    -- Users count
    SELECT COUNT(*) INTO @userCount FROM Users;
    
    -- Animals count
    SELECT COUNT(*) INTO @animalCount FROM Animals;
    
    -- Pending reports count
    SELECT COUNT(*) INTO @reportCount FROM Stray_Reports WHERE status = 'pending';
    
    -- Shelters count
    SELECT COUNT(*) INTO @shelterCount FROM Shelters;
    
    -- Pending adoptions count
    SELECT COUNT(*) INTO @adoptionCount FROM Adoptions WHERE status = 'pending';
    
    -- Pending vaccinations count
    SELECT COUNT(*) INTO @pendingVaccCount FROM Vaccinations WHERE completed_date IS NULL;
    
    -- Return all stats in a single result set
    SELECT 
        @userCount AS totalUsers,
        @animalCount AS totalAnimals,
        @reportCount AS activeReports,
        @shelterCount AS totalShelters,
        @adoptionCount AS activeAdoptionRequests,
        @pendingVaccCount AS pendingVaccinations;
END //

DELIMITER ;

-- ============================================
-- ADMIN ANIMALS MANAGEMENT PROCEDURES
-- ============================================
DELIMITER //

-- Get all animals
CREATE PROCEDURE GetAllAnimals()
BEGIN
    SELECT * FROM Animals;
END //

-- Add a new animal
CREATE PROCEDURE AddAnimal(
    IN p_name VARCHAR(100),
    IN p_species VARCHAR(50),
    IN p_breed VARCHAR(100),
    IN p_age INT,
    IN p_gender VARCHAR(10),
    IN p_health_status VARCHAR(100),
    IN p_neutered BOOLEAN,
    IN p_shelter_id INT,
    IN p_status VARCHAR(20),
    IN p_image_path VARCHAR(255),
    IN p_report_id INT
)
BEGIN
    DECLARE new_animal_id INT;
    
    IF p_report_id IS NOT NULL THEN
        -- Get next animal ID
        SELECT IFNULL(MAX(animal_id) + 1, 1) INTO new_animal_id FROM Animals;
        
        -- Insert new animal
        INSERT INTO Animals (
            animal_id, name, species, breed, age, gender, 
            health_status, neutered, shelter_id, status, image_path
        ) 
        VALUES (
            new_animal_id, p_name, p_species, p_breed, p_age, p_gender, 
            p_health_status, p_neutered, p_shelter_id, 
            IFNULL(p_status, 'available'), p_image_path
        );
        
        -- Update report with processed animal
        UPDATE Stray_Reports 
        SET processed_animal_id = new_animal_id 
        WHERE report_id = p_report_id;
    ELSE
        -- Insert new animal with auto-increment ID
        INSERT INTO Animals (
            name, species, breed, age, gender, 
            health_status, neutered, shelter_id, status, image_path
        ) 
        VALUES (
            p_name, p_species, p_breed, p_age, p_gender, 
            p_health_status, p_neutered, p_shelter_id, 
            IFNULL(p_status, 'available'), p_image_path
        );
        
        -- Get the last inserted ID
        SET new_animal_id = LAST_INSERT_ID();
    END IF;
    
    -- Return the new animal ID
    SELECT new_animal_id AS animal_id;
END //

-- Update an existing animal
CREATE PROCEDURE UpdateAnimal(
    IN p_animal_id INT,
    IN p_name VARCHAR(100),
    IN p_species VARCHAR(50),
    IN p_breed VARCHAR(100),
    IN p_age INT,
    IN p_gender VARCHAR(10),
    IN p_health_status VARCHAR(100),
    IN p_neutered BOOLEAN,
    IN p_shelter_id INT,
    IN p_status VARCHAR(20),
    IN p_image_path VARCHAR(255)
)
BEGIN
    UPDATE Animals 
    SET 
        name = p_name,
        species = p_species,
        breed = p_breed,
        age = p_age,
        gender = p_gender,
        health_status = p_health_status,
        neutered = p_neutered,
        shelter_id = p_shelter_id,
        status = p_status,
        image_path = p_image_path
    WHERE animal_id = p_animal_id;
    
    -- Return success status
    SELECT ROW_COUNT() > 0 AS success, 'Animal updated' AS message;
END //

-- Delete an animal
CREATE PROCEDURE DeleteAnimal(IN p_animal_id INT)
BEGIN
    DELETE FROM Animals WHERE animal_id = p_animal_id;
    
    -- Return success status
    SELECT ROW_COUNT() > 0 AS success, 'Animal deleted' AS message;
END //

DELIMITER ;

-- ============================================
-- ADMIN SHELTER MANAGEMENT PROCEDURES
-- ============================================
DELIMITER //

-- Get all shelters
CREATE PROCEDURE GetAllShelters()
BEGIN
    SELECT * FROM Shelters ORDER BY name;
END //

-- Add a new shelter
CREATE PROCEDURE AddShelter(
    IN p_name VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_city VARCHAR(100),
    IN p_country VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_email VARCHAR(100)
)
BEGIN
    INSERT INTO Shelters (name, address, city, country, phone, email)
    VALUES (p_name, p_address, p_city, p_country, p_phone, p_email);
    
    -- Return the new shelter
    SELECT * FROM Shelters WHERE shelter_id = LAST_INSERT_ID();
END //

-- Update an existing shelter
CREATE PROCEDURE UpdateShelter(
    IN p_shelter_id INT,
    IN p_name VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_city VARCHAR(100),
    IN p_country VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_email VARCHAR(100)
)
BEGIN
    UPDATE Shelters
    SET 
        name = p_name,
        address = p_address,
        city = p_city,
        country = p_country,
        phone = p_phone,
        email = p_email
    WHERE shelter_id = p_shelter_id;
    
    -- Return the updated shelter
    SELECT * FROM Shelters WHERE shelter_id = p_shelter_id;
END //

-- Delete a shelter (with validation)
CREATE PROCEDURE DeleteShelter(IN p_shelter_id INT)
BEGIN
    DECLARE animal_count INT;
    
    -- Check if shelter has animals
    SELECT COUNT(*) INTO animal_count FROM Animals WHERE shelter_id = p_shelter_id;
    
    IF animal_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete shelter with associated animals';
    ELSE
        DELETE FROM Shelters WHERE shelter_id = p_shelter_id;
        
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Shelter not found';
        END IF;
        
        SELECT 'Shelter deleted successfully' AS message;
    END IF;
END //

DELIMITER ;

-- ============================================
-- ADMIN STRAY REPORTS MANAGEMENT PROCEDURES
-- ============================================
DELIMITER //

-- Get all stray reports with user info
CREATE PROCEDURE GetAllStrayReports()
BEGIN
    SELECT sr.*, u.first_name, u.last_name 
    FROM Stray_Reports sr
    JOIN Users u ON sr.user_id = u.user_id
    ORDER BY sr.report_date DESC;
END //

-- Update stray report status
CREATE PROCEDURE UpdateStrayReportStatus(
    IN p_report_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE Stray_Reports 
    SET 
        status = p_status, 
        accepted_date = CASE WHEN p_status = 'accepted' THEN NOW() ELSE NULL END
    WHERE report_id = p_report_id;
    
    SELECT 'Report status updated successfully' AS message;
END //

DELIMITER ;

-- ============================================
-- ADMIN ADOPTION MANAGEMENT PROCEDURES
-- ============================================
DELIMITER //

-- Get all adoptions with user and animal info
CREATE PROCEDURE GetAllAdoptions()
BEGIN
    SELECT a.*, u.first_name, u.last_name, an.name AS animal_name
    FROM Adoptions a
    JOIN Users u ON a.user_id = u.user_id
    JOIN Animals an ON a.animal_id = an.animal_id
    ORDER BY a.application_date DESC;
END //

-- Update adoption status and fields
CREATE PROCEDURE UpdateAdoptionStatusAdmin(
    IN p_adoption_id INT,
    IN p_status VARCHAR(20),
    IN p_home_check_passed BOOLEAN,
    IN p_fee_paid BOOLEAN,
    IN p_contract_signed BOOLEAN
)
BEGIN
    UPDATE Adoptions
    SET 
        status = p_status,
        home_check_passed = CASE WHEN p_home_check_passed IS NOT NULL THEN p_home_check_passed ELSE home_check_passed END,
        fee_paid = CASE WHEN p_fee_paid IS NOT NULL THEN p_fee_paid ELSE fee_paid END,
        contract_signed = CASE WHEN p_contract_signed IS NOT NULL THEN p_contract_signed ELSE contract_signed END,
        approval_date = CASE WHEN p_status = 'approved' THEN NOW() ELSE approval_date END
    WHERE adoption_id = p_adoption_id;
    
    SELECT 'Adoption request updated' AS message;
END //

DELIMITER ;

-- ============================================
-- ADMIN VACCINE MANAGEMENT PROCEDURES
-- ============================================
DELIMITER //

-- Get all vaccine types
CREATE PROCEDURE GetAllVaccineTypes()
BEGIN
    SELECT * FROM Vaccine_Types ORDER BY name;
END //

-- Add a new vaccine type
CREATE PROCEDURE AddVaccineType(
    IN p_name VARCHAR(100),
    IN p_description TEXT
)
BEGIN
    INSERT INTO Vaccine_Types (name, description)
    VALUES (p_name, p_description);
    
    SELECT * FROM Vaccine_Types WHERE vaccine_id = LAST_INSERT_ID();
END //

-- Update a vaccine type
CREATE PROCEDURE UpdateVaccineType(
    IN p_vaccine_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT
)
BEGIN
    UPDATE Vaccine_Types
    SET 
        name = p_name,
        description = p_description
    WHERE vaccine_id = p_vaccine_id;
    
    SELECT * FROM Vaccine_Types WHERE vaccine_id = p_vaccine_id;
END //

-- Delete a vaccine type
CREATE PROCEDURE DeleteVaccineType(IN p_vaccine_id INT)
BEGIN
    DELETE FROM Vaccine_Types WHERE vaccine_id = p_vaccine_id;
    
    SELECT 'Vaccine deleted' AS message;
END //

DELIMITER ;

-- ============================================
-- ADMIN VACCINATION MANAGEMENT PROCEDURES
-- ============================================
DELIMITER //

-- Schedule a new vaccination
CREATE PROCEDURE ScheduleVaccination(
    IN p_animal_id INT,
    IN p_vaccine_id INT,
    IN p_scheduled_date DATE
)
BEGIN
    INSERT INTO Vaccinations (animal_id, vaccine_id, scheduled_date)
    VALUES (p_animal_id, p_vaccine_id, p_scheduled_date);
    
    SELECT 'Vaccination scheduled' AS message;
END //

-- Get all vaccinations with details
CREATE PROCEDURE GetAllVaccinations()
BEGIN
    SELECT 
        v.vaccination_id, 
        a.name AS animal_name, 
        vt.name AS vaccine_name, 
        v.scheduled_date, 
        v.completed_date
    FROM Vaccinations v
    JOIN Animals a ON v.animal_id = a.animal_id
    JOIN Vaccine_Types vt ON v.vaccine_id = vt.vaccine_id
    ORDER BY v.scheduled_date DESC;
END //

-- Mark a vaccination as completed
CREATE PROCEDURE CompleteVaccination(IN p_vaccination_id INT)
BEGIN
    UPDATE Vaccinations 
    SET completed_date = CURDATE() 
    WHERE vaccination_id = p_vaccination_id;
    
    SELECT 'Vaccination marked as done' AS message;
END //

DELIMITER ;